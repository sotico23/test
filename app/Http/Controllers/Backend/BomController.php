<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Bom;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BomController extends Controller
{
    public function index(): Response
    {
        $boms = Bom::orderBy('nombre')->paginate(15);

        return Inertia::render('Backend/Boms/Index', ['boms' => $boms]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'producto_final' => 'nullable|string|max:255',
            'cantidad' => 'nullable|integer|min:1',
            'materiales' => 'nullable|array',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ]);
        Bom::create($validated);

        return redirect()->route('boms.index');
    }

    public function update(Request $request, Bom $bom): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'producto_final' => 'nullable|string|max:255',
            'cantidad' => 'nullable|integer|min:1',
            'materiales' => 'nullable|array',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ]);
        $bom->update($validated);

        return redirect()->route('boms.index');
    }

    public function destroy(Bom $bom): RedirectResponse
    {
        $bom->delete();

        return redirect()->route('boms.index');
    }
}
