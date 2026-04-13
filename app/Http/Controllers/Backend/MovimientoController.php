<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Movimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MovimientoController extends Controller
{
    public function index(): Response
    {
        $movimientos = Movimiento::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Movimientos/Index', ['movimientos' => $movimientos]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tipo' => 'required|string|max:50',
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'referencia' => 'nullable|string|max:255',
            'fecha' => 'nullable|date',
            'cuenta_id' => 'nullable|integer',
            'categoria' => 'nullable|string|max:100',
            'estado' => 'required|string|max:50',
        ]);
        Movimiento::create($validated);

        return redirect()->route('movimientos.index');
    }

    public function update(Request $request, Movimiento $movimiento): RedirectResponse
    {
        $validated = $request->validate([
            'tipo' => 'required|string|max:50',
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'referencia' => 'nullable|string|max:255',
            'fecha' => 'nullable|date',
            'cuenta_id' => 'nullable|integer',
            'categoria' => 'nullable|string|max:100',
            'estado' => 'required|string|max:50',
        ]);
        $movimiento->update($validated);

        return redirect()->route('movimientos.index');
    }

    public function destroy(Movimiento $movimiento): RedirectResponse
    {
        $movimiento->delete();

        return redirect()->route('movimientos.index');
    }
}
