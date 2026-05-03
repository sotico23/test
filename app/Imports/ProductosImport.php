<?php

namespace App\Imports;

use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductosImport implements ToModel, WithHeadingRow
{
    protected $ownerId;

    public function __construct($ownerId = null)
    {
        $this->ownerId = $ownerId ?: Auth::user()->getOwnerId();
    }

    /**
     * @return Model|null
     */
    public function model(array $row)
    {
        // Try to handle both ';' and ',' if handled by Excel library
        // Usually WithHeadingRow handles it if common headers are present

        $codigo = $row['codigo'] ?? null;
        if (! $codigo) {
            return null;
        }

        $categoriaId = null;
        if (! empty($row['categoria'])) {
            $categoria = Categoria::firstOrCreate(
                ['nombre' => $row['categoria'], 'owner_id' => $this->ownerId],
                ['tipo' => 'producto', 'activo' => true]
            );
            $categoriaId = $categoria->id;
        }

        DB::transaction(function () use ($row, $codigo, $categoriaId) {
            $producto = Producto::updateOrCreate(
                ['codigo' => $codigo, 'owner_id' => $this->ownerId],
                [
                    'nombre' => $row['nombre'] ?? 'Sin Nombre',
                    'descripcion' => $row['descripcion'] ?? '',
                    'precio_compra' => (float) ($row['precio_compra'] ?? 0),
                    'precio_venta' => (float) ($row['precio_venta'] ?? 0),
                    'stock_minimo' => (float) ($row['stock_minimo'] ?? 0),
                    'unidad_medida' => in_array($row['unidad_medida'] ?? '', ['unidad', 'kg', 'lt']) ? $row['unidad_medida'] : 'unidad',
                    'categoria_id' => $categoriaId,
                    'user_id' => Auth::id(),
                    'activo' => strtolower($row['activo'] ?? '') === 'no' ? false : true,
                ]
            );

            $producto->inventarios()->updateOrCreate(
                ['producto_id' => $producto->id],
                [
                    'cantidad' => (float) ($row['stock'] ?? 0),
                    'cantidad_minima' => (float) ($row['stock_minimo'] ?? 0),
                ]
            );
        });

        return null; // Handled manually via updateOrCreate + transaction
    }
}
