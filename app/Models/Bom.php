<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bom extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'boms';

    protected $fillable = [
        'owner_id',
        'nombre',
        'producto_final',
        'cantidad',
        'materiales',
        'activo',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'materiales' => 'array',
            'activo' => 'boolean',
        ];
    }
}
