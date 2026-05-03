<?php

namespace App\Http\Controllers\Backend;

use App\Exports\ContabilidadExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\ContabilidadImport;
use App\Models\Asiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContabilidadController extends Controller
{
    use HasBulkOperations;

    public function index(): Response
    {
        $asientos = Asiento::with('detalles')->orderBy('fecha', 'desc')->orderBy('numero', 'desc')->paginate(15);

        return Inertia::render('Backend/Contabilidad/Index', [
            'asientos' => $asientos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'numero' => 'required|string|max:20|unique:asientos,numero',
            'descripcion' => 'required|string|max:255',
            'tipo' => 'required|string|max:20',
            'detalles' => 'required|array|min:1',
            'detalles.*.cuenta' => 'required|string|max:100',
            'detalles.*.cuenta_codigo' => 'required|string|max:20',
            'detalles.*.descripcion' => 'nullable|string',
            'detalles.*.debe' => 'required|numeric|min:0',
            'detalles.*.haber' => 'required|numeric|min:0',
        ]);

        $totalDebe = collect($validated['detalles'])->sum('debe');
        $totalHaber = collect($validated['detalles'])->sum('haber');

        if (bccomp((string) $totalDebe, (string) $totalHaber, 2) !== 0) {
            return back()->withErrors(['detalles' => 'El total del debe debe ser igual al total del haber']);
        }

        $asiento = Asiento::create([
            'fecha' => $validated['fecha'],
            'numero' => $validated['numero'],
            'descripcion' => $validated['descripcion'],
            'tipo' => $validated['tipo'],
            'total_debe' => $totalDebe,
            'total_haber' => $totalHaber,
            'estado' => true,
        ]);

        foreach ($validated['detalles'] as $detalle) {
            $asiento->detalles()->create($detalle);
        }

        return redirect()->route('contabilidad.index');
    }

    public function update(Request $request, Asiento $asiento): RedirectResponse
    {
        $validated = $request->validate([
            'fecha' => 'nullable|date',
            'numero' => 'nullable|string|max:20|unique:asientos,numero,'.$asiento->id,
            'descripcion' => 'nullable|string|max:255',
            'tipo' => 'nullable|string|max:20',
            'estado' => 'nullable|boolean',
        ]);

        $updateData = [];
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $updateData[$key] = $value;
            }
        }

        if (! empty($updateData)) {
            $asiento->update($updateData);
        }

        return redirect()->route('contabilidad.index');
    }

    public function destroy(Asiento $asiento): RedirectResponse
    {
        $asiento->delete();

        return redirect()->route('contabilidad.index');
    }

    protected function getExportClass(array $filters): object
    {
        return new ContabilidadExport($filters);
    }

    protected function getImportClass(): object
    {
        return new ContabilidadImport;
    }
}
