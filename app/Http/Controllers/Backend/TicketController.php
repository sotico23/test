<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(): Response
    {
        $tickets = Ticket::with(['cliente', 'producto'])->orderBy('created_at', 'desc')->paginate(15);
        $clientes = Cliente::orderBy('nombre')->get(['id', 'nombre']);
        $productos = Producto::orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('Backend/Tickets/Index', [
            'tickets' => $tickets,
            'clientes' => $clientes,
            'productos' => $productos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cliente_id' => 'nullable|exists:clientes,id',
            'producto_id' => 'nullable|exists:productos,id',
            'prioridad' => 'required|string|max:50',
            'estado' => 'required|string|max:50',
            'categoria' => 'nullable|string|max:100',
            'asignado_a' => 'nullable|string|max:255',
        ]);
        Ticket::create($validated);

        return redirect()->route('tickets.index');
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cliente_id' => 'nullable|exists:clientes,id',
            'producto_id' => 'nullable|exists:productos,id',
            'prioridad' => 'required|string|max:50',
            'estado' => 'required|string|max:50',
            'categoria' => 'nullable|string|max:100',
            'asignado_a' => 'nullable|string|max:255',
        ]);
        $ticket->update($validated);

        return redirect()->route('tickets.index');
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        $ticket->delete();

        return redirect()->route('tickets.index');
    }
}
