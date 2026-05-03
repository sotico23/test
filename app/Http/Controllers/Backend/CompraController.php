<?php

namespace App\Http\Controllers\Backend;

use App\Exports\ComprasExport;
use App\Http\Controllers\Controller;
use App\Imports\ComprasImport;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\Proveedor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompraController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = Auth::user()->getOwnerId();
        $query = Compra::with('proveedor', 'detalleCompras.producto')
            ->where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhereHas('proveedor', function ($pq) use ($search) {
                        $pq->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $compras = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $proveedors = Proveedor::where('activo', true)->where('owner_id', $ownerId)->get();
        $productos = Producto::where('activo', true)->where('owner_id', $ownerId)->get();

        return Inertia::render('Backend/Compras/Index', [
            'compras' => $compras,
            'proveedors' => $proveedors,
            'productos' => $productos,
            'filters' => $request->only(['search', 'estado']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:50|unique:compras,numero',
            'proveedor_id' => 'required|exists:proveedors,id',
            'fecha' => 'required|date',
            'estado' => 'required|in:pendiente,recibida,cancelada',
            'notas' => 'nullable|string',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        foreach ($validated['productos'] as $item) {
            $subtotal += $item['cantidad'] * $item['precio_unitario'];
        }
        $iva = round($subtotal * 0.19);
        $total = $subtotal + $iva;

        $compra = Compra::create([
            'owner_id' => Auth::user()->getOwnerId(),
            'numero' => $validated['numero'],
            'proveedor_id' => $validated['proveedor_id'],
            'fecha' => $validated['fecha'],
            'subtotal' => $subtotal,
            'iva' => $iva,
            'total' => $total,
            'estado' => $validated['estado'],
            'notas' => $validated['notas'] ?? null,
        ]);

        foreach ($validated['productos'] as $item) {
            $subtotalItem = $item['cantidad'] * $item['precio_unitario'];

            DetalleCompra::create([
                'compra_id' => $compra->id,
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $subtotalItem,
            ]);

            if ($validated['estado'] === 'recibida') {
                $inventario = Inventario::where('producto_id', $item['producto_id'])->first();
                if ($inventario) {
                    $inventario->increment('cantidad', $item['cantidad']);
                }
            }
        }

        return redirect()->route('compras.index');
    }

    public function update(Request $request, Compra $compra): RedirectResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:pendiente,recibida,cancelada',
            'notas' => 'nullable|string',
        ]);

        $estadoAnterior = $compra->estado;
        $compra->update($validated);

        if ($estadoAnterior !== 'recibida' && $validated['estado'] === 'recibida') {
            foreach ($compra->detalleCompras as $detalle) {
                $inventario = Inventario::where('producto_id', $detalle->producto_id)->first();
                if ($inventario) {
                    $inventario->increment('cantidad', $detalle->cantidad);
                }
            }
        }

        return redirect()->route('compras.index');
    }

    public function destroy(Compra $compra): RedirectResponse
    {
        if ($compra->owner_id !== Auth::user()->getOwnerId()) {
            abort(403, 'No tienes permiso para eliminar esta compra.');
        }

        $compra->delete();

        return redirect()->route('compras.index');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Compra::with('proveedor')->where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhereHas('proveedor', fn ($pq) => $pq->where('nombre', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $compras = $query->orderBy('created_at', 'desc')->get();
        $filename = 'compras_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($compras) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['ID', 'Numero', 'Proveedor', 'Fecha', 'Total', 'Estado', 'Notas'], ';');

            foreach ($compras as $c) {
                fputcsv($file, [
                    $c->id,
                    $c->numero,
                    $c->proveedor?->nombre ?? 'N/A',
                    $c->fecha,
                    $c->total,
                    $c->estado,
                    $c->notas,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $ownerId = auth()->user()->getOwnerId();
        $query = Compra::with('proveedor')->where('owner_id', $ownerId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhereHas('proveedor', fn ($pq) => $pq->where('nombre', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return Excel::download(new ComprasExport($query->get()), 'compras_'.now()->format('Ymd_His').'.xlsx');
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate(['archivo' => 'required|file|mimes:csv,txt,xlsx,xls']);
        Excel::import(new ComprasImport, $request->file('archivo'));

        return redirect()->back()->with('success', 'Compras importadas correctamente.');
    }

    public function importExcel(Request $request): RedirectResponse
    {
        return $this->importCsv($request);
    }
}
