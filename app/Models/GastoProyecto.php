<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GastoProyecto extends Model
{
    use HasFactory;

    protected $table = 'gastos_proyecto';

    protected $fillable = ['proyecto_id', 'categoria', 'descripcion', 'monto', 'fecha', 'referencia', 'aprobado', 'aprobador_id'];

    protected function casts(): array
    {
        return ['monto' => 'decimal:2', 'fecha' => 'date', 'aprobado' => 'boolean'];
    }
}
