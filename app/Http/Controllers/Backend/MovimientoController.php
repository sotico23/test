<?php

namespace App\Http\Controllers\Backend;

use App\Exports\MovimientosExport;
use App\Http\Controllers\Controller;
use App\Imports\MovimientosImport;
use App\Models\Movimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MovimientoController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = Auth::user()->getOwnerId();

        $query = Movimiento::where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('producto', 'like', "%{$search}%")
                    ->orWhere('tipo', 'like', "%{$search}%")
                    ->orWhere('referencia', 'like', "%{$search}%")
                    ->orWhere('almacen_origen', 'like', "%{$search}%")
                    ->orWhere('almacen_destino', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->input('tipo'));
        }

        $movimientos = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Backend/Movimientos/Index', [
            'movimientos' => $movimientos,
            'filters' => $request->only(['search', 'tipo']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();

        $validated = $request->validate([
            'producto' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'cantidad' => 'required|integer|min:0',
            'almacen_origen' => 'nullable|string|max:100',
            'almacen_destino' => 'nullable|string|max:100',
            'referencia' => 'nullable|string|max:255',
            'notas' => 'nullable|string',
        ]);

        $validated['owner_id'] = $ownerId;
        Movimiento::create($validated);

        return redirect()->route('movimientos.index');
    }

    public function update(Request $request, Movimiento $movimiento): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();
        if ($movimiento->owner_id !== $ownerId) {
            abort(403);
        }

        $validated = $request->validate([
            'producto' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'cantidad' => 'required|integer|min:0',
            'almacen_origen' => 'nullable|string|max:100',
            'almacen_destino' => 'nullable|string|max:100',
            'referencia' => 'nullable|string|max:255',
            'notas' => 'nullable|string',
        ]);

        $movimiento->update($validated);

        return redirect()->route('movimientos.index');
    }

    public function destroy(Movimiento $movimiento): RedirectResponse
    {
        $ownerId = Auth::user()->getOwnerId();
        if ($movimiento->owner_id !== $ownerId) {
            abort(403);
        }

        $movimiento->delete();

        return redirect()->route('movimientos.index');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $ownerId = Auth::user()->getOwnerId();
        $query = Movimiento::where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('producto', 'like', "%{$search}%")
                    ->orWhere('tipo', 'like', "%{$search}%")
                    ->orWhere('referencia', 'like', "%{$search}%");
            });
        }

        $movimientos = $query->orderBy('created_at', 'desc')->get();
        $filename = 'movimientos_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($movimientos) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Producto',
                'Tipo',
                'Cantidad',
                'Origen',
                'Destino',
                'Referencia',
                'Notas',
                'Fecha',
            ], ';');

            foreach ($movimientos as $mov) {
                fputcsv($file, [
                    $mov->producto,
                    $mov->tipo,
                    $mov->cantidad,
                    $mov->almacen_origen,
                    $mov->almacen_destino,
                    $mov->referencia,
                    $mov->notas,
                    $mov->created_at->format('Y-m-d H:i'),
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $ownerId = Auth::user()->getOwnerId();
        $query = Movimiento::where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('producto', 'like', "%{$search}%")
                    ->orWhere('tipo', 'like', "%{$search}%")
                    ->orWhere('referencia', 'like', "%{$search}%");
            });
        }

        $movimientos = $query->orderBy('created_at', 'desc')->get();

        return Excel::download(new MovimientosExport($movimientos), 'movimientos_'.now()->format('Ymd_His').'.xlsx');
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt',
        ]);

        Excel::import(new MovimientosImport, $request->file('archivo'));

        return redirect()->route('movimientos.index')->with('success', 'Movimientos importados correctamente.');
    }

    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls',
        ]);

        Excel::import(new MovimientosImport, $request->file('archivo'));

        return redirect()->route('movimientos.index')->with('success', 'Movimientos importados correctamente.');
    }
}
