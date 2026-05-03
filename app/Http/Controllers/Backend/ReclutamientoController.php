<?php

namespace App\Http\Controllers\Backend;

use App\Exports\ReclutamientosExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\ReclutamientosImport;
use App\Models\Reclutamiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReclutamientoController extends Controller
{
    use HasBulkOperations;

    protected function getExportClass(array $filters): object
    {
        return new ReclutamientosExport($filters);
    }

    protected function getImportClass(): object
    {
        return new ReclutamientosImport;
    }

    public function index(): Response
    {
        $reclutamientos = Reclutamiento::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Reclutamiento/Index', ['reclutamientos' => $reclutamientos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'puesto' => 'required|string|max:255',
            'candidato_id' => 'nullable|integer',
            'fecha_postulacion' => 'nullable|date',
            'fecha_entrevista' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'resultado' => 'nullable|string|max:100',
            'notas' => 'nullable|string',
        ]);
        Reclutamiento::create($validated);

        return redirect()->route('reclutamiento.index');
    }

    public function update(Request $request, Reclutamiento $reclutamiento): RedirectResponse
    {
        $validated = $request->validate([
            'puesto' => 'required|string|max:255',
            'candidato_id' => 'nullable|integer',
            'fecha_postulacion' => 'nullable|date',
            'fecha_entrevista' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'resultado' => 'nullable|string|max:100',
            'notas' => 'nullable|string',
        ]);
        $reclutamiento->update($validated);

        return redirect()->route('reclutamiento.index');
    }

    public function destroy(Reclutamiento $reclutamiento): RedirectResponse
    {
        $reclutamiento->delete();

        return redirect()->route('reclutamiento.index');
    }
}
