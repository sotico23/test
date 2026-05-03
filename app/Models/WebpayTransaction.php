<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebpayTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id', 'token', 'amount', 'status', 'buy_order', 'transbank_response',
    ];

    protected function casts(): array
    {
        return [
            'transbank_response' => 'array',
        ];
    }
}
