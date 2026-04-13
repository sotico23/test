import { Head, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Search, X } from 'lucide-react';
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
import { ModalShow } from '@/components/ui/ModalShow';
import AppLayout from '@/layouts/app-layout';
import { formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface Categoria {
    id: number;
    nombre: string;
}
interface Proveedor {
    id: number;
    nombre: string;
    nit: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    categoria_id: number | null;
    activo: boolean;
    notas: string | null;
    categoria?: Categoria;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proveedores', href: '/proveedors' },
];

export default function Index({
    proveedors,
    categorias,
}: {
    proveedors: {
        data: Proveedor[];
        links: any[];
        meta?: any;
        total: number;
    };
    categorias: Categoria[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Proveedor | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Proveedor | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        clearErrors,
    } = useForm({
        nombre: '',
        nit: '',
        telefono: '',
        email: '',
        direccion: '',
        categoria_id: '' as string,
        activo: true,
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria_id: '',
        activo: '',
    });

    const proveedoresFiltrados = useMemo(() => {
        return proveedors.data.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.nombre.toLowerCase().includes(busca) &&
                    !(p.nit || '').toLowerCase().includes(busca) &&
                    !(p.email || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.categoria_id &&
                p.categoria_id?.toString() !== filtros.categoria_id
            )
                return false;

            if (filtros.activo !== '') {
                const isActivo = filtros.activo === '1';
                if (p.activo !== isActivo) return false;
            }

            return true;
        });
    }, [proveedors, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            categoria_id: '',
            activo: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/proveedors/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                    clearErrors();
                },
            });
        else
            post('/proveedors', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
    };

    const handleEdit = (proveedor: Proveedor) => {
        clearErrors();
        setEditando(proveedor);
        setData({
            nombre: proveedor.nombre,
            nit: proveedor.nit || '',
            telefono: proveedor.telefono || '',
            email: proveedor.email || '',
            direccion: proveedor.direccion || '',
            categoria_id: proveedor.categoria_id?.toString() || '',
            activo: proveedor.activo,
            notas: proveedor.notas || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este proveedor?'))
            destroy(`/proveedors/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proveedores" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Proveedores</h1>
                    <Button
                        onClick={() => {
                            clearErrors();
                            setEditando(null);
                            reset();
                            setIsOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Proveedor
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Proveedores</CardTitle>
                        <CardDescription>
                            {proveedors.total} proveedores encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, RUT, email..."
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
                                value={filtros.categoria_id}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        categoria_id: e.target.value,
                                    })
                                }
                                className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filtros.activo}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        activo: e.target.value,
                                    })
                                }
                                className="flex h-9 rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todos los estados</option>
                                <option value="1">Activos</option>
                                <option value="0">Inactivos</option>
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
                                            Categoría
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
                                    {proveedoresFiltrados.map((proveedor) => (
                                        <tr
                                            key={proveedor.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 font-medium">
                                                <span
                                                    className="block max-w-[180px] truncate"
                                                    title={proveedor.nombre}
                                                >
                                                    {proveedor.nombre}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {proveedor.nit || '-'}
                                            </td>
                                            <td className="hidden px-4 py-2 sm:table-cell">
                                                <div className="flex items-center gap-1 text-sm">
                                                    {proveedor.telefono || '-'}
                                                    <WhatsAppButton
                                                        phone={
                                                            proveedor.telefono
                                                        }
                                                        nombre={
                                                            proveedor.nombre
                                                        }
                                                    />
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm md:table-cell">
                                                {proveedor.email || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {proveedor.categoria?.nombre ||
                                                    '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge
                                                    variant={
                                                        proveedor.activo
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                    className="px-1.5 py-0 text-[10px]"
                                                >
                                                    {proveedor.activo
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
                                                        onClick={() =>
                                                            handleEdit(
                                                                proveedor,
                                                            )
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
                                                                proveedor.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {proveedoresFiltrados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron proveedores
                                                con los filtros aplicados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={proveedors.links}
                            meta={
                                proveedors.meta || {
                                    from: (proveedors as any).from,
                                    to: (proveedors as any).to,
                                    total: proveedors.total,
                                }
                            }
                        />
                    </CardContent>
                </Card>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-2xl md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editando
                                    ? 'Editar Proveedor'
                                    : 'Nuevo Proveedor'}
                            </DialogTitle>
                            <DialogDescription>
                                {editando
                                    ? 'Modifique los datos del proveedor'
                                    : 'Ingrese los datos del nuevo proveedor'}
                            </DialogDescription>
                        </DialogHeader>
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                                <div className="text-sm text-red-700">
                                    <strong>
                                        Corrija los siguientes errores:
                                    </strong>
                                    <ul className="mt-1 list-disc pl-5">
                                        {Object.entries(errors).map(
                                            ([key, error]) => (
                                                <li key={key}>
                                                    {key}: {error as string}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>RUT</Label>
                                        <Input
                                            value={data.nit}
                                            onChange={(e) =>
                                                setData('nit', e.target.value)
                                            }
                                            placeholder="12345678-9"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={data.telefono}
                                            onChange={(e) =>
                                                setData(
                                                    'telefono',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={data.direccion}
                                        onChange={(e) =>
                                            setData('direccion', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
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
                            <DialogFooter>
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

                <ModalShow
                    isOpen={isViewOpen}
                    setIsOpen={setIsViewOpen}
                    item={viewing}
                    title="Proveedor"
                    badgeLabel="Detalle de Proveedor"
                    colorScheme="amber"
                    quickStats={[
                        {
                            label: 'NIT',
                            val: viewing?.nit || '---',
                            colorScheme: 'blue',
                        },
                        {
                            label: 'Categoría',
                            val:
                                categorias.find(
                                    (c) => c.id === viewing?.categoria_id,
                                )?.nombre || 'General',
                            colorScheme: 'purple',
                        },
                        {
                            label: 'Estado',
                            val: viewing?.activo ? 'ACTIVO' : 'INACTIVO',
                            colorScheme: viewing?.activo ? 'green' : 'rose',
                        },
                    ]}
                >
                    <Card className="border-none bg-gray-50/50 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-3">
                            <CardTitle className="text-base font-bold text-gray-800">
                                Información de Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 p-5">
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Teléfono
                                </Label>
                                <p className="font-medium">
                                    {viewing?.telefono || 'Sin teléfono'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Email
                                </Label>
                                <p className="font-medium">
                                    {viewing?.email || 'Sin email'}
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
                            <div className="col-span-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Notas
                                </Label>
                                <p className="font-medium">
                                    {viewing?.notas || 'Sin notas'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </ModalShow>
            </div>
        </AppLayout>
    );
}
