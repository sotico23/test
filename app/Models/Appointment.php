<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use BelongsToOwner;

    protected $fillable = [
        'owner_id',
        'client_id',
        'provider_id',
        'producto_id',
        'start_time',
        'end_time',
        'status',
        'payment_status',
        'notes',
        'amount_paid',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
