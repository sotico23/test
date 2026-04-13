<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\Proveedor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompraController extends Controller
{
    public function index(): Response
    {
        $ownerId = Auth::user()->getOwnerId();
        $compras = Compra::with('proveedor', 'detalleCompras.producto')->where('owner_id', $ownerId)->orderBy('created_at', 'desc')->paginate(15);
        $proveedors = Proveedor::where('activo', true)->where('owner_id', $ownerId)->get();
        $productos = Producto::where('activo', true)->where('owner_id', $ownerId)->get();

        return Inertia::render('Backend/Compras/Index', [
            'compras' => $compras,
            'proveedors' => $proveedors,
            'productos' => $productos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:50|unique:compras,numero',
            'proveedor_id' => 'required|exists:proveedors,id',
            'fecha' => 'required|date',
            'estado' => 'required|in:pendiente,recibida,cancelada',
            'notas' => 'nullable|string',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        foreach ($validated['productos'] as $item) {
            $subtotal += $item['cantidad'] * $item['precio_unitario'];
        }
        $iva = round($subtotal * 0.19);
        $total = $subtotal + $iva;

        $compra = Compra::create([
            'owner_id' => Auth::user()->getOwnerId(),
            'numero' => $validated['numero'],
            'proveedor_id' => $validated['proveedor_id'],
            'fecha' => $validated['fecha'],
            'subtotal' => $subtotal,
            'iva' => $iva,
            'total' => $total,
            'estado' => $validated['estado'],
            'notas' => $validated['notas'] ?? null,
        ]);

        foreach ($validated['productos'] as $item) {
            $subtotalItem = $item['cantidad'] * $item['precio_unitario'];

            DetalleCompra::create([
                'compra_id' => $compra->id,
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $subtotalItem,
            ]);

            if ($validated['estado'] === 'recibida') {
                $inventario = Inventario::where('producto_id', $item['producto_id'])->first();
                if ($inventario) {
                    $inventario->increment('cantidad', $item['cantidad']);
                }
            }
        }

        return redirect()->route('compras.index');
    }

    public function update(Request $request, Compra $compra): RedirectResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:pendiente,recibida,cancelada',
            'notas' => 'nullable|string',
        ]);

        $estadoAnterior = $compra->estado;
        $compra->update($validated);

        if ($estadoAnterior !== 'recibida' && $validated['estado'] === 'recibida') {
            foreach ($compra->detalleCompras as $detalle) {
                $inventario = Inventario::where('producto_id', $detalle->producto_id)->first();
                if ($inventario) {
                    $inventario->increment('cantidad', $detalle->cantidad);
                }
            }
        }

        return redirect()->route('compras.index');
    }

    public function destroy(Compra $compra): RedirectResponse
    {
        if ($compra->owner_id !== Auth::user()->getOwnerId()) {
            abort(403, 'No tienes permiso para eliminar esta compra.');
        }

        $compra->delete();

        return redirect()->route('compras.index');
    }
}
