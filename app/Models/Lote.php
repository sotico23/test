<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'lotes';

    protected $fillable = ['owner_id', 'numero_lote', 'producto_id', 'cantidad', 'fecha_produccion', 'fecha_vencimiento', 'estado', 'almacen_id'];

    protected function casts(): array
    {
        return ['cantidad' => 'integer', 'fecha_produccion' => 'date', 'fecha_vencimiento' => 'date'];
    }
}
