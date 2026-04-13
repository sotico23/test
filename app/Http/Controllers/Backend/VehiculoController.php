<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehiculoController extends Controller
{
    public function index(): Response
    {
        $vehiculos = Vehiculo::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Vehiculos/Index', ['vehiculos' => $vehiculos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['placa' => strtoupper($request->placa)]);

        $validated = $request->validate([
            'placa' => [
                'required',
                'string',
                'max:20',
                'unique:vehiculos,placa',
                'regex:/^([A-Z]{2}-?[0-9]{4}|[A-Z]{4}-?[0-9]{2})$/i',
            ],
            'imei' => 'nullable|string|unique:vehiculos,imei',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|max:50',
            'año' => 'nullable|integer',
            'color' => 'nullable|string|max:50',
            'estado' => 'required|string|in:disponible,en_ruta,mantenimiento,fuera_servicio,requiere_atencion',
            'kilometraje' => 'nullable|numeric|min:0',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'velocidad' => 'nullable|integer',
            'ultima_actualizacion' => 'nullable|date',
            'notas' => 'nullable|string',
        ], [
            'placa.regex' => 'El formato de la placa debe ser chileno (ej: AB1234, AB-1234, ABCD12, ABCD-12)',
        ]);

        Vehiculo::create($validated);

        return redirect()->route('vehiculos.index');
    }

    public function update(Request $request, Vehiculo $vehiculo): RedirectResponse
    {
        $request->merge(['placa' => strtoupper($request->placa)]);

        $validated = $request->validate([
            'placa' => [
                'nullable',
                'string',
                'max:20',
                'unique:vehiculos,placa,'.$vehiculo->id,
                'regex:/^([A-Z]{2}-?[0-9]{4}|[A-Z]{4}-?[0-9]{2})$/i',
            ],
            'imei' => 'nullable|string|unique:vehiculos,imei,'.$vehiculo->id,
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|max:50',
            'año' => 'nullable|integer',
            'color' => 'nullable|string|max:50',
            'estado' => 'nullable|string|in:disponible,en_ruta,mantenimiento,fuera_servicio,requiere_atencion',
            'kilometraje' => 'nullable|numeric|min:0',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'velocidad' => 'nullable|integer',
            'ultima_actualizacion' => 'nullable|date',
            'notas' => 'nullable|string',
        ], [
            'placa.regex' => 'El formato de la placa debe ser chileno (ej: AB1234, AB-1234, ABCD12, ABCD-12)',
        ]);

        $updateData = [];
        foreach ($validated as $key => $value) {
            if ($value !== null || ($request->has($key) && $key !== 'placa')) {
                $updateData[$key] = $value;
            }
        }
        if ($request->filled('placa')) {
            $updateData['placa'] = strtoupper($validated['placa']);
        }

        if (! empty($updateData)) {
            $vehiculo->update($updateData);
        }

        return redirect()->route('vehiculos.index');
    }

    public function destroy(Vehiculo $vehiculo): RedirectResponse
    {
        $vehiculo->delete();

        return redirect()->route('vehiculos.index');
    }

    public function actualizarTracking(Request $request, Vehiculo $vehiculo): RedirectResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'velocidad' => 'nullable|integer|min:0',
        ]);

        $vehiculo->update([
            'lat' => (float) $validated['lat'],
            'lng' => (float) $validated['lng'],
            'velocidad' => $validated['velocidad'] ?? 0,
            'ultima_actualizacion' => now(),
            'estado' => ($validated['velocidad'] ?? 0) > 0 ? 'en_ruta' : 'disponible',
        ]);

        return redirect()->back()->with('success', 'Ubicación actualizada correctamente');
    }

    public function simularTracking(Vehiculo $vehiculo): RedirectResponse
    {
        $chileCenter = [
            'lat' => -33.4489 + (rand(-100, 100) / 1000),
            'lng' => -70.6693 + (rand(-100, 100) / 1000),
        ];

        $velocidad = rand(0, 120);

        $vehiculo->update([
            'lat' => $chileCenter['lat'],
            'lng' => $chileCenter['lng'],
            'velocidad' => $velocidad,
            'ultima_actualizacion' => now(),
            'estado' => $velocidad > 0 ? 'en_ruta' : 'disponible',
        ]);

        return redirect()->back()->with('success', 'Datos de tracking simul correctamente');
    }

    public function limpiarTracking(Vehiculo $vehiculo): RedirectResponse
    {
        $vehiculo->update([
            'lat' => null,
            'lng' => null,
            'velocidad' => 0,
            'ultima_actualizacion' => null,
            'estado' => 'disponible',
        ]);

        return redirect()->back()->with('success', 'Datos de tracking limpiados');
    }
}
