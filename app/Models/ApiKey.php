<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use HasFactory;

    protected $table = 'api_keys';

    protected $fillable = ['nombre', 'key', 'usuario_id', 'fecha_expiracion', 'ultimo_uso', 'estado', 'permisos'];

    protected $hidden = ['key'];

    protected function casts(): array
    {
        return ['fecha_expiracion' => 'date', 'ultimo_uso' => 'datetime'];
    }
}
