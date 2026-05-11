<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    use HasFactory;

    protected $table = 'detalle_ventas';

    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
        'subtotal_metrica',
    ];

    protected function casts(): array
    {
        return [
            'precio_unitario' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'subtotal_metrica' => 'decimal:2',
        ];
    }

    protected static function booted()
    {
        static::saving(function ($item) {
            if ($item->producto) {
                $producto = $item->producto;
                $contenido = (float) ($producto->contenido_por_unidad ?? 1.0);
                $pesoBase = (float) ($producto->peso_base ?? 0.0);

                // Reengineering Formula: total_metrica = cantidad * contenido
                // We add the base weight (tara) if it's a weightable product
                $item->subtotal_metrica = ($item->cantidad * $contenido) + ($item->cantidad * $pesoBase);
            }
        });
    }

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
