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

    public function update(Request $request, Conductor $conductore): RedirectResponse
    {
        if ($request->filled('rut')) {
            $request->merge(['rut' => strtoupper(trim($request->rut))]);
        }

        $rules = [
            'nombre' => 'sometimes|string|max:255',
            'rut' => 'sometimes|nullable|string|max:20|unique:conductores,rut,'.$conductore->id,
            'licencia' => 'sometimes|nullable|string|max:50',
            'telefono' => 'sometimes|nullable|string|max:50',
            'email' => 'sometimes|nullable|email',
            'estado' => 'sometimes|nullable|string|in:activo,inactivo,licencia_vencida',
            'notas' => 'sometimes|nullable|string',
        ];

        $validated = $request->validate($rules);

        // Convert empty strings to null so blank fields don't overwrite existing data
        $toSave = array_map(fn ($v) => $v === '' ? null : $v, $validated);
        // Remove null values so we only update fields that have real content
        $toSave = array_filter($toSave, fn ($v) => $v !== null);

        // Always allow explicit null for fields sent with intent to clear
        // (Only preserve non-empty values from the form)
        if (! empty($toSave)) {
            $conductore->update($toSave);
        }

        return redirect()->route('conductores.index');
    }

    public function destroy(Conductor $conductore): RedirectResponse
    {
        $conductore->delete();

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
