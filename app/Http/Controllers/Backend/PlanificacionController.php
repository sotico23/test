<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Planificacion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanificacionController extends Controller
{
    public function index(): Response
    {
        $planificaciones = Planificacion::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Planificacion/Index', ['planificaciones' => $planificaciones]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'proyecto_id' => 'nullable|integer|exists:proyectos,id',
            'responsable_id' => 'nullable|integer|exists:users,id',
            'estado' => 'required|string|max:50',
            'prioridad' => 'nullable|string|max:50',
            'ubicacion' => 'nullable|string|max:255',
            'presupuesto' => 'nullable|numeric|min:0',
            'categoria' => 'nullable|string|max:100',
            'objetivo' => 'nullable|string',
            'asistentes_max' => 'nullable|integer|min:1',
            'fecha_limite' => 'nullable|date',
            'requiere_materiales' => 'nullable|boolean',
            'materiales' => 'nullable|string',
            'proveedor_id' => 'nullable|integer',
            'contacto_emergencia' => 'nullable|string|max:255',
            'telefono_emergencia' => 'nullable|string|max:20',
        ]);
        Planificacion::create($validated);

        return redirect()->route('planificacion.index');
    }

    public function update(Request $request, Planificacion $planificacion): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'proyecto_id' => 'nullable|integer|exists:proyectos,id',
            'responsable_id' => 'nullable|integer|exists:users,id',
            'estado' => 'required|string|max:50',
            'prioridad' => 'nullable|string|max:50',
            'ubicacion' => 'nullable|string|max:255',
            'presupuesto' => 'nullable|numeric|min:0',
            'categoria' => 'nullable|string|max:100',
            'objetivo' => 'nullable|string',
            'asistentes_max' => 'nullable|integer|min:1',
            'fecha_limite' => 'nullable|date',
            'requiere_materiales' => 'nullable|boolean',
            'materiales' => 'nullable|string',
            'proveedor_id' => 'nullable|integer',
            'contacto_emergencia' => 'nullable|string|max:255',
            'telefono_emergencia' => 'nullable|string|max:20',
        ]);
        $planificacion->update($validated);

        return redirect()->route('planificacion.index');
    }

    public function destroy(Planificacion $planificacion): RedirectResponse
    {
        $planificacion->delete();

        return redirect()->route('planificacion.index');
    }
}
