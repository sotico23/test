<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Oportunidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OportunidadController extends Controller
{
    public function index(): Response
    {
        $ownerId = Auth::user()->getOwnerId();
        $oportunidades = Oportunidad::with('cliente')
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        $clientes = Cliente::where('activo', true)->where('owner_id', $ownerId)->orderBy('nombre')->get();

        return Inertia::render('Backend/Oportunidades/Index', ['oportunidades' => $oportunidades, 'clientes' => $clientes]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'cliente_id' => 'required|exists:clientes,id',
            'valor' => 'nullable|numeric|min:0',
            'etapa' => 'required|string|max:50',
            'probabilidad' => 'nullable|integer|min:0|max:100',
            'fecha_cierre_estimada' => 'nullable|date',
            'descripcion' => 'nullable|string',
        ]);
        if (isset($validated['valor'])) {
            $validated['valor'] = round($validated['valor']);
        }
        $validated['owner_id'] = Auth::user()->getOwnerId();
        Oportunidad::create($validated);

        return redirect()->route('oportunidades.index');
    }

    public function update(Request $request, Oportunidad $oportunidad): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'cliente_id' => 'required|exists:clientes,id',
            'valor' => 'nullable|numeric|min:0',
            'etapa' => 'required|string|max:50',
            'probabilidad' => 'nullable|integer|min:0|max:100',
            'fecha_cierre_estimada' => 'nullable|date',
            'descripcion' => 'nullable|string',
        ]);
        if (isset($validated['valor'])) {
            $validated['valor'] = round($validated['valor']);
        }
        $oportunidad->update($validated);

        return redirect()->route('oportunidades.index');
    }

    public function destroy(Oportunidad $oportunidad): RedirectResponse
    {
        $oportunidad->delete();

        return redirect()->route('oportunidades.index');
    }
}
