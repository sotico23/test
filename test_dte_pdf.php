<?php

use App\Models\Almacen;
use App\Models\Cliente;
use App\Models\DteDocumento;
use App\Models\Factura;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // 1. Preparar Emisor (User 1)
    $emisor = User::first();
    $emisor->update([
        'rut' => '76.722.330-9',
        'razon_social' => 'AL DIA TECNOLOGIA SPA',
        'giro' => 'DESARROLLO DE SOFTWARE',
        'direccion' => 'AV. PROVIDENCIA 1234',
        'comuna' => 'PROVIDENCIA',
        'ciudad' => 'SANTIAGO',
    ]);

    // 2. Preparar Cliente
    $cliente = Cliente::first() ?? Cliente::create([
        'owner_id' => $emisor->id,
        'nombre' => 'CLIENTE DE PRUEBA CHILE',
        'rut' => '66.666.666-6',
        'giro' => 'SERVICIOS COMERCIALES',
        'direccion' => 'CALLE FALSA 123',
        'comuna' => 'SANTIAGO',
        'ciudad' => 'SANTIAGO',
        'activo' => true,
        'email' => 'cliente@ejemplo.cl',
    ]);

    // 3. Almacen y Producto
    $almacen = Almacen::first() ?? Almacen::create([
        'owner_id' => $emisor->id,
        'nombre' => 'Bodega Central',
        'codigo' => 'BC01',
        'activo' => true,
    ]);

    $producto = Producto::first() ?? Producto::create([
        'owner_id' => $emisor->id,
        'nombre' => 'SERVICIO DE CONSULTORIA ERP',
        'precio' => 100000,
        'activo' => true,
    ]);

    // 4. Crear Factura
    $folio = 101;
    $factura = Factura::create([
        'numero' => $folio,
        'owner_id' => $emisor->id,
        'user_id' => $emisor->id,
        'cliente_id' => $cliente->id,
        'almacen_id' => $almacen->id,
        'fecha' => now(),
        'subtotal' => 100000,
        'impuesto' => 19000,
        'total' => 119000,
        'tipo' => 'venta',
        'estado' => 'pagada',
        'iva_porcentaje' => 19,
        'iva_incluido' => false,
    ]);

    $factura->detalles()->create([
        'producto_id' => $producto->id,
        'cantidad' => 1,
        'precio_unitario' => 100000,
        'subtotal' => 100000,
        'impuesto' => 19000,
        'total' => 119000,
    ]);

    // 5. Crear DTE Documento con TED Simulado
    // Un TED real es binario (firmado), aquí ponemos un XML válido para que el BarcodeService lo procese
    $tedXml = '<TED version="1.0"><DD><RE>76722330-9</RE><TD>33</TD><F>'.$folio.'</F><FE>'.now()->format('Y-m-d').'</FE><RR>66666666-6</RR><RSR>CLIENTE DE PRUEBA CHILE</RSR><MNT>119000</MNT><IT1>SERVICIO DE CONSULTORIA ERP</IT1><CAF version="1.0"><DA><RE>76722330-9</RE><RS>AL DIA TECNOLOGIA SPA</RS><TD>33</TD><RNG><D>1</D><H>500</H></RNG><FA>2023-10-01</FA><RSAPK><M>dummy</M><E>dummy</E></RSAPK><IDK>100</IDK></DA><FRMA algoritmo="SHA1withRSA">dummy_sig</FRMA></CAF><TSTZ>'.now()->format('Y-m-d\TH:i:s').'</TSTZ></DD><FRMT algoritmo="SHA1withRSA">dummy_frmt_sig</FRMT></TED>';

    $dte = DteDocumento::create([
        'owner_id' => $emisor->id,
        'modelo_origen' => 'Factura',
        'origen_id' => $factura->id,
        'tipo_documento' => 33, // Factura Electrónica
        'folio' => $folio,
        'rut_emisor' => '76722330-9',
        'rut_receptor' => '66666666-6',
        'razon_social_receptor' => 'CLIENTE DE PRUEBA CHILE',
        'monto_neto' => 100000,
        'monto_iva' => 19000,
        'monto_total' => 119000,
        'ted' => $tedXml,
        'estado' => 'firmado',
        'ambiente' => 'certificacion',
    ]);

    $factura->update(['dte_documento_id' => $dte->id]);

    DB::commit();

    echo "\n✅ Factura Electrónica de Prueba creada con éxito!";
    echo "\nID Factura: ".$factura->id;
    echo "\nFolio DTE: ".$folio;
    echo "\n\nPara ver el PDF, visita:";
    echo "\nhttp://127.0.0.1:8000/facturacion/pdf/".$factura->id; // Ajustar según ruta real
    echo "\n";

} catch (Exception $e) {
    DB::rollBack();
    echo "\n❌ Error: ".$e->getMessage();
}
