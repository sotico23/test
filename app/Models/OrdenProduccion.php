<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenProduccion extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'ordenes_produccion';

    protected $fillable = [
        'owner_id',
        'numero',
        'producto',
        'cantidad',
        'fecha_inicio',
        'fecha_fin',
        'progreso',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'progreso' => 'integer',
        ];
    }
}
