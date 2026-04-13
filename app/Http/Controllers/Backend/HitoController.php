<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Hito;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HitoController extends Controller
{
    public function index(): Response
    {
        $hitos = Hito::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Hitos/Index', ['hitos' => $hitos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proyecto_id' => 'nullable|integer',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_prevista' => 'nullable|date',
            'fecha_real' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'responsable_id' => 'nullable|integer',
        ]);
        Hito::create($validated);

        return redirect()->route('hitos.index');
    }

    public function update(Request $request, Hito $hito): RedirectResponse
    {
        $validated = $request->validate([
            'proyecto_id' => 'nullable|integer',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_prevista' => 'nullable|date',
            'fecha_real' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'responsable_id' => 'nullable|integer',
        ]);
        $hito->update($validated);

        return redirect()->route('hitos.index');
    }

    public function destroy(Hito $hito): RedirectResponse
    {
        $hito->delete();

        return redirect()->route('hitos.index');
    }
}
