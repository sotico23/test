import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, X, Eye } from 'lucide-react';
import { ModalShow } from '@/components/ui/ModalShow';
import { useState } from 'react';
import { useMemo } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import type { BreadcrumbItem } from '@/types';

interface Ticket {
    id: number;
    titulo: string;
    descripcion: string | null;
    cliente_id: number | null;
    cliente?: { id: number; nombre: string } | null;
    producto_id: number | null;
    producto?: { id: number; nombre: string } | null;
    prioridad: string;
    estado: string;
    categoria: string | null;
    asignado_a: string | null;
}

interface Cliente {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tickets', href: '/tickets' },
];

const prioridades = ['baja', 'media', 'alta', 'critica'];
const estados = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];

export default function Index({
    tickets,
    clientes,
    productos,
}: {
    tickets: {
        data: Ticket[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
    clientes: Cliente[];
    productos: Producto[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Ticket | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Ticket | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        titulo: '',
        descripcion: '',
        cliente_id: '' as number | '',
        producto_id: '' as number | '',
        prioridad: 'media',
        estado: 'abierto',
        categoria: '',
        asignado_a: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        prioridad: '',
        estado: '',
    });

    const ticketsFiltrados = useMemo(() => {
        return tickets.data.filter((t: Ticket) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !t.titulo.toLowerCase().includes(busca) &&
                    !(t.descripcion || '').toLowerCase().includes(busca) &&
                    !(t.cliente?.nombre || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.prioridad && t.prioridad !== filtros.prioridad)
                return false;
            if (filtros.estado && t.estado !== filtros.estado) return false;

            return true;
        });
    }, [tickets.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            prioridad: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/tickets/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/tickets', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (t: Ticket) => {
        setEditando(t);
        setData({
            titulo: t.titulo,
            descripcion: t.descripcion || '',
            cliente_id: t.cliente_id || '',
            producto_id: t.producto_id || '',
            prioridad: t.prioridad,
            estado: t.estado,
            categoria: t.categoria || '',
            asignado_a: t.asignado_a || '',
        });
        setIsOpen(true);
    };

    const handleView = (t: Ticket) => {
        setViewing(t);
        setIsViewOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            titulo: '',
            descripcion: '',
            cliente_id: '',
            producto_id: '',
            prioridad: 'media',
            estado: 'abierto',
            categoria: '',
            asignado_a: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/tickets/${id}`);
    };

    const getPrioridadBadge = (p: string) => {
        const colores: Record<string, string> = {
            baja: 'bg-green-500',
            media: 'bg-yellow-500',
            alta: 'bg-orange-500',
            critica: 'bg-red-500',
        };
        return <Badge className={colores[p] || 'bg-gray-500'}>{p}</Badge>;
    };
    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            abierto: 'bg-blue-500',
            en_proceso: 'bg-yellow-500',
            pendiente: 'bg-purple-500',
            resuelto: 'bg-green-500',
            cerrado: 'bg-gray-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Tickets" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Tickets de Soporte
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de tickets y soporte
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>
                                {ticketsFiltrados.length} tickets encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por título, cliente, descripción..."
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
                                    value={filtros.prioridad}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            prioridad: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1 capitalize"
                                >
                                    <option value="">
                                        Todas las prioridades
                                    </option>
                                    {prioridades.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filtros.estado}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            estado: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1 capitalize"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((e) => (
                                        <option key={e} value={e}>
                                            {e.replace('_', ' ')}
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
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-2 text-left font-medium">
                                                Título
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Cliente
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Prioridad
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticketsFiltrados.map((t) => (
                                            <tr
                                                key={t.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 font-medium">
                                                    {t.titulo}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {t.cliente?.nombre || '-'}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getPrioridadBadge(
                                                        t.prioridad,
                                                    )}
                                                </td>
                                                <td className="py-2 text-center text-sm">
                                                    {getEstadoBadge(t.estado)}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(t)
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
                                                                    t.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {ticketsFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron tickets
                                                    con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={tickets.links}
                                    meta={tickets.meta}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Ticket
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    value={data.titulo}
                                    onChange={(e) =>
                                        setData('titulo', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Cliente</Label>
                                    <select
                                        value={data.cliente_id}
                                        onChange={(e) =>
                                            setData(
                                                'cliente_id',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : '',
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="">
                                            Seleccionar cliente
                                        </option>
                                        {clientes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Producto</Label>
                                    <select
                                        value={data.producto_id}
                                        onChange={(e) =>
                                            setData(
                                                'producto_id',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : '',
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="">
                                            Seleccionar producto
                                        </option>
                                        {productos.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Prioridad</Label>
                                    <select
                                        value={data.prioridad}
                                        onChange={(e) =>
                                            setData('prioridad', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {prioridades.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                            <div className="space-y-2">
                                <Label>Asignado a</Label>
                                <Input
                                    value={data.asignado_a}
                                    onChange={(e) =>
                                        setData('asignado_a', e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                />
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
                title="Ticket"
                badgeLabel="Detalle de Ticket"
                colorScheme="rose"
                quickStats={[
                    {
                        label: 'Prioridad',
                        val: viewing?.prioridad?.toUpperCase() || 'MEDIA',
                        colorScheme:
                            viewing?.prioridad === 'alta' ? 'orange' : 'blue',
                    },
                    {
                        label: 'Estado',
                        val: viewing?.estado?.toUpperCase() || 'ABIERTO',
                        colorScheme:
                            viewing?.estado === 'resuelto' ? 'green' : 'purple',
                    },
                    {
                        label: 'Categoría',
                        val: viewing?.categoria || 'General',
                        colorScheme: 'teal',
                    },
                ]}
            >
                <Card className="border-none bg-gray-50/50 shadow-sm">
                    <CardHeader className="border-b border-gray-100 pb-3">
                        <CardTitle className="text-base font-bold text-gray-800">
                            Descripción
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <p className="text-sm">
                            {viewing?.descripcion || 'Sin descripción'}
                        </p>
                    </CardContent>
                </Card>
            </ModalShow>
        </>
    );
}
