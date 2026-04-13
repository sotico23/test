<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Almacen;
use App\Models\Inventario;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventarioController extends Controller
{
    public function index(): Response
    {
        $ownerId = Auth::user()->getOwnerId();

        $almacenes = Almacen::where('activo', true)
            ->where('owner_id', $ownerId)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        $almacenIds = $almacenes->pluck('id')->toArray();

        $inventarios = Inventario::whereHas('producto', fn ($q) => $q->where('owner_id', $ownerId))
            ->whereIn('almacen_id', $almacenIds)
            ->with('producto.categoria')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $productos = Producto::where('activo', true)
            ->where('owner_id', $ownerId)
            ->get();

        return Inertia::render('Backend/Inventarios/Index', [
            'inventarios' => $inventarios,
            'productos' => $productos,
            'almacenes' => $almacenes,
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
}
