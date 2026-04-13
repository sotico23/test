<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Campana;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampanaController extends Controller
{
    public function index(): Response
    {
        $campanas = Campana::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Campanas/Index', ['campanas' => $campanas]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:100',
            'canal' => 'nullable|string|max:100',
            'objetivo' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'presupuesto' => 'nullable|numeric|min:0',
            'presupuesto_real' => 'nullable|numeric|min:0',
            'visitas' => 'nullable|integer|min:0',
            'leads' => 'nullable|integer|min:0',
            'conversiones' => 'nullable|integer|min:0',
            'roi' => 'nullable|numeric',
            'estado' => 'required|string|max:50',
        ]);
        Campana::create($validated);

        return redirect()->route('campanas.index');
    }

    public function update(Request $request, Campana $campana): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:100',
            'canal' => 'nullable|string|max:100',
            'objetivo' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'presupuesto' => 'nullable|numeric|min:0',
            'presupuesto_real' => 'nullable|numeric|min:0',
            'visitas' => 'nullable|integer|min:0',
            'leads' => 'nullable|integer|min:0',
            'conversiones' => 'nullable|integer|min:0',
            'roi' => 'nullable|numeric',
            'estado' => 'required|string|max:50',
        ]);
        $campana->update($validated);

        return redirect()->route('campanas.index');
    }

    public function destroy(Campana $campana): RedirectResponse
    {
        $campana->delete();

        return redirect()->route('campanas.index');
    }
}
