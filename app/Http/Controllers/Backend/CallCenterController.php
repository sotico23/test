<?php

namespace App\Http\Controllers\Backend;

use App\Exports\LlamadasCallCenterExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\LlamadasCallCenterImport;
use App\Models\Cliente;
use App\Models\Empleado;
use App\Models\GestionCallCenter;
use App\Models\LlamadaCallCenter;
use App\Models\Prospecto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CallCenterController extends Controller
{
    use HasBulkOperations;

    protected function getExportClass(array $filters): object
    {
        return new LlamadasCallCenterExport($filters);
    }

    protected function getImportClass(): object
    {
        return new LlamadasCallCenterImport;
    }

    public function index(Request $request)
    {
        $userId = auth()->user()->getOwnerId();
        $query = LlamadaCallCenter::with(['user', 'cliente', 'prospecto', 'gestiones'])
            ->where('owner_id', $userId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero_telefono', 'like', "%{$search}%")
                    ->orWhereHas('cliente', fn ($q2) => $q2->where('nombre', 'like', "%{$search}%"))
                    ->orWhereHas('prospecto', fn ($q3) => $q3->where('nombre', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('tipo') && $request->input('tipo') !== 'all') {
            $query->where('tipo', $request->input('tipo'));
        }

        if ($request->filled('estado') && $request->input('estado') !== 'all') {
            $query->where('estado', $request->input('estado'));
        }

        $llamadas = $query->latest()
            ->paginate(15)
            ->withQueryString();

        // Fetching all potential contacts with performance-optimized queries
        $clientes = Cliente::where('owner_id', $userId)
            ->select('id', 'nombre', 'telefono')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'telefono' => $c->telefono,
                'tipo' => 'cliente',
            ]);

        $prospectos = Prospecto::where('owner_id', $userId)
            ->select('id', 'nombre', 'telefono')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'telefono' => $p->telefono,
                'tipo' => 'prospecto',
            ]);

        $empleados = Empleado::where('owner_id', $userId)
            ->select('id', 'nombre', 'apellido', 'telefono')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'nombre' => "{$e->nombre} {$e->apellido}",
                'telefono' => $e->telefono,
                'tipo' => 'empleado',
            ]);

        // Merge all contacts into a single collection
        $contactos = $clientes->concat($prospectos)
            ->concat($empleados)
            ->values();

        // Stats with proper ownership scoping
        $stats = [
            'total_llamadas' => LlamadaCallCenter::where('owner_id', $userId)->count(),
            'llamadas_hoy' => LlamadaCallCenter::where('owner_id', $userId)
                ->whereDate('fecha', now()->toDateString())
                ->count(),
            'gestiones_hoy' => GestionCallCenter::whereHas('llamada', function ($q) use ($userId) {
                $q->where('owner_id', $userId);
            })->whereDate('created_at', now()->toDateString())->count(),
            'promedio_duracion' => round(LlamadaCallCenter::where('owner_id', $userId)->avg('duracion') ?? 0, 2),
        ];

        return Inertia::render('Backend/CallCenter/Index', [
            'llamadas' => $llamadas,
            'contactos' => $contactos,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tipo', 'estado']),
        ]);
    }

    public function storeLlamada(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'prospecto_id' => 'nullable|exists:prospectos,id',
            'tipo' => 'required|in:entrante,saliente',
            'numero_telefono' => 'nullable|string',
            'estado' => 'required|in:completada,perdida,ocupado,no_contesta,equivocado',
            'duracion' => 'nullable|integer',
            'fecha' => 'required|date',
            'notas' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['owner_id'] = auth()->user()->getOwnerId();

        LlamadaCallCenter::create($validated);

        return redirect()->back()->with('success', 'Llamada registrada correctamente');
    }

    public function storeGestion(Request $request)
    {
        $validated = $request->validate([
            'llamada_id' => 'nullable|exists:llamadas_call_center,id',
            'cliente_id' => 'nullable|exists:clientes,id',
            'prospecto_id' => 'nullable|exists:prospectos,id',
            'comentario' => 'required|string',
            'resultado' => 'required|string',
            'proxima_accion' => 'nullable|string',
            'fecha_seguimiento' => 'nullable|date',
        ]);

        $validated['user_id'] = auth()->id();

        GestionCallCenter::create($validated);

        return back()->with('success', 'Gestión registrada correctamente');
    }

    public function destroyLlamada($id)
    {
        $ownerId = auth()->user()->getOwnerId();
        $llamada = LlamadaCallCenter::where('owner_id', $ownerId)->findOrFail($id);
        $llamada->delete();

        return redirect()->back()->with('success', 'Registro eliminado correctamente');
    }
}
