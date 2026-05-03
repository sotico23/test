import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    Shield,
    Lock,
    Users,
    CheckCircle2,
    Store,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

interface UsuarioRol {
    id: string; // "user_id-role_id"
    user_id: number;
    user_name: string;
    user_avatar: string | null;
    role_id: number;
    role_name: string;
    permissions: { id: number; name: string }[];
}

interface PublicProfile {
    id: number;
    title: string;
    slug: string;
    is_official: boolean;
    user: {
        id: number;
        name: string;
    }
}

interface Props {
    usuarios: User[];
    roles: Role[];
    permisos: Permission[];
    usuariosRoles: UsuarioRol[];
    publicProfiles: PublicProfile[];
}

const GRUPO_PERMISOS = {
    general: {
        titulo: 'General',
        icon: '⚙️',
        permisos: ['ver dashboard', 'ver rh', 'acceso completo'],
    },
    crm: {
        titulo: 'CRM',
        icon: '👥',
        permisos: [
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
        ],
    },
    scm: {
        titulo: 'SCM',
        icon: '📦',
        permisos: [
            'acceso scm',
            'gestionar proveedores',
            'gestionar compras',
            'gestionar inventario',
            'gestionar almacenes',
            'gestionar movimientos',
            'gestionar lotes',
            'gestionar vacios',
        ],
    },
    mrp: {
        titulo: 'MRP',
        icon: '🏭',
        permisos: [
            'acceso mrp',
            'gestionar boms',
            'gestionar produccion',
            'gestionar calidad',
            'gestionar planificacion',
        ],
    },
    finanzas: {
        titulo: 'Finanzas',
        icon: '💰',
        permisos: [
            'acceso fin',
            'gestionar facturacion',
            'gestionar cobranzas',
            'gestionar pagos',
            'gestionar tesoreria',
            'gestionar contabilidad',
            'gestionar impuestos',
        ],
    },
    rrhh: {
        titulo: 'RRHH',
        icon: '👨‍💼',
        permisos: [
            'acceso rrhh',
            'gestionar empleados',
            'gestionar nominas',
            'gestionar asistencia',
            'gestionar reclutamiento',
            'gestionar evaluaciones',
            'gestionar tareas',
        ],
    },
    proyectos: {
        titulo: 'Proyectos',
        icon: '📋',
        permisos: [
            'acceso pms',
            'gestionar proyectos',
            'gestionar hitos',
            'gestionar timesheets',
            'gestionar gastos proyecto',
        ],
    },
    bi: {
        titulo: 'BI y Admin',
        icon: '📊',
        permisos: [
            'acceso bi',
            'gestionar configuracion',
            'gestionar usuarios',
            'gestionar roles',
        ],
    },
    flota: {
        titulo: 'Flota',
        icon: '🚚',
        permisos: [
            'acceso flota',
            'gestionar vehiculos',
            'gestionar conductores',
            'gestionar entregas',
            'gestionar grupos trabajo',
            'ver grupos trabajo',
            'ver lista pendientes',
        ],
    },
    pos: {
        titulo: 'POS',
        icon: '🛒',
        permisos: [
            'acceso pos',
            'ver reportes pos',
            'gestionar cierre caja',
            'gestionar facturacion pos',
            'gestionar promociones pos',
        ],
    },
    cliente: {
        titulo: 'Cliente',
        icon: '🏢',
        permisos: ['hacer pedidos', 'ver sus pedidos'],
    },
};

function obtenerPermisosPorGrupo(permisos: { id: number; name: string }[]) {
    const grupos: Record<
        string,
        {
            titulo: string;
            icon: string;
            permisos: { id: number; name: string }[];
        }
    > = {};

    for (const [key, grupo] of Object.entries(GRUPO_PERMISOS)) {
        const permisosDelGrupo = permisos.filter((p) =>
            grupo.permisos.includes(p.name),
        );
        if (permisosDelGrupo.length > 0) {
            grupos[key] = {
                titulo: grupo.titulo,
                icon: grupo.icon,
                permisos: permisosDelGrupo,
            };
        }
    }

    // Agregar permisos que no estén en ningún grupo
    const permisosNoAgrupados = permisos.filter(
        (p) =>
            !Object.values(GRUPO_PERMISOS).some((g) =>
                g.permisos.includes(p.name),
            ),
    );

    if (permisosNoAgrupados.length > 0) {
        grupos['otros'] = {
            titulo: 'Otros',
            icon: '📌',
            permisos: permisosNoAgrupados,
        };
    }

    return grupos;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Recursos Humanos', href: '/empleados' },
    { title: 'Roles y Permisos', href: '/usuarios-roles' },
];

export default function Index({
    usuarios,
    roles,
    permisos,
    usuariosRoles,
    publicProfiles,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'asignaciones' | 'roles' | 'permisos' | 'tiendas'
    >('asignaciones');

    // Modals states
    const [isAsignacionOpen, setIsAsignacionOpen] = useState(false);
    const [isRolOpen, setIsRolOpen] = useState(false);
    const [isPermisoOpen, setIsPermisoOpen] = useState(false);

    // Editing states
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingPermission, setEditingPermission] =
        useState<Permission | null>(null);
    const [gruposExpandidos, setGruposExpandidos] = useState<
        Record<string, boolean>
    >({});

    // Inicializar todos los grupos como expandidos
    const inicializarGrupos = () => {
        const grupos: Record<string, boolean> = {};
        Object.keys(GRUPO_PERMISOS).forEach((key) => {
            grupos[key] = true;
        });
        setGruposExpandidos(grupos);
    };

    const toggleGrupo = (key: string) => {
        setGruposExpandidos((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleTodosLosGrupos = (expandir: boolean) => {
        const grupos: Record<string, boolean> = {};
        Object.keys(GRUPO_PERMISOS).forEach((key) => {
            grupos[key] = expandir;
        });
        setGruposExpandidos(grupos);
    };

    // Form for assignment
    const asignacionForm = useForm({
        usuario_id: '',
        rol_id: '',
    });

    const rolForm = useForm({
        name: '',
        permissions: [] as number[],
    });

    const permisoForm = useForm({
        name: '',
    });

    // Filters
    const [filtros, setFiltros] = useState({
        asignacion: '',
        rol: '',
        permiso: '',
        tienda: '',
    });

    const asignacionesFiltradas = useMemo(() => {
        return usuariosRoles.filter(
            (ur) =>
                ur.user_name
                    .toLowerCase()
                    .includes(filtros.asignacion.toLowerCase()) ||
                ur.role_name
                    .toLowerCase()
                    .includes(filtros.asignacion.toLowerCase()),
        );
    }, [usuariosRoles, filtros.asignacion]);

    const rolesFiltrados = useMemo(() => {
        return roles.filter((r) =>
            r.name.toLowerCase().includes(filtros.rol.toLowerCase()),
        );
    }, [roles, filtros.rol]);

    const permisosFiltrados = useMemo(() => {
        return permisos.filter((p) =>
            p.name.toLowerCase().includes(filtros.permiso.toLowerCase()),
        );
    }, [permisos, filtros.permiso]);

    const handleAddAsignacion = (e: React.FormEvent) => {
        e.preventDefault();

        if (!asignacionForm.data.usuario_id || !asignacionForm.data.rol_id) {
            alert('Por favor seleccione un usuario y un rol');
            return;
        }

        asignacionForm.post(route('usuarios-roles.store'), {
            onSuccess: () => {
                setIsAsignacionOpen(false);
                asignacionForm.reset();
            },
            preserveScroll: true,
        });
    };
    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            rolForm.put(route('usuarios-roles.role.update', editingRole.id), {
                onSuccess: () => {
                    setIsRolOpen(false);
                    setEditingRole(null);
                    rolForm.reset();
                },
            });
        } else {
            rolForm.post(route('usuarios-roles.role.store'), {
                onSuccess: () => {
                    setIsRolOpen(false);
                    rolForm.reset();
                },
            });
        }
    };

    const handleSavePermission = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPermission) {
            permisoForm.put(
                route('usuarios-roles.permission.update', editingPermission.id),
                {
                    onSuccess: () => {
                        setIsPermisoOpen(false);
                        setEditingPermission(null);
                        permisoForm.reset();
                    },
                },
            );
        } else {
            permisoForm.post(route('usuarios-roles.permission.store'), {
                onSuccess: () => {
                    setIsPermisoOpen(false);
                    permisoForm.reset();
                },
            });
        }
    };

    const openEditRole = (role: Role) => {
        setEditingRole(role);
        rolForm.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.id),
        });
        inicializarGrupos();
        setIsRolOpen(true);
    };

    const openEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        permisoForm.setData('name', permission.name);
        setIsPermisoOpen(true);
    };

    const handleDeleteRole = (id: number) => {
        if (
            confirm(
                '¿Eliminar este rol? Los usuarios asignados perderán sus permisos.',
            )
        ) {
            router.delete(route('usuarios-roles.role.destroy', id));
        }
    };

    const handleDeletePermission = (id: number) => {
        if (confirm('¿Eliminar este permiso de forma permanente?')) {
            router.delete(route('usuarios-roles.permission.destroy', id));
        }
    };

    const handleDeleteAsignacion = (id: string) => {
        if (confirm('¿Eliminar esta asignación de rol?')) {
            router.delete(route('usuarios-roles.destroy', id));
        }
    };

    const handleToggleOfficial = (profileId: number) => {
        router.patch(route('usuarios-roles.toggle-official', profileId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Accesos" />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Gestión de Accesos
                        </h1>
                        <p className="mt-1 text-lg text-muted-foreground">
                            Control modular de la plataforma mediante roles y
                            permisos.
                        </p>
                    </div>
                </div>

                {/* Tabs Navigator */}
                <div className="flex w-fit rounded-xl border bg-muted p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('asignaciones')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'asignaciones'
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Asignaciones
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'roles'
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                    >
                        <Shield className="h-4 w-4" />
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('permisos')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'permisos'
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                    >
                        <Lock className="h-4 w-4" />
                        Permisos
                    </button>
                    <button
                        onClick={() => setActiveTab('tiendas')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'tiendas'
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                    >
                        <Store className="h-4 w-4" />
                        Tiendas
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in space-y-4 duration-300 fade-in">
                    {activeTab === 'asignaciones' && (
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar usuario..."
                                        className="h-9 rounded-lg pl-9"
                                        value={filtros.asignacion}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                asignacion: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsAsignacionOpen(true)}
                                    className="rounded-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nueva
                                    Asignación
                                </Button>
                            </div>

                            {/* Agrupar asignaciones por usuario */}
                            {(() => {
                                const usuariosAgrupados =
                                    asignacionesFiltradas.reduce(
                                        (acc, ur) => {
                                            if (!acc[ur.user_id]) {
                                                acc[ur.user_id] = {
                                                    user_id: ur.user_id,
                                                    user_name: ur.user_name,
                                                    user_avatar: ur.user_avatar,
                                                    roles: [],
                                                };
                                            }
                                            acc[ur.user_id].roles.push(ur);
                                            return acc;
                                        },
                                        {} as Record<
                                            number,
                                            {
                                                user_id: number;
                                                user_name: string;
                                                user_avatar: string | null;
                                                roles: typeof asignacionesFiltradas;
                                            }
                                        >,
                                    );

                                const usuariosList =
                                    Object.values(usuariosAgrupados);

                                if (usuariosList.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                            <Users className="mb-4 h-12 w-12 opacity-20" />
                                            <p>
                                                No se encontraron asignaciones.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {usuariosList.map((usuario) => {
                                            const totalPermisos =
                                                usuario.roles.reduce(
                                                    (acc, r) =>
                                                        acc +
                                                        r.permissions.length,
                                                    0,
                                                );

                                            return (
                                                <Card
                                                    key={usuario.user_id}
                                                    className="bg-card/50 transition-all hover:ring-primary/50"
                                                >
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {usuario.user_avatar ? (
                                                                    <img
                                                                        src={
                                                                            usuario.user_avatar
                                                                        }
                                                                        alt={
                                                                            usuario.user_name
                                                                        }
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                                        {usuario.user_name
                                                                            .substring(
                                                                                0,
                                                                                2,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <CardTitle className="text-sm font-bold">
                                                                        {
                                                                            usuario.user_name
                                                                        }
                                                                    </CardTitle>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {
                                                                            usuario
                                                                                .roles
                                                                                .length
                                                                        }{' '}
                                                                        rol(es)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2">
                                                            {usuario.roles.map(
                                                                (ur) => {
                                                                    const gruposAsignacion =
                                                                        obtenerPermisosPorGrupo(
                                                                            ur.permissions as Permission[],
                                                                        );
                                                                    const gruposKeys =
                                                                        Object.keys(
                                                                            gruposAsignacion,
                                                                        );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                ur.id
                                                                            }
                                                                            className="rounded-lg border bg-background p-2"
                                                                        >
                                                                            <div className="mb-1 flex items-center justify-between">
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs font-medium"
                                                                                >
                                                                                    {
                                                                                        ur.role_name
                                                                                    }
                                                                                </Badge>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                                    onClick={() =>
                                                                                        handleDeleteAsignacion(
                                                                                            ur.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {gruposKeys
                                                                                    .slice(
                                                                                        0,
                                                                                        4,
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            key,
                                                                                        ) => (
                                                                                            <span
                                                                                                key={
                                                                                                    key
                                                                                                }
                                                                                                className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                                                                                title={
                                                                                                    gruposAsignacion[
                                                                                                        key
                                                                                                    ]
                                                                                                        .titulo
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    gruposAsignacion[
                                                                                                        key
                                                                                                    ]
                                                                                                        .icon
                                                                                                }{' '}
                                                                                                {
                                                                                                    gruposAsignacion[
                                                                                                        key
                                                                                                    ]
                                                                                                        .permisos
                                                                                                        .length
                                                                                                }
                                                                                            </span>
                                                                                        ),
                                                                                    )}
                                                                                {gruposKeys.length >
                                                                                    4 && (
                                                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                                                                        +
                                                                                        {gruposKeys.length -
                                                                                            4}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => {
                                                                    // Seleccionar usuario y abrir modal
                                                                    asignacionForm.setData(
                                                                        'usuario_id',
                                                                        usuario.user_id.toString(),
                                                                    );
                                                                    setIsAsignacionOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />{' '}
                                                                Agregar Rol
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Filtrar roles..."
                                        className="h-9 rounded-lg pl-9"
                                        value={filtros.rol}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                rol: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={() => {
                                        setEditingRole(null);
                                        rolForm.reset();
                                        inicializarGrupos();
                                        setIsRolOpen(true);
                                    }}
                                    className="rounded-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
                                </Button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {rolesFiltrados.map((role) => {
                                    const gruposRol = obtenerPermisosPorGrupo(
                                        role.permissions,
                                    );
                                    const gruposKeys = Object.keys(gruposRol);

                                    return (
                                        <Card
                                            key={role.id}
                                            className="bg-card/50 transition-all hover:ring-primary/50"
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        Rol
                                                    </Badge>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                openEditRole(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive"
                                                            onClick={() =>
                                                                handleDeleteRole(
                                                                    role.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardTitle className="text-base font-bold">
                                                    {role.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {gruposKeys
                                                        .slice(0, 4)
                                                        .map((key) => (
                                                            <span
                                                                key={key}
                                                                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px]"
                                                            >
                                                                {
                                                                    gruposRol[
                                                                        key
                                                                    ].icon
                                                                }{' '}
                                                                {
                                                                    gruposRol[
                                                                        key
                                                                    ].permisos
                                                                        .length
                                                                }
                                                            </span>
                                                        ))}
                                                    {gruposKeys.length > 4 && (
                                                        <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                                                            +
                                                            {gruposKeys.length -
                                                                4}
                                                        </span>
                                                    )}
                                                    {gruposKeys.length ===
                                                        0 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Sin permisos
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'permisos' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar permisos..."
                                        className="h-9 rounded-lg pl-9"
                                        value={filtros.permiso}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                permiso: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={() => {
                                        setEditingPermission(null);
                                        permisoForm.reset();
                                        setIsPermisoOpen(true);
                                    }}
                                    variant="outline"
                                    className="rounded-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo
                                    Permiso
                                </Button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {Object.entries(
                                    obtenerPermisosPorGrupo(permisosFiltrados),
                                ).map(([key, grupo]) => (
                                    <div
                                        key={key}
                                        className="rounded-lg border bg-background p-3"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-lg">
                                                {grupo.icon}
                                            </span>
                                            <span className="text-xs font-semibold uppercase">
                                                {grupo.titulo}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto text-[10px]"
                                            >
                                                {grupo.permisos.length}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {grupo.permisos.map((p) => (
                                                <span
                                                    key={p.id}
                                                    className="rounded bg-muted px-2 py-0.5 text-[10px]"
                                                >
                                                    {p.name
                                                        .replace(
                                                            'gestionar ',
                                                            '',
                                                        )
                                                        .replace('ver ', '')
                                                        .replace('hacer ', '')
                                                        .replace('acceso ', '')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tiendas' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar tienda..."
                                        className="h-9 rounded-lg pl-9"
                                        value={filtros.tienda}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                tienda: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {publicProfiles
                                    .filter(p => p.title.toLowerCase().includes(filtros.tienda.toLowerCase()))
                                    .map((profile) => (
                                    <Card
                                        key={profile.id}
                                        className="bg-card/50 transition-all hover:ring-primary/50"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[10px]">Tienda</Badge>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Oficial</span>
                                                    <Checkbox 
                                                        checked={profile.is_official}
                                                        onCheckedChange={() => handleToggleOfficial(profile.id)}
                                                    />
                                                </div>
                                            </div>
                                            <CardTitle className="mt-2 text-base font-bold">
                                                {profile.title}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {profile.user.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                 <span className="text-[10px] text-muted-foreground">/{profile.slug}</span>
                                                 {profile.is_official && (
                                                     <Badge className="bg-blue-500/10 text-blue-600 border-none px-2 py-0 h-5 text-[9px] font-black uppercase tracking-widest">
                                                         <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Oficial
                                                     </Badge>
                                                 )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Asignación */}
            <Dialog open={isAsignacionOpen} onOpenChange={setIsAsignacionOpen}>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                    <DialogHeader className="gap-2">
                        <DialogTitle className="text-2xl font-bold">
                            Asignar Nuevo Rol
                        </DialogTitle>
                        <DialogDescription>
                            Seleccione un usuario y el nivel de acceso que desea
                            otorgarle.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleAddAsignacion}
                        className="space-y-6 pt-4"
                    >
                        <div className="space-y-2">
                            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Usuario
                            </Label>
                            <select
                                className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                value={asignacionForm.data.usuario_id}
                                onChange={(e) =>
                                    asignacionForm.setData(
                                        'usuario_id',
                                        e.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">Seleccione un usuario</option>
                                {usuarios.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={asignacionForm.errors.usuario_id}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Rol de Acceso
                            </Label>
                            <select
                                className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                value={asignacionForm.data.rol_id}
                                onChange={(e) =>
                                    asignacionForm.setData(
                                        'rol_id',
                                        e.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Seleccione un nivel de acceso
                                </option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={asignacionForm.errors.rol_id}
                            />
                        </div>
                        <Separator className="my-2 opacity-50" />
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={asignacionForm.processing}
                                className="h-11 w-full rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                {asignacionForm.processing
                                    ? 'Procesando...'
                                    : 'Confirmar Privilegios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Modal Rol */}
            <Dialog open={isRolOpen} onOpenChange={setIsRolOpen}>
                <DialogContent className="rounded-2xl sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? 'Actualice el nombre y permisos del rol seleccionado.'
                                : 'Defina un nombre para el rol y asigne permisos iniciales.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRole} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label>Nombre del Rol</Label>
                            <Input
                                placeholder="Ej: Supervisor de Ventas"
                                value={rolForm.data.name}
                                onChange={(e) =>
                                    rolForm.setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError message={rolForm.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">
                                    Asignar Permisos
                                </Label>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleTodosLosGrupos(true)
                                        }
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Expandir todos
                                    </button>
                                    <span className="text-muted-foreground">
                                        |
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleTodosLosGrupos(false)
                                        }
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Colapsar todos
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border p-3">
                                {Object.entries(
                                    obtenerPermisosPorGrupo(permisos),
                                ).map(([key, grupo]) => (
                                    <div
                                        key={key}
                                        className="space-y-2 rounded-lg bg-muted/30 p-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => toggleGrupo(key)}
                                                className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase hover:text-primary/80"
                                            >
                                                <span>
                                                    {gruposExpandidos[key]
                                                        ? '▼'
                                                        : '▶'}
                                                </span>
                                                <span>{grupo.icon}</span>
                                                <span>{grupo.titulo}</span>
                                                <span className="font-normal text-muted-foreground">
                                                    ({grupo.permisos.length})
                                                </span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <Checkbox
                                                    id={`select-all-${key}`}
                                                    checked={grupo.permisos.every(
                                                        (p) =>
                                                            rolForm.data.permissions.includes(
                                                                p.id,
                                                            ),
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        const permisosIds =
                                                            grupo.permisos.map(
                                                                (p) => p.id,
                                                            );
                                                        if (checked) {
                                                            const nuevosPermisos =
                                                                [
                                                                    ...new Set([
                                                                        ...rolForm
                                                                            .data
                                                                            .permissions,
                                                                        ...permisosIds,
                                                                    ]),
                                                                ];
                                                            rolForm.setData(
                                                                'permissions',
                                                                nuevosPermisos,
                                                            );
                                                        } else {
                                                            const permisosRestantes =
                                                                rolForm.data.permissions.filter(
                                                                    (id) =>
                                                                        !permisosIds.includes(
                                                                            id,
                                                                        ),
                                                                );
                                                            rolForm.setData(
                                                                'permissions',
                                                                permisosRestantes,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`select-all-${key}`}
                                                    className="cursor-pointer text-[10px] text-muted-foreground"
                                                >
                                                    Todos
                                                </label>
                                            </div>
                                        </div>
                                        {gruposExpandidos[key] && (
                                            <div className="grid grid-cols-1 gap-1 pl-4 sm:grid-cols-2">
                                                {grupo.permisos.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center space-x-2 py-1"
                                                    >
                                                        <Checkbox
                                                            id={`p-${p.id}`}
                                                            checked={rolForm.data.permissions.includes(
                                                                p.id,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                if (checked)
                                                                    rolForm.setData(
                                                                        'permissions',
                                                                        [
                                                                            ...rolForm
                                                                                .data
                                                                                .permissions,
                                                                            p.id,
                                                                        ],
                                                                    );
                                                                else
                                                                    rolForm.setData(
                                                                        'permissions',
                                                                        rolForm.data.permissions.filter(
                                                                            (
                                                                                id,
                                                                            ) =>
                                                                                id !==
                                                                                p.id,
                                                                        ),
                                                                    );
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`p-${p.id}`}
                                                            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            {p.name
                                                                .replace(
                                                                    'gestionar ',
                                                                    '',
                                                                )
                                                                .replace(
                                                                    'ver ',
                                                                    '',
                                                                )
                                                                .replace(
                                                                    'hacer ',
                                                                    '',
                                                                )}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl"
                                disabled={rolForm.processing}
                            >
                                {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Permiso */}
            <Dialog open={isPermisoOpen} onOpenChange={setIsPermisoOpen}>
                <DialogContent className="rounded-2xl sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingPermission
                                ? 'Editar Permiso'
                                : 'Nuevo Permiso Global'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPermission
                                ? 'Actualice el nombre de la capacidad base.'
                                : 'Agregue una nueva capacidad atómica al sistema.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleSavePermission}
                        className="space-y-6 pt-4"
                    >
                        <div className="space-y-2">
                            <Label>Nombre del Permiso</Label>
                            <Input
                                placeholder="Ej: anular facturas"
                                value={permisoForm.data.name}
                                onChange={(e) =>
                                    permisoForm.setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError message={permisoForm.errors.name} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl"
                                disabled={permisoForm.processing}
                            >
                                {editingPermission
                                    ? 'Guardar Cambios'
                                    : 'Registrar Permiso'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

// Helper to provide route names in the frontend if wayfinder is used
function route(name: string, params?: any) {
    if (name === 'usuarios-roles.index') return '/usuarios-roles';
    if (name === 'usuarios-roles.store') return '/usuarios-roles';
    if (name === 'usuarios-roles.destroy') return `/usuarios-roles/${params}`;
    if (name === 'usuarios-roles.role.store') return '/usuarios-roles/role';
    if (name === 'usuarios-roles.role.update')
        return `/usuarios-roles/role/${params}`;
    if (name === 'usuarios-roles.role.destroy')
        return `/usuarios-roles/role/${params}`;
    if (name === 'usuarios-roles.permission.store')
        return '/usuarios-roles/permission';
    if (name === 'usuarios-roles.permission.update')
        return `/usuarios-roles/permission/${params}`;
    if (name === 'usuarios-roles.permission.destroy')
        return `/usuarios-roles/permission/${params}`;
    if (name === 'usuarios-roles.toggle-official')
        return `/usuarios-roles/public-profile/${params}/toggle-official`;
    return '#';
}
