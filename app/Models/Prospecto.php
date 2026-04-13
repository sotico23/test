<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prospecto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'empresa',
        'descripcion',
        'fuente',
        'estado',
        'valor_estimado',
        'fecha_seguimiento',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'valor_estimado' => 'decimal:2',
            'fecha_seguimiento' => 'date',
        ];
    }
}
