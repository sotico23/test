<?php

namespace App\Helpers;

use Spatie\Permission\Models\Permission;

class PermissionHelper
{
    /**
     * Mapeo de Nombres de Módulos
     */
    public static array $moduleMap = [
        'comercial' => 'Ventas y CRM',
        'inventario' => 'Inventario y SCM',
        'mrp' => 'Manufactura y Producción',
        'finanzas' => 'Finanzas y Facturación',
        'rrhh' => 'Recursos Humanos',
        'proyectos' => 'Proyectos (PMS)',
        'flota' => 'Logística y Flota',
        'ventas' => 'Punto de Venta (POS)',
        'lms' => 'LMS (Cursos)',
        'rifas' => 'Rifas y Sorteos',
        'uptime' => 'Monitores (Uptime)',
        'admin' => 'Administración del Sistema',
        'citas' => 'Citas y Servicios',
        'general' => 'Permisos Generales',
    ];

    /**
     * Mapeo de Acciones del CRUD
     */
    public static array $actionMap = [
        'viewAny' => 'Ver Listado',
        'view' => 'Ver Detalle',
        'create' => 'Crear / Agregar',
        'edit' => 'Editar / Modificar',
        'delete' => 'Eliminar',
        'import' => 'Carga Masiva (Importar)',
        'export' => 'Descargar Reportes (Exportar)',
    ];

    /**
     * Genera un nombre amigable a partir del nombre técnico (ej: comercial.clientes.create)
     */
    public static function getFriendlyName(string $permissionName): string
    {
        $parts = explode('.', $permissionName);

        // Nombres legacy (ej: "ver dashboard") o mal formados
        if (count($parts) !== 3) {
            return ucfirst($permissionName);
        }

        [$modulo, $submodulo, $accion] = $parts;

        $friendlySubmodulo = ucfirst(str_replace('-', ' ', $submodulo));
        $friendlyAction = self::$actionMap[$accion] ?? ucfirst($accion);

        // Ej: "Crear / Agregar Clientes"
        return "{$friendlyAction}"; // O "$friendlyAction $friendlySubmodulo" dependiendo de cómo lo quiera la UI.
        // Ya que estará agrupado por submódulo, mostrar solo la acción es más limpio. Ej: [Clientes] -> [Ver Listado] [Crear]
    }

    /**
     * Devuelve toda la estructura de permisos agrupada jerárquicamente
     */
    public static function getGroupedPermissions(): array
    {
        $permissions = Permission::orderBy('name')->get();

        $grouped = [];

        foreach ($permissions as $permission) {
            $parts = explode('.', $permission->name);

            if (count($parts) === 3) {
                [$modulo, $submodulo, $accion] = $parts;
                $moduleName = self::$moduleMap[$modulo] ?? ucfirst($modulo);
                $submoduleName = ucfirst(str_replace('-', ' ', $submodulo));
            } else {
                // Legacy
                $moduleName = self::$moduleMap['general'];
                $submoduleName = 'Otros';
            }

            if (! isset($grouped[$moduleName])) {
                $grouped[$moduleName] = [];
            }

            if (! isset($grouped[$moduleName][$submoduleName])) {
                $grouped[$moduleName][$submoduleName] = [];
            }

            $grouped[$moduleName][$submoduleName][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'friendly_name' => self::getFriendlyName($permission->name),
            ];
        }

        return $grouped;
    }
}
