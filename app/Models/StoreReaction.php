<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreReaction extends Model
{
    protected $fillable = [
        'user_id',
        'public_profile_id',
        'like',
        'rating',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function publicProfile(): BelongsTo
    {
        return $this->belongsTo(PublicProfile::class);
    }
}
