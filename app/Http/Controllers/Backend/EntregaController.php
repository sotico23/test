<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Conductor;
use App\Models\Entrega;
use App\Models\Vehiculo;
use App\Models\Venta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EntregaController extends Controller
{
    public function index(): Response
    {
        $entregas = Entrega::orderBy('created_at', 'desc')->paginate(15);
        $vehiculos = Vehiculo::orderBy('marca')->get();
        $conductores = Conductor::orderBy('nombre')->get();
        $clientes = Cliente::orderBy('nombre')->get();
        $ventas = Venta::whereIn('estado', ['pagada', 'confirmado'])->with('detalleVentas.producto')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Backend/Entregas/Index', [
            'entregas' => $entregas,
            'vehiculos' => $vehiculos,
            'conductores' => $conductores,
            'clientes' => $clientes,
            'ventas' => $ventas,
        ]);
    }

    public function store(Request $request): RedirectResponse
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
        Entrega::create($validated);

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
