<?php

namespace App\Imports;

use App\Models\Cliente;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClientesImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        $ownerId = auth()->user()->getOwnerId();

        DB::transaction(function () use ($rows, $ownerId) {
            foreach ($rows as $row) {
                if (empty($row['nombre'])) {
                    continue;
                }

                $nit = $row['nit'] ?? $row['rut'] ?? null;
                $email = $row['email'] ?? null;

                $query = Cliente::where('owner_id', $ownerId);

                // Attempt to find existing by nit or email
                if ($nit) {
                    $query->where('nit', $nit);
                } elseif ($email) {
                    $query->where('email', $email);
                } else {
                    $query->where('nombre', $row['nombre']);
                }

                $cliente = $query->first();

                if ($cliente) {
                    $cliente->update([
                        'nombre' => $row['nombre'],
                        'nit' => $nit ?: $cliente->nit,
                        'rut' => $row['rut'] ?? $cliente->rut,
                        'telefono' => $row['telefono'] ?? $cliente->telefono,
                        'email' => $email ?: $cliente->email,
                        'direccion' => $row['direccion'] ?? $cliente->direccion,
                        'ciudad' => $row['ciudad'] ?? $cliente->ciudad,
                        'region' => $row['region'] ?? $cliente->region,
                        'comuna' => $row['comuna'] ?? $cliente->comuna,
                        'giro' => $row['giro'] ?? $cliente->giro,
                        'contacto' => $row['contacto'] ?? $cliente->contacto,
                        'telefono_contacto' => $row['telefono_contacto'] ?? $cliente->telefono_contacto,
                        'notas' => $row['notas'] ?? $cliente->notas,
                    ]);
                } else {
                    Cliente::create([
                        'owner_id' => $ownerId,
                        'nombre' => $row['nombre'],
                        'nit' => $nit,
                        'rut' => $row['rut'] ?? null,
                        'telefono' => $row['telefono'] ?? null,
                        'email' => $email,
                        'direccion' => $row['direccion'] ?? null,
                        'ciudad' => $row['ciudad'] ?? null,
                        'region' => $row['region'] ?? null,
                        'comuna' => $row['comuna'] ?? null,
                        'giro' => $row['giro'] ?? null,
                        'contacto' => $row['contacto'] ?? null,
                        'telefono_contacto' => $row['telefono_contacto'] ?? null,
                        'notas' => $row['notas'] ?? null,
                        'activo' => true,
                    ]);
                }
            }
        });
    }
}
