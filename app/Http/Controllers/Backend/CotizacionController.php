<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\FiltraPorCliente;
use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Producto;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionController extends Controller
{
    use FiltraPorCliente;

    public function index(): Response
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Cotizacion::with('cliente')
            ->where(fn ($q) => $q->where('owner_id', $ownerId))
            ->orderBy('fecha', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where('cliente_id', $this->getClienteAuth()->id);
        }

        $cotizaciones = $query->paginate(15);
        $clientes = Cliente::where(fn ($q) => $q->where('activo', true))->orderBy('nombre')->get();
        $productos = Producto::where(fn ($q) => $q->where('activo', true))->orderBy('nombre')->get();

        return Inertia::render('Backend/Cotizaciones/Index', [
            'cotizaciones' => $cotizaciones,
            'clientes' => $clientes,
            'productos' => $productos,
            'owner_id' => $ownerId,
            'user_id' => auth()->id(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:20|unique:cotizaciones,numero',
            'cliente_id' => 'required|exists:clientes,id',
            'fecha' => 'required|date',
            'fecha_validez' => 'nullable|date',
            'subtotal' => 'nullable|numeric|min:0',
            'impuesto' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'detalles' => 'nullable|array',
            'condiciones' => 'nullable|string',
            'iva_personalizado' => 'nullable|numeric|min:0',
            'descuento_tipo' => 'nullable|string|in:monto,porcentaje',
            'descuento_monto' => 'nullable|numeric|min:0',
        ]);
        if (isset($validated['subtotal'])) {
            $validated['subtotal'] = (int) round($validated['subtotal']);
        }
        if (isset($validated['impuesto'])) {
            $validated['impuesto'] = (int) round($validated['impuesto']);
        }
        if (isset($validated['total'])) {
            $validated['total'] = (int) round($validated['total']);
        }
        if (isset($validated['descuento_monto'])) {
            $validated['descuento_monto'] = (int) round($validated['descuento_monto']);
        }
        if (isset($validated['detalles']) && is_array($validated['detalles'])) {
            foreach ($validated['detalles'] as &$detalle) {
                if (isset($detalle['cantidad'])) {
                    $detalle['cantidad'] = (int) $detalle['cantidad'];
                }
                if (isset($detalle['precio'])) {
                    $detalle['precio'] = (int) round($detalle['precio']);
                }
            }
        }

        $validated['user_id'] = auth()->id();
        $validated['owner_id'] = auth()->user()->getOwnerId();
        Cotizacion::create($validated);

        return redirect()->route('cotizaciones.index');
    }

    public function update(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => [
                'required',
                'string',
                'max:20',
                Rule::unique('cotizaciones')->ignore($cotizacion->id),
            ],
            'cliente_id' => 'required|exists:clientes,id',
            'fecha' => 'required|date',
            'fecha_validez' => 'nullable|date',
            'subtotal' => 'nullable|numeric|min:0',
            'impuesto' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'detalles' => 'nullable|array',
            'condiciones' => 'nullable|string',
            'iva_personalizado' => 'nullable|numeric|min:0',
            'descuento_tipo' => 'nullable|string|in:monto,porcentaje',
            'descuento_monto' => 'nullable|numeric|min:0',
        ]);
        if (isset($validated['subtotal'])) {
            $validated['subtotal'] = (int) round($validated['subtotal']);
        }
        if (isset($validated['impuesto'])) {
            $validated['impuesto'] = (int) round($validated['impuesto']);
        }
        if (isset($validated['total'])) {
            $validated['total'] = (int) round($validated['total']);
        }
        if (isset($validated['descuento_monto'])) {
            $validated['descuento_monto'] = (int) round($validated['descuento_monto']);
        }
        if (isset($validated['detalles']) && is_array($validated['detalles'])) {
            foreach ($validated['detalles'] as &$detalle) {
                if (isset($detalle['cantidad'])) {
                    $detalle['cantidad'] = (int) $detalle['cantidad'];
                }
                if (isset($detalle['precio'])) {
                    $detalle['precio'] = (int) round($detalle['precio']);
                }
            }
        }

        if (! isset($validated['owner_id'])) {
            $validated['owner_id'] = auth()->user()->getOwnerId();
        }
        $cotizacion->update($validated);

        return redirect()->route('cotizaciones.index');
    }

    public function destroy(Cotizacion $cotizacion): RedirectResponse
    {
        $cotizacion->delete();

        return redirect()->route('cotizaciones.index');
    }

    public function downloadPdf(Cotizacion $cotizacion)
    {
        $cotizacion->load(['cliente', 'emisor']);
        $pdf = Pdf::loadView('pdf.cotizacion', compact('cotizacion'));

        return $pdf->download('cotizacion_'.$cotizacion->numero.'.pdf');
    }

    public function previewPdf(Cotizacion $cotizacion)
    {
        $cotizacion->load(['cliente', 'emisor']);

        return view('pdf.cotizacion', compact('cotizacion'));
    }

    public function exportCsv(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Cotizacion::with('cliente')
            ->where('owner_id', $ownerId);

        if ($request->query('fecha_desde')) {
            $query->where('fecha', '>=', Carbon::parse($request->query('fecha_desde'))->startOfDay());
        }
        if ($request->query('fecha_hasta')) {
            $query->where('fecha', '<=', Carbon::parse($request->query('fecha_hasta'))->endOfDay());
        }

        $query->orderBy('fecha', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where('cliente_id', $this->getClienteAuth()->id);
        }

        $cotizaciones = $query->get();

        $filename = 'cotizaciones_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () use ($cotizaciones) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Numero', 'Fecha', 'Vence', 'Cliente_Email', 'Estado',
                'Item_Descripcion', 'Item_Cantidad', 'Item_Precio', 'Condiciones', 'Notas',
            ], ';');

            foreach ($cotizaciones as $c) {
                $detalles = is_array($c->detalles) ? $c->detalles : [];
                if (empty($detalles)) {
                    fputcsv($file, [
                        $c->numero,
                        $c->fecha ? $c->fecha->format('Y-m-d') : '',
                        $c->fecha_validez ? $c->fecha_validez->format('Y-m-d') : '',
                        $c->cliente->email ?? '',
                        $c->estado,
                        '', '', '',
                        $c->condiciones,
                        $c->notas,
                    ], ';');
                } else {
                    foreach ($detalles as $d) {
                        fputcsv($file, [
                            $c->numero,
                            $c->fecha ? $c->fecha->format('Y-m-d') : '',
                            $c->fecha_validez ? $c->fecha_validez->format('Y-m-d') : '',
                            $c->cliente->email ?? '',
                            $c->estado,
                            $d['descripcion'] ?? '',
                            $d['cantidad'] ?? 0,
                            $d['precio'] ?? 0,
                            $c->condiciones,
                            $c->notas,
                        ], ';');
                    }
                }
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Cotizacion::with('cliente')
            ->where('owner_id', $ownerId);

        if ($request->query('fecha_desde')) {
            $query->where('fecha', '>=', Carbon::parse($request->query('fecha_desde'))->startOfDay());
        }
        if ($request->query('fecha_hasta')) {
            $query->where('fecha', '<=', Carbon::parse($request->query('fecha_hasta'))->endOfDay());
        }

        $query->orderBy('fecha', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where('cliente_id', $this->getClienteAuth()->id);
        }

        $cotizaciones = $query->get();
        $filename = 'cotizaciones_'.now()->format('Ymd_His').'.xls';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        return response()->stream(function () use ($cotizaciones) {
            echo '<html><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><body><table border="1">';
            echo '<tr>
                <th style="background-color: #f2f2f2;">Numero</th>
                <th style="background-color: #f2f2f2;">Fecha</th>
                <th style="background-color: #f2f2f2;">Vence</th>
                <th style="background-color: #f2f2f2;">Cliente_Email</th>
                <th style="background-color: #f2f2f2;">Estado</th>
                <th style="background-color: #f2f2f2;">Item_Descripcion</th>
                <th style="background-color: #f2f2f2;">Item_Cantidad</th>
                <th style="background-color: #f2f2f2;">Item_Precio</th>
                <th style="background-color: #f2f2f2;">Condiciones</th>
                <th style="background-color: #f2f2f2;">Notas</th>
            </tr>';
            foreach ($cotizaciones as $c) {
                $detalles = is_array($c->detalles) ? $c->detalles : [];
                if (empty($detalles)) {
                    echo '<tr><td>'.$c->numero.'</td><td>'.($c->fecha ? $c->fecha->format('Y-m-d') : '').'</td><td>'.($c->fecha_validez ? $c->fecha_validez->format('Y-m-d') : '').'</td><td>'.($c->cliente->email ?? '').'</td><td>'.$c->estado.'</td><td></td><td></td><td></td><td>'.$c->condiciones.'</td><td>'.$c->notas.'</td></tr>';
                } else {
                    foreach ($detalles as $d) {
                        echo '<tr><td>'.$c->numero.'</td><td>'.($c->fecha ? $c->fecha->format('Y-m-d') : '').'</td><td>'.($c->fecha_validez ? $c->fecha_validez->format('Y-m-d') : '').'</td><td>'.($c->cliente->email ?? '').'</td><td>'.$c->estado.'</td><td>'.($d['descripcion'] ?? '').'</td><td>'.($d['cantidad'] ?? 0).'</td><td>'.($d['precio'] ?? 0).'</td><td>'.$c->condiciones.'</td><td>'.$c->notas.'</td></tr>';
                    }
                }
            }
            echo '</table></body></html>';
        }, 200, $headers);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file',
        ]);

        $file = $request->file('archivo');
        $filePath = $file->getRealPath();

        // Detect delimiter
        $handle = fopen($filePath, 'r');
        $firstLine = fgets($handle);
        fclose($handle);

        $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';

        $handle = fopen($filePath, 'r');
        $bom = fread($handle, 3);
        if ($bom !== chr(0xEF).chr(0xBB).chr(0xBF)) {
            rewind($handle);
        }

        $header = fgetcsv($handle, 0, $delimiter);

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (count($row) >= 10) {
                $rows[] = array_combine([
                    'numero', 'fecha', 'vence', 'cliente_email', 'estado',
                    'item_descripcion', 'item_cantidad', 'item_precio', 'condiciones', 'notas',
                ], array_slice($row, 0, 10));
            }
        }
        fclose($handle);

        if (empty($rows)) {
            return redirect()->back()->with('error', 'No se encontraron datos válidos en el archivo. Verifique el formato.');
        }

        $grouped = collect($rows)->groupBy('numero');
        $ownerId = auth()->user()->getOwnerId();
        $importedCount = 0;

        DB::transaction(function () use ($grouped, $ownerId, &$importedCount) {
            foreach ($grouped as $numero => $items) {
                $first = $items->first();
                $cliente = Cliente::where(fn ($q) => $q->where('email', $first['cliente_email']))
                    ->where(fn ($q) => $q->where('owner_id', $ownerId))
                    ->first();

                if (! $cliente) {
                    continue;
                }

                $detalles = [];
                $subtotal = 0;
                foreach ($items as $item) {
                    if (! empty($item['item_descripcion'])) {
                        $cantidad = (int) $item['item_cantidad'];
                        $precio = round($item['item_precio']);
                        $detalles[] = [
                            'descripcion' => $item['item_descripcion'],
                            'cantidad' => $cantidad,
                            'precio' => $precio,
                        ];
                        $subtotal += round($cantidad * $precio);
                    }
                }

                $impuesto = round($subtotal * 0.19);
                $total = $subtotal + $impuesto;

                Cotizacion::updateOrCreate(
                    ['numero' => $numero, 'owner_id' => $ownerId],
                    [
                        'cliente_id' => $cliente->id,
                        'user_id' => auth()->id(),
                        'fecha' => $first['fecha'],
                        'fecha_validez' => $first['vence'] ?: null,
                        'estado' => $first['estado'] ?: 'borrador',
                        'condiciones' => $first['condiciones'] ?? '',
                        'notas' => $first['notas'] ?? '',
                        'detalles' => $detalles,
                        'subtotal' => (int) $subtotal,
                        'impuesto' => (int) $impuesto,
                        'total' => (int) $total,
                    ]
                );
                $importedCount++;
            }
        });

        return redirect()->back()->with('success', "Se procesaron $importedCount cotizaciones correctamente.");
    }
}
