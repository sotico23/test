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
        'nav_quienes_somos_visible',
        'nav_quienes_somos_label',
        'nav_quienes_somos_content',
        'nav_quienes_somos_image',
        'nav_quienes_somos_subtitle',
        'nav_feedback_visible',
        'nav_feedback_label',
        'nav_feedback_content',
        'nav_feedback_image',
        'nav_feedback_subtitle',
        'nav_fundacion_visible',
        'nav_fundacion_label',
        'nav_fundacion_content',
        'nav_fundacion_image',
        'nav_fundacion_subtitle',
        'nav_extra',
    ];

    protected $casts = [
        'maintenance_mode' => 'boolean',
        'caracteristicas' => 'array',
        'planes' => 'array',
        'nav_extra' => 'array',
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
