<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclutamiento extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'reclutamiento';

    protected $fillable = ['owner_id', 'puesto', 'candidato_id', 'fecha_postulacion', 'fecha_entrevista', 'estado', 'resultado', 'notas'];

    protected function casts(): array
    {
        return ['fecha_postulacion' => 'date', 'fecha_entrevista' => 'date'];
    }
}
