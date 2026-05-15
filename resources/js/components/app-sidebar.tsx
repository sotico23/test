import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    ClipboardList,
    DollarSign,
    FileText,
    PieChart,
    Settings,
    Tag,
    Truck,
    Users,
    UsersRound,
    Wrench,
    ShoppingCart,
    Lock,
    User,
    GraduationCap,
    Gift,
    CreditCard,
    Megaphone,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import AppLogo from './app-logo';

// Updated NavItem type to support permission checking
export type ExtendedNavItem = NavItem & {
    permission?: string | string[];
    items?: (NavItem & { permission?: string | string[] })[];
};

const buildRouteUrl = (path: string): string => {
    return path;
};

const adminNavItems = (isSuperAdmin: boolean): ExtendedNavItem[] => [
    {
        title: 'Administración',
        group: 'SISTEMA',
        href: '#sistema',
        icon: Lock,
        permission: ['admin.usuarios.viewAny', 'admin.roles.viewAny'],
        items: [
            {
                title: 'Usuarios y Roles',
                href: buildRouteUrl('/usuarios-roles'),
                permission: ['admin.usuarios.viewAny', 'admin.roles.viewAny'],
            },
            ...(isSuperAdmin
                ? [
                      {
                          title: 'Configuración Web',
                          href: buildRouteUrl('/configuracion-web'),
                          permission: ['admin.configuracion.viewAny', 'admin.web-settings.viewAny'],
                      },
                  ]
                : []),
        ],
    },
];

const mainNavItems: ExtendedNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Building2,
        permission: 'general.ver dashboard', // legacy permission or general
    },
    {
        title: 'Gestión Comercial',
        group: 'COMERCIAL',
        href: '#comercial',
        icon: Users,
        permission: 'comercial.*',
        items: [
            { title: 'Leads & Pipeline', href: buildRouteUrl('/prospectos'), permission: 'comercial.prospectos.viewAny' },
            { title: 'Oportunidades', href: buildRouteUrl('/oportunidades'), permission: 'comercial.oportunidades.viewAny' },
            { title: 'Categorías', href: buildRouteUrl('/categorias'), permission: 'comercial.categorias.viewAny' },
            { title: 'Productos', href: buildRouteUrl('/productos'), permission: 'comercial.productos.viewAny' },
            { title: 'Clientes', href: buildRouteUrl('/clientes'), permission: 'comercial.clientes.viewAny' },
            { title: 'Cotizaciones', href: buildRouteUrl('/cotizaciones'), permission: 'comercial.cotizaciones.viewAny' },
            { title: 'Ventas (SFA)', href: buildRouteUrl('/ventas'), permission: 'ventas.ventas.viewAny' },
            { title: 'Campañas', href: buildRouteUrl('/campanas'), permission: 'comercial.campanas.viewAny' },
            { title: 'Tickets Soporte', href: buildRouteUrl('/tickets'), permission: 'comercial.tickets.viewAny' },
            { title: 'Call Center', href: buildRouteUrl('/call-center'), permission: 'comercial.call-center.viewAny' },
        ],
    },
    {
        title: 'Operaciones e Inventario',
        group: 'OPERACIONES',
        href: '#operaciones',
        icon: Truck,
        permission: 'inventario.*',
        items: [
            { title: 'Inventario', href: buildRouteUrl('/inventarios'), permission: 'inventario.inventarios.viewAny' },
            { title: 'Almacenes (WMS)', href: buildRouteUrl('/almacenes'), permission: 'inventario.almacenes.viewAny' },
            { title: 'Movimientos', href: buildRouteUrl('/movimientos'), permission: 'inventario.movimientos.viewAny' },
            { title: 'Lotes y Series', href: buildRouteUrl('/lotes'), permission: 'inventario.lotes.viewAny' },
            { title: 'Proveedores', href: buildRouteUrl('/proveedors'), permission: 'inventario.proveedores.viewAny' },
            { title: 'Órdenes de Compra', href: buildRouteUrl('/compras'), permission: 'inventario.compras.viewAny' },
        ],
    },
    {
        title: 'Producción (MRP)',
        group: 'OPERACIONES',
        href: '#mrp',
        icon: Wrench,
        permission: 'mrp.*',
        items: [
            { title: 'BOM (Materiales)', href: buildRouteUrl('/boms'), permission: 'mrp.boms.viewAny' },
            { title: 'Órdenes Producción', href: buildRouteUrl('/ordenes-produccion'), permission: 'mrp.produccion.viewAny' },
            { title: 'Control Calidad', href: buildRouteUrl('/calidad'), permission: 'mrp.calidad.viewAny' },
            { title: 'Planificación', href: buildRouteUrl('/planificacion'), permission: 'mrp.planificacion.viewAny' },
        ],
    },
    {
        title: 'Facturación',
        group: 'FACTURACIÓN',
        href: '#facturacion',
        icon: FileText,
        permission: 'finanzas.*',
        items: [
            { title: 'Facturación (AR)', href: buildRouteUrl('/facturacion'), permission: 'finanzas.facturacion.viewAny' },
            { title: 'Cobranzas', href: buildRouteUrl('/cobranzas'), permission: 'finanzas.cobranzas.viewAny' },
            { title: 'Pagos (AP)', href: buildRouteUrl('/pagos'), permission: 'finanzas.pagos.viewAny' },
            { title: 'Contabilidad (GL)', href: buildRouteUrl('/contabilidad'), permission: 'finanzas.contabilidad.viewAny' },
            { title: 'Impuestos', href: buildRouteUrl('/impuestos'), permission: 'finanzas.impuestos.viewAny' },
        ],
    },
    {
        title: 'Pagos en Línea',
        group: 'FINANZAS',
        href: '#pagos-online',
        icon: CreditCard,
        permission: 'finanzas.*',
        items: [
            { title: 'Configuración Webpay', href: buildRouteUrl('/webpay/config'), permission: 'admin.configuracion.viewAny' },
            { title: 'Configuración PayPal', href: buildRouteUrl('/paypal/config'), permission: 'admin.configuracion.viewAny' },
            { title: 'Configuración MercadoPago', href: buildRouteUrl('/mercadopago/config'), permission: 'admin.configuracion.viewAny' },
            { title: 'Movimientos', href: buildRouteUrl('/webpay/movimientos'), permission: 'finanzas.tesoreria.viewAny' },
        ],
    },
    {
        title: 'Gestión Humana',
        group: 'RRHH',
        href: '#rrhh',
        icon: UsersRound,
        permission: 'rrhh.*',
        items: [
            { title: 'Empleados', href: buildRouteUrl('/empleados'), permission: 'rrhh.empleados.viewAny' },
            { title: 'Nómina', href: buildRouteUrl('/nominas'), permission: 'rrhh.nominas.viewAny' },
            { title: 'Asistencia', href: buildRouteUrl('/asistencia'), permission: 'rrhh.asistencia.viewAny' },
            { title: 'Reclutamiento', href: buildRouteUrl('/reclutamiento'), permission: 'rrhh.reclutamiento.viewAny' },
            { title: 'Evaluaciones', href: buildRouteUrl('/evaluaciones'), permission: 'rrhh.evaluaciones.viewAny' },
        ],
    },
    {
        title: 'Proyectos (PMS)',
        group: 'PROYECTOS',
        href: '#pms',
        icon: ClipboardList,
        permission: 'proyectos.*',
        items: [
            { title: 'Proyectos', href: buildRouteUrl('/proyectos'), permission: 'proyectos.proyectos.viewAny' },
            { title: 'Hitos y Tareas', href: buildRouteUrl('/hitos'), permission: 'proyectos.hitos.viewAny' },
            { title: 'Timesheets', href: buildRouteUrl('/timesheets'), permission: 'proyectos.timesheets.viewAny' },
            { title: 'Gastos Proyecto', href: buildRouteUrl('/gastos-proyecto'), permission: 'proyectos.gastos.viewAny' },
        ],
    },
    {
        title: 'Logística y Flota',
        group: 'LOGÍSTICA',
        href: '#logistica',
        icon: Truck,
        permission: 'flota.*',
        items: [
            { title: 'Vehículos', href: buildRouteUrl('/vehiculos'), permission: 'flota.vehiculos.viewAny' },
            { title: 'Conductores', href: buildRouteUrl('/conductores'), permission: 'flota.conductores.viewAny' },
            { title: 'Entregas', href: buildRouteUrl('/entregas'), permission: 'flota.entregas.viewAny' },
            { title: 'Cargas Diarias / Rutas', href: buildRouteUrl('/cargas-diarias'), permission: 'flota.cargas.viewAny' },
            { title: 'Grupos de Trabajo', href: buildRouteUrl('/grupos-trabajo'), permission: 'flota.grupos-trabajo.viewAny' },
        ],
    },
    {
        title: 'Punto de Venta (POS)',
        group: 'TIENDA',
        href: '#tienda',
        icon: ShoppingCart,
        permission: 'ventas.pos.*',
        items: [
            { title: 'Terminal POS', href: buildRouteUrl('/pos'), permission: 'ventas.pos.viewAny' },
            { title: 'Cierre de Caja', href: buildRouteUrl('/pos/cierre'), permission: 'ventas.pos.viewAny' },
            { title: 'Facturación POS', href: buildRouteUrl('/pos/facturacion'), permission: 'ventas.pos.viewAny' },
            { title: 'Reportes Ventas', href: buildRouteUrl('/pos/reportes'), permission: 'ventas.pos.viewAny' },
            { title: 'Mensajes Marketplace', href: buildRouteUrl('/chat'), permission: 'comercial.oportunidades.viewAny' },
        ],
    },
    {
        title: 'Citas y Reservas',
        group: 'SERVICIOS',
        href: '#reservas',
        icon: Calendar,
        permission: 'citas.*',
        items: [
            { title: 'Dashboard', href: buildRouteUrl('/appointments/dashboard'), permission: 'citas.citas.viewAny' },
            { title: 'Calendario', href: buildRouteUrl('/appointments/calendar'), permission: 'citas.citas.viewAny' },
            { title: 'Mis Citas', href: buildRouteUrl('/appointments'), permission: 'citas.citas.viewAny' },
            { title: 'Servicios', href: buildRouteUrl('/services'), permission: 'citas.servicios.viewAny' },
        ],
    },
    {
        title: 'Plataforma de Aprendizaje',
        group: 'EDUCACIÓN',
        href: '#lms',
        icon: GraduationCap,
        permission: 'lms.*',
        items: [
            { title: 'Catálogo de Cursos', href: buildRouteUrl('/cursos'), permission: 'lms.cursos.viewAny' },
            { title: 'Mis Cursos (Instructor)', href: buildRouteUrl('/instructor/cursos'), permission: 'lms.cursos.create' },
            { title: 'Cursos Inscritos', href: buildRouteUrl('/alumno/cursos'), permission: 'lms.alumnos.viewAny' },
            { title: 'Progreso y Notas', href: buildRouteUrl('/alumno/progreso'), permission: 'lms.alumnos.viewAny' },
        ],
    },
    {
        title: 'Marketing',
        group: 'MARKETING',
        href: '#marketing',
        icon: Megaphone,
        permission: 'admin.*',
        items: [
            { title: 'Campañas', href: buildRouteUrl('/campanas'), permission: 'comercial.campanas.viewAny' },
            { title: 'Email Marketing', href: buildRouteUrl('/mail-templates'), permission: 'admin.mail-templates.viewAny' },
            { title: 'Config. Correo', href: buildRouteUrl('/marketing/email-config'), permission: 'admin.email-config.viewAny' },
        ],
    },
    {
        title: 'Rifas y Sorteos',
        group: 'MARKETING',
        href: '#raffles',
        icon: Gift,
        permission: 'rifas.*',
        items: [
            { title: 'Gestionar Rifas', href: buildRouteUrl('/raffles'), permission: 'rifas.rifas.viewAny' },
            { title: 'Sorteos', href: buildRouteUrl('/raffles/draws'), permission: 'rifas.sorteos.viewAny' },
        ],
    },
];

function canAny(permission: string | string[], userPermissions: string[] | undefined): boolean {
    if (!permission) return true;
    if (!userPermissions) return false;
    
    const perms = Array.isArray(permission) ? permission : [permission];
    return perms.some((p) => userPermissions.includes(p));
}

// Helper Function to Filter Items
function filterNavItems(items: ExtendedNavItem[], userPermissions: string[] | undefined): NavItem[] {
    const hasWildcard = userPermissions?.length === 1 && userPermissions[0] === '*';

    return items
        .filter((item) => {
            if (hasWildcard) return true;
            if (!item.permission) return true; // Unprotected items (if any dashboard fallback)

            if (item.permission === 'general.ver dashboard') {
                return true; // Everyone sees the dashboard in ERP context
            }

            // check module-level wildcard like comercial.*
            if (typeof item.permission === 'string' && item.permission.endsWith('.*')) {
                const prefix = item.permission.split('.')[0];
                return userPermissions?.some((p) => p.startsWith(`${prefix}.`)) ?? false;
            }

            return canAny(item.permission, userPermissions);
        })
        .map((item) => {
            if (!item.items) return item;

            // Filter sub-items
            const filteredSubItems = item.items.filter((subItem) => {
                if (hasWildcard) return true;
                if (!subItem.permission) return true;
                return canAny(subItem.permission, userPermissions);
            });

            return { ...item, items: filteredSubItems };
        })
        .filter((item) => {
            // Remove group headers that have 0 children after filtering
            if (item.items && item.items.length === 0) {
                return false;
            }
            return true;
        }) as NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage().props as {
        auth: { user: { roles?: string[]; permissions?: string[] } };
    };
    
    const isSuperAdmin = auth.user.roles?.includes('Super Admin') || auth.user.roles?.includes('Master');

    const rawAllItems = isSuperAdmin
        ? [...mainNavItems, ...adminNavItems(isSuperAdmin)]
        : mainNavItems;

    const filteredItems = filterNavItems(rawAllItems, auth.user.permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/mi-informacion" prefetch>
                                <User className="size-4" />
                                <span>Mi Información</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isSuperAdmin && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/configuracion-web" prefetch>
                                    <Settings className="size-4" />
                                    <span>Configuración Web</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
