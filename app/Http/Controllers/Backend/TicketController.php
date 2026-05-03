<?php

namespace App\Http\Controllers\Backend;

use App\Exports\TicketsExport;
use App\Http\Controllers\Controller;
use App\Imports\TicketsImport;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = Auth::user()->getOwnerId();
        $query = Ticket::with(['cliente', 'producto'])->where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%")
                    ->orWhere('asignado_a', 'like', "%{$search}%")
                    ->orWhereHas('cliente', function ($q2) use ($search) {
                        $q2->where('nombre', 'like', "%{$search}%");
                    })
                    ->orWhereHas('producto', function ($q2) use ($search) {
                        $q2->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->input('prioridad'));
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $clientes = Cliente::where('owner_id', $ownerId)->orderBy('nombre')->get(['id', 'nombre']);
        $productos = Producto::where('owner_id', $ownerId)->orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('Backend/Tickets/Index', [
            'tickets' => $tickets,
            'clientes' => $clientes,
            'productos' => $productos,
            'filters' => $request->only(['search', 'estado', 'prioridad']),
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

        $validated['owner_id'] = Auth::user()->getOwnerId();
        Ticket::create($validated);

        return redirect()->route('tickets.index')->with('success', 'Ticket creado correctamente.');
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->authorizeOwner($ticket);

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

        return redirect()->route('tickets.index')->with('success', 'Ticket actualizado correctamente.');
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        $this->authorizeOwner($ticket);
        $ticket->delete();

        return redirect()->route('tickets.index')->with('success', 'Ticket eliminado correctamente.');
    }

    public function show(Ticket $ticket): Response
    {
        $this->authorizeOwner($ticket);
        $ticket->load(['cliente', 'producto']);

        return Inertia::render('Backend/Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function exportCsv(Request $request)
    {
        $ownerId = Auth::user()->getOwnerId();
        $tickets = Ticket::with(['cliente', 'producto'])
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Excel::download(new TicketsExport($tickets), 'tickets_'.now()->format('Ymd_His').'.csv', \Maatwebsite\Excel\Excel::CSV);
    }

    public function exportExcel(Request $request)
    {
        $ownerId = Auth::user()->getOwnerId();
        $tickets = Ticket::with(['cliente', 'producto'])
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Excel::download(new TicketsExport($tickets), 'tickets_'.now()->format('Ymd_His').'.xlsx');
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt,xlsx,xls',
        ]);

        try {
            Excel::import(new TicketsImport, $request->file('archivo'));

            return redirect()->back()->with('success', 'Tickets importados correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error en el formato del archivo: '.$e->getMessage());
        }
    }

    public function importExcel(Request $request): RedirectResponse
    {
        return $this->importCsv($request);
    }

    protected function authorizeOwner(Ticket $ticket): void
    {
        if ($ticket->owner_id !== Auth::user()->getOwnerId()) {
            abort(403);
        }
    }
}
