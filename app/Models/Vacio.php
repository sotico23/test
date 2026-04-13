<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vacio extends Model
{
    use BelongsToOwner;

    protected $fillable = [
        'owner_id',
        'producto_id',
        'cantidad',
        'cantidad_minima',
        'estado',
        'ubicacion',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'cantidad_minima' => 'integer',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
