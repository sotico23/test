<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Vacio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VacioController extends Controller
{
    public function index(): Response
    {
        $vacios = Vacio::with('producto')->orderBy('updated_at', 'desc')->get();
        $productos = Producto::where('activo', true)->where('envase_retornable', true)->get();

        return Inertia::render('Backend/Vacios/Index', [
            'vacios' => $vacios,
            'productos' => $productos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:0',
            'cantidad_minima' => 'required|integer|min:0',
            'estado' => 'required|in:disponible,entregado,retornado,perdido',
            'ubicacion' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string',
        ]);

        Vacio::create($validated);

        return redirect()->route('vacios.index');
    }

    public function update(Request $request, Vacio $vacio): RedirectResponse
    {
        $validated = $request->validate([
            'cantidad' => 'required|integer|min:0',
            'cantidad_minima' => 'required|integer|min:0',
            'estado' => 'required|in:disponible,entregado,retornado,perdido',
            'ubicacion' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string',
        ]);

        $vacio->update($validated);

        return redirect()->route('vacios.index');
    }

    public function destroy(Vacio $vacio): RedirectResponse
    {
        $vacio->delete();

        return redirect()->route('vacios.index');
    }

    public function retornar(Request $request, Vacio $vacio): RedirectResponse
    {
        $validated = $request->validate([
            'cantidad' => 'required|integer|min:1',
        ]);

        $vacio->decrement('cantidad', $validated['cantidad']);

        if ($vacio->cantidad <= 0) {
            $vacio->delete();
        }

        return redirect()->route('vacios.index');
    }
}
