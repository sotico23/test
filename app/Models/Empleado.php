<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empleado extends Model
{
    use BelongsToOwner, HasFactory;

    protected $fillable = [
        'user_id',
        'owner_id',
        'creator_id',
        'almacen_id',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'cargo',
        'departamento',
        'fecha_contratacion',
        'salario',
        'estado',
        'direccion',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'fecha_contratacion' => 'date',
            'salario' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'empleado_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeByDepartamento($query, string $departamento)
    {
        return $query->where('departamento', $departamento);
    }

    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombre} {$this->apellido}";
    }

    public function getAntiguedadAniosAttribute(): int
    {
        return (int) $this->fecha_contratacion?->diffInYears(now()) ?? 0;
    }
}
