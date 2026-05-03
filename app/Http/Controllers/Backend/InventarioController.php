<?php

namespace App\Http\Controllers\Backend;

use App\Exports\InventariosExport;
use App\Http\Controllers\Controller;
use App\Imports\InventariosImport;
use App\Models\Almacen;
use App\Models\Inventario;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventarioController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = Auth::user()->getOwnerId();

        $almacenes = Almacen::where('activo', true)
            ->where('owner_id', $ownerId)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        $almacenIds = $almacenes->pluck('id')->toArray();

        $query = Inventario::whereHas('producto', fn ($q) => $q->where('owner_id', $ownerId))
            ->whereIn('almacen_id', $almacenIds)
            ->with(['producto.categoria', 'almacen']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('producto', fn ($pq) => $pq->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                )->orWhere('ubicacion', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('cantidad', '<=', 'cantidad_minima');
        }

        if ($request->filled('almacen_id')) {
            $query->where('almacen_id', $request->input('almacen_id'));
        }

        $inventarios = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $productos = Producto::where('activo', true)
            ->where('owner_id', $ownerId)
            ->get();

        return Inertia::render('Backend/Inventarios/Index', [
            'inventarios' => $inventarios,
            'productos' => $productos,
            'almacenes' => $almacenes,
            'filters' => $request->only(['search', 'stock_bajo', 'almacen_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'almacen_id' => 'required|exists:almacenes,id',
            'cantidad' => 'required|integer|min:0',
            'cantidad_minima' => 'required|integer|min:0',
            'ubicacion' => 'nullable|string|max:100',
        ]);

        $producto = Producto::where('id', $validated['producto_id'])
            ->where('owner_id', $ownerId)
            ->firstOrFail();

        $almacen = Almacen::where('id', $validated['almacen_id'])
            ->where('owner_id', $ownerId)
            ->firstOrFail();

        Inventario::create([
            'producto_id' => $validated['producto_id'],
            'almacen_id' => $validated['almacen_id'],
            'cantidad' => $validated['cantidad'],
            'cantidad_minima' => $validated['cantidad_minima'],
            'ubicacion' => $validated['ubicacion'] ?? null,
        ]);

        return redirect()->route('inventarios.index');
    }

    public function update(Request $request, Inventario $inventario): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $inventario->load('producto');

        if ($inventario->producto->owner_id !== $ownerId) {
            abort(403);
        }

        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'almacen_id' => 'required|exists:almacenes,id',
            'cantidad' => 'required|integer|min:0',
            'cantidad_minima' => 'required|integer|min:0',
            'ubicacion' => 'nullable|string|max:100',
        ]);

        $inventario->update($validated);

        return redirect()->route('inventarios.index');
    }

    public function destroy(Inventario $inventario): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $inventario->load('producto');

        if ($inventario->producto->owner_id !== $ownerId) {
            abort(403);
        }

        $inventario->delete();

        return redirect()->route('inventarios.index');
    }

    public function show(Inventario $inventario): Response
    {
        $ownerId = Auth::user()->getOwnerId();

        $inventario->load(['producto.categoria', 'almacen']);

        if ($inventario->producto->owner_id !== $ownerId) {
            abort(403);
        }

        return Inertia::render('Backend/Inventarios/Show', [
            'inventario' => $inventario,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $ownerId = auth()->user()->getOwnerId();

        $almacenes = Almacen::where('activo', true)
            ->where('owner_id', $ownerId)
            ->pluck('id')
            ->toArray();

        $query = Inventario::whereHas('producto', fn ($q) => $q->where('owner_id', $ownerId))
            ->whereIn('almacen_id', $almacenes)
            ->with(['producto', 'almacen']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('producto', fn ($pq) => $pq->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                )->orWhere('ubicacion', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('cantidad', '<=', 'cantidad_minima');
        }

        if ($request->filled('almacen_id')) {
            $query->where('almacen_id', $request->input('almacen_id'));
        }

        $inventarios = $query->orderBy('created_at', 'desc')->get();

        $filename = 'inventarios_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($inventarios) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Producto',
                'SKU',
                'Almacén',
                'Cantidad',
                'Stock Mínimo',
                'Ubicación',
            ], ';');

            foreach ($inventarios as $inv) {
                fputcsv($file, [
                    $inv->producto?->nombre ?? '',
                    $inv->producto?->sku ?? '',
                    $inv->almacen?->nombre ?? '',
                    $inv->cantidad,
                    $inv->cantidad_minima,
                    $inv->ubicacion ?? '',
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();

        $almacenes = Almacen::where('activo', true)
            ->where('owner_id', $ownerId)
            ->pluck('id')
            ->toArray();

        $query = Inventario::whereHas('producto', fn ($q) => $q->where('owner_id', $ownerId))
            ->whereIn('almacen_id', $almacenes)
            ->with(['producto', 'almacen']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('producto', fn ($pq) => $pq->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                )->orWhere('ubicacion', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('cantidad', '<=', 'cantidad_minima');
        }

        if ($request->filled('almacen_id')) {
            $query->where('almacen_id', $request->input('almacen_id'));
        }

        $inventarios = $query->orderBy('created_at', 'desc')->get();

        return Excel::download(new InventariosExport($inventarios), 'inventarios_'.now()->format('Ymd_His').'.xlsx');
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt',
        ]);

        Excel::import(new InventariosImport, $request->file('archivo'));

        return redirect()->route('inventarios.index')->with('success', 'Inventarios importadas correctamente.');
    }

    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls',
        ]);

        Excel::import(new InventariosImport, $request->file('archivo'));

        return redirect()->route('inventarios.index')->with('success', 'Inventarios importadas correctamente.');
    }
}
