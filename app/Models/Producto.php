<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Producto extends Model
{
    use BelongsToOwner, HasFactory;

    protected $fillable = [
        'user_id',
        'owner_id',
        'public_profile_id',
        'codigo',
        'unidad_medida',
        'nombre',
        'descripcion',
        'categoria_id',
        'precio_compra',
        'precio_venta',
        'stock_minimo',
        'envase_retornable',
        'medida_pesable',
        'tipo_medida',
        'cantidad_medida',
        'tipo_envase',
        'activo',
        'imagen',
        'imagen2',
        'imagen3',
        'imagen4',
        'imagen5',
        'video',
        'mostrar_en_perfil',
        'is_service',
        'duracion',
        'course_id',
        'peso_por_unidad',
        'contenido_por_unidad',
        'peso_base',
    ];

    protected function casts(): array
    {
        return [
            'precio_compra' => 'decimal:2',
            'precio_venta' => 'decimal:2',
            'activo' => 'boolean',
            'envase_retornable' => 'boolean',
            'medida_pesable' => 'boolean',
            'cantidad_medida' => 'decimal:2',
            'mostrar_en_perfil' => 'boolean',
            'is_service' => 'boolean',
            'peso_por_unidad' => 'decimal:2',
            'contenido_por_unidad' => 'decimal:2',
            'peso_base' => 'decimal:2',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function inventarios(): HasMany
    {
        return $this->hasMany(Inventario::class);
    }

    public function inventario(): HasOne
    {
        return $this->hasOne(Inventario::class)->latestOfMany();
    }

    /**
     * Get stock for a specific warehouse
     */
    public function stockEnAlmacen(int $almacenId): float
    {
        $inventario = $this->inventarios()
            ->where(fn ($q) => $q->where('almacen_id', $almacenId))
            ->first();

        return $inventario ? (float) ($inventario->cantidad ?? 0.0) : 0.0;
    }

    public function detalleCompras(): HasMany
    {
        return $this->hasMany(DetalleCompra::class);
    }

    public function detalleVentas(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function publicProfile(): BelongsTo
    {
        return $this->belongsTo(PublicProfile::class);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeConStock($query)
    {
        return $query->whereHas('inventario', fn ($q) => $q->whereColumn('cantidad', '>', 'cantidad_minima'));
    }

    public function scopeSinStock($query)
    {
        return $query->whereDoesntHave('inventario')
            ->orWhereHas('inventario', fn ($q) => $q->whereColumn('cantidad', '<=', 'cantidad_minima'));
    }

    public function getMargenGananciaAttribute(): float
    {
        if ($this->precio_compra == 0) {
            return 0;
        }

        return (($this->precio_venta - $this->precio_compra) / $this->precio_compra) * 100;
    }

    public function variantes(): HasMany
    {
        return $this->hasMany(ProductoVariante::class);
    }

    public function skus(): HasMany
    {
        return $this->hasMany(SkuVariante::class);
    }

    public function getTieneVariantesAttribute(): bool
    {
        return $this->skus()->count() > 0;
    }

    public function getStockTotalAttribute(): float
    {
        if ($this->tiene_variantes) {
            return $this->skus()->sum('stock');
        }

        return $this->inventarios()->sum('cantidad') ?? 0;
    }

    public function getPrecioConVariantesAttribute(): float
    {
        $precioMin = $this->skus()->min('precio_venta');

        return $precioMin ?? $this->precio_venta;
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
