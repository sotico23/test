import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Shield,
    KeyRound,
    Eye,
} from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
import { FormInput } from '@/components/form-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalShow } from '@/components/ui/ModalShow';
import Pagination from '@/components/ui/Pagination';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { BulkActions } from '@/components/shared/BulkActions';

interface Almacen {
    id: number;
    nombre: string;
    codigo: string;
}

interface Rol {
    id: number;
    name: string;
}

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    cargo: string | null;
    departamento: string | null;
    almacen_id: number | null;
    almacen?: Almacen;
    fecha_contratacion: string | null;
    salario: number | null;
    estado: string;
    direccion: string | null;
    notas: string | null;
    user_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Empleados', href: '/empleados' },
];

const estados = ['activo', 'inactivo', 'vacaciones', 'licencia'];

export default function Index({
    empleados,
    almacenes,
    roles,
}: {
    empleados: {
        data: Empleado[];
        links: any[];
        from?: number;
        to?: number;
        total?: number;
        meta?: any;
    };
    almacenes: Almacen[];
    roles: Rol[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Empleado | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Empleado | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cargo: '',
        departamento: '',
        almacen_id: '',
        fecha_contratacion: '',
        salario: 0,
        estado: 'activo',
        direccion: '',
        notas: '',
        crear_usuario: false,
        password: '',
        rol_id: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const empleadosFiltrados = useMemo(() => {
        return empleados.data.filter((emp) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !emp.nombre.toLowerCase().includes(busca) &&
                    !emp.apellido.toLowerCase().includes(busca) &&
                    !emp.email.toLowerCase().includes(busca) &&
                    !(emp.cargo || '').toLowerCase().includes(busca) &&
                    !(emp.departamento || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && emp.estado !== filtros.estado) return false;

            return true;
        });
    }, [empleados.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditando(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/empleados/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error al actualizar:', errors);
                },
            });
        } else {
            post('/empleados', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error al crear:', errors);
                },
            });
        }
    };

    const handleEdit = (emp: Empleado) => {
        setEditando(emp);
        setData({
            nombre: emp.nombre,
            apellido: emp.apellido,
            email: emp.email,
            telefono: emp.telefono || '',
            cargo: emp.cargo || '',
            departamento: emp.departamento || '',
            almacen_id: emp.almacen_id?.toString() || '',
            fecha_contratacion: emp.fecha_contratacion || '',
            salario: emp.salario || 0,
            estado: emp.estado,
            direccion: emp.direccion || '',
            notas: emp.notas || '',
            crear_usuario: emp.user_id !== null,
            password: '',
            rol_id: '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            cargo: '',
            departamento: '',
            almacen_id: '',
            fecha_contratacion: '',
            salario: 0,
            estado: 'activo',
            direccion: '',
            notas: '',
            crear_usuario: false,
            password: '',
            rol_id: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/empleados/${id}`);
    };

    const handleView = (emp: Empleado) => {
        setViewing(emp);
        setIsViewOpen(true);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            activo: 'bg-green-500',
            inactivo: 'bg-gray-500',
            vacaciones: 'bg-blue-500',
            licencia: 'bg-yellow-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Empleados" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Empleados</h1>
                            <p className="text-muted-foreground">
                                Directorio de empleados
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <BulkActions
                                baseUrl="/empleados"
                                modelName="Empleados"
                            />
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Empleados</CardTitle>
                            <CardDescription>
                                {empleadosFiltrados.length} empleados
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre, email, cargo o dep..."
                                            value={filtros.busqueda}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    busqueda: e.target.value,
                                                })
                                            }
                                            className="h-9 pl-8"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filtros.estado}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            estado: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((est) => (
                                        <option key={est} value={est}>
                                            {est.charAt(0).toUpperCase() +
                                                est.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    onClick={limpiarFiltros}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 text-left font-medium">
                                                Nombre
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Email
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Cargo
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Almacén / Bodega
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {empleadosFiltrados.map((emp) => (
                                            <tr
                                                key={emp.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-medium text-foreground">
                                                        {emp.nombre}{' '}
                                                        {emp.apellido}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {emp.telefono || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-muted-foreground">
                                                    {emp.email}
                                                    {emp.user_id && (
                                                        <div className="mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-blue-200 bg-blue-50 text-[9px] text-blue-600"
                                                            >
                                                                Acceso
                                                                Plataforma
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    {emp.cargo || '-'}
                                                </td>
                                                <td className="py-2 text-muted-foreground">
                                                    {emp.almacen?.nombre || '-'}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(emp.estado)}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(emp)
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    emp.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {empleadosFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron empleados
                                                    con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={empleados.links}
                                    meta={empleados.meta || empleados}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => !open && handleClose()}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Empleado
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Nombre *"
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    error={errors.nombre}
                                    required
                                />
                                <FormInput
                                    label="Apellido *"
                                    id="apellido"
                                    value={data.apellido}
                                    onChange={(e) =>
                                        setData('apellido', e.target.value)
                                    }
                                    error={errors.apellido}
                                    required
                                />
                            </div>
                            <FormInput
                                label="Email *"
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                error={errors.email}
                                required
                            />
                            <div className="flex items-center space-x-2 rounded-md border bg-blue-50/50 p-3">
                                <input
                                    type="checkbox"
                                    id="crear_usuario"
                                    checked={data.crear_usuario}
                                    onChange={(e) =>
                                        setData(
                                            'crear_usuario',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label
                                    htmlFor="crear_usuario"
                                    className="cursor-pointer text-sm font-medium text-blue-900"
                                >
                                    Dar acceso a la plataforma (crear usuario)
                                </Label>
                            </div>
                            {data.crear_usuario && (
                                <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <FormInput
                                            label="Contraseña"
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.password}
                                            placeholder="Manual (mín 6 caracteres)"
                                            className="font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            {editando && editando?.user_id 
                                                ? 'Dejar vacío para mantener la contraseña actual' 
                                                : 'Dejar vacío para usar: empleadonuevo'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1 text-xs font-medium">
                                            <Shield className="h-3 w-3" /> Rol
                                        </Label>
                                        <select
                                            value={data.rol_id}
                                            onChange={(e) =>
                                                setData(
                                                    'rol_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                        >
                                            <option value="">
                                                Seleccionar rol...
                                            </option>
                                            {roles.map((rol) => (
                                                <option
                                                    key={rol.id}
                                                    value={rol.id}
                                                >
                                                    {rol.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Teléfono"
                                    id="telefono"
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                    error={errors.telefono}
                                />
                                <FormInput
                                    label="Cargo"
                                    id="cargo"
                                    value={data.cargo}
                                    onChange={(e) =>
                                        setData('cargo', e.target.value)
                                    }
                                    error={errors.cargo}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Almacén / Bodega</Label>
                                    <select
                                        value={data.almacen_id}
                                        onChange={(e) =>
                                            setData(
                                                'almacen_id',
                                                e.target.value,
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="">
                                            Seleccionar almacén...
                                        </option>
                                        {almacenes.map((alm) => (
                                            <option key={alm.id} value={alm.id}>
                                                {alm.nombre} ({alm.codigo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <FormInput
                                    label="Salario"
                                    id="salario"
                                    type="number"
                                    step="1"
                                    value={data.salario}
                                    onChange={(e) =>
                                        setData(
                                            'salario',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    error={errors.salario}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Fecha Contratación"
                                    id="fecha_contratacion"
                                    type="date"
                                    value={data.fecha_contratacion}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_contratacion',
                                            e.target.value,
                                        )
                                    }
                                    error={errors.fecha_contratacion}
                                />
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <select
                                        value={data.estado}
                                        onChange={(e) =>
                                            setData('estado', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {estados.map((e) => (
                                            <option key={e} value={e}>
                                                {e}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ModalShow
                isOpen={isViewOpen}
                setIsOpen={setIsViewOpen}
                item={viewing}
                title="Empleado"
                badgeLabel="Detalle de Empleado"
                colorScheme="teal"
                quickStats={[
                    {
                        label: 'Email',
                        val: viewing?.email || '---',
                        colorScheme: 'blue',
                    },
                    {
                        label: 'Estado',
                        val: viewing?.estado?.toUpperCase() || 'ACTIVO',
                        colorScheme:
                            viewing?.estado === 'activo' ? 'green' : 'rose',
                    },
                    {
                        label: 'Cargo',
                        val: viewing?.cargo || '---',
                        colorScheme: 'purple',
                    },
                ]}
            >
                <Card className="border-none bg-gray-50/50 shadow-sm">
                    <CardHeader className="border-b border-gray-100 pb-3">
                        <CardTitle className="text-base font-bold text-gray-800">
                            Información Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-5">
                        <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                Email
                            </Label>
                            <p className="font-medium">
                                {viewing?.email || 'Sin email'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                Teléfono
                            </Label>
                            <p className="font-medium">
                                {viewing?.telefono || 'Sin teléfono'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                Dirección
                            </Label>
                            <p className="font-medium">
                                {viewing?.direccion || 'Sin dirección'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </ModalShow>
        </>
    );
}
