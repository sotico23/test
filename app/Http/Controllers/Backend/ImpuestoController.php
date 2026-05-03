<?php

namespace App\Http\Controllers\Backend;

use App\Exports\ImpuestosExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\ImpuestosImport;
use App\Models\Impuesto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImpuestoController extends Controller
{
    use HasBulkOperations;

    public function index(): Response
    {
        $impuestos = Impuesto::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Impuestos/Index', ['impuestos' => $impuestos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50',
            'tasa' => 'required|numeric|min:0|max:100',
            'tipo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'estado' => 'required|string|max:50',
        ]);
        Impuesto::create($validated);

        return redirect()->route('impuestos.index');
    }

    public function update(Request $request, Impuesto $impuesto): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50',
            'tasa' => 'required|numeric|min:0|max:100',
            'tipo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'estado' => 'required|string|max:50',
        ]);
        $impuesto->update($validated);

        return redirect()->route('impuestos.index');
    }

    public function destroy(Impuesto $impuesto): RedirectResponse
    {
        $impuesto->delete();

        return redirect()->route('impuestos.index');
    }

    protected function getExportClass(array $filters): object
    {
        return new ImpuestosExport($filters);
    }

    protected function getImportClass(): object
    {
        return new ImpuestosImport;
    }
}
