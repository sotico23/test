<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InventariosExport implements FromCollection, WithHeadings, WithMapping
{
    protected $inventarios;

    public function __construct(Collection $inventarios)
    {
        $this->inventarios = $inventarios;
    }

    public function collection(): Collection
    {
        return $this->inventarios;
    }

    public function headings(): array
    {
        return [
            'Producto',
            'SKU',
            'Almacén',
            'Cantidad',
            'Stock Mínimo',
            'Ubicación',
        ];
    }

    public function map($inventario): array
    {
        return [
            $inventario->producto?->nombre ?? '',
            $inventario->producto?->sku ?? '',
            $inventario->almacen?->nombre ?? '',
            $inventario->cantidad,
            $inventario->cantidad_minima,
            $inventario->ubicacion ?? '',
        ];
    }
}
