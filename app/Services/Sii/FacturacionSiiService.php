<?php

namespace App\Services\Sii;

use App\Models\ConfiguracionSii;
use App\Models\DteDocumento;
use App\Models\DteEnvio;
use App\Models\Factura;
use Exception;
use Illuminate\Support\Facades\DB;

/**
 * Orquestador principal para la integración con el SII.
 * Coordina la generación, firma y envío de documentos.
 */
class FacturacionSiiService
{
    public function __construct(
        private DteXmlGenerator $xmlGenerator,
        private DteSigner $signer,
        private CafManager $cafManager,
        private SiiSoapClient $soapClient
    ) {}

    /**
     * Procesa una Factura del ERP para convertirla en DTE y enviarla al SII.
     */
    public function procesarFactura(Factura $factura): DteDocumento
    {
        return DB::transaction(function () use ($factura) {
            $ownerId = $factura->owner_id;

            // 0. Validar configuración del emisor
            $config = ConfiguracionSii::where('owner_id', $ownerId)->first();
            if (! $config) {
                throw new Exception('Debe configurar los datos del emisor (SII) antes de facturar.');
            }

            // 1. Obtener folio disponible
            $infoFolio = $this->cafManager->obtenerSiguienteFolio(33, $ownerId);
            $folio = $infoFolio['folio'];
            $caf = $infoFolio['caf'];

            // 2. Preparar datos para el XML
            $datosDte = $this->mapearDatosFactura($factura, $folio);

            // 3. Generar XML base (Sin firma)
            $xmlUnsigned = $this->xmlGenerator->generar($datosDte, 33);

            // 4. Firmar XML
            $pfxPath = storage_path('app/'.config('sii.certificado.ruta'));
            $pfxPass = config('sii.certificado.clave');
            $xmlSigned = $this->signer->firmarDte($xmlUnsigned, $pfxPath, $pfxPass);

            // 5. Generar y agregar TED (Timbre)
            // Nota: Para simplificar, en esta fase el TED se agrega dentro del signer o generator
            // pero requiere el XML firmado y el CAF.

            // 6. Registrar DteDocumento en BD
            $dte = DteDocumento::create([
                'owner_id' => $ownerId,
                'modelo_origen' => 'Factura',
                'origen_id' => $factura->id,
                'tipo_documento' => 33,
                'folio' => $folio,
                'caf_folio_id' => $caf->id,
                'rut_emisor' => $datosDte['rut_emisor'],
                'rut_receptor' => $datosDte['rut_receptor'],
                'razon_social_receptor' => $datosDte['razon_social_receptor'],
                'monto_neto' => (int) $factura->subtotal,
                'monto_iva' => (int) $factura->impuesto,
                'monto_total' => (int) $factura->total,
                'xml_sin_firma' => $xmlUnsigned,
                'xml_firmado' => $xmlSigned,
                'estado' => 'firmado',
                'ambiente' => config('sii.semilla_url') ? 'certificacion' : 'produccion',
            ]);

            return $dte;
        });
    }

    /**
     * Realiza el envío de un documento ya firmado al SII.
     */
    public function enviarAlSii(DteDocumento $dte): void
    {
        $ownerId = $dte->owner_id;
        $urlSemilla = config('sii.semilla_url');
        $urlToken = config('sii.token_url');
        $urlEnvio = config('sii.envio_dte_url');

        // 1. Obtener Token
        $seed = $this->soapClient->getSeed($urlSemilla);
        $signedSeed = $this->prepareSignedSeed($seed);
        $token = $this->soapClient->getToken($urlToken, $signedSeed);

        // 2. Preparar Sobre (EnvioDTE)
        $xmlSobre = $this->construirSobre($dte);

        // 3. Enviar
        $rutEmisor = $dte->rut_emisor;
        $rutEnvia = config('sii.certificado.rut_emisor'); // Usualmente el mismo del cert

        $resultado = $this->soapClient->enviarSobre(
            $urlEnvio,
            $token,
            $rutEmisor,
            $rutEnvia,
            $xmlSobre
        );

        // 4. Actualizar estados
        if ($resultado['status'] == '0') {
            $dte->update([
                'estado' => 'enviado',
                'track_id' => $resultado['track_id'],
            ]);

            DteEnvio::create([
                'owner_id' => $ownerId,
                'rut_emisor' => $rutEmisor,
                'xml_sobre' => $xmlSobre,
                'track_id' => $resultado['track_id'],
                'estado' => 'enviado',
                'ambiente' => $dte->ambiente,
            ]);
        } else {
            $dte->update(['estado_sii' => "Error SII: {$resultado['status']}"]);
            throw new Exception('El SII rechazó el envío del documento.');
        }
    }

    private function mapearDatosFactura(Factura $factura, int $folio): array
    {
        $factura->load(['cliente', 'detalles.producto']);
        $config = ConfiguracionSii::where('owner_id', $factura->owner_id)->firstOrFail();

        return [
            'rut_emisor' => $config->rut,
            'razon_social_emisor' => $config->razon_social,
            'giro_emisor' => $config->giro,
            'direccion_emisor' => $config->direccion,
            'comuna_emisor' => $config->comuna,
            'ciudad_emisor' => $config->ciudad,
            'actividad_economica' => $config->acteco,
            'rut_receptor' => $factura->cliente->rut ?? $factura->cliente->nit,
            'razon_social_receptor' => $factura->cliente->nombre,
            'giro_receptor' => $factura->cliente->giro,
            'direccion_receptor' => $factura->cliente->direccion,
            'comuna_receptor' => $factura->cliente->comuna,
            'ciudad_receptor' => $factura->cliente->ciudad,
            'fecha' => $factura->fecha->format('Y-m-d'),
            'folio' => $folio,
            'items' => $factura->detalles->map(fn ($d) => [
                'nombre' => $d->producto->nombre,
                'cantidad' => (int) $d->cantidad,
                'precio_unitario' => (int) $d->precio_unitario,
            ])->toArray(),
        ];
    }

    private function prepareSignedSeed(string $seed): string
    {
        $xml = "<getToken><item><semilla>{$seed}</semilla></item></getToken>";
        $pfxPath = storage_path('app/'.config('sii.certificado.ruta'));
        $pfxPass = config('sii.certificado.clave');

        // El SII pide firmar el nodo <item>
        // Usamos el signo DTE adaptado para semillas
        return $this->signer->firmarDte($xml, $pfxPath, $pfxPass);
    }

    private function construirSobre(DteDocumento $dte): string
    {
        // Estructura básica EnvioDTE
        // Requiere una firma adicional sobre el nodo <SetDTE>
        // Por ahora retornamos el XML del documento envuelto
        return '<?xml version="1.0" encoding="ISO-8859-1"?>'.
               '<EnvioDTE xmlns="http://www.sii.cl/SiiDte" version="1.0">'.
               '<SetDTE ID="SetDoc">'.
               $dte->xml_firmado.
               '</SetDTE>'.
               '</EnvioDTE>';
    }
}
