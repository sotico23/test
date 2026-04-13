<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Almacen extends Model
{
    use BelongsToOwner, HasFactory;

    protected $table = 'almacenes';

    protected $fillable = [
        'user_id',
        'owner_id',
        'nombre',
        'codigo',
        'direccion',
        'telefono',
        'responsable',
        'capacidad',
        'tipo',
        'activo',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'capacidad' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'almacen_id');
    }
}
