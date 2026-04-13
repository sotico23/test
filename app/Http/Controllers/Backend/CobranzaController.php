<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\FiltraPorCliente;
use App\Models\Cobranza;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CobranzaController extends Controller
{
    use FiltraPorCliente;

    public function index(): Response
    {
        $query = Cobranza::orderBy('created_at', 'desc');

        if ($this->usuarioEsCliente()) {
            $query->where('cliente_id', $this->getClienteAuth()->id);
        }

        $cobranzas = $query->paginate(15);

        return Inertia::render('Backend/Cobranzas/Index', ['cobranzas' => $cobranzas]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factura_id' => 'nullable|integer',
            'cliente_id' => 'nullable|integer',
            'monto' => 'required|numeric|min:0',
            'fecha_pago' => 'nullable|date',
            'metodo_pago' => 'nullable|string|max:100',
            'referencia' => 'nullable|string|max:255',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        Cobranza::create($validated);

        return redirect()->route('cobranzas.index');
    }

    public function update(Request $request, Cobranza $cobranza): RedirectResponse
    {
        $validated = $request->validate([
            'factura_id' => 'nullable|integer',
            'cliente_id' => 'nullable|integer',
            'monto' => 'required|numeric|min:0',
            'fecha_pago' => 'nullable|date',
            'metodo_pago' => 'nullable|string|max:100',
            'referencia' => 'nullable|string|max:255',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
        ]);
        $cobranza->update($validated);

        return redirect()->route('cobranzas.index');
    }

    public function destroy(Cobranza $cobranza): RedirectResponse
    {
        $cobranza->delete();

        return redirect()->route('cobranzas.index');
    }
}
