<?php

namespace App\Models;

use App\Traits\BelongsToOwner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentConfig extends Model
{
    use BelongsToOwner, HasFactory;

    protected $fillable = [
        'owner_id',
        'commerce_code', 'api_key', 'environment', 'is_active',
        'paypal_client_id', 'paypal_client_secret', 'paypal_mode', 'paypal_active',
        'mercadopago_public_key', 'mercadopago_access_token', 'mercadopago_mode', 'mercadopago_active',
    ];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'paypal_client_secret' => 'encrypted',
            'mercadopago_access_token' => 'encrypted',
            'is_active' => 'boolean',
            'paypal_active' => 'boolean',
            'mercadopago_active' => 'boolean',
        ];
    }
}
