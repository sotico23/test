<?php

namespace App\Exports;

use App\Models\Empleado;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EmpleadosExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function collection()
    {
        $query = Empleado::with('almacen')
            ->where('creator_id', auth()->user()->getOwnerId());

        if (! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('cargo', 'like', "%{$search}%");
            });
        }

        if (! empty($this->filters['estado']) && $this->filters['estado'] !== 'all') {
            $query->where('estado', $this->filters['estado']);
        }

        return $query->orderBy('nombre')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Apellido',
            'Email',
            'Telefono',
            'Cargo',
            'Departamento',
            'Salario',
            'Estado',
            'Fecha_Contratacion',
            'Direccion',
        ];
    }

    public function map($e): array
    {
        return [
            $e->id,
            $e->nombre,
            $e->apellido,
            $e->email,
            $e->telefono,
            $e->cargo,
            $e->departamento,
            $e->salario,
            $e->estado,
            $e->fecha_contratacion,
            $e->direccion,
        ];
    }
}
