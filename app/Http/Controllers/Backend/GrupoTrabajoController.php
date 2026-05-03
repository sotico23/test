<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Conductor;
use App\Models\DetalleVenta;
use App\Models\Entrega;
use App\Models\GrupoTrabajo;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GrupoTrabajoController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $ownerId = $user->getOwnerId();
        $canManage = $user->hasPermissionTo('gestionar grupos trabajo');

        if ($canManage) {
            $grupos = GrupoTrabajo::with(['miembros', 'conductores'])
                ->where('owner_id', $ownerId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate metrics for each group
            $grupos->each(function ($grupo) use ($ownerId) {
                $conductorIds = $grupo->conductores->pluck('id');

                // Get Ventas that are linked to Entregas assigned to this group's conductors
                $ventaIds = Entrega::whereIn('conductor_id', $conductorIds)
                    ->where('owner_id', $ownerId)
                    ->whereHas('venta', function ($q) {
                        $q->where('estado', 'pagada');
                    })
                    ->pluck('venta_id');

                $grupo->cantidad_ventas = count($ventaIds);
                $grupo->total_ventas = Venta::whereIn('id', $ventaIds)->sum('total');

                // Calculate Kg and Liters from those specific sales
                $detalles = DetalleVenta::whereIn('venta_id', $ventaIds)
                    ->with('producto')
                    ->get();

                $totalKg = 0;
                $totalL = 0;

                foreach ($detalles as $detalle) {
                    $producto = $detalle->producto;
                    if ($producto) {
                        $cantidad = (float) $detalle->cantidad;
                        // If product measure is per unit but has a weight/volume defined
                        $valorMedida = (float) $producto->cantidad_medida;

                        if (strtolower($producto->tipo_medida) === 'kg' || strtolower($producto->unidad_medida) === 'kg') {
                            $totalKg += $cantidad * ($valorMedida ?: 1);
                        } elseif (strtolower($producto->tipo_medida) === 'l' || strtolower($producto->tipo_medida) === 'litro' || strtolower($producto->unidad_medida) === 'l') {
                            $totalL += $cantidad * ($valorMedida ?: 1);
                        }
                    }
                }

                $grupo->total_kg = $totalKg;
                $grupo->total_l = $totalL;
            });

            $empleados = User::where(function ($query) use ($ownerId) {
                $query->where('creator_id', $ownerId)
                    ->orWhere('id', $ownerId);
            })->orderBy('name')
                ->get(['id', 'name', 'email']);

            $conductores = Conductor::where('owner_id', $ownerId)->orderBy('nombre')->get();
        } else {
            $grupos = GrupoTrabajo::with(['miembros', 'conductores'])
                ->where('owner_id', $ownerId)
                ->whereHas('miembros', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $empleados = [];
            $conductores = [];
        }

        return Inertia::render('Backend/GruposTrabajo/Index', [
            'grupos' => $grupos,
            'empleados' => $empleados,
            'conductores' => $conductores,
            'puedeGestionar' => $canManage,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless(Auth::user()->can('gestionar grupos trabajo'), 403);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'estado' => 'nullable|in:activo,inactivo',
            'miembros' => 'nullable|array',
            'miembros.*' => 'exists:users,id',
            'conductores' => 'nullable|array',
            'conductores.*' => 'exists:conductores,id',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['owner_id'] = Auth::user()->getOwnerId();
        $validated['estado'] = $validated['estado'] ?? 'activo';

        try {
            DB::transaction(function () use ($validated) {
                $grupo = GrupoTrabajo::create($validated);

                if (! empty($validated['miembros'])) {
                    $grupo->miembros()->sync($validated['miembros']);
                }

                if (! empty($validated['conductores'])) {
                    $grupo->conductores()->sync($validated['conductores']);
                }
            });

            return redirect()->route('grupos-trabajo.index')->with('success', 'Grupo de trabajo creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear el grupo de trabajo: '.$e->getMessage());
        }
    }

    public function update(Request $request, GrupoTrabajo $grupoTrabajo): RedirectResponse
    {
        abort_unless(Auth::user()->can('gestionar grupos trabajo'), 403);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'estado' => 'nullable|in:activo,inactivo',
            'miembros' => 'nullable|array',
            'miembros.*' => 'exists:users,id',
            'conductores' => 'nullable|array',
            'conductores.*' => 'exists:conductores,id',
        ]);

        try {
            DB::transaction(function () use ($grupoTrabajo, $validated) {
                $grupoTrabajo->update($validated);

                if (isset($validated['miembros'])) {
                    $grupoTrabajo->miembros()->sync($validated['miembros']);
                } else {
                    $grupoTrabajo->miembros()->sync([]);
                }

                if (isset($validated['conductores'])) {
                    $grupoTrabajo->conductores()->sync($validated['conductores']);
                } else {
                    $grupoTrabajo->conductores()->sync([]);
                }
            });

            return redirect()->route('grupos-trabajo.index')->with('success', 'Grupo de trabajo actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el grupo de trabajo: '.$e->getMessage());
        }
    }

    public function destroy(GrupoTrabajo $grupoTrabajo): RedirectResponse
    {
        abort_unless(Auth::user()->can('gestionar grupos trabajo'), 403);

        try {
            DB::transaction(function () use ($grupoTrabajo) {
                $grupoTrabajo->miembros()->detach();
                $grupoTrabajo->conductores()->detach();
                $grupoTrabajo->delete();
            });

            return redirect()->route('grupos-trabajo.index')->with('success', 'Grupo de trabajo eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el grupo de trabajo: '.$e->getMessage());
        }
    }
}
