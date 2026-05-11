<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\FiltraPorCliente;
use App\Models\Asiento;
use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\Tesoreria;
use App\Models\Vacio;
use App\Models\Venta;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VentaController extends Controller
{
    use FiltraPorCliente;

    public function index(): Response
    {
        $query = Venta::with('cliente', 'detalleVentas.producto')->orderBy('created_at', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where(fn ($q) => $q->where(fn ($q) => $q->where('cliente_id', $this->getClienteAuth()->id)));
        }

        $ventas = $query->paginate(15);
        $clientes = Cliente::where(fn ($q) => $q->where('activo', true))->get();
        $productos = Producto::where(fn ($q) => $q->where('activo', true))->get();

        return Inertia::render('Backend/Ventas/Index', [
            'ventas' => $ventas,
            'clientes' => $clientes,
            'productos' => $productos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero_factura' => 'required|string|max:50|unique:ventas,numero',
            'cliente_id' => 'required|exists:clientes,id',
            'fecha' => 'required|date',
            'estado' => 'required|in:pendiente,pagada,cancelada',
            'notas' => 'nullable|string',
            'incluye_iva' => 'nullable|boolean',
            'tipo_descuento' => 'nullable|in:monto,porcentaje',
            'valor_descuento' => 'nullable|numeric|min:0',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        foreach ($validated['productos'] as $item) {
            $subtotal += round($item['cantidad'] * $item['precio_unitario']);
        }

        $tipoDescuento = $validated['tipo_descuento'] ?? 'monto';
        $valorDescuento = $validated['valor_descuento'] ?? 0;
        $montoDescuento = 0;

        if ($tipoDescuento === 'porcentaje') {
            $montoDescuento = round($subtotal * ($valorDescuento / 100));
        } else {
            $montoDescuento = round($valorDescuento);
        }

        $baseImponible = max(0, $subtotal - $montoDescuento);
        $incluyeIva = $validated['incluye_iva'] ?? true;
        $iva = $incluyeIva ? round($baseImponible * 0.19) : 0;
        $total = $baseImponible + $iva;

        $venta = Venta::create([
            'numero' => $validated['numero_factura'],
            'cliente_id' => $validated['cliente_id'],
            'fecha' => $validated['fecha'],
            'subtotal' => (int) $subtotal,
            'iva' => (int) $iva,
            'total' => (int) $total,
            'monto_descuento' => (int) $montoDescuento,
            'valor_descuento' => $valorDescuento,
            'tipo_descuento' => $tipoDescuento,
            'incluye_iva' => $incluyeIva,
            'estado' => $validated['estado'],
            'notas' => $validated['notas'] ?? null,
        ]);

        if ($venta->estado === 'pagada') {
            $this->procesarPago($venta);
        }

        foreach ($validated['productos'] as $item) {
            $subtotalItem = round($item['cantidad'] * $item['precio_unitario']);

            DetalleVenta::create([
                'venta_id' => $venta->id,
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => round($item['precio_unitario']),
                'subtotal' => (int) $subtotalItem,
            ]);
        }

        return redirect()->route('ventas.index');
    }

    public function update(Request $request, Venta $venta): RedirectResponse
    {
        $validated = $request->validate([
            'numero_factura' => 'nullable|string|max:50|unique:ventas,numero,'.$venta->id,
            'cliente_id' => 'nullable|exists:clientes,id',
            'fecha' => 'nullable|date',
            'estado' => 'nullable|in:pendiente,pagada,cancelada',
            'notas' => 'nullable|string',
            'incluye_iva' => 'nullable|boolean',
            'tipo_descuento' => 'nullable|in:monto,porcentaje',
            'valor_descuento' => 'nullable|numeric|min:0',
            'productos' => 'nullable|array|min:1',
            'productos.*.producto_id' => 'nullable|exists:productos,id',
            'productos.*.cantidad' => 'nullable|integer|min:1',
            'productos.*.precio_unitario' => 'nullable|numeric|min:0',
        ]);

        $estadoAnterior = $venta->estado;

        $subtotal = 0;
        $items = $validated['productos'] ?? $venta->detalleVentas;
        foreach ($items as $item) {
            $cantidad = isset($item['cantidad']) ? $item['cantidad'] : $item->cantidad;
            $precio = isset($item['precio_unitario']) ? $item['precio_unitario'] : $item->precio_unitario;
            $subtotal += round($cantidad * $precio);
        }

        $tipoDescuento = $validated['tipo_descuento'] ?? $venta->tipo_descuento;
        $valorDescuento = $validated['valor_descuento'] ?? $venta->valor_descuento;
        $montoDescuento = 0;

        if ($tipoDescuento === 'porcentaje') {
            $montoDescuento = round($subtotal * ($valorDescuento / 100));
        } else {
            $montoDescuento = round($valorDescuento);
        }

        $baseImponible = max(0, $subtotal - $montoDescuento);
        $incluyeIva = $validated['incluye_iva'] ?? $venta->incluye_iva;
        $iva = $incluyeIva ? round($baseImponible * 0.19) : 0;
        $total = $baseImponible + $iva;

        $venta->update([
            'numero' => $validated['numero_factura'] ?? $venta->numero,
            'cliente_id' => $validated['cliente_id'] ?? $venta->cliente_id,
            'fecha' => $validated['fecha'] ?? $venta->fecha,
            'subtotal' => (int) $subtotal,
            'iva' => (int) $iva,
            'total' => (int) $total,
            'monto_descuento' => (int) $montoDescuento,
            'valor_descuento' => $valorDescuento,
            'tipo_descuento' => $tipoDescuento,
            'incluye_iva' => (bool) $incluyeIva,
            'estado' => $validated['estado'] ?? $venta->estado,
            'notas' => $validated['notas'] ?? $venta->notas,
        ]);

        if ($estadoAnterior !== 'pagada' && $venta->estado === 'pagada') {
            $this->procesarPago($venta);
        }

        // Re-sync productos: delete old and create new
        $venta->detalleVentas()->delete();

        foreach ($validated['productos'] as $item) {
            $subtotalItem = round($item['cantidad'] * $item['precio_unitario']);

            DetalleVenta::create([
                'venta_id' => $venta->id,
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => round($item['precio_unitario']),
                'subtotal' => (int) $subtotalItem,
            ]);
        }

        return redirect()->route('ventas.index');
    }

    public function destroy(Venta $venta): RedirectResponse
    {
        if ($this->usuarioEsCliente() && $venta->cliente_id !== $this->getClienteAuth()->id) {
            abort(403, 'No tienes permiso para eliminar esta venta.');
        }

        $venta->delete();

        return redirect()->route('ventas.index');
    }

    public function updateStatus(Request $request, Venta $venta): RedirectResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:pendiente,pagada,cancelada',
        ]);

        $estadoAnterior = $venta->estado;

        $venta->update([
            'estado' => $validated['estado'],
        ]);

        if ($estadoAnterior !== 'pagada' && $venta->estado === 'pagada') {
            $this->procesarPago($venta);
        }

        return redirect()->back();
    }

    public function downloadPdf(Venta $venta)
    {
        $venta->load(['cliente', 'detalleVentas.producto']);
        $pdf = Pdf::loadView('pdf.venta', compact('venta'));

        return $pdf->download('venta_'.$venta->numero.'.pdf');
    }

    public function exportCsv(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Venta::with(['cliente', 'detalleVentas.producto'])
            ->where('owner_id', $ownerId);

        if ($request->query('fecha_desde')) {
            $query->where(fn ($q) => $q->where('fecha', '>=', Carbon::parse($request->query('fecha_desde'))->startOfDay()));
        }
        if ($request->query('fecha_hasta')) {
            $query->where(fn ($q) => $q->where('fecha', '<=', Carbon::parse($request->query('fecha_hasta'))->endOfDay()));
        }

        $query->orderBy('fecha', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where(fn ($q) => $q->where('cliente_id', $this->getClienteAuth()->id));
        }

        $ventas = $query->get();
        $filename = 'ventas_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () use ($ventas) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Numero', 'Fecha', 'Cliente_Email', 'Estado',
                'Item_Descripcion', 'Item_Cantidad', 'Item_Precio', 'Subtotal', 'IVA', 'Total', 'Notas',
            ], ';');

            foreach ($ventas as $v) {
                if ($v->detalleVentas->isEmpty()) {
                    fputcsv($file, [
                        $v->numero,
                        $v->fecha ? Carbon::parse($v->fecha)->format('Y-m-d') : '',
                        $v->cliente->email ?? '',
                        $v->estado,
                        '', '', '',
                        $v->subtotal, $v->iva, $v->total, $v->notas,
                    ], ';');
                } else {
                    foreach ($v->detalleVentas as $d) {
                        fputcsv($file, [
                            $v->numero,
                            $v->fecha ? Carbon::parse($v->fecha)->format('Y-m-d') : '',
                            $v->cliente->email ?? '',
                            $v->estado,
                            $d->producto->nombre ?? 'Producto Eliminado',
                            $d->cantidad, $d->precio_unitario,
                            $v->subtotal, $v->iva, $v->total, $v->notas,
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
        $query = Venta::with(['cliente', 'detalleVentas.producto'])
            ->where('owner_id', $ownerId);

        if ($request->query('fecha_desde')) {
            $query->where(fn ($q) => $q->where('fecha', '>=', Carbon::parse($request->query('fecha_desde'))->startOfDay()));
        }
        if ($request->query('fecha_hasta')) {
            $query->where(fn ($q) => $q->where('fecha', '<=', Carbon::parse($request->query('fecha_hasta'))->endOfDay()));
        }

        $query->orderBy('fecha', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where(fn ($q) => $q->where('cliente_id', $this->getClienteAuth()->id));
        }

        $ventas = $query->get();
        $filename = 'ventas_'.now()->format('Ymd_His').'.xls';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        return response()->stream(function () use ($ventas) {
            echo '<html><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><body><table border="1">';
            echo '<tr>
                <th style="background-color: #f2f2f2;">Numero</th>
                <th style="background-color: #f2f2f2;">Fecha</th>
                <th style="background-color: #f2f2f2;">Cliente_Email</th>
                <th style="background-color: #f2f2f2;">Estado</th>
                <th style="background-color: #f2f2f2;">Item_Descripcion</th>
                <th style="background-color: #f2f2f2;">Item_Cantidad</th>
                <th style="background-color: #f2f2f2;">Item_Precio</th>
                <th style="background-color: #f2f2f2;">Subtotal</th>
                <th style="background-color: #f2f2f2;">IVA</th>
                <th style="background-color: #f2f2f2;">Total</th>
                <th style="background-color: #f2f2f2;">Notas</th>
            </tr>';
            foreach ($ventas as $v) {
                if ($v->detalleVentas->isEmpty()) {
                    echo '<tr><td>'.$v->numero.'</td><td>'.($v->fecha ? Carbon::parse($v->fecha)->format('Y-m-d') : '').'</td><td>'.($v->cliente->email ?? '').'</td><td>'.$v->estado.'</td><td></td><td></td><td></td><td>'.$v->subtotal.'</td><td>'.$v->iva.'</td><td>'.$v->total.'</td><td>'.$v->notas.'</td></tr>';
                } else {
                    foreach ($v->detalleVentas as $d) {
                        echo '<tr><td>'.$v->numero.'</td><td>'.($v->fecha ? Carbon::parse($v->fecha)->format('Y-m-d') : '').'</td><td>'.($v->cliente->email ?? '').'</td><td>'.$v->estado.'</td><td>'.($d->producto->nombre ?? 'Producto Eliminado').'</td><td>'.$d->cantidad.'</td><td>'.$d->precio_unitario.'</td><td>'.$v->subtotal.'</td><td>'.$v->iva.'</td><td>'.$v->total.'</td><td>'.$v->notas.'</td></tr>';
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
            if (count($row) >= 11) {
                $rows[] = array_combine([
                    'numero', 'fecha', 'cliente_email', 'estado',
                    'item_descripcion', 'item_cantidad', 'item_precio',
                    'subtotal_header', 'iva_header', 'total_header', 'notas',
                ], array_slice($row, 0, 11));
            }
        }
        fclose($handle);

        if (empty($rows)) {
            return redirect()->back()->with('error', 'No se encontraron datos válidos en el archivo.');
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

                $subtotal = 0;
                $venta = Venta::updateOrCreate(
                    ['numero' => $numero, 'owner_id' => $ownerId],
                    [
                        'cliente_id' => $cliente->id,
                        'user_id' => auth()->id(),
                        'fecha' => $first['fecha'],
                        'estado' => $first['estado'] ?: 'pendiente',
                        'subtotal' => 0,
                        'iva' => 0,
                        'total' => 0,
                    ]
                );

                $venta->detalleVentas()->delete();

                foreach ($items as $item) {
                    $producto = Producto::where(fn ($q) => $q->where('nombre', $item['item_descripcion']))
                        ->where(fn ($q) => $q->where('owner_id', $ownerId))
                        ->first();

                    if (! $producto) {
                        continue;
                    }

                    $cantidad = (int) $item['item_cantidad'];
                    $precio = round($item['item_precio']);
                    $itemSubtotal = round($cantidad * $precio);

                    DetalleVenta::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $producto->id,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio,
                        'subtotal' => (int) $itemSubtotal,
                    ]);

                    $subtotal += $itemSubtotal;
                }

                $iva = round($subtotal * 0.19);
                $venta->update([
                    'subtotal' => (int) $subtotal,
                    'iva' => (int) $iva,
                    'total' => (int) ($subtotal + $iva),
                ]);

                $importedCount++;
            }
        });

        return redirect()->back()->with('success', "Se procesaron $importedCount ventas correctamente.");
    }

    private function procesarPago(Venta $venta): void
    {
        DB::transaction(function () use ($venta) {
            // 1. Registro en Tesorería (Flujo de Caja)
            $existeTesoreria = Tesoreria::where(fn ($q) => $q->where('referencia', $venta->numero))->exists();
            if (! $existeTesoreria) {
                Tesoreria::create([
                    'owner_id' => $venta->owner_id,
                    'tipo' => 'ingreso',
                    'monto' => $venta->total,
                    'descripcion' => "Ingreso por Venta #{$venta->numero}",
                    'fecha' => now(),
                    'referencia' => $venta->numero,
                    'estado' => 'completado',
                ]);
            }

            // 2. Registro Contable (Asiento Diario)
            $existeAsiento = Asiento::where(fn ($q) => $q->where('descripcion', 'LIKE', "%Venta #{$venta->numero}%"))->exists();
            if (! $existeAsiento) {
                $asiento = Asiento::create([
                    'owner_id' => $venta->owner_id,
                    'fecha' => now(),
                    'numero' => 'AS-VNT-'.str_pad($venta->id, 6, '0', STR_PAD_LEFT),
                    'descripcion' => "Registro de contable Venta #{$venta->numero}",
                    'tipo' => 'venta',
                    'total_debe' => $venta->total,
                    'total_haber' => $venta->total,
                    'estado' => true,
                ]);

                // Detalle 1: Ingreso a Caja/Banco (Debe)
                $asiento->detalles()->create([
                    'cuenta' => 'Caja/Banco',
                    'cuenta_codigo' => '1.1.01',
                    'descripcion' => 'Ingreso por venta',
                    'debe' => $venta->total,
                    'haber' => 0,
                ]);

                // Detalle 2: Ingreso por Ventas (Haber - Subtotal)
                $asiento->detalles()->create([
                    'cuenta' => 'Ventas',
                    'cuenta_codigo' => '4.1.01',
                    'descripcion' => 'Venta de productos/servicios',
                    'debe' => 0,
                    'haber' => $venta->subtotal,
                ]);

                // Detalle 3: IVA por Pagar (Haber - Impuesto)
                if ($venta->iva > 0) {
                    $asiento->detalles()->create([
                        'cuenta' => 'IVA Débito Fiscal',
                        'cuenta_codigo' => '2.1.03',
                        'descripcion' => 'Impuesto sobre ventas',
                        'debe' => 0,
                        'haber' => $venta->iva,
                    ]);
                }
            }

            // 3. Descontar Inventario
            $venta->load('detalleVentas');
            foreach ($venta->detalleVentas as $item) {
                $inventario = Inventario::where(fn ($q) => $q->where('producto_id', $item->producto_id))->first();
                if ($inventario && $inventario->cantidad >= $item->cantidad) {
                    $inventario->decrement('cantidad', $item->cantidad);
                }

                $producto = Producto::find($item->producto_id);
                if ($producto && $producto->envase_retornable) {
                    $vacio = Vacio::firstOrNew(['producto_id' => $item->producto_id]);
                    $vacio->cantidad = ($vacio->cantidad ?? 0) + $item->cantidad;
                    $vacio->estado = 'entregado';
                    $vacio->save();
                }
            }
        });
    }
}
