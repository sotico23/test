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

    public function items()
    {
        return $this->hasMany(EntregaItem::class);
    }

    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }
}
