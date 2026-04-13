import { Head, router, usePage } from '@inertiajs/react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    Shield,
    Clock,
    Edit2,
    Save,
    X,
    Key,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit as editProfile } from '@/routes/profile/index';
import type { BreadcrumbItem } from '@/types';

interface ProfileData {
    id: number;
    name: string;
    email: string;
    rut: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    region: string | null;
    comuna: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    tipo_entidad: string | null;
    job: string | null;
    location: string | null;
    profile_photo_url: string | null;
    cover_photo_path: string | null;
    roles: string[];
    permissions: string[];
    email_verified_at: string | null;
    created_at: string;
    two_factor_enabled: boolean;
}

interface PageProps {
    profile: ProfileData;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi Información',
        href: '/mi-informacion',
    },
];

export default function MiInformacion() {
    const { profile } = usePage<PageProps>().props;
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({
        name: profile.name,
        rut: profile.rut || '',
        telefono: profile.telefono || '',
        direccion: profile.direccion || '',
        ciudad: profile.ciudad || '',
        region: profile.region || '',
        comuna: profile.comuna || '',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        genero: profile.genero || '',
        job: profile.job || '',
        location: profile.location || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGuardar = () => {
        setGuardando(true);
        router.patch('/mi-informacion', formData, {
            onSuccess: () => {
                setEditando(false);
                setGuardando(false);
                toast.success('Información actualizada correctamente');
            },
            onError: () => {
                setGuardando(false);
                toast.error('Error al actualizar la información');
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No verificado';
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Información Personal" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Mi Información Personal
                        </h2>
                        <p className="text-muted-foreground">
                            Gestiona tu información personal y datos de contacto
                        </p>
                    </div>
                    {!editando && (
                        <Button onClick={() => setEditando(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar Información
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Datos Personales</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    {profile.profile_photo_url ? (
                                        <img
                                            src={profile.profile_photo_url}
                                            alt={profile.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">
                                            {profile.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {profile.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.tipo_entidad || 'Usuario'}
                                    </p>
                                </div>
                            </div>

                            {editando ? (
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="name">
                                            Nombre Completo
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                handleChange(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rut">RUT</Label>
                                        <Input
                                            id="rut"
                                            value={formData.rut}
                                            onChange={(e) =>
                                                handleChange(
                                                    'rut',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="12.345.678-9"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="fecha_nacimiento">
                                            Fecha de Nacimiento
                                        </Label>
                                        <Input
                                            id="fecha_nacimiento"
                                            type="date"
                                            value={formData.fecha_nacimiento}
                                            onChange={(e) =>
                                                handleChange(
                                                    'fecha_nacimiento',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="genero">Género</Label>
                                        <Input
                                            id="genero"
                                            value={formData.genero}
                                            onChange={(e) =>
                                                handleChange(
                                                    'genero',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masculino, Femenino, Otro..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            RUT
                                        </span>
                                        <span className="font-medium">
                                            {profile.rut || 'No registrado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Fecha de Nacimiento
                                        </span>
                                        <span className="font-medium">
                                            {profile.fecha_nacimiento
                                                ? formatDate(
                                                      profile.fecha_nacimiento,
                                                  )
                                                : 'No registrado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Género
                                        </span>
                                        <span className="font-medium">
                                            {profile.genero || 'No registrado'}
                                        </span>
                                    </div>
                                    {profile.job && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Profesión/Cargo
                                            </span>
                                            <span className="font-medium">
                                                {profile.job}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">
                                Información de Contacto
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{profile.email}</span>
                                {profile.email_verified_at ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                            </div>

                            {editando ? (
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="telefono">
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="telefono"
                                            value={formData.telefono}
                                            onChange={(e) =>
                                                handleChange(
                                                    'telefono',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="+56 9 1234 5678"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="direccion">
                                            Dirección
                                        </Label>
                                        <Input
                                            id="direccion"
                                            value={formData.direccion}
                                            onChange={(e) =>
                                                handleChange(
                                                    'direccion',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Calle, número, depto..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor="region">
                                                Región
                                            </Label>
                                            <Input
                                                id="region"
                                                value={formData.region}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'region',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Región"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ciudad">
                                                Ciudad
                                            </Label>
                                            <Input
                                                id="ciudad"
                                                value={formData.ciudad}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'ciudad',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ciudad"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="comuna">
                                                Comuna
                                            </Label>
                                            <Input
                                                id="comuna"
                                                value={formData.comuna}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'comuna',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Comuna"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {profile.telefono ||
                                                'No registrado'}
                                        </span>
                                    </div>
                                    {profile.direccion && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {profile.direccion}
                                                {profile.comuna &&
                                                    `, ${profile.comuna}`}
                                                {profile.ciudad &&
                                                    `, ${profile.ciudad}`}
                                                {profile.region &&
                                                    `, ${profile.region}`}
                                            </span>
                                        </div>
                                    )}
                                    {profile.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Ubicación: {profile.location}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Seguridad</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Key className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Autenticación de Dos Factores
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        profile.two_factor_enabled
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {profile.two_factor_enabled
                                        ? 'Activa'
                                        : 'Inactiva'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Email verificado
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        profile.email_verified_at
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {profile.email_verified_at
                                        ? 'Verificado'
                                        : 'Pendiente'}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <a href="/settings/two-factor">
                                    <Key className="mr-2 h-4 w-4" />
                                    Configurar Seguridad
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Roles y Permisos</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Roles asignados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.roles.length > 0 ? (
                                        profile.roles.map((role) => (
                                            <Badge key={role} variant="outline">
                                                {role}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            Sin roles asignados
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Permisos ({profile.permissions.length})
                                </p>
                                <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
                                    {profile.permissions
                                        .slice(0, 10)
                                        .map((perm) => (
                                            <span
                                                key={perm}
                                                className="rounded bg-muted px-2 py-1 text-xs"
                                            >
                                                {perm}
                                            </span>
                                        ))}
                                    {profile.permissions.length > 10 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{profile.permissions.length - 10}{' '}
                                            más
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">
                                Información de Cuenta
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                                <p className="text-muted-foreground">
                                    ID de Usuario
                                </p>
                                <p className="font-medium">#{profile.id}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Miembro desde
                                </p>
                                <p className="font-medium">
                                    {formatDate(profile.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Email verificado
                                </p>
                                <p className="font-medium">
                                    {formatDate(profile.email_verified_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">2FA</p>
                                <p className="font-medium">
                                    {profile.two_factor_enabled
                                        ? 'Activado'
                                        : 'Desactivado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {editando && (
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setEditando(false)}
                            disabled={guardando}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button onClick={handleGuardar} disabled={guardando}>
                            {guardando ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
