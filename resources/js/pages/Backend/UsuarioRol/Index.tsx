import { Head, useForm, router } from '@inertiajs/react';
import {
    Eye,
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
    };
}

interface Props {
    usuarios: User[];
    roles: Role[];
    permisos: Permission[];
    grouped_permissions: Record<string, Record<string, { id: number; name: string; friendly_name: string }[]>>;
    usuariosRoles: UsuarioRol[];
    publicProfiles: PublicProfile[];
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
    grouped_permissions,
    usuariosRoles,
    publicProfiles,
}: Props) {
    function filterGroupedPermissions(selectedIds: number[]) {
        const result: Record<string, Record<string, { id: number; name: string; friendly_name: string }[]>> = {};
        for (const [moduleName, submodules] of Object.entries(grouped_permissions)) {
            let moduleHasPerms = false;
            const subResult: Record<string, any[]> = {};
            for (const [subName, perms] of Object.entries(submodules)) {
                const filtered = perms.filter(p => selectedIds.includes(p.id));
                if (filtered.length > 0) {
                    subResult[subName] = filtered;
                    moduleHasPerms = true;
                }
            }
            if (moduleHasPerms) {
                result[moduleName] = subResult;
            }
        }
        return result;
    }

    function getModuleSummary(selectedIds: number[]): string[] {
        const result: string[] = [];
        for (const [moduleName, submodules] of Object.entries(grouped_permissions)) {
            let count = 0;
            for (const perms of Object.values(submodules)) {
                count += perms.filter(p => selectedIds.includes(p.id)).length;
            }
            if (count > 0) {
                result.push(`${moduleName} (${count})`);
            }
        }
        return result;
    }
    const [activeTab, setActiveTab] = useState<
        'asignaciones' | 'roles' | 'permisos' | 'tiendas'
    >('asignaciones');

    // Modals states
    const [isAsignacionOpen, setIsAsignacionOpen] = useState(false);
    const [isRolOpen, setIsRolOpen] = useState(false);
    const [isPermisoOpen, setIsPermisoOpen] = useState(false);
    const [viewingRole, setViewingRole] = useState<Role | null>(null);

    // Editing states
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});

    const toggleGrupo = (key: string) => {
        setGruposExpandidos((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleTodosLosGrupos = (expandir: boolean) => {
        const grupos: Record<string, boolean> = {};
        Object.keys(grouped_permissions).forEach((key) => {
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
        setGruposExpandidos({});
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
        router.patch(
            route('usuarios-roles.toggle-official', profileId),
            {},
            {
                preserveScroll: true,
            },
        );
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
                                                                            const userPermIds = (ur.permissions as Permission[]).map(p => p.id);
                                                                            const moduleSummaries = getModuleSummary(userPermIds);
                                                                            
                                                                            return (
                                                                                <div
                                                                                    key={ur.id}
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
                                                                                <div className="flex gap-0.5">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-6 w-6 text-muted-foreground hover:bg-muted"
                                                                                        title="Ver rol"
                                                                                        onClick={() => {
                                                                                            const role =
                                                                                                roles.find(
                                                                                                    (
                                                                                                        r,
                                                                                                    ) =>
                                                                                                        r.name ===
                                                                                                        ur.role_name,
                                                                                                );
                                                                                            if (
                                                                                                role
                                                                                            )
                                                                                                setViewingRole(
                                                                                                    role,
                                                                                                );
                                                                                        }}
                                                                                    >
                                                                                        <Eye className="h-3 w-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-6 w-6 text-muted-foreground hover:bg-muted"
                                                                                        title="Editar rol"
                                                                                        onClick={() => {
                                                                                            const role =
                                                                                                roles.find(
                                                                                                    (
                                                                                                        r,
                                                                                                    ) =>
                                                                                                        r.name ===
                                                                                                        ur.role_name,
                                                                                                );
                                                                                            if (
                                                                                                role
                                                                                            )
                                                                                                openEditRole(
                                                                                                    role,
                                                                                                );
                                                                                        }}
                                                                                    >
                                                                                        <Pencil className="h-3 w-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                                        title="Eliminar asignación"
                                                                                        onClick={() =>
                                                                                            handleDeleteAsignacion(
                                                                                                ur.id,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {moduleSummaries.slice(0, 4).map((summary, idx) => (
                                                                                    <span key={idx} className="rounded bg-muted px-1.5 py-0.5 text-[10px]" title={summary}>
                                                                                        {summary.split('(')[0].trim()}
                                                                                    </span>
                                                                                ))}
                                                                                {moduleSummaries.length > 4 && (
                                                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">+ {moduleSummaries.length - 4} más</span>
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
                                        setGruposExpandidos({});
                                        setIsRolOpen(true);
                                    }}
                                    className="rounded-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
                                </Button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {rolesFiltrados.map((role) => {
                                    const rolePermIds = role.permissions.map(p => p.id);
                                    const moduleSummaries = getModuleSummary(rolePermIds);

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
                                                            title="Ver detalle"
                                                            onClick={() =>
                                                                setViewingRole(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Editar rol"
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
                                                    {moduleSummaries.slice(0, 4).map((summary, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px]" title={summary}>
                                                            {summary.split('(')[0].trim()}
                                                            <span className="font-bold">({summary.split('(')[1].replace(')', '')})</span>
                                                        </span>
                                                    ))}
                                                    {moduleSummaries.length > 4 && (
                                                        <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                                                            + {moduleSummaries.length - 4} más
                                                        </span>
                                                    )}
                                                    {moduleSummaries.length ===
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

                            <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(grouped_permissions).map(([moduleName, submodules]) => {
                                    const allPerms = Object.values(submodules).flat();
                                    
                                    // Handle filtering
                                    const filteredPerms = allPerms.filter(p => !filtros.permiso || p.name.toLowerCase().includes(filtros.permiso.toLowerCase()) || p.friendly_name.toLowerCase().includes(filtros.permiso.toLowerCase()));
                                    if (filteredPerms.length === 0 && filtros.permiso) return null;

                                    return (
                                        <Card key={moduleName} className="overflow-hidden">
                                            <CardHeader className="bg-muted/30 pb-3 h-full">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{moduleName}</CardTitle>
                                                    <Badge variant="secondary" className="text-xs">{filteredPerms.length || allPerms.length}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="h-64 overflow-y-auto p-0">
                                                <div className="divide-y">
                                                    {Object.entries(submodules).map(([subName, perms]) => {
                                                        const validPerms = perms.filter(p => !filtros.permiso || p.name.toLowerCase().includes(filtros.permiso.toLowerCase()) || p.friendly_name.toLowerCase().includes(filtros.permiso.toLowerCase()));
                                                        if (validPerms.length === 0) return null;
                                                        
                                                        return (
                                                            <div key={subName} className="p-3">
                                                                <h4 className="mb-2 text-xs font-semibold text-muted-foreground">{subName}</h4>
                                                                <div className="space-y-1">
                                                                    {validPerms.map(p => (
                                                                        <div key={p.id} className="group flex items-center justify-between rounded-md p-2 hover:bg-muted/50">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-sm font-medium">{p.friendly_name}</span>
                                                                                <span className="text-[10px] text-muted-foreground font-mono">{p.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
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
                                    .filter((p) =>
                                        p.title
                                            .toLowerCase()
                                            .includes(
                                                filtros.tienda.toLowerCase(),
                                            ),
                                    )
                                    .map((profile) => (
                                        <Card
                                            key={profile.id}
                                            className="bg-card/50 transition-all hover:ring-primary/50"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        Tienda
                                                    </Badge>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            Oficial
                                                        </span>
                                                        <Checkbox
                                                            checked={
                                                                profile.is_official
                                                            }
                                                            onCheckedChange={() =>
                                                                handleToggleOfficial(
                                                                    profile.id,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <CardTitle className="mt-2 text-base font-bold">
                                                    {profile.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 text-[10px]">
                                                    <Users className="h-3 w-3" />{' '}
                                                    {profile.user.name}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        /{profile.slug}
                                                    </span>
                                                    {profile.is_official && (
                                                        <Badge className="h-5 border-none bg-blue-500/10 px-2 py-0 text-[9px] font-black tracking-widest text-blue-600 uppercase">
                                                            <CheckCircle2 className="mr-1 h-2.5 w-2.5" />{' '}
                                                            Oficial
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
                <DialogContent className="mx-4 rounded-2xl border border-border bg-background p-6 shadow-xl sm:mx-auto sm:max-w-[425px]">
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
                <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden rounded-xl p-0 shadow-2xl sm:max-w-[600px]">
                    <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
                        <DialogTitle className="text-lg font-black sm:text-xl">
                            {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            {editingRole
                                ? 'Actualice el nombre y permisos del rol seleccionado.'
                                : 'Defina un nombre para el rol y asigne permisos iniciales.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleSaveRole}
                        className="flex flex-col overflow-hidden"
                        style={{ maxHeight: 'calc(95vh - 120px)' }}
                    >
                        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Nombre del Rol
                                    </Label>
                                    <Input
                                        placeholder="Ej: Supervisor de Ventas"
                                        value={rolForm.data.name}
                                        onChange={(e) =>
                                            rolForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="h-10"
                                    />
                                    <InputError message={rolForm.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                                            Asignar Permisos
                                        </Label>
                                        <div className="flex gap-2 text-xs">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleTodosLosGrupos(true)
                                                }
                                                className="text-primary hover:underline"
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
                                                className="text-primary hover:underline"
                                            >
                                                Colapsar todos
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-[40vh] space-y-3 overflow-y-auto rounded-xl border p-3">
                                        {Object.entries(grouped_permissions).map(([moduleName, submodules]) => {
                                            const modulePerms = Object.values(submodules).flat();
                                            const allSelected = modulePerms.every(p => rolForm.data.permissions.includes(p.id));
                                            
                                            // Optional partial selection state
                                            const someSelected = modulePerms.some(p => rolForm.data.permissions.includes(p.id));

                                            return (
                                                <div key={moduleName} className="space-y-2 rounded-lg bg-muted/30 p-2">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => toggleGrupo(moduleName)}
                                                            className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase hover:text-primary/80"
                                                        >
                                                            <span>{gruposExpandidos[moduleName] ? '▼' : '▶'}</span>
                                                            <span>{moduleName}</span>
                                                            <span className="font-normal text-muted-foreground">({modulePerms.length})</span>
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <Checkbox
                                                                id={`select-all-${moduleName}`}
                                                                checked={allSelected}
                                                                onCheckedChange={(checked) => {
                                                                    const modulePermIds = modulePerms.map((p) => p.id);
                                                                    if (checked) {
                                                                        const nuevosPermisos = [...new Set([...rolForm.data.permissions, ...modulePermIds])];
                                                                        rolForm.setData('permissions', nuevosPermisos);
                                                                    } else {
                                                                        const permisosRestantes = rolForm.data.permissions.filter((id) => !modulePermIds.includes(id));
                                                                        rolForm.setData('permissions', permisosRestantes);
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={`select-all-${moduleName}`} className="cursor-pointer text-[10px] text-muted-foreground">
                                                                Todos
                                                            </label>
                                                        </div>
                                                    </div>
                                                    
                                                    {gruposExpandidos[moduleName] && (
                                                        <div className="pl-4 mt-2 grid gap-3 md:grid-cols-2">
                                                            {Object.entries(submodules).map(([subName, perms]) => {
                                                                const subAllSelected = perms.every(p => rolForm.data.permissions.includes(p.id));
                                                                
                                                                return (
                                                                    <div key={subName} className="rounded-md bg-background border p-2">
                                                                        <div className="flex items-center justify-between mb-2 pb-1 border-b">
                                                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">{subName}</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <Checkbox
                                                                                    id={`sub-${subName}`}
                                                                                    checked={subAllSelected}
                                                                                    onCheckedChange={(checked) => {
                                                                                        const subPermIds = perms.map((p) => p.id);
                                                                                        if (checked) {
                                                                                            const nuevosPermisos = [...new Set([...rolForm.data.permissions, ...subPermIds])];
                                                                                            rolForm.setData('permissions', nuevosPermisos);
                                                                                        } else {
                                                                                            const permisosRestantes = rolForm.data.permissions.filter((id) => !subPermIds.includes(id));
                                                                                            rolForm.setData('permissions', permisosRestantes);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-1">
                                                                            {perms.map(p => (
                                                                                <div key={p.id} className="flex items-center space-x-2 py-0.5">
                                                                                    <Checkbox
                                                                                        id={`p-${p.id}`}
                                                                                        checked={rolForm.data.permissions.includes(p.id)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            if (checked) {
                                                                                                rolForm.setData('permissions', [...rolForm.data.permissions, p.id]);
                                                                                            } else {
                                                                                                rolForm.setData('permissions', rolForm.data.permissions.filter((id) => id !== p.id));
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <label htmlFor={`p-${p.id}`} className="cursor-pointer text-xs">
                                                                                        {p.friendly_name}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4">
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

            {/* Modal Ver Detalle de Rol */}
            <Dialog
                open={!!viewingRole}
                onOpenChange={() => setViewingRole(null)}
            >
                <DialogContent className="mx-4 rounded-2xl border border-border bg-background p-6 shadow-xl sm:mx-auto sm:max-w-[500px]">
                    <DialogHeader className="gap-2">
                        <DialogTitle className="text-2xl font-bold">
                            {viewingRole?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Este rol tiene{' '}
                            {viewingRole?.permissions.length ?? 0} permisos
                            asignados.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 space-y-3 overflow-y-auto pt-4">
                        {viewingRole &&
                            Object.entries(filterGroupedPermissions(viewingRole.permissions.map(p => p.id)))
                            .map(([moduleName, submodules]) => (
                                <div key={moduleName} className="rounded-lg border bg-muted/30 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase">{moduleName}</span>
                                        <Badge variant="secondary" className="ml-auto text-[10px]">
                                            {Object.values(submodules).flat().length}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {Object.entries(submodules).map(([subName, perms]) => (
                                            <div key={subName} className="rounded bg-background p-2">
                                                <h4 className="mb-1 text-[10px] font-semibold text-muted-foreground">{subName}</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {perms.map(p => (
                                                        <Badge key={p.id} variant="outline" className="text-[10px] bg-card" title={p.name}>
                                                            {p.friendly_name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        {viewingRole &&
                            viewingRole.permissions.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Este rol no tiene permisos asignados.
                                </p>
                            )}
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            variant="outline"
                            className="w-full rounded-xl"
                            onClick={() => {
                                if (viewingRole) openEditRole(viewingRole);
                                setViewingRole(null);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> Editar Rol
                        </Button>
                    </DialogFooter>
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
