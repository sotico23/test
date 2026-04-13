<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Lote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoteController extends Controller
{
    public function index(): Response
    {
        $lotes = Lote::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Lotes/Index', ['lotes' => $lotes]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero_lote' => 'required|string|max:100',
            'producto_id' => 'nullable|integer',
            'cantidad' => 'required|integer|min:0',
            'fecha_produccion' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'almacen_id' => 'nullable|integer',
        ]);
        Lote::create($validated);

        return redirect()->route('lotes.index');
    }

    public function update(Request $request, Lote $lote): RedirectResponse
    {
        $validated = $request->validate([
            'numero_lote' => 'required|string|max:100',
            'producto_id' => 'nullable|integer',
            'cantidad' => 'required|integer|min:0',
            'fecha_produccion' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
            'estado' => 'required|string|max:50',
            'almacen_id' => 'nullable|integer',
        ]);
        $lote->update($validated);

        return redirect()->route('lotes.index');
    }

    public function destroy(Lote $lote): RedirectResponse
    {
        $lote->delete();

        return redirect()->route('lotes.index');
    }
}
