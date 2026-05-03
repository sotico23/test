<?php

namespace App\Imports;

use App\Models\Categoria;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CategoriasImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        $ownerId = Auth::user()->getOwnerId();

        return new Categoria([
            'nombre' => $row['nombre'],
            'descripcion' => $row['descripcion'] ?? null,
            'tipo' => $row['tipo'] ?? 'producto',
            'activo' => strtolower($row['activo'] ?? '') === 'sí' || strtolower($row['activo'] ?? '') === 'si' || $row['activo'] === '1' || $row['activo'] === true,
            'mostrar_en_perfil' => strtolower($row['mostrar_en_perfil'] ?? '') === 'sí' || strtolower($row['mostrar_en_perfil'] ?? '') === 'si' || $row['mostrar_en_perfil'] === '1' || $row['mostrar_en_perfil'] === true,
            'owner_id' => $ownerId,
            'user_id' => Auth::id(),
        ]);
    }
}
