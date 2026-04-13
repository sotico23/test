<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\PublicProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::user()->getOwnerId();

        $productos = Producto::with('categoria', 'inventario')
            ->where(fn ($q) => $q->where('owner_id', $userId))
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        $categorias = Categoria::where(fn ($q) => $q->where('tipo', 'producto'))
            ->where(fn ($q) => $q->where('activo', true))
            ->where(fn ($q) => $q->where('owner_id', $userId))
            ->get();

        return Inertia::render('Backend/Productos/Index', [
            'productos' => $productos,
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:productos,codigo',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'nullable|exists:categorias,id',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'stock_minimo' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'almacen_id' => 'nullable|exists:almacenes,id',
            'unidad_medida' => 'nullable|in:unidad,kg,lt',
            'envase_retornable' => 'boolean',
            'tipo_envase' => 'nullable|string',
            'activo' => 'boolean',
            'medida_pesable' => 'boolean',
            'tipo_medida' => 'nullable|in:unidad,kilo,litro',
            'cantidad_medida' => 'nullable|numeric|min:0',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen2' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen3' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen4' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen5' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'video' => 'nullable|mimes:mp4,webm,ogv|max:10240',
            'mostrar_en_perfil' => 'boolean',
        ]);

        $data = array_merge($validated, [
            'owner_id' => Auth::user()->getOwnerId(),
            'user_id' => Auth::id(),
        ]);

        $publicProfile = PublicProfile::where('user_id', Auth::user()->getOwnerId())->first();
        if ($publicProfile) {
            $data['public_profile_id'] = $publicProfile->id;
        }

        if (! isset($data['unidad_medida']) || empty($data['unidad_medida'])) {
            $data['unidad_medida'] = 'unidad';
        }

        $stock = $validated['stock'];
        $almacenId = $validated['almacen_id'] ?? null;

        unset($data['stock'], $data['almacen_id']);

        $imagenes = [];
        for ($i = 1; $i <= 5; $i++) {
            $key = 'imagen'.($i === 1 ? '' : $i);
            if ($request->hasFile($key)) {
                $imagenes[$key] = $request->file($key)->store('productos', 'public');
            }
        }

        if ($request->hasFile('video')) {
            $imagenes['video'] = $request->file('video')->store('productos/videos', 'public');
        }

        $producto = Producto::create(array_merge($data, $imagenes));

        $producto->inventarios()->create([
            'cantidad' => $stock,
            'cantidad_minima' => $validated['stock_minimo'],
            'almacen_id' => $almacenId,
        ]);

        return redirect()->route('productos.index');
    }

    public function update(Request $request, Producto $producto): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => 'nullable|string|max:50|unique:productos,codigo,'.$producto->id,
            'nombre' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'nullable|exists:categorias,id',
            'precio_compra' => 'nullable|numeric|min:0',
            'precio_venta' => 'nullable|numeric|min:0',
            'stock_minimo' => 'nullable|numeric|min:0',
            'stock' => 'nullable|numeric|min:0',
            'almacen_id' => 'nullable|exists:almacenes,id',
            'unidad_medida' => 'nullable|in:unidad,kg,lt',
            'envase_retornable' => 'nullable|boolean',
            'tipo_envase' => 'nullable|string',
            'activo' => 'nullable|boolean',
            'medida_pesable' => 'nullable|boolean',
            'tipo_medida' => 'nullable|in:unidad,kilo,litro',
            'cantidad_medida' => 'nullable|numeric|min:0',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen2' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen3' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen4' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'imagen5' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'video' => 'nullable|mimes:mp4,webm,ogv|max:10240',
            'mostrar_en_perfil' => 'nullable|boolean',
        ]);

        $publicProfile = PublicProfile::where('user_id', Auth::user()->getOwnerId())->first();

        $updateData = [];

        if ($request->filled('codigo')) {
            $updateData['codigo'] = $validated['codigo'];
        }
        if ($request->filled('nombre')) {
            $updateData['nombre'] = $validated['nombre'];
        }
        if ($request->filled('descripcion')) {
            $updateData['descripcion'] = $validated['descripcion'];
        }
        if ($request->filled('categoria_id')) {
            $updateData['categoria_id'] = $validated['categoria_id'];
        }
        if ($request->filled('precio_compra')) {
            $updateData['precio_compra'] = $validated['precio_compra'];
        }
        if ($request->filled('precio_venta')) {
            $updateData['precio_venta'] = $validated['precio_venta'];
        }
        if ($request->filled('stock_minimo')) {
            $updateData['stock_minimo'] = $validated['stock_minimo'];
        }
        if ($request->filled('activo')) {
            $updateData['activo'] = $validated['activo'];
        }
        if ($request->filled('unidad_medida')) {
            $updateData['unidad_medida'] = $validated['unidad_medida'];
        }
        if ($request->filled('envase_retornable')) {
            $updateData['envase_retornable'] = $validated['envase_retornable'];
        }
        if ($request->filled('tipo_envase')) {
            $updateData['tipo_envase'] = $validated['tipo_envase'];
        }
        if ($request->filled('medida_pesable')) {
            $updateData['medida_pesable'] = $validated['medida_pesable'];
        }
        if ($request->filled('tipo_medida')) {
            $updateData['tipo_medida'] = $validated['tipo_medida'];
        }
        if ($request->filled('cantidad_medida')) {
            $updateData['cantidad_medida'] = $validated['cantidad_medida'];
        }
        if ($request->filled('mostrar_en_perfil')) {
            $updateData['mostrar_en_perfil'] = $validated['mostrar_en_perfil'];
        }

        $stock = $validated['stock'] ?? null;
        $almacenId = $validated['almacen_id'] ?? null;

        if ($request->filled('stock')) {
            $updateData['_stock_update'] = $validated['stock'];
        }
        if ($request->filled('stock_minimo')) {
            $updateData['_stock_minimo_update'] = $validated['stock_minimo'];
        }
        if ($request->filled('almacen_id')) {
            $updateData['_almacen_id_update'] = $validated['almacen_id'];
        }

        if (! empty($updateData)) {
            $updateData['public_profile_id'] = $publicProfile?->id;
        }

        for ($i = 1; $i <= 5; $i++) {
            $key = 'imagen'.($i === 1 ? '' : $i);
            if ($request->hasFile($key)) {
                if ($producto->{$key}) {
                    Storage::disk('public')->delete($producto->{$key});
                }
                $updateData[$key] = $request->file($key)->store('productos', 'public');
            }
        }

        if ($request->hasFile('video')) {
            if ($producto->video) {
                Storage::disk('public')->delete($producto->video);
            }
            $updateData['video'] = $request->file('video')->store('productos/videos', 'public');
        }

        $updateDataFiltered = array_filter($updateData, fn ($key) => ! in_array($key, ['_stock_update', '_stock_minimo_update', '_almacen_id_update']), ARRAY_FILTER_USE_KEY);

        if (! empty($updateDataFiltered)) {
            $producto->update($updateDataFiltered);
        }

        if ($request->filled('stock') || $request->filled('stock_minimo') || $request->filled('almacen_id')) {
            $inventario = $producto->inventarios()->first();
            $inventarioData = [];
            if ($request->filled('stock')) {
                $inventarioData['cantidad'] = $validated['stock'];
            }
            if ($request->filled('stock_minimo')) {
                $inventarioData['cantidad_minima'] = $validated['stock_minimo'];
            }
            if ($request->filled('almacen_id')) {
                $inventarioData['almacen_id'] = $validated['almacen_id'];
            }

            if ($inventario) {
                if (! empty($inventarioData)) {
                    $inventario->update($inventarioData);
                }
            } elseif (! empty($inventarioData)) {
                $inventarioData['producto_id'] = $producto->id;
                $producto->inventarios()->create($inventarioData);
            }
        }

        return redirect()->route('productos.index');
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        if ($producto->owner_id !== Auth::user()->getOwnerId()) {
            abort(403, 'No tienes permiso para eliminar este producto.');
        }

        for ($i = 1; $i <= 5; $i++) {
            $key = 'imagen'.($i === 1 ? '' : $i);
            if ($producto->{ $key}) {
                Storage::disk('public')->delete($producto->{ $key});
            }
        }
        if ($producto->video) {
            Storage::disk('public')->delete($producto->video);
        }

        $producto->delete();

        return redirect()->route('productos.index');
    }

    public function exportCsv(Request $request)
    {
        $userId = auth()->user()->getOwnerId();
        $productos = Producto::with(['categoria', 'inventarios'])
            ->where(fn ($q) => $q->where('owner_id', $userId))
            ->get();

        $filename = 'productos_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () use ($productos) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, [
                'Codigo', 'Nombre', 'Descripcion', 'Precio_Compra', 'Precio_Venta',
                'Stock', 'Stock_Minimo', 'Unidad_Medida', 'Categoria', 'Activo',
            ], ';');

            foreach ($productos as $p) {
                fputcsv($file, [
                    $p->codigo,
                    $p->nombre,
                    $p->descripcion,
                    $p->precio_compra,
                    $p->precio_venta,
                    $p->inventarios->first()->cantidad ?? 0,
                    $p->stock_minimo,
                    $p->unidad_medida,
                    $p->categoria->nombre ?? '',
                    $p->activo ? 'Si' : 'No',
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $userId = auth()->user()->getOwnerId();
        $productos = Producto::with(['categoria', 'inventarios'])
            ->where(fn ($q) => $q->where('owner_id', $userId))
            ->get();

        $filename = 'productos_'.now()->format('Ymd_His').'.xls';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        return response()->stream(function () use ($productos) {
            echo '<html><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><body><table border="1">';
            echo '<tr>
                <th style="background-color: #f2f2f2;">Codigo</th>
                <th style="background-color: #f2f2f2;">Nombre</th>
                <th style="background-color: #f2f2f2;">Descripcion</th>
                <th style="background-color: #f2f2f2;">Precio_Compra</th>
                <th style="background-color: #f2f2f2;">Precio_Venta</th>
                <th style="background-color: #f2f2f2;">Stock</th>
                <th style="background-color: #f2f2f2;">Stock_Minimo</th>
                <th style="background-color: #f2f2f2;">Unidad_Medida</th>
                <th style="background-color: #f2f2f2;">Categoria</th>
                <th style="background-color: #f2f2f2;">Activo</th>
            </tr>';
            foreach ($productos as $p) {
                echo '<tr>
                    <td>'.$p->codigo.'</td>
                    <td>'.$p->nombre.'</td>
                    <td>'.$p->descripcion.'</td>
                    <td>'.$p->precio_compra.'</td>
                    <td>'.$p->precio_venta.'</td>
                    <td>'.($p->inventarios->first()->cantidad ?? 0).'</td>
                    <td>'.$p->stock_minimo.'</td>
                    <td>'.$p->unidad_medida.'</td>
                    <td>'.($p->categoria->nombre ?? '').'</td>
                    <td>'.($p->activo ? 'Si' : 'No').'</td>
                </tr>';
            }
            echo '</table></body></html>';
        }, 200, $headers);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file',
        ]);

        $file = $request->file('archivo');
        $filePath = $file->getRealPath();

        $handle = fopen($filePath, 'r');
        $firstLine = fgets($handle);
        fclose($handle);

        $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';

        $handle = fopen($filePath, 'r');
        $bom = fread($handle, 3);
        if ($bom !== chr(0xEF).chr(0xBB).chr(0xBF)) {
            rewind($handle);
        }

        $header = fgetcsv($handle, 0, $delimiter);

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (count($row) >= 8) {
                $rows[] = array_combine([
                    'codigo', 'nombre', 'descripcion', 'precio_compra', 'precio_venta',
                    'stock', 'stock_minimo', 'unidad_medida',
                ], array_slice($row, 0, 8));
            }
        }
        fclose($handle);

        if (empty($rows)) {
            return redirect()->back()->with('error', 'No se encontraron datos válidos en el archivo.');
        }

        $ownerId = auth()->user()->getOwnerId();
        $importedCount = 0;

        DB::transaction(function () use ($rows, $ownerId, &$importedCount) {
            foreach ($rows as $row) {
                $producto = Producto::updateOrCreate(
                    ['codigo' => $row['codigo'], 'owner_id' => $ownerId],
                    [
                        'nombre' => $row['nombre'],
                        'descripcion' => $row['descripcion'] ?? '',
                        'precio_compra' => (float) $row['precio_compra'],
                        'precio_venta' => (float) $row['precio_venta'],
                        'stock_minimo' => (float) $row['stock_minimo'],
                        'unidad_medida' => in_array($row['unidad_medida'], ['unidad', 'kg', 'lt']) ? $row['unidad_medida'] : 'unidad',
                        'user_id' => auth()->id(),
                        'activo' => true,
                    ]
                );

                $producto->inventarios()->updateOrCreate(
                    ['producto_id' => $producto->id],
                    [
                        'cantidad' => (float) $row['stock'],
                        'cantidad_minima' => (float) $row['stock_minimo'],
                    ]
                );

                $importedCount++;
            }
        });

        return redirect()->back()->with('success', "Se procesaron $importedCount productos correctamente.");
    }
}
