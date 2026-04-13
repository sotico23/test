<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\ControlCalidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ControlCalidadController extends Controller
{
    public function index(): Response
    {
        $controles = ControlCalidad::orderBy('fecha', 'desc')->paginate(15);

        return Inertia::render('Backend/Calidad/Index', ['controles' => $controles]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lote' => 'nullable|string|max:100',
            'producto' => 'nullable|string|max:255',
            'tipo' => 'nullable|string|max:100',
            'resultado' => 'nullable|string|max:50',
            'cantidad_muestra' => 'nullable|integer|min:0',
            'cantidad_defectuosa' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string',
            'fecha' => 'nullable|date',
        ]);
        ControlCalidad::create($validated);

        return redirect()->route('calidad.index');
    }

    public function update(Request $request, ControlCalidad $calidad): RedirectResponse
    {
        $validated = $request->validate([
            'lote' => 'nullable|string|max:100',
            'producto' => 'nullable|string|max:255',
            'tipo' => 'nullable|string|max:100',
            'resultado' => 'nullable|string|max:50',
            'cantidad_muestra' => 'nullable|integer|min:0',
            'cantidad_defectuosa' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string',
            'fecha' => 'nullable|date',
        ]);
        $calidad->update($validated);

        return redirect()->route('calidad.index');
    }

    public function destroy(ControlCalidad $calidad): RedirectResponse
    {
        $calidad->delete();

        return redirect()->route('calidad.index');
    }
}
