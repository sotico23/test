<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversacion extends Model
{
    use HasFactory;

    protected $table = 'conversaciones';

    protected $fillable = [
        'pedido_id',
        'public_profile_id',
        'comprador_id',
        'vendedor_id',
        'titulo',
        'ultimo_mensaje_at',
    ];

    protected function casts(): array
    {
        return [
            'ultimo_mensaje_at' => 'datetime',
        ];
    }

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    public function publicProfile(): BelongsTo
    {
        return $this->belongsTo(PublicProfile::class);
    }

    public function comprador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'comprador_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendedor_id');
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(MensajeConversacion::class)->orderBy('created_at', 'asc');
    }

    public function ultimoMensaje(): HasOne
    {
        return $this->hasOne(MensajeConversacion::class)->latestOfMany();
    }
}
