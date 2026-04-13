import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    ClipboardList,
    DollarSign,
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
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const buildRouteUrl = (path: string): string => {
    return path;
};

const adminNavItems = (isSuperAdmin: boolean): NavItem[] => [
    {
        title: 'Administración',
        group: 'SISTEMA',
        href: '#sistema',
        icon: Lock,
        items: [
            {
                title: 'Usuarios y Roles',
                href: buildRouteUrl('/usuarios-roles'),
            },
            { title: 'API Keys', href: buildRouteUrl('/api-keys') },
            ...(isSuperAdmin
                ? [
                    {
                        title: 'Configuración Web',
                        href: buildRouteUrl('/configuracion-web'),
                    },
                ]
                : []),
        ],
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Building2,
    },
    {
        title: 'Gestión Comercial',
        group: 'COMERCIAL',
        href: '#comercial',
        icon: Users,
        items: [
            { title: 'Leads & Pipeline', href: buildRouteUrl('/prospectos') },
            { title: 'Oportunidades', href: buildRouteUrl('/oportunidades') },
            { title: 'Clientes', href: buildRouteUrl('/clientes') },
            { title: 'Productos', href: buildRouteUrl('/productos') },
            { title: 'Categorías', href: buildRouteUrl('/categorias') },
            { title: 'Cotizaciones', href: buildRouteUrl('/cotizaciones') },
            { title: 'Ventas (SFA)', href: buildRouteUrl('/ventas') },

            { title: 'Campañas', href: buildRouteUrl('/campanas') },
            { title: 'Tickets Soporte', href: buildRouteUrl('/tickets') },
        ],
    },
    {
        title: 'Operaciones e Inventario',
        group: 'OPERACIONES',
        href: '#operaciones',
        icon: Truck,
        items: [
            { title: 'Inventario', href: buildRouteUrl('/inventarios') },
            { title: 'Almacenes (WMS)', href: buildRouteUrl('/almacenes') },
            { title: 'Movimientos', href: buildRouteUrl('/movimientos') },
            { title: 'Lotes y Series', href: buildRouteUrl('/lotes') },
            { title: 'Proveedores', href: buildRouteUrl('/proveedors') },
            { title: 'Órdenes de Compra', href: buildRouteUrl('/compras') },
        ],
    },
    {
        title: 'Producción (MRP)',
        group: 'OPERACIONES',
        href: '#mrp',
        icon: Wrench,
        items: [
            { title: 'BOM (Materiales)', href: buildRouteUrl('/boms') },
            {
                title: 'Órdenes Producción',
                href: buildRouteUrl('/ordenes-produccion'),
            },
            { title: 'Control Calidad', href: buildRouteUrl('/calidad') },
            { title: 'Planificación', href: buildRouteUrl('/planificacion') },
        ],
    },
    {
        title: 'Finanzas y Tesorería',
        group: 'FINANZAS',
        href: '#finanzas',
        icon: DollarSign,
        items: [
            { title: 'Facturación (AR)', href: buildRouteUrl('/facturacion') },
            { title: 'Cobranzas', href: buildRouteUrl('/cobranzas') },
            { title: 'Pagos (AP)', href: buildRouteUrl('/pagos') },
            { title: 'Tesorería', href: buildRouteUrl('/tesoreria') },
            {
                title: 'Contabilidad (GL)',
                href: buildRouteUrl('/contabilidad'),
            },
            { title: 'Impuestos', href: buildRouteUrl('/impuestos') },
        ],
    },
    {
        title: 'Gestión Humana',
        group: 'RRHH',
        href: '#rrhh',
        icon: UsersRound,
        items: [
            { title: 'Empleados', href: buildRouteUrl('/empleados') },
            { title: 'Nómina', href: buildRouteUrl('/nominas') },
            { title: 'Asistencia', href: buildRouteUrl('/asistencia') },
            { title: 'Reclutamiento', href: buildRouteUrl('/reclutamiento') },
            { title: 'Evaluaciones', href: buildRouteUrl('/evaluaciones') },
        ],
    },
    {
        title: 'Proyectos (PMS)',
        group: 'PROYECTOS',
        href: '#pms',
        icon: ClipboardList,
        items: [
            { title: 'Proyectos', href: buildRouteUrl('/proyectos') },
            { title: 'Hitos y Tareas', href: buildRouteUrl('/hitos') },
            { title: 'Timesheets', href: buildRouteUrl('/timesheets') },
            {
                title: 'Gastos Proyecto',
                href: buildRouteUrl('/gastos-proyecto'),
            },
        ],
    },
    {
        title: 'Logística y Flota',
        group: 'LOGÍSTICA',
        href: '#logistica',
        icon: Truck,
        items: [
            { title: 'Vehículos', href: buildRouteUrl('/vehiculos') },
            { title: 'Conductores', href: buildRouteUrl('/conductores') },
            { title: 'Entregas', href: buildRouteUrl('/entregas') },
            {
                title: 'Grupos de Trabajo',
                href: buildRouteUrl('/grupos-trabajo'),
            },
        ],
    },
    {
        title: 'Punto de Venta (POS)',
        group: 'TIENDA',
        href: '#tienda',
        icon: ShoppingCart,
        items: [
            { title: 'Terminal POS', href: buildRouteUrl('/pos') },
            { title: 'Cierre de Caja', href: buildRouteUrl('/pos/cierre') },
            {
                title: 'Facturación POS',
                href: buildRouteUrl('/pos/facturacion'),
            },
            { title: 'Reportes Ventas', href: buildRouteUrl('/pos/reportes') },
            { title: 'Mensajes Marketplace', href: buildRouteUrl('/chat') },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as {
        auth: { user: { roles?: string[] } };
    };
    const isSuperAdmin = auth?.user?.roles?.includes('Super Admin') ?? false;

    const allItems = isSuperAdmin
        ? [...mainNavItems, ...adminNavItems(true)]
        : mainNavItems;

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
                <NavMain items={allItems} />
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
