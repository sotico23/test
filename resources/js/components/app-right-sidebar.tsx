import { Link, router, usePage } from '@inertiajs/react';
import {
    Settings,
    LogOut,
    Bell,
    MessageSquare,
    Calendar,
    Clock,
    User,
    Key,
    Smartphone,
    Palette,
    Store,
    ShoppingCart as CartIcon,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { logout } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { show as showMarketplace } from '@/routes/marketplace';
import { edit } from '@/routes/profile';
import { edit as editPublicProfile } from '@/routes/public-profile';
import { show as showTwoFactor } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';

interface Conversacion {
    usuario_id: number;
    usuario_nombre: string;
    ultimo_mensaje: string;
    fecha_ultimo: string;
    sin_leer: number;
}

const settingsNav = [
    {
        title: 'Perfil',
        href: edit(),
        icon: User,
    },
    {
        title: 'Contraseña',
        href: editPassword(),
        icon: Key,
    },
    {
        title: 'Autenticación',
        href: showTwoFactor(),
        icon: Smartphone,
    },
    {
        title: 'Apariencia',
        href: editAppearance(),
        icon: Palette,
    },
];

export function AppRightSidebar() {
    const { auth } = usePage().props;
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [totalSinLeer, setTotalSinLeer] = useState(0);

    useEffect(() => {
        fetchNotificaciones();
    }, []);

    const fetchNotificaciones = async () => {
        try {
            const res = await fetch('/mensajes');
            const data = await res.json();
            setConversaciones(data.conversaciones?.slice(0, 5) || []);
            setTotalSinLeer(data.total_sin_leer || 0);
        } catch (e) {
            console.error(e);
        }
    };

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Ahora';
        if (min < 60) return `${min} min`;
        const hours = Math.floor(min / 60);
        if (hours < 24) return `${hours}h`;
        return d.toLocaleDateString('es-CL');
    };

    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <Sidebar side="right" variant="inset">
            <SidebarContent className="gap-4">
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Usuario</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className="rounded-lg bg-sidebar-accent/50 p-3">
                            <UserInfo user={auth.user} showEmail={true} />
                            {auth.user.permissions?.includes(
                                'gestionar perfil publico',
                            ) && (
                                <div className="mt-3">
                                    <Link
                                        href={editPublicProfile()}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <Store className="h-3 w-3" />
                                        Configurar Tienda
                                    </Link>
                                </div>
                            )}
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Perfil Social</SidebarGroupLabel>
                    <SidebarMenu>
                        {settingsNav.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <SidebarMenuItem key="global-marketplace">
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: 'Ver Marketplace' }}
                            >
                                <Link href="/tienda" prefetch>
                                    <Store className="h-4 w-4" />
                                    <span>Ver Marketplace</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem key="community-publications">
                            <SidebarMenuButton
                                asChild
                                tooltip={{
                                    children: 'Publicaciones de la Comunidad',
                                }}
                            >
                                <Link href="/comunidad" prefetch>
                                    <Users className="h-4 w-4" />
                                    <span>Publicaciones de la Comunidad</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {auth.user.public_profile?.slug &&
                            auth.user.public_profile.is_active && (
                                <SidebarMenuItem key="public-profile">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{
                                            children: 'Ver mi Perfil Público',
                                        }}
                                    >
                                        <Link
                                            href={showMarketplace({
                                                slug: auth.user.public_profile
                                                    .slug,
                                            })}
                                            prefetch
                                        >
                                            <Store className="h-4 w-4" />
                                            <span>Ver mi Perfil Público</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                    </SidebarMenu>
                </SidebarGroup>

                {(auth.user.pending_orders || 0) > 0 && (
                    <>
                        <SidebarSeparator />
                        <SidebarGroup className="px-2 py-0">
                            <SidebarGroupLabel>
                                <CartIcon className="mr-2 inline h-4 w-4 text-amber-500" />
                                Pedidos Pendientes
                                <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white">
                                    {auth.user.pending_orders}
                                </span>
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <Link
                                    href="/pedidos-recibidos"
                                    className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/10 dark:text-amber-400"
                                >
                                    <CartIcon className="h-4 w-4" />
                                    <span>
                                        Tienes {auth.user.pending_orders}{' '}
                                        pedidos nuevos en espera
                                    </span>
                                </Link>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}

                <SidebarSeparator />

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>
                        <Bell className="mr-2 inline h-4 w-4" />
                        Notificaciones
                        {totalSinLeer > 0 && (
                            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                {totalSinLeer}
                            </span>
                        )}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className="space-y-2">
                            {conversaciones.length === 0 ? (
                                <div className="py-4 text-center text-xs text-muted-foreground">
                                    No tienes notificaciones
                                </div>
                            ) : (
                                conversaciones.map((conv) => (
                                    <div
                                        key={conv.usuario_id}
                                        className="cursor-pointer rounded-lg bg-sidebar-accent/30 p-3 transition-colors hover:bg-sidebar-accent/50"
                                    >
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-sm font-medium">
                                                        {conv.usuario_nombre}
                                                    </span>
                                                    {conv.sin_leer > 0 && (
                                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {conv.ultimo_mensaje}
                                                </p>
                                                <span className="text-xs text-muted-foreground/70">
                                                    {formatFecha(
                                                        conv.fecha_ultimo,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link
                            href="/mensajes"
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Nuevo Mensaje
                        </Link>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: 'Cerrar sesión' }}
                            >
                                <Link
                                    href={logout()}
                                    as="button"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Cerrar sesión</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
