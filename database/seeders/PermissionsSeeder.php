<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiamos la caché
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Todos los permisos organizados por módulo
        $permissions = [
            // General
            'ver dashboard',
            'ver rh',
            'acceso completo',

            // CRM
            'acceso crm',
            'gestionar prospectos',
            'gestionar oportunidades',
            'gestionar clientes',
            'gestionar productos',
            'gestionar categorias',
            'gestionar cotizaciones',
            'gestionar pedidos',
            'gestionar campanas',
            'gestionar tickets',
            'gestionar perfil publico',

            // SCM
            'acceso scm',
            'gestionar proveedores',
            'gestionar compras',
            'gestionar inventario',
            'gestionar almacenes',
            'gestionar movimientos',
            'gestionar lotes',
            'gestionar vacios',

            // MRP
            'acceso mrp',
            'gestionar boms',
            'gestionar produccion',
            'gestionar calidad',
            'gestionar planificacion',

            // Finanzas
            'acceso fin',
            'gestionar facturacion',
            'gestionar cobranzas',
            'gestionar pagos',
            'gestionar tesoreria',
            'gestionar contabilidad',
            'gestionar impuestos',

            // RRHH
            'acceso rrhh',
            'gestionar empleados',
            'gestionar nominas',
            'gestionar asistencia',
            'gestionar reclutamiento',
            'gestionar evaluaciones',
            'gestionar tareas',

            // Proyectos
            'acceso pms',
            'gestionar proyectos',
            'gestionar hitos',
            'gestionar timesheets',
            'gestionar gastos proyecto',

            // BI y Admin
            'acceso bi',
            'gestionar configuracion',
            'gestionar usuarios',
            'gestionar roles',

            // Flota
            'acceso flota',
            'gestionar vehiculos',
            'gestionar conductores',
            'gestionar entregas',
            'gestionar grupos trabajo',
            'ver grupos trabajo',
            'ver lista pendientes',

            // POS
            'acceso pos',
            'ver reportes pos',
            'gestionar cierre caja',
            'gestionar facturacion pos',
            'gestionar promociones pos',

            // Call Center
            'acceso call center',
            'gestionar llamadas',
            'gestionar contactos',

            // LMS
            'acceso lms',
            'gestionar cursos',
            'gestionar lecciones',
            'gestionar alumnos',

            // SII (Facturación Electrónica Chile)
            'acceso sii',
            'gestionar dte',
            'configurar sii',

            // Rifas
            'acceso rifas',
            'gestionar rifas',
            'gestionar sorteos',

            // Uptime
            'acceso uptime',
            'gestionar monitores',
            'gestionar alertas uptime',

            // Pasarelas de Pago
            'gestionar pagos online',

            // Citas y Reservas
            'acceso citas',
            'gestionar citas',
            'gestionar servicios',

            // Cliente Marketplace
            'hacer pedidos',
            'ver sus pedidos',
        ];

        // Crear o actualizar todos los permisos
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // --- CREACIÓN DE ROLES y asignación ---

        // 1. Super Admin
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        // Obtiene todos los permisos implícitamente mediante el Gate (AuthServiceProvider), pero se los damos también por BD (opcional)
        $roleSuperAdmin->syncPermissions(Permission::all());

        // 2. Administrador
        $roleAdmin = Role::firstOrCreate(['name' => 'Administrador']);
        // Al administrador le damos todo excepto configuración avanzada/roles
        $roleAdmin->syncPermissions(Permission::whereNotIn('name', ['gestionar configuracion', 'gestionar roles'])->get());

        // 3. Empleado (Role base)
        $roleEmpleado = Role::firstOrCreate(['name' => 'Empleado']);
        $roleEmpleado->syncPermissions(['ver dashboard']);

        // 4. Cliente
        $roleCliente = Role::firstOrCreate(['name' => 'Cliente']);
        $roleCliente->syncPermissions(['hacer pedidos', 'ver sus pedidos']);
    }
}
