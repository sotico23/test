<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\CargaDiaria;
use App\Models\CargaDiariaProducto;
use App\Models\Conductor;
use App\Models\Producto;
use App\Models\Vehiculo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CargaDiariaController extends Controller
{
    public function index(): Response
    {
        $cargas = CargaDiaria::with(['vehiculo', 'conductor', 'productos.producto'])->orderBy('created_at', 'desc')->paginate(15);
        $vehiculos = Vehiculo::orderBy('marca')->get();
        $conductores = Conductor::orderBy('nombre')->get();
        $productos = Producto::orderBy('nombre')->get();

        return Inertia::render('Backend/CargaDiaria/Index', [
            'cargas' => $cargas,
            'vehiculos' => $vehiculos,
            'conductores' => $conductores,
            'productos' => $productos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'conductor_id' => 'required|exists:conductores,id',
            'fecha' => 'required|date',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'productos' => 'nullable|array',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $carga = CargaDiaria::create([
                    'vehiculo_id' => $validated['vehiculo_id'],
                    'conductor_id' => $validated['conductor_id'],
                    'fecha' => $validated['fecha'],
                    'estado' => $validated['estado'] ?? 'pendiente',
                    'notas' => $validated['notas'] ?? null,
                ]);

                if (! empty($validated['productos'])) {
                    foreach ($validated['productos'] as $prod) {
                        CargaDiariaProducto::create([
                            'carga_diaria_id' => $carga->id,
                            'producto_id' => $prod['producto_id'],
                            'cantidad_bordo' => $prod['cantidad'],
                        ]);
                    }
                }
            });

            return redirect()->route('cargas-diarias.index')->with('success', 'Carga diaria registrada con éxito.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar la carga: '.$e->getMessage());
        }
    }

    public function show(CargaDiaria $cargaDiaria): Response
    {
        $cargaDiaria->load(['vehiculo', 'conductor', 'productos.producto']);

        return Inertia::render('Backend/CargaDiaria/Show', [
            'carga' => $cargaDiaria,
        ]);
    }

    public function update(Request $request, CargaDiaria $cargaDiaria): RedirectResponse
    {
        $validated = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'conductor_id' => 'required|exists:conductores,id',
            'fecha' => 'required|date',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);

        try {
            $cargaDiaria->update($validated);

            return redirect()->route('cargas-diarias.index')->with('success', 'Carga diaria actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar la carga: '.$e->getMessage());
        }
    }

    public function destroy(CargaDiaria $cargaDiaria): RedirectResponse
    {
        try {
            $cargaDiaria->delete();

            return redirect()->route('cargas-diarias.index')->with('success', 'Carga eliminada correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar la carga: '.$e->getMessage());
        }
    }
}
