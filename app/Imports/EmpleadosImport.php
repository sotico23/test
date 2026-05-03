<?php

namespace App\Imports;

use App\Models\Empleado;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EmpleadosImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row): ?Empleado
    {
        $ownerId = auth()->user()->getOwnerId();

        return Empleado::updateOrCreate(
            [
                'email' => $row['email'],
                'creator_id' => $ownerId,
            ],
            [
                'creator_id' => $ownerId,
                'nombre' => $row['nombre'] ?? '',
                'apellido' => $row['apellido'] ?? '',
                'email' => $row['email'],
                'telefono' => $row['telefono'] ?? null,
                'cargo' => $row['cargo'] ?? null,
                'departamento' => $row['departamento'] ?? null,
                'salario' => is_numeric($row['salario'] ?? null) ? $row['salario'] : null,
                'estado' => $row['estado'] ?? 'activo',
                'fecha_contratacion' => ! empty($row['fecha_contratacion']) ? $row['fecha_contratacion'] : null,
                'direccion' => $row['direccion'] ?? null,
            ]
        );
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'email' => 'required|email',
        ];
    }
}
