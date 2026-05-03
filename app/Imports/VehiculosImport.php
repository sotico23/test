<?php

namespace App\Imports;

use App\Models\Vehiculo;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class VehiculosImport implements ToModel, WithHeadingRow
{
    protected $ownerId;

    public function __construct($ownerId = null)
    {
        $this->ownerId = $ownerId ?: Auth::user()->getOwnerId();
    }

    public function model(array $row)
    {
        $placa = $row['placa'] ?? null;
        if (! $placa) {
            return null;
        }

        return Vehiculo::updateOrCreate(
            [
                'placa' => strtoupper($placa),
                'owner_id' => $this->ownerId,
            ],
            [
                'marca' => $row['marca'] ?? null,
                'modelo' => $row['modelo'] ?? null,
                'tipo' => $row['tipo'] ?? null,
                'año' => $row['ano'] ?? $row['año'] ?? null,
                'color' => $row['color'] ?? null,
                'kilometraje' => $row['kilometraje'] ?? 0,
                'estado' => $row['estado'] ?? 'disponible',
                'imei' => $row['imei'] ?? null,
                'notas' => $row['notas'] ?? null,
            ]
        );
    }
}
