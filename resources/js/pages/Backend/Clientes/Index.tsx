import { Head, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Search, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface Categoria {
    id: number;
    nombre: string;
}

interface Cliente {
    id: number;
    nombre: string;
    nit: string | null;
    rut: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    region: string | null;
    comuna: string | null;
    giro: string | null;
    contacto: string | null;
    telefono_contacto: string | null;
    categoria_id: number | null;
    activo: boolean;
    notas: string | null;
    categoria?: Categoria;
    created_at: string;
    user_id: number | null;
    tiene_acceso: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clientes', href: '/clientes' },
];

export default function Index({
    clientes,
    categorias,
}: {
    clientes: {
        data: Cliente[];
        links: any[];
        meta?: any;
        total: number;
    };
    categorias: Categoria[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Cliente | null>(null);
    const [viendo, setViendo] = useState<Cliente | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        nit: '',
        rut: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        region: '',
        comuna: '',
        giro: '',
        contacto: '',
        telefono_contacto: '',
        categoria_id: '' as string,
        activo: true,
        notas: '',
        crear_usuario: false,
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria_id: '',
        activo: '',
    });

    const clientesFiltrados = useMemo(() => {
        return clientes.data.filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.nombre.toLowerCase().includes(busca) &&
                    !(c.rut || '').toLowerCase().includes(busca) &&
                    !(c.nit || '').toLowerCase().includes(busca) &&
                    !(c.email || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.categoria_id &&
                filtros.categoria_id !== 'all' &&
                c.categoria_id?.toString() !== filtros.categoria_id
            )
                return false;
            if (filtros.activo && filtros.activo !== 'all') {
                const isActivo = filtros.activo === '1';
                if (c.activo !== isActivo) return false;
            }

            return true;
        });
    }, [clientes, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            categoria_id: 'all',
            activo: 'all',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, categoria_id: data.categoria_id || null };
        if (editando) {
            put(`/clientes/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/clientes', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (cliente: Cliente) => {
        setEditando(cliente);
        setData({
            nombre: cliente.nombre,
            nit: cliente.nit || '',
            rut: cliente.rut || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            ciudad: cliente.ciudad || '',
            region: cliente.region || '',
            comuna: cliente.comuna || '',
            giro: cliente.giro || '',
            contacto: cliente.contacto || '',
            telefono_contacto: cliente.telefono_contacto || '',
            categoria_id: cliente.categoria_id?.toString() || '',
            activo: cliente.activo,
            notas: cliente.notas || '',
            crear_usuario: cliente.tiene_acceso || false,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este cliente?'))
            destroy(`/clientes/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <Button
                        onClick={() => {
                            setEditando(null);
                            reset();
                            setData('crear_usuario', false);
                            setIsOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Clientes</CardTitle>
                        <CardDescription>
                            {clientes.total} clientes encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-muted/50 p-4 shadow-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="group relative">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Buscar por nombre, RUT, email..."
                                        value={filtros.busqueda}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                busqueda: e.target.value,
                                            })
                                        }
                                        className="h-10 border-muted-foreground/20 pl-9 transition-all focus:border-primary"
                                    />
                                </div>
                            </div>

                            <Select
                                value={filtros.categoria_id}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        categoria_id: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[200px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todas las categorías
                                    </SelectItem>
                                    {categorias.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            {cat.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filtros.activo}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        activo: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[180px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los estados
                                    </SelectItem>
                                    <SelectItem value="1">Activos</SelectItem>
                                    <SelectItem value="0">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 border-muted-foreground/20 px-4 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                onClick={limpiarFiltros}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtros
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Nombre
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            RUT
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Teléfono
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Email
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Comuna/Ciudad
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Estado
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientesFiltrados.map((cliente) => (
                                        <tr
                                            key={cliente.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 font-medium">
                                                <span
                                                    className="block max-w-[180px] truncate"
                                                    title={cliente.nombre}
                                                >
                                                    {cliente.nombre}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {cliente.rut ||
                                                    cliente.nit ||
                                                    '-'}
                                            </td>
                                            <td className="hidden px-4 py-2 sm:table-cell">
                                                <div className="flex items-center gap-1 text-sm">
                                                    {cliente.telefono || '-'}
                                                    <WhatsAppButton
                                                        phone={cliente.telefono}
                                                        nombre={cliente.nombre}
                                                    />
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm md:table-cell">
                                                {cliente.email || '-'}
                                                {cliente.user_id && (
                                                    <div className="mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-blue-200 bg-blue-50 text-[9px] text-blue-600"
                                                        >
                                                            Acceso Plataforma
                                                        </Badge>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm lg:table-cell">
                                                {cliente.comuna ||
                                                cliente.ciudad
                                                    ? `${cliente.comuna || ''}${
                                                          cliente.comuna &&
                                                          cliente.ciudad
                                                              ? ', '
                                                              : ''
                                                      }${cliente.ciudad || ''}`
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge
                                                    variant={
                                                        cliente.activo
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                    className="px-1.5 py-0 text-[10px]"
                                                >
                                                    {cliente.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setViendo(cliente);
                                                            setIsViewOpen(true);
                                                        }}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleEdit(cliente)
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
                                                                cliente.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {clientesFiltrados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron clientes con
                                                los filtros aplicados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={clientes.links}
                            meta={
                                clientes.meta || {
                                    from: (clientes as any).from,
                                    to: (clientes as any).to,
                                    total: clientes.total,
                                }
                            }
                        />
                    </CardContent>
                </Card>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>
                                {editando ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid max-h-[calc(85vh-140px)] grid-cols-1 gap-3 overflow-y-auto px-1 md:grid-cols-2">
                                <div className="col-span-2 grid gap-2">
                                    <Label>Nombre / Razón Social</Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>RUT</Label>
                                    <Input
                                        value={data.rut}
                                        onChange={(e) =>
                                            setData('rut', e.target.value)
                                        }
                                        placeholder="12345678-9"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={data.telefono}
                                        onChange={(e) =>
                                            setData('telefono', e.target.value)
                                        }
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Acceso a Plataforma</Label>
                                    <div className="mt-2 flex items-center gap-2">
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
                                            className="cursor-pointer text-sm font-normal"
                                        >
                                            {editando
                                                ? data.crear_usuario
                                                    ? 'Mantener acceso activo'
                                                    : 'Activar acceso a la plataforma'
                                                : 'Crear acceso a la plataforma'}
                                        </Label>
                                    </div>
                                    <p className="text-[10px] leading-tight text-muted-foreground italic">
                                        {editando
                                            ? data.crear_usuario
                                                ? 'Al desactivar se eliminará el acceso del usuario'
                                                : 'El cliente podrá iniciar sesión con contraseña: cliente123'
                                            : 'El cliente podrá iniciar sesión con contraseña: cliente123'}
                                    </p>
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={data.direccion}
                                        onChange={(e) =>
                                            setData('direccion', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Comuna</Label>
                                    <Input
                                        value={data.comuna}
                                        onChange={(e) =>
                                            setData('comuna', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Ciudad</Label>
                                    <Input
                                        value={data.ciudad}
                                        onChange={(e) =>
                                            setData('ciudad', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label>Región</Label>
                                    <Input
                                        value={data.region}
                                        onChange={(e) =>
                                            setData('region', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label>Giro</Label>
                                    <Input
                                        value={data.giro}
                                        onChange={(e) =>
                                            setData('giro', e.target.value)
                                        }
                                        placeholder="Ej: Comercialización de productos"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Persona de Contacto</Label>
                                    <Input
                                        value={data.contacto}
                                        onChange={(e) =>
                                            setData('contacto', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Teléfono Contacto</Label>
                                    <Input
                                        value={data.telefono_contacto}
                                        onChange={(e) =>
                                            setData(
                                                'telefono_contacto',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label>Categoría</Label>
                                    <Select
                                        value={data.categoria_id}
                                        onValueChange={(v) =>
                                            setData('categoria_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categorias.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    <Check className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Vista Premium */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-none bg-white p-0 shadow-2xl">
                        <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                            {/* Fondo decorativo con gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 opacity-100" />
                            <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                                <Eye className="h-24 w-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-1 text-white">
                                <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                    Perfil del Cliente
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                    {viendo?.nombre}
                                </DialogTitle>
                                <DialogDescription className="text-lg font-medium text-blue-100/80">
                                    Ficha administrativa y datos de contacto.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        {viendo && (
                            <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(90vh-180px)] flex-col gap-6 overflow-y-auto px-8">
                                {/* Dashboard de estados rápidos */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[
                                        {
                                            label: 'RUT / ID',
                                            val:
                                                viendo.rut ||
                                                viendo.nit ||
                                                '---',
                                            color: 'border-blue-200 bg-blue-50 text-blue-800',
                                        },
                                        {
                                            label: 'Categoría',
                                            val:
                                                categorias.find(
                                                    (c) =>
                                                        c.id ===
                                                        viendo.categoria_id,
                                                )?.nombre || 'General',
                                            color: 'border-gray-200 bg-gray-50 text-gray-800',
                                        },
                                        {
                                            label: 'Estado',
                                            val: viendo.activo
                                                ? 'ACTIVO'
                                                : 'INACTIVO',
                                            color: viendo.activo
                                                ? 'border-green-200 bg-green-50 text-green-800'
                                                : 'border-red-200 bg-red-50 text-red-800',
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`group rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${item.color}`}
                                        >
                                            <p className="mb-1 text-[10px] font-extrabold tracking-wider uppercase opacity-70">
                                                {item.label}
                                            </p>
                                            <p className="truncate text-sm font-semibold uppercase">
                                                {item.val}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Información de Contacto */}
                                    <Card className="border-none bg-gray-50/50 shadow-sm">
                                        <CardHeader className="border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-md bg-blue-100 p-1.5 text-blue-700">
                                                    <Plus className="h-4 w-4" />
                                                </div>
                                                <CardTitle className="text-base font-bold text-gray-800">
                                                    Contacto Directo
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-4 p-5">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Correo Electrónico
                                                </Label>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {viendo.email}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Teléfono Principal
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {viendo.telefono ||
                                                            'Sin teléfono'}
                                                    </p>
                                                    <WhatsAppButton
                                                        phone={viendo.telefono}
                                                        nombre={viendo.nombre}
                                                    />
                                                </div>
                                            </div>
                                            {viendo.direccion && (
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        Dirección
                                                    </Label>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {viendo.direccion},{' '}
                                                        {viendo.comuna &&
                                                            `${viendo.comuna}, `}
                                                        {viendo.ciudad}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Información Fiscal / Adicional */}
                                    <div className="flex flex-col gap-6">
                                        <Card className="border-none bg-indigo-50/50 shadow-sm">
                                            <CardHeader className="border-b border-indigo-100 px-5 py-3">
                                                <CardTitle className="text-xs font-black tracking-widest text-indigo-700 uppercase">
                                                    Giro / Actividad
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-5 text-sm leading-relaxed font-medium text-indigo-900/70 italic">
                                                {viendo.giro ||
                                                    'Giro no especificado para este cliente.'}
                                            </CardContent>
                                        </Card>

                                        <Card className="border-none bg-amber-50/30 shadow-sm">
                                            <CardHeader className="border-b border-amber-100 px-5 py-3">
                                                <CardTitle className="text-xs font-black tracking-widest text-amber-700 uppercase">
                                                    Persona de Contacto
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-2 p-5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-amber-800/60">
                                                        Nombre
                                                    </span>
                                                    <span className="font-bold text-amber-900">
                                                        {viendo.contacto ||
                                                            '---'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-amber-800/60">
                                                        Teléfono
                                                    </span>
                                                    <span className="font-bold text-amber-900">
                                                        {viendo.telefono_contacto ||
                                                            '---'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {viendo.notas && (
                                    <Card className="border-none bg-gray-100/50 shadow-sm">
                                        <CardHeader className="border-b border-gray-200 px-5 py-3">
                                            <CardTitle className="text-xs font-black tracking-widest text-gray-500 uppercase">
                                                Observaciones
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-5 text-sm leading-relaxed text-gray-600">
                                            {viendo.notas}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <DialogFooter className="mt-4 border-t bg-gray-50 p-6">
                            <Button
                                variant="outline"
                                onClick={() => setIsViewOpen(false)}
                                className="w-full border-gray-200 px-10 font-bold shadow-sm transition-all hover:bg-white hover:text-primary active:scale-95 sm:w-auto"
                            >
                                Cerrar Ficha
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
