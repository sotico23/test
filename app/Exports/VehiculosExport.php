<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class VehiculosExport implements FromCollection, WithHeadings, WithMapping
{
    protected $vehiculos;

    public function __construct($vehiculos)
    {
        $this->vehiculos = $vehiculos;
    }

    public function collection()
    {
        return $this->vehiculos;
    }

    public function headings(): array
    {
        return [
            'Placa',
            'Marca',
            'Modelo',
            'Tipo',
            'Año',
            'Color',
            'Kilometraje',
            'Estado',
            'IMEI',
            'Notas',
        ];
    }

    public function map($v): array
    {
        return [
            $v->placa,
            $v->marca,
            $v->modelo,
            $v->tipo,
            $v->año,
            $v->color,
            $v->kilometraje,
            $v->estado,
            $v->imei,
            $v->notas,
        ];
    }
}
