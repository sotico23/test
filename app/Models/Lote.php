<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'lotes';

    protected $fillable = [
        'owner_id',
        'numero_lote',
        'producto',
        'cantidad',
        'fecha_vencimiento',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'fecha_vencimiento' => 'date',
        ];
    }
}
