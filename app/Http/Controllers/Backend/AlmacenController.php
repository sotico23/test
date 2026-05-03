<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Imports\AlmacenesImport;
use App\Models\Almacen;
use App\Models\Empleado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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

    public function show(Almacen $almacen)
    {
        $almacen->load('empleados');

        return Inertia::render('Backend/Almacenes/Show', [
            'almacen' => $almacen,
        ]);
    }

    public function exportCsv(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();
        $almacenes = Almacen::with('empleados')
            ->where('owner_id', $ownerId)
            ->orderBy('nombre')
            ->get();

        $filename = 'almacenes_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () use ($almacenes) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Codigo',
                'Nombre',
                'Direccion',
                'Telefono',
                'Capacidad',
                'Tipo',
                'Activo',
                'Notas',
            ], ';');

            foreach ($almacenes as $a) {
                fputcsv($file, [
                    $a->codigo,
                    $a->nombre,
                    $a->direccion,
                    $a->telefono,
                    $a->capacidad,
                    $a->tipo,
                    $a->activo ? 'Si' : 'No',
                    $a->notas,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        return $this->exportCsv($request);
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt,xlsx,xls',
        ]);

        try {
            Excel::import(new AlmacenesImport, $request->file('archivo'));

            return redirect()->back()->with('success', 'Almacenes importados correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error en el formato del archivo: '.$e->getMessage());
        }
    }

    public function importExcel(Request $request): RedirectResponse
    {
        return $this->importCsv($request);
    }
}
