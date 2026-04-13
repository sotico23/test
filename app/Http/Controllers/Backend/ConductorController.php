<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Conductor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConductorController extends Controller
{
    public function index(): Response
    {
        $conductores = Conductor::orderBy('nombre')->paginate(15);

        return Inertia::render('Backend/Conductores/Index', ['conductores' => $conductores]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->has('rut') && $request->rut) {
            $request->merge(['rut' => strtoupper(trim($request->rut))]);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'rut' => 'nullable|string|max:20|unique:conductores,rut',
            'licencia' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        Conductor::create($validated);

        return redirect()->route('conductores.index');
    }

    public function update(Request $request, Conductor $conductor): RedirectResponse
    {
        if ($request->has('rut') && $request->rut) {
            $request->merge(['rut' => strtoupper(trim($request->rut))]);
        }

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'rut' => 'nullable|string|max:20|unique:conductores,rut,'.$conductor->id,
            'licencia' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'estado' => 'nullable|string|max:50',
            'notas' => 'nullable|string',
        ]);

        $updateData = [];
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $updateData[$key] = $value;
            }
        }
        if ($request->filled('rut')) {
            $updateData['rut'] = strtoupper(trim($validated['rut']));
        }

        if (! empty($updateData)) {
            $conductor->update($updateData);
        }

        return redirect()->route('conductores.index');
    }

    public function destroy(Conductor $conductor): RedirectResponse
    {
        $conductor->delete();

        return redirect()->route('conductores.index');
    }

    public function simularTracking(Conductor $conductor): RedirectResponse
    {
        $latitud = -33.4489 + (rand(-100, 100) / 1000);
        $longitud = -70.6693 + (rand(-100, 100) / 1000);

        $conductor->update([
            'lat' => $latitud,
            'lng' => $longitud,
            'ultima_actualizacion' => now(),
        ]);

        return redirect()->back()->with('success', 'Ubicacion simulate');
    }

    public function limpiarTracking(Conductor $conductor): RedirectResponse
    {
        $conductor->update([
            'lat' => null,
            'lng' => null,
            'ultima_actualizacion' => null,
        ]);

        return redirect()->back()->with('success', 'Ubicacion limpiada');
    }
}
