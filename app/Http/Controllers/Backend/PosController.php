<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Requests\PromocionStoreRequest;
use App\Http\Requests\PromocionUpdateRequest;
use App\Models\Almacen;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\Promocion;
use App\Models\SkuVariante;
use App\Models\Venta;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $ownerId = Auth::user()->getOwnerId();

        $productos = Producto::with([
            'inventario',
            'skus' => function ($q) {
                $q->where('activo', true);
            },
            'skus.valores.varianteValor.variante',
        ])
            ->where('activo', true)
            ->where('owner_id', $ownerId)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'codigo' => $producto->codigo,
                    'precio_venta' => $producto->precio_venta,
                    'precio_con_variantes' => $producto->precio_con_variantes,
                    'stock' => $producto->stock_total,
                    'stock_minimo' => $producto->stock_minimo,
                    'unidad_medida' => $producto->unidad_medida,
                    'imagen' => $producto->imagen,
                    'tiene_variantes' => $producto->tiene_variantes,
                    'skus' => $producto->skus->map(function ($sku) {
                        return [
                            'id' => $sku->id,
                            'sku' => $sku->sku,
                            'precio_venta' => $sku->precio_venta,
                            'stock' => $sku->stock,
                            'variantes' => $sku->valores->map(function ($v) {
                                return [
                                    'variante' => $v->varianteValor->variante->nombre,
                                    'valor' => $v->varianteValor->valor,
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ];
            });

        $clientes = Cliente::where('owner_id', $ownerId)->get(['id', 'nombre', 'rut']);

        $promociones = Promocion::where('owner_id', $ownerId)
            ->where('activa', true)
            ->where(function ($q) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('fecha_inicio')->orWhere('fecha_inicio', '<=', now());
            })
            ->get(['id', 'nombre', 'tipo', 'valor', 'skus', 'categoria_id', 'compra_minima']);

        $almacenes = Almacen::where('owner_id', $ownerId)->get(['id', 'nombre']);

        return Inertia::render('Backend/Pos/Index', [
            'productos' => $productos,
            'clientes' => $clientes,
            'almacenes' => $almacenes,
            'promociones' => $promociones,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia',
            'tipo_documento' => 'required|in:boleta,factura',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:productos,id',
            'items.*.sku_id' => 'nullable',
            'items.*.cantidad' => 'required|numeric|min:0.001',
            'items.*.precio' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric',
            'iva' => 'required|numeric',
            'total' => 'required|numeric',
            'descuento' => 'nullable|numeric|min:0',
            'almacen_id' => 'required|exists:almacenes,id',
        ]);

        try {
            DB::beginTransaction();

            $clienteId = $request->cliente_id ?? Cliente::where('owner_id', Auth::user()->getOwnerId())->first()?->id;
            $ownerId = Auth::user()->getOwnerId();
            $descuento = $request->descuento ?? 0;

            $venta = Venta::create([
                'owner_id' => $ownerId,
                'user_id' => Auth::id(),
                'cliente_id' => $clienteId,
                'numero_factura' => 'POS-'.time(),
                'fecha' => now(),
                'subtotal' => (int) round($request->subtotal),
                'iva' => (int) round($request->iva),
                'total' => (int) round($request->total),
                'descuento' => (int) round($descuento),
                'metodo_pago' => $request->metodo_pago,
                'tipo_documento' => $request->tipo_documento,
                'almacen_id' => $request->almacen_id,
                'es_pos' => true,
                'estado' => 'pagada',
            ]);

            foreach ($request->items as $item) {
                $producto = Producto::find($item['id']);
                $precioUnitario = round($item['precio']);

                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'], // Preserve decimal for weights
                    'precio_unitario' => (int) $precioUnitario,
                    'subtotal' => (int) round($precioUnitario * $item['cantidad']),
                    'sku_variante_id' => $item['sku_id'] ?? null,
                ]);

                if ($item['sku_id']) {
                    $sku = SkuVariante::find($item['sku_id']);
                    if ($sku) {
                        $sku->decrement('stock', $item['cantidad']);
                    }
                }

                // Deduct from specific warehouse inventory
                $inventario = Inventario::where('producto_id', $producto->id)
                    ->where('almacen_id', $request->almacen_id)
                    ->first();

                if ($inventario) {
                    $inventario->decrement('cantidad', $item['cantidad']);
                } else {
                    // Create if doesn't exist (safety)
                    Inventario::create([
                        'producto_id' => $producto->id,
                        'almacen_id' => $request->almacen_id,
                        'cantidad' => -$item['cantidad'],
                        'owner_id' => $ownerId,
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Venta realizada con éxito.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Error al procesar la venta: '.$e->getMessage());
        }
    }

    public function cierreCaja(Request $request)
    {
        $fechaDesde = $request->query('fecha_desde')
            ? Carbon::parse($request->query('fecha_desde'))->startOfDay()
            : now()->startOfDay();
        $fechaHasta = $request->query('fecha_hasta')
            ? Carbon::parse($request->query('fecha_hasta'))->endOfDay()
            : now()->endOfDay();

        $ownerId = Auth::user()->getOwnerId();
        $ventas = Venta::where('owner_id', $ownerId)
            ->where('es_pos', true)
            ->whereBetween('fecha', [$fechaDesde, $fechaHasta])
            ->orderBy('created_at', 'desc')
            ->get();

        $arqueo = [
            'efectivo' => $ventas->where('metodo_pago', 'efectivo')->sum('total'),
            'tarjeta' => $ventas->where('metodo_pago', 'tarjeta')->sum('total'),
            'transferencia' => $ventas->where('metodo_pago', 'transferencia')->sum('total'),
            'total' => $ventas->sum('total'),
            'cantidad_ventas' => $ventas->count(),
            'fecha_desde' => $fechaDesde->toDateString(),
            'fecha_hasta' => $fechaHasta->toDateString(),
            'detalle' => $ventas->map(function ($v) {
                return [
                    'id' => $v->id,
                    'fecha' => $v->created_at->format('d/m/Y'),
                    'hora' => $v->created_at->format('H:i'),
                    'tipo' => 'Venta',
                    'metodo' => ucfirst($v->metodo_pago),
                    'documento' => ucfirst($v->tipo_documento).' #'.($v->numero_factura ?? $v->id),
                    'monto' => $v->total,
                ];
            })->values(),
        ];

        return Inertia::render('Backend/Pos/CierreCaja', [
            'arqueo' => $arqueo,
        ]);
    }

    public function exportarArqueoPdf(Request $request)
    {
        $fechaDesde = $request->query('fecha_desde')
            ? Carbon::parse($request->query('fecha_desde'))->startOfDay()
            : now()->startOfDay();
        $fechaHasta = $request->query('fecha_hasta')
            ? Carbon::parse($request->query('fecha_hasta'))->endOfDay()
            : now()->endOfDay();

        $ownerId = Auth::user()->getOwnerId();
        $ventas = Venta::where('owner_id', $ownerId)
            ->where('es_pos', true)
            ->whereBetween('fecha', [$fechaDesde, $fechaHasta])
            ->orderBy('created_at', 'desc')
            ->get();

        $data = [
            'efectivo' => $ventas->where('metodo_pago', 'efectivo')->sum('total'),
            'tarjeta' => $ventas->where('metodo_pago', 'tarjeta')->sum('total'),
            'transferencia' => $ventas->where('metodo_pago', 'transferencia')->sum('total'),
            'total' => $ventas->sum('total'),
            'cantidad_ventas' => $ventas->count(),
            'fecha_desde' => $fechaDesde->format('d/m/Y'),
            'fecha_hasta' => $fechaHasta->format('d/m/Y'),
            'usuario' => Auth::user()->name,
            'detalle' => $ventas->map(function ($v) {
                return [
                    'fecha' => $v->created_at->format('d/m/Y'),
                    'hora' => $v->created_at->format('H:i'),
                    'metodo' => ucfirst($v->metodo_pago),
                    'documento' => ucfirst($v->tipo_documento).' #'.($v->numero_factura ?? $v->id),
                    'monto' => $v->total,
                ];
            }),
        ];

        $pdf = Pdf::loadView('pdf.arqueo-caja', $data);

        return $pdf->download('arqueo_caja_'.$fechaDesde->format('Ymd').'_'.$fechaHasta->format('Ymd').'.pdf');
    }

    public function exportarArqueoCsv(Request $request)
    {
        $fechaDesde = $request->query('fecha_desde')
            ? Carbon::parse($request->query('fecha_desde'))->startOfDay()
            : now()->startOfDay();
        $fechaHasta = $request->query('fecha_hasta')
            ? Carbon::parse($request->query('fecha_hasta'))->endOfDay()
            : now()->endOfDay();

        $ownerId = Auth::user()->getOwnerId();
        $ventas = Venta::where('owner_id', $ownerId)
            ->where('es_pos', true)
            ->whereBetween('fecha', [$fechaDesde, $fechaHasta])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'arqueo_caja_'.$fechaDesde->format('Ymd').'_'.$fechaHasta->format('Ymd').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($ventas) {
            $file = fopen('php://output', 'w');
            // BOM for UTF-8 Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Fecha', 'Hora', 'Tipo', 'Método de Pago', 'Documento', 'Monto'], ';');

            foreach ($ventas as $v) {
                fputcsv($file, [
                    $v->created_at->format('d/m/Y'),
                    $v->created_at->format('H:i'),
                    'Venta',
                    ucfirst($v->metodo_pago),
                    ucfirst($v->tipo_documento).' #'.($v->numero_factura ?? $v->id),
                    number_format($v->total, 0, ',', '.'),
                ], ';');
            }

            // Summary row
            fputcsv($file, [], ';');
            fputcsv($file, ['', '', '', '', 'TOTAL', number_format($ventas->sum('total'), 0, ',', '.')], ';');
            fputcsv($file, ['', '', '', '', 'Efectivo', number_format($ventas->where('metodo_pago', 'efectivo')->sum('total'), 0, ',', '.')], ';');
            fputcsv($file, ['', '', '', '', 'Tarjeta', number_format($ventas->where('metodo_pago', 'tarjeta')->sum('total'), 0, ',', '.')], ';');
            fputcsv($file, ['', '', '', '', 'Transferencia', number_format($ventas->where('metodo_pago', 'transferencia')->sum('total'), 0, ',', '.')], ';');

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function facturacion()
    {
        $ownerId = Auth::user()->getOwnerId();
        $documentos = Venta::query()
            ->with('cliente')
            ->where('owner_id', $ownerId)
            ->where('es_pos', true)
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Backend/Pos/Facturacion', [
            'documentos' => $documentos,
        ]);
    }

    public function promociones()
    {
        $ownerId = Auth::user()->getOwnerId();
        $promociones = Promocion::with('categoria')
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->get();

        $categorias = Categoria::where('activo', true)->where('owner_id', $ownerId)->get(['id', 'nombre']);

        return Inertia::render('Backend/Pos/Promociones', [
            'promociones' => $promociones,
            'categorias' => $categorias,
        ]);
    }

    public function storePromocion(PromocionStoreRequest $request)
    {
        $data = $request->validated();
        $data['owner_id'] = Auth::user()->getOwnerId();
        $data['user_id'] = Auth::id();

        if (isset($data['skus']) && is_array($data['skus'])) {
            $data['skus'] = array_values(array_filter($data['skus']));
            if (empty($data['skus'])) {
                $data['skus'] = null;
            }
        }

        Promocion::create($data);

        return redirect()->route('pos.promociones')->with('success', 'Promoción creada correctamente.');
    }

    public function updatePromocion(PromocionUpdateRequest $request, Promocion $promocion)
    {
        $data = $request->validated();

        if (isset($data['skus']) && is_array($data['skus'])) {
            $data['skus'] = array_values(array_filter($data['skus']));
            if (empty($data['skus'])) {
                $data['skus'] = null;
            }
        }

        $promocion->update($data);

        return redirect()->route('pos.promociones')->with('success', 'Promoción actualizada correctamente.');
    }

    public function togglePromocion(Promocion $promocion)
    {
        $promocion->update(['activa' => ! $promocion->activa]);

        return redirect()->route('pos.promociones')->with('success', $promocion->activa ? 'Promoción activada.' : 'Promoción desactivada.');
    }

    public function destroyPromocion(Promocion $promocion)
    {
        $promocion->delete();

        return redirect()->route('pos.promociones')->with('success', 'Promoción eliminada.');
    }

    public function reportes(Request $request)
    {
        $ownerId = Auth::user()->getOwnerId();
        $almacenId = $request->query('almacen_id');

        // Ranking de productos
        $rankingQuery = Producto::join('detalle_ventas', 'productos.id', '=', 'detalle_ventas.producto_id')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->select('productos.nombre', DB::raw('SUM(detalle_ventas.cantidad) as total_vendidos'), DB::raw('SUM(detalle_ventas.subtotal) as total_ingresos'))
            ->where('productos.owner_id', $ownerId)
            ->where('ventas.estado', 'pagada');

        if ($almacenId) {
            $rankingQuery->where('ventas.almacen_id', $almacenId);
        }

        $ranking = $rankingQuery->groupBy('productos.id', 'productos.nombre')
            ->orderBy('total_vendidos', 'desc')
            ->get();

        // Utilidad aproximada
        $utilidadQuery = Venta::join('detalle_ventas', 'ventas.id', '=', 'detalle_ventas.venta_id')
            ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
            ->select(DB::raw('SUM(detalle_ventas.subtotal - (productos.precio_compra * detalle_ventas.cantidad)) as utilidad_total'))
            ->where('ventas.owner_id', $ownerId)
            ->where('ventas.estado', 'pagada');

        if ($almacenId) {
            $utilidadQuery->where('ventas.almacen_id', $almacenId);
        }

        $utilidadData = $utilidadQuery->first();

        // Total Mes
        $totalMesQuery = Venta::where('owner_id', $ownerId)
            ->where('estado', 'pagada')
            ->whereMonth('fecha', now()->month);

        if ($almacenId) {
            $totalMesQuery->where('almacen_id', $almacenId);
        }

        $totalMes = $totalMesQuery->sum('total');

        $almacenes = Almacen::where('owner_id', $ownerId)->get(['id', 'nombre']);

        return Inertia::render('Backend/Pos/Reportes', [
            'ranking' => $ranking,
            'utilidad' => $utilidadData->utilidad_total ?? 0,
            'totalMes' => $totalMes,
            'almacenes' => $almacenes,
            'almacenId' => $almacenId,
        ]);
    }
}
