<?php

namespace App\Http\Controllers\Backend;

use App\Exports\NominasExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\NominasImport;
use App\Models\Nomina;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NominaController extends Controller
{
    use HasBulkOperations;

    protected function getExportClass(array $filters): object
    {
        return new NominasExport($filters);
    }

    protected function getImportClass(): object
    {
        return new NominasImport;
    }

    public function index(): Response
    {
        $nominas = Nomina::orderBy('periodo', 'desc')->paginate(15);

        return Inertia::render('Backend/Nominas/Index', ['nominas' => $nominas]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'periodo' => 'required|string|max:20',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'total_bruto' => 'nullable|numeric|min:0',
            'total_deducciones' => 'nullable|numeric|min:0',
            'total_neto' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        Nomina::create($validated);

        return redirect()->route('nominas.index');
    }

    public function update(Request $request, Nomina $nomina): RedirectResponse
    {
        $validated = $request->validate([
            'periodo' => 'required|string|max:20',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'total_bruto' => 'nullable|numeric|min:0',
            'total_deducciones' => 'nullable|numeric|min:0',
            'total_neto' => 'nullable|numeric|min:0',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        $nomina->update($validated);

        return redirect()->route('nominas.index');
    }

    public function destroy(Nomina $nomina): RedirectResponse
    {
        $nomina->delete();

        return redirect()->route('nominas.index');
    }
}
