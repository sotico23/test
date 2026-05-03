<?php

namespace App\Exports;

use App\Models\Producto;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductosExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    /**
     * @return Collection
     */
    public function collection()
    {
        $query = Producto::with(['categoria', 'inventarios'])
            ->where('owner_id', auth()->user()->getOwnerId());

        if (! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if (! empty($this->filters['categoria_id']) && $this->filters['categoria_id'] !== 'all') {
            $query->where('categoria_id', $this->filters['categoria_id']);
        }

        if (! empty($this->filters['stock_bajo'])) {
            $query->whereHas('inventarios', function ($q) {
                $q->whereColumn('cantidad', '<=', 'cantidad_minima');
            });
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Codigo',
            'Nombre',
            'Descripcion',
            'Precio_Compra',
            'Precio_Venta',
            'Stock',
            'Stock_Minimo',
            'Unidad_Medida',
            'Categoria',
            'Activo',
        ];
    }

    public function map($producto): array
    {
        return [
            $producto->codigo,
            $producto->nombre,
            $producto->descripcion,
            $producto->precio_compra,
            $producto->precio_venta,
            $producto->inventarios->first()->cantidad ?? 0,
            $producto->stock_minimo,
            $producto->unidad_medida,
            $producto->categoria->nombre ?? '',
            $producto->activo ? 'Si' : 'No',
        ];
    }
}
