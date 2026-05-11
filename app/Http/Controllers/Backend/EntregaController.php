<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Conductor;
use App\Models\Entrega;
use App\Models\Vehiculo;
use App\Models\Venta;
use App\Services\DeliveryStatsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EntregaController extends Controller
{
    public function __construct(protected DeliveryStatsService $statsService) {}

    public function index(Request $request): Response
    {
        $ownerId = Auth::user()->getOwnerId();

        $query = Entrega::where('owner_id', $ownerId)
            ->with(['items.producto', 'venta', 'conductor', 'vehiculo']);

        if ($request->filled('conductor_id')) {
            $query->where('conductor_id', $request->input('conductor_id'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $entregas = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $vehiculos = Vehiculo::where('owner_id', $ownerId)->orderBy('marca')->get();
        $conductores = Conductor::orderBy('nombre')->get(['id', 'nombre']);
        $clientes = Cliente::where('owner_id', $ownerId)->orderBy('nombre')->get();

        $ventas = Venta::where('owner_id', $ownerId)
            ->whereIn('estado', ['pagada', 'confirmado'])
            ->whereDoesntHave('entrega')
            ->with(['detalleVentas.producto', 'cliente'])
            ->orderBy('created_at', 'desc')
            ->get();

        $driverId = $request->input('conductor_id');
        $stats = $this->statsService->getDriverStats($ownerId, $driverId);

        return Inertia::render('Backend/Entregas/Index', [
            'entregas' => $entregas,
            'vehiculos' => $vehiculos,
            'conductores' => $conductores,
            'clientes' => $clientes,
            'ventas' => $ventas,
            'stats' => $stats,
            'filters' => $request->only(['conductor_id', 'estado']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'venta_id' => 'nullable|integer|exists:ventas,id',
            'vehiculo_id' => 'nullable|integer|exists:vehiculos,id',
            'conductor_id' => 'nullable|integer|exists:conductores,id',
            'cliente' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'fecha_entrega' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'descripcion' => 'nullable|string',
        ]);

        $ownerId = Auth::user()->getOwnerId();
        $validated['owner_id'] = $ownerId;

        $entrega = Entrega::create($validated);

        // Si tiene venta_id, crear los items de entrega automáticamente (Hoja de Carga)
        if ($entrega->venta_id) {
            $venta = Venta::with('detalleVentas.producto')->find($entrega->venta_id);
            if ($venta) {
                foreach ($venta->detalleVentas as $detalle) {
                    if (! $detalle->producto) {
                        continue;
                    }

                    $totals = $this->statsService->calculateItemTotals($detalle->producto_id, (float) $detalle->cantidad);

                    $entrega->items()->create([
                        'producto_id' => $detalle->producto_id,
                        'cantidad_pedida' => $detalle->cantidad,
                        'cantidad_entregada' => $detalle->cantidad, // Por defecto completo
                        'unidad_medida' => $detalle->producto->unidad_medida ?? 'unidad',
                        'subtotal_metrica' => ($totals['kg'] > 0) ? $totals['kg'] : $totals['litros'],
                        'unidades_totales' => $totals['unidades'],
                        'owner_id' => $ownerId,
                    ]);
                }
            }
        }

        return redirect()->route('entregas.index');
    }

    public function update(Request $request, Entrega $entrega): RedirectResponse
    {
        $validated = $request->validate([
            'venta_id' => 'nullable|integer',
            'vehiculo_id' => 'nullable|integer',
            'conductor_id' => 'nullable|integer',
            'cliente' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'fecha_entrega' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'productos_json' => 'nullable|string',
        ]);
        $entrega->update($validated);

        return redirect()->route('entregas.index');
    }

    public function destroy(Entrega $entrega): RedirectResponse
    {
        $entrega->delete();

        return redirect()->route('entregas.index');
    }
}
