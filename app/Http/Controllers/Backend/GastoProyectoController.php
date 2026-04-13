<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\GastoProyecto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GastoProyectoController extends Controller
{
    public function index(): Response
    {
        $gastos = GastoProyecto::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/GastoProyecto/Index', ['gastos' => $gastos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proyecto_id' => 'nullable|integer',
            'categoria' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'nullable|date',
            'referencia' => 'nullable|string|max:255',
            'aprobado' => 'nullable|boolean',
            'aprobador_id' => 'nullable|integer',
        ]);
        GastoProyecto::create($validated);

        return redirect()->route('gasto-proyecto.index');
    }

    public function update(Request $request, GastoProyecto $gastoProyecto): RedirectResponse
    {
        $validated = $request->validate([
            'proyecto_id' => 'nullable|integer',
            'categoria' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'nullable|date',
            'referencia' => 'nullable|string|max:255',
            'aprobado' => 'nullable|boolean',
            'aprobador_id' => 'nullable|integer',
        ]);
        $gastoProyecto->update($validated);

        return redirect()->route('gasto-proyecto.index');
    }

    public function destroy(GastoProyecto $gastoProyecto): RedirectResponse
    {
        $gastoProyecto->delete();

        return redirect()->route('gasto-proyecto.index');
    }
}
