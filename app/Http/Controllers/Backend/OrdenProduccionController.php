<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\OrdenProduccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrdenProduccionController extends Controller
{
    public function index(): Response
    {
        $ordenes = OrdenProduccion::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/OrdenProduccion/Index', ['ordenes' => $ordenes]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:50|unique:ordenes_produccion,numero',
            'producto' => 'nullable|string|max:255',
            'cantidad' => 'nullable|integer|min:1',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'progreso' => 'nullable|integer|min:0|max:100',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        OrdenProduccion::create($validated);

        return redirect()->route('ordenes-produccion.index');
    }

    public function update(Request $request, OrdenProduccion $ordenesProduccion): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => 'nullable|string|max:50|unique:ordenes_produccion,numero,'.$ordenesProduccion->id,
            'producto' => 'nullable|string|max:255',
            'cantidad' => 'nullable|integer|min:1',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'progreso' => 'nullable|integer|min:0|max:100',
            'estado' => 'nullable|string|max:50',
            'notas' => 'nullable|string',
        ]);

        $updateData = [];
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $updateData[$key] = $value;
            }
        }

        if (! empty($updateData)) {
            $ordenesProduccion->update($updateData);
        }

        return redirect()->route('ordenes-produccion.index');
    }

    public function destroy(OrdenProduccion $ordenesProduccion): RedirectResponse
    {
        $ordenesProduccion->delete();

        return redirect()->route('ordenes-produccion.index');
    }
}
