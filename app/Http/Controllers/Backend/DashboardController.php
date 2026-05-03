<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\CafFolio;
use App\Models\ConfiguracionSii;
use App\Models\DashboardConfig;
use App\Models\Mensaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $dashboardConfig = DashboardConfig::getForUser($user->id);

        $ownerId = $user->getOwnerId();
        $anioActual = now()->year;
        $mesActual = now()->month;

        $esSuperAdmin = $user->hasRole('Super Admin');
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('Admin');
        $esEmpleado = $user->hasRole('Empleado');
        $esCliente = $user->hasRole('Cliente') || $user->cliente !== null;

        // Common metric: Unread Messages
        $mensajesSinLeer = Mensaje::where('receiver_id', $user->id)->where('leido', false)->count();

        $stats = [];
        $proyecciones = [];
        $cashFlowData = [];
        $topProductos = [];

        if ($esSuperAdmin || $esAdmin) {
            $baseVentas = DB::table('ventas')->where('estado', 'pagada');
            $baseCompras = DB::table('compras');
            $baseProductos = DB::table('productos');

            if (! $esSuperAdmin) {
                // We use owner_id as the primary filter for multi-tenancy
                $baseVentas->where('owner_id', $ownerId);
                $baseCompras->join('proveedors', 'compras.proveedor_id', '=', 'proveedors.id')
                    ->where('proveedors.owner_id', $ownerId);
                $baseProductos->where('owner_id', $ownerId);
            } else {
                // For super admins, we still join compras to avoid column ambiguity if needed
                $baseCompras->join('proveedors', 'compras.proveedor_id', '=', 'proveedors.id');
            }

            // 1. VENTAS (Gross & Net & IVA Débito) - Broaden to YEAR TO DATE for "Real" feel if month is empty
            $ventasStats = (clone $baseVentas)
                ->whereYear('fecha', $anioActual)
                ->whereMonth('fecha', $mesActual)
                ->selectRaw('SUM(total) as gross, SUM(subtotal) as net, SUM(iva) as iva_debito')
                ->first();

            // If empty, fall back to Year to Date
            if (! (optional($ventasStats)->gross)) {
                $ventasStats = (clone $baseVentas)
                    ->whereYear('fecha', $anioActual)
                    ->selectRaw('SUM(total) as gross, SUM(subtotal) as net, SUM(iva) as iva_debito')
                    ->first();
            }

            // Final fallback to zero object
            $ventasStats = $ventasStats ?: (object) ['gross' => 0, 'net' => 0, 'iva_debito' => 0];

            // 2. COMPRAS (IVA Crédito)
            $comprasStats = (clone $baseCompras)
                ->whereYear('compras.fecha', $anioActual)
                ->whereMonth('compras.fecha', $mesActual)
                ->selectRaw('SUM(compras.total) as gross, SUM(compras.subtotal) as net, SUM(compras.iva) as iva_credito')
                ->first();

            if (! (optional($comprasStats)->gross)) {
                $comprasStats = (clone $baseCompras)
                    ->whereYear('compras.fecha', $anioActual)
                    ->selectRaw('SUM(compras.total) as gross, SUM(compras.subtotal) as net, SUM(compras.iva) as iva_credito')
                    ->first();
            }

            // Final fallback to zero object
            $comprasStats = $comprasStats ?: (object) ['gross' => 0, 'net' => 0, 'iva_credito' => 0];

            // 3. CUENTAS POR COBRAR / PAGAR
            $porCobrar = (clone $baseVentas)->where('estado', 'pendiente')->sum('total');
            $porPagar = (clone $baseCompras)->where('compras.estado', 'pendiente')->sum('compras.total');

            // 4. STOCK CRÍTICO
            $stockCritico = (clone $baseProductos)
                ->whereRaw('stock_minimo >= (select COALESCE(sum(cantidad), 0) from inventarios where producto_id = productos.id)')
                ->count();

            $utilidadNeta = ((float) ($ventasStats->net ?? 0)) - ((float) ($comprasStats->net ?? 0));

            $stats = [
                'ventas' => (object) [
                    'label' => 'Ventas (Año)',
                    'value' => $this->formatCurrency($ventasStats->gross ?? 0),
                    'subValue' => 'Neto: '.$this->formatCurrency($ventasStats->net ?? 0),
                    'trend' => 'up',
                    'color' => 'indigo',
                    'url' => '/ventas',
                ],
                'iva' => (object) [
                    'label' => 'IVA Estimado',
                    'value' => $this->formatCurrency(max(0, ($ventasStats->iva_debito ?? 0) - ($comprasStats->iva_credito ?? 0))),
                    'subValue' => 'Basado en año actual',
                    'trend' => 'neutral',
                    'color' => 'amber',
                    'url' => '/impuestos',
                ],
                'utilidad' => (object) [
                    'label' => 'Utilidad Neta',
                    'value' => $this->formatCurrency($utilidadNeta),
                    'subValue' => 'Ingresos - Egresos (YTD)',
                    'trend' => $utilidadNeta >= 0 ? 'up' : 'down',
                    'color' => 'emerald',
                    'url' => '/contabilidad',
                ],
                'cartera' => (object) [
                    'label' => 'Cuentas x Cobrar',
                    'value' => $this->formatCurrency($porCobrar),
                    'subValue' => 'Facturas Pendientes',
                    'trend' => 'neutral',
                    'color' => 'blue',
                    'url' => '/cobranzas',
                ],
                'pagables' => (object) [
                    'label' => 'Cuentas x Pagar',
                    'value' => $this->formatCurrency($porPagar),
                    'subValue' => 'Compras Pendientes',
                    'trend' => 'down',
                    'color' => 'rose',
                    'url' => '/pagos',
                ],
                'stock' => (object) [
                    'label' => 'Stock Crítico',
                    'value' => $stockCritico,
                    'subValue' => 'Productos a Reponer',
                    'trend' => $stockCritico > 0 ? 'down' : 'up',
                    'color' => 'orange',
                    'url' => '/inventarios',
                ],
            ];

            // 5. TOP PRODUCTOS
            $topProductosQuery = DB::table('detalle_ventas')
                ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id');

            if (! $esSuperAdmin) {
                $topProductosQuery->where('productos.owner_id', $ownerId);
            }

            $topProductos = $topProductosQuery
                ->select('productos.nombre', DB::raw('SUM(detalle_ventas.cantidad) as total_cantidad'), DB::raw('SUM(detalle_ventas.subtotal) as total_venta'))
                ->groupBy('productos.id', 'productos.nombre')
                ->orderByDesc('total_cantidad')
                ->limit(5)
                ->get();

            // 6. PROYECCIONES & CASHFLOW (Last 6 months + Next 6 months)
            $cashFlowData = [];
            for ($i = 5; $i >= 0; $i--) {
                $targetDate = now()->subMonths($i);
                $qv = (clone $baseVentas)->whereYear('fecha', $targetDate->year)->whereMonth('fecha', $targetDate->month);
                $qc = (clone $baseCompras)->whereYear('compras.fecha', $targetDate->year)->whereMonth('compras.fecha', $targetDate->month);

                $v = $qv->sum('total');
                $c = $qc->sum('compras.total');

                $cashFlowData[] = [
                    'mes' => $targetDate->translatedFormat('M'),
                    'ingresos' => (float) $v,
                    'egresos' => (float) $c,
                    'balance' => (float) ($v - $c),
                ];
            }

            $lastValue = $ventasStats->gross ?? 0;
            $proyecciones = [];
            for ($i = 1; $i <= 6; $i++) {
                $futureDate = now()->addMonths($i);
                $lastValue = $lastValue * 1.05; // 5% base growth
                $proyecciones[] = [
                    'mes' => $futureDate->translatedFormat('M'),
                    'total' => round($lastValue, 2),
                    'es_proyeccion' => true,
                ];
            }
        }

        $siiStats = null;
        if ($esSuperAdmin || $esAdmin) {
            $siiConfig = ConfiguracionSii::where('owner_id', $ownerId)->first();
            $cafs = CafFolio::where('owner_id', $ownerId)->where('agotado', false)->get();
            $hasSiiToken = Cache::has('sii_token');

            $siiStats = [
                'ambiente' => $siiConfig->ambiente ?? config('sii.ambiente', 'certificacion'),
                'emisor' => $siiConfig ? [
                    'rut' => $siiConfig->rut,
                    'razon_social' => $siiConfig->razon_social,
                ] : null,
                'token_activo' => $hasSiiToken,
                'folios_disponibles' => $cafs->map(fn ($c) => [
                    'tipo' => $c->tipo_documento,
                    'restantes' => ($c->folio_hasta - $c->folio_siguiente) + 1,
                ]),
            ];
        }

        $stats = (object) $stats;

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'cashFlowData' => Inertia::defer(fn () => $cashFlowData),
            'proyecciones' => Inertia::defer(fn () => $proyecciones),
            'topProductos' => Inertia::defer(fn () => $topProductos),
            'esSuperAdmin' => $esSuperAdmin,
            'esAdmin' => $esAdmin,
            'esEmpleado' => $esEmpleado,
            'esCliente' => $esCliente,
            'mensajesSinLeer' => $mensajesSinLeer,
            'userName' => $user->name,
            'dashboardConfig' => $dashboardConfig,
            'siiStats' => $siiStats,
        ]);
    }

    private function formatCurrency($value)
    {
        return '$'.number_format($value, 0, ',', '.');
    }

    public function saveConfig(Request $request)
    {
        $user = Auth::user();

        $data = [
            'mode' => $request->input('mode', 'grid'),
            'is_default' => true,
        ];

        $widgets = $request->input('widgets');
        if ($widgets) {
            if (is_string($widgets)) {
                $data['widgets'] = json_decode($widgets, true);
            } else {
                $data['widgets'] = $widgets;
            }
        }

        $layout = $request->input('layout');
        if ($layout) {
            if (is_string($layout)) {
                $data['layout'] = json_decode($layout, true);
            } else {
                $data['layout'] = $layout;
            }
        }

        $config = DashboardConfig::where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        if ($config) {
            $config->update($data);
        } else {
            DashboardConfig::create(array_merge($data, [
                'user_id' => $user->id,
            ]));
        }

        return back()->with('success', 'Configuración guardada');
    }
}
