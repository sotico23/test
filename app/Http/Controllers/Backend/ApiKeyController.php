<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{
    public function index(): Response
    {
        $apiKeys = ApiKey::orderBy('created_at', 'desc')->get();

        return Inertia::render('Backend/ApiKeys/Index', ['apiKeys' => $apiKeys]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_expiracion' => 'nullable|date|after:today',
            'permisos' => 'nullable|string',
        ]);

        $validated['key'] = Str::random(64);
        $validated['usuario_id'] = Auth::id();
        $validated['estado'] = 'activo';

        ApiKey::create($validated);

        return redirect()->route('api-keys.index')->with('success', 'API Key generada correctamente.');
    }

    public function update(Request $request, ApiKey $apiKey): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_expiracion' => 'nullable|date|after:today',
            'estado' => 'required|string|in:activo,inactivo,revocado',
            'permisos' => 'nullable|string',
        ]);
        $apiKey->update($validated);

        return redirect()->route('api-keys.index');
    }

    public function destroy(ApiKey $apiKey): RedirectResponse
    {
        if ($apiKey->usuario_id !== Auth::id()) {
            abort(403, 'No tienes permiso para eliminar esta API Key.');
        }

        $apiKey->delete();

        return redirect()->route('api-keys.index');
    }
}
