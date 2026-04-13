<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function index(): Response
    {
        $configuraciones = Configuracion::orderBy('created_at', 'desc')->get();

        return Inertia::render('Backend/Configuracion/Index', ['configuraciones' => $configuraciones]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:100',
            'valor' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'editable' => 'nullable|boolean',
        ]);
        Configuracion::create($validated);

        return redirect()->route('configuracion.index');
    }

    public function update(Request $request, Configuracion $configuracion): RedirectResponse
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:100',
            'valor' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'editable' => 'nullable|boolean',
        ]);
        $configuracion->update($validated);

        return redirect()->route('configuracion.index');
    }

    public function destroy(Configuracion $configuracion): RedirectResponse
    {
        $configuracion->delete();

        return redirect()->route('configuracion.index');
    }
}
