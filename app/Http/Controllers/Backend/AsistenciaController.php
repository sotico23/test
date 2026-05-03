<?php

namespace App\Http\Controllers\Backend;

use App\Exports\AsistenciasExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Models\Asistencia;
use App\Models\Empleado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsistenciaController extends Controller
{
    use HasBulkOperations;

    public function index(): Response
    {
        $ownerId = auth()->user()->getOwnerId();
        $asistencias = Asistencia::with('empleado')
            ->where('owner_id', $ownerId)
            ->orderBy('fecha', 'desc')
            ->paginate(15);
        $empleados = Empleado::where('owner_id', $ownerId)
            ->where('estado', 'activo')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'cargo']);

        return Inertia::render('Backend/Asistencia/Index', [
            'asistencias' => $asistencias,
            'empleados' => $empleados,
        ]);
    }

    protected function getExportClass(array $filters): object
    {
        return new AsistenciasExport($filters);
    }

    protected function getImportClass(): object
    {
        return new AsistenciasImport;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'empleado_id' => 'nullable|integer',
            'fecha' => 'nullable|date',
            'hora_entrada' => 'nullable|string|max:10',
            'hora_salida' => 'nullable|string|max:10',
            'horas_trabajadas' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        $validated['owner_id'] = auth()->user()->getOwnerId();
        Asistencia::create($validated);

        return back();
    }

    public function update(Request $request, Asistencia $asistencia): RedirectResponse
    {
        $validated = $request->validate([
            'empleado_id' => 'nullable|integer',
            'fecha' => 'nullable|date',
            'hora_entrada' => 'nullable|string|max:10',
            'hora_salida' => 'nullable|string|max:10',
            'horas_trabajadas' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        $asistencia->update($validated);

        return back();
    }

    public function destroy(Asistencia $asistencia): RedirectResponse
    {
        $asistencia->delete();

        return back();
    }
}
