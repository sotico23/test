<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebSetting extends Model
{
    use HasFactory;

    protected $table = 'web_settings';

    protected $fillable = [
        'user_id',
        'app_name',
        'app_logo',
        'app_favicon',
        'app_title',
        'app_description',
        'app_keywords',
        'app_author',
        'timezone',
        'locale',
        'currency',
        'currency_symbol',
        'maintenance_mode',
        // Configuración de página de inicio
        'hero_titulo',
        'hero_subtitulo',
        'hero_boton_principal',
        'hero_boton_secundario',
        'hero_badge',
        'caracteristicas',
        'planes',
        'cta_titulo',
        'cta_descripcion',
        'cta_boton',
    ];

    protected $casts = [
        'maintenance_mode' => 'boolean',
        'caracteristicas' => 'array',
        'planes' => 'array',
    ];

    public static function getSettings(bool $forPublicPage = false): self
    {
        $cacheKey = 'web_settings:latest';

        return cache()->rememberForever($cacheKey, function () {
            $settings = self::orderBy('id', 'desc')->first();

            if ($settings) {
                return $settings;
            }

            return self::create([
                'user_id' => null,
                'app_name' => 'GrowERP',
                'app_title' => 'GrowERP - Tu ERP todo-en-uno',
            ]);
        });
    }

    public static function clearCache(): void
    {
        cache()->forget('web_settings:latest');
        cache()->forget('web_settings:shared');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::updated(function (self $settings) {
            self::clearCache();
        });

        static::created(function (self $settings) {
            self::clearCache();
        });
    }
}
