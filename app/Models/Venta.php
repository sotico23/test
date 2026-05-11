<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Venta extends Model
{
    use BelongsToOwner, HasFactory;

    protected $appends = ['numero_factura'];

    protected $fillable = [
        'numero',
        'owner_id',
        'cliente_id',
        'almacen_id',
        'user_id',
        'fecha',
        'subtotal',
        'iva',
        'total',
        'metodo_pago',
        'tipo_documento',
        'es_pos',
        'estado',
        'notas',
        'incluye_iva',
        'tipo_descuento',
        'valor_descuento',
        'monto_descuento',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'subtotal' => 'decimal:2',
            'iva' => 'decimal:2',
            'total' => 'decimal:2',
            'incluye_iva' => 'boolean',
            'valor_descuento' => 'decimal:2',
            'monto_descuento' => 'decimal:2',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalleVentas(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    public function entrega(): HasOne
    {
        return $this->hasOne(Entrega::class);
    }

    protected function numeroFactura(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->numero,
        );
    }
}
