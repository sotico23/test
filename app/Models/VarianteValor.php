<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VarianteValor extends Model
{
    protected $table = 'variante_valores';

    protected $fillable = [
        'variante_id',
        'valor',
        'codigo',
    ];

    public function variante(): BelongsTo
    {
        return $this->belongsTo(Variante::class);
    }
}
