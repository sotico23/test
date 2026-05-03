<?php

namespace App\Exports;

use App\Models\Almacen;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AlmacenesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $ownerId;

    public function __construct($ownerId = null)
    {
        $this->ownerId = $ownerId;
    }

    public function collection()
    {
        return Almacen::with('empleados')->where('owner_id', $this->ownerId)->orderBy('nombre')->get();
    }

    public function headings(): array
    {
        return [
            'Codigo',
            'Nombre',
            'Direccion',
            'Telefono',
            'Capacidad',
            'Tipo',
            'Activo',
            'Notas',
        ];
    }

    public function map($almacen): array
    {
        return [
            $almacen->codigo,
            $almacen->nombre,
            $almacen->direccion,
            $almacen->telefono,
            $almacen->capacidad,
            $almacen->tipo,
            $almacen->activo ? 'Si' : 'No',
            $almacen->notas,
        ];
    }
}
