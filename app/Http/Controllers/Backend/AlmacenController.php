<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Almacen;
use App\Models\Empleado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AlmacenController extends Controller
{
    public function index()
    {
        $userId = Auth::user()->getOwnerId();
        $empleados = Empleado::where('estado', 'Activo')
            ->where('owner_id', $userId)
            ->orderBy('nombre')
            ->orderBy('apellido')
            ->get();

        $almacenes = Almacen::with('empleados')
            ->where('owner_id', $userId)
            ->orderBy('nombre')
            ->paginate(15);

        return inertia('Backend/Almacenes/Index', [
            'almacenes' => $almacenes,
            'empleados' => $empleados,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => [
                'required',
                'string',
                'max:20',
                // Asegúrate de que el nombre de la tabla sea 'almacenes'
                Rule::unique('almacenes')->where('owner_id', $ownerId),
            ],
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:50',
            'responsable_id' => 'nullable|integer|exists:empleados,id',
            'capacidad' => 'nullable|integer|min:0',
            'tipo' => 'required|string|max:50', // Cambiado de nullable a required para ser consistente con store
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ], [
            'codigo.unique' => 'Este código ya está en uso en otro almacén de su organización.',
        ]);

        $validated['owner_id'] = $ownerId;
        $validated['user_id'] = Auth::id();

        $almacen = Almacen::create($validated);

        if (! empty($validated['responsable_id'])) {
            Empleado::where('id', $validated['responsable_id'])->update(['almacen_id' => $almacen->id]);
        }

        return redirect()->route('almacenes.index')->with('success', 'Almacén creado correctamente');
    }

    public function update(Request $request, Almacen $almacene): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('almacenes', 'codigo')
                    ->where('owner_id', $ownerId)
                    ->ignore($almacene->id),
            ],
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:50',
            'responsable_id' => 'nullable|integer|exists:empleados,id',
            'capacidad' => 'nullable|integer|min:0',
            'tipo' => 'required|string|max:50',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ], [
            'codigo.unique' => 'Este código ya está en uso en otro almacén de su organización.',
        ]);

        // Usamos una transacción para asegurar que los empleados y el almacén se actualicen juntos
        DB::transaction(function () use ($validated, $almacene, $request) {
            $almacene->update($validated);

            // Actualización lógica del responsable
            if ($request->has('responsable_id')) {
                // Quitamos el almacén al responsable anterior
                Empleado::where('almacen_id', $almacene->id)->update(['almacen_id' => null]);

                // Asignamos el nuevo si existe
                if ($request->filled('responsable_id')) {
                    Empleado::where('id', $request->responsable_id)->update(['almacen_id' => $almacene->id]);
                }
            }
        });

        return redirect()->back()->with('success', 'Almacén actualizado correctamente');
    }

    public function destroy(Almacen $almacen): RedirectResponse
    {
        $almacen->delete();

        return redirect()->route('almacenes.index');
    }
}
