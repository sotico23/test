<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrega extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'entregas';

    protected $fillable = [
        'owner_id',
        'venta_id',
        'vehiculo_id',
        'conductor_id',
        'cliente',
        'direccion',
        'fecha_entrega',
        'estado',
        'notas',
        'descripcion',
        'productos_json',
    ];

    protected function casts(): array
    {
        return ['fecha_entrega' => 'date'];
    }
}
