<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conductor extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'conductores';

    protected $fillable = ['owner_id', 'nombre', 'rut', 'licencia', 'fecha_vencimiento_licencia', 'telefono', 'email', 'estado', 'notas', 'lat', 'lng', 'ultima_actualizacion'];

    protected function casts(): array
    {
        return [
            'fecha_vencimiento_licencia' => 'datetime',
        ];
    }
}
