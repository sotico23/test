<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\WebSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebSettingController extends Controller
{
    public function index(): Response
    {
        $settings = WebSetting::getSettings();

        $defaults = [
            'hero' => [
                'titulo' => $settings->hero_titulo ?? 'Gestiona tu negocio como un experto',
                'subtitulo' => $settings->hero_subtitulo ?? 'La plataforma todo-en-uno que necesitas para hacer crecer tu empresa. Desde inventario hasta facturación, todo en un solo lugar.',
                'boton_principal' => $settings->hero_boton_principal ?? 'Comenzar gratis',
                'boton_secundario' => $settings->hero_boton_secundario ?? 'Ver demo',
                'badge' => $settings->hero_badge ?? '¡Nuevo! IA integrada para predicción de inventario',
            ],
            'caracteristicas' => $settings->caracteristicas ?? [
                ['icono' => '📊', 'titulo' => 'Dashboard Inteligente', 'descripcion' => 'Visualiza tus métricas en tiempo real con gráficos interactivos'],
                ['icono' => '👥', 'titulo' => 'Gestión de Clientes', 'descripcion' => 'CRM completo para gestionar prospectos, oportunidades y clientes'],
                ['icono' => '📦', 'titulo' => 'Control de Inventario', 'descripcion' => 'Gestiona tu stock con alertas automáticas y múltiples almacenes'],
                ['icono' => '💰', 'titulo' => 'Facturación Electrónica', 'descripcion' => 'Emite facturas, cotizaciones y gestiona tu tesorería'],
                ['icono' => '📈', 'titulo' => 'Reportes Avanzados', 'descripcion' => 'Toma decisiones basadas en datos con análisis detallados'],
                ['icono' => '🔗', 'titulo' => 'Integraciones', 'descripcion' => 'Conecta con pasarelas de pago, envíos y más'],
            ],
            'planes' => $settings->planes ?? [
                [
                    'nombre' => 'Gratuito',
                    'precio' => '$0',
                    'periodo' => '/mes',
                    'descripcion' => 'Perfecto para comenzar',
                    'popular' => false,
                    'caracteristicas' => ['Hasta 10 clientes', 'Gestión básica de inventario', '1 usuario administrador', 'Reportes simples', 'Soporte por email'],
                ],
                [
                    'nombre' => 'Vendedor Independiente',
                    'precio' => '$29',
                    'periodo' => '/mes',
                    'descripcion' => 'Para vendedores individuales',
                    'popular' => false,
                    'caracteristicas' => ['Hasta 100 clientes', 'Gestión completa de inventario', '3 usuarios', 'Facturación electrónica', 'Reportes avanzados', 'Soporte prioritario'],
                ],
                [
                    'nombre' => 'Premium',
                    'precio' => '$99',
                    'periodo' => '/mes',
                    'descripcion' => 'Para pequeñas empresas',
                    'popular' => true,
                    'caracteristicas' => ['Clientes ilimitados', 'Gestión de proveedores', '10 usuarios', 'Facturación electrónica completa', 'Reportes detallados', 'Múltiples almacenes', 'Integraciones', 'Soporte por chat'],
                ],
                [
                    'nombre' => 'Enterprise',
                    'precio' => '$299',
                    'periodo' => '/mes',
                    'descripcion' => 'Para empresas en crecimiento',
                    'popular' => false,
                    'caracteristicas' => ['Todo del plan Premium', 'Usuarios ilimitados', 'Múltiples sucursales', 'Gestión de empleados', 'Control de acceso avanzado', 'Auditoría completa', 'Personalización completa', 'Soporte telefónico'],
                ],
                [
                    'nombre' => 'Corporativo',
                    'precio' => 'Custom',
                    'periodo' => '',
                    'descripcion' => 'Para grandes organizaciones',
                    'popular' => false,
                    'caracteristicas' => ['Todo del plan Enterprise', 'Servidor dedicado', '部署 local', 'Personalización de marca', 'Capacitación dedicada', 'Gerente de cuenta', 'SLA garantizado', 'Soporte 24/7'],
                ],
            ],
            'cta' => [
                'titulo' => $settings->cta_titulo ?? '¿Listo para transformar tu negocio?',
                'descripcion' => $settings->cta_descripcion ?? 'Únete a miles de empresas que ya están creciendo con GrowERP',
                'boton' => $settings->cta_boton ?? 'Crear cuenta gratis',
            ],
            'general' => [
                'nombre_sitio' => $settings->app_name ?? 'GrowERP',
                'logo_letra' => substr($settings->app_name ?? 'G', 0, 1),
            ],
        ];

        return Inertia::render('Backend/ConfiguracionWeb/Index', array_merge(['settings' => $settings], $defaults));
    }

    public function update(Request $request, WebSetting $configuracion_web): RedirectResponse
    {
        $data = $request->all();

        // Validar solo los campos simples
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_title' => 'required|string|max:255',
            'app_description' => 'nullable|string',
            'app_keywords' => 'nullable|string|max:500',
            'app_author' => 'nullable|string|max:255',
            'timezone' => 'required|string|max:100',
            'locale' => 'required|string|max:10',
            'currency' => 'required|string|max:10',
            'currency_symbol' => 'required|string|max:5',
            'maintenance_mode' => 'boolean',
        ]);

        // Handle logo file upload
        if ($request->hasFile('app_logo_file')) {
            if ($configuracion_web->app_logo && str_starts_with($configuracion_web->app_logo, '/storage/branding/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $configuracion_web->app_logo));
            }
            $path = $request->file('app_logo_file')->store('branding', 'public');
            $validated['app_logo'] = '/storage/'.$path;
        }

        // Handle favicon file upload
        if ($request->hasFile('app_favicon_file')) {
            if ($configuracion_web->app_favicon && str_starts_with($configuracion_web->app_favicon, '/storage/branding/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $configuracion_web->app_favicon));
            }
            $path = $request->file('app_favicon_file')->store('branding', 'public');
            $validated['app_favicon'] = '/storage/'.$path;
        }

        // Extraer campos de configuración de página de inicio
        if (isset($data['hero']) && is_array($data['hero'])) {
            $validated['hero_titulo'] = $data['hero']['titulo'] ?? null;
            $validated['hero_subtitulo'] = $data['hero']['subtitulo'] ?? null;
            $validated['hero_boton_principal'] = $data['hero']['boton_principal'] ?? null;
            $validated['hero_boton_secundario'] = $data['hero']['boton_secundario'] ?? null;
            $validated['hero_badge'] = $data['hero']['badge'] ?? null;
        }

        if (isset($data['caracteristicas']) && is_array($data['caracteristicas'])) {
            $validated['caracteristicas'] = $data['caracteristicas'];
        }

        if (isset($data['planes']) && is_array($data['planes'])) {
            $validated['planes'] = $data['planes'];
        }

        if (isset($data['cta']) && is_array($data['cta'])) {
            $validated['cta_titulo'] = $data['cta']['titulo'] ?? null;
            $validated['cta_descripcion'] = $data['cta']['descripcion'] ?? null;
            $validated['cta_boton'] = $data['cta']['boton'] ?? null;
        }

        $configuracion_web->update($validated);
        WebSetting::clearCache();

        return redirect()->route('configuracion-web.index')->with('success', 'Configuración guardada.');
    }
}
