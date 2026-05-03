<?php

namespace App\Imports;

use App\Models\Almacen;
use App\Models\Empleado;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AlmacenesImport implements ToModel, WithHeadingRow
{
    protected $ownerId;

    public function __construct($ownerId = null)
    {
        $this->ownerId = $ownerId ?: Auth::user()->getOwnerId();
    }

    public function model(array $row)
    {
        $codigo = $row['codigo'] ?? null;
        if (! $codigo) {
            return null;
        }

        $responsableId = null;
        if (! empty($row['responsable'])) {
            $partes = explode(' ', $row['responsable']);
            $nombre = $partes[0] ?? '';
            $apellido = $partes[1] ?? '';
            $empleado = Empleado::where('nombre', 'like', '%'.$nombre.'%')
                ->where('owner_id', $this->ownerId)
                ->first();
            $responsableId = $empleado?->id;
        }

        return new Almacen([
            'codigo' => $codigo,
            'nombre' => $row['nombre'] ?? 'Sin Nombre',
            'direccion' => $row['direccion'] ?? null,
            'telefono' => $row['telefono'] ?? null,
            'capacidad' => isset($row['capacidad']) ? (int) $row['capacidad'] : null,
            'tipo' => $row['tipo'] ?? 'principal',
            'activo' => strtolower($row['activo'] ?? 'si') !== 'no',
            'notas' => $row['notas'] ?? null,
            'owner_id' => $this->ownerId,
            'user_id' => Auth::id(),
            'responsable_id' => $responsableId,
        ]);
    }
}
