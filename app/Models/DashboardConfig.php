<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardConfig extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'mode',
        'layout',
        'widgets',
        'is_default',
    ];

    protected $casts = [
        'layout' => 'array',
        'widgets' => 'array',
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getForUser(int $userId): ?self
    {
        return static::where('user_id', $userId)
            ->where('is_default', true)
            ->first();
    }

    public static function getAllForUser(int $userId)
    {
        return static::where('user_id', $userId)->orderBy('name')->get();
    }
}
