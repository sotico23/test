<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    use BelongsToOwner, HasFactory;

    protected $fillable = [
        'owner_id',
        'nombre',
        'descripcion',
        'cliente',
        'responsable',
        'fecha_inicio',
        'fecha_fin',
        'presupuesto',
        'gasto_real',
        'progreso',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'presupuesto' => 'decimal:2',
            'gasto_real' => 'decimal:2',
            'progreso' => 'integer',
        ];
    }
}
