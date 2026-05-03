<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RafflePrize extends Model
{
    protected $fillable = [
        'raffle_id',
        'name',
        'description',
        'image_url',
        'quantity',
        'position',
        'estimated_value',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'position' => 'integer',
        'estimated_value' => 'decimal:2',
    ];

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function winners(): HasMany
    {
        return $this->hasMany(RaffleParticipant::class, 'prize_id');
    }

    public function getImageUrlAttribute($value): ?string
    {
        return $value ? asset('storage/'.$value) : null;
    }
}
