<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'movimientos';

    protected $fillable = [
        'owner_id',
        'producto',
        'tipo',
        'cantidad',
        'almacen_origen',
        'almacen_destino',
        'referencia',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
        ];
    }
}
