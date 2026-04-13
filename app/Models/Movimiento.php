<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    use HasFactory;

    protected $table = 'movimientos';

    protected $fillable = ['tipo', 'monto', 'descripcion', 'referencia', 'fecha', 'cuenta_id', 'categoria', 'estado'];

    protected function casts(): array
    {
        return ['monto' => 'decimal:2', 'fecha' => 'date'];
    }
}
