<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Prospecto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProspectoController extends Controller
{
    public function index(): Response
    {
        $prospectos = Prospecto::orderBy('created_at', 'desc')->get();

        return Inertia::render('Backend/Prospectos/Index', ['prospectos' => $prospectos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|email',
            'telefono' => 'nullable|string|max:50',
            'empresa' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'fuente' => 'nullable|string|max:100',
            'estado' => 'required|string|max:50',
            'valor_estimado' => 'nullable|numeric|min:0',
            'fecha_seguimiento' => 'nullable|date',
            'notas' => 'nullable|string',
        ]);
        Prospecto::create($validated);

        return redirect()->route('prospectos.index');
    }

    public function update(Request $request, Prospecto $prospecto): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|email',
            'telefono' => 'nullable|string|max:50',
            'empresa' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'fuente' => 'nullable|string|max:100',
            'estado' => 'required|string|max:50',
            'valor_estimado' => 'nullable|numeric|min:0',
            'fecha_seguimiento' => 'nullable|date',
            'notas' => 'nullable|string',
        ]);
        $prospecto->update($validated);

        return redirect()->route('prospectos.index');
    }

    public function updateEstado(Request $request, Prospecto $prospecto): RedirectResponse
    {
        $validated = $request->validate([
            'estado' => 'required|string|max:50',
        ]);
        $prospecto->update($validated);

        return redirect()->route('prospectos.index');
    }

    public function destroy(Prospecto $prospecto): RedirectResponse
    {
        $prospecto->delete();

        return redirect()->route('prospectos.index');
    }
}
