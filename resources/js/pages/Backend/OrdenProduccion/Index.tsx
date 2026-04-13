import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, X } from 'lucide-react';
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

interface Orden {
    id: number;
    numero: string;
    producto: string | null;
    cantidad: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    progreso: number;
    estado: string;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Órdenes de Producción', href: '/ordenes-produccion' },
];

const estados = ['pendiente', 'en_proceso', 'completado', 'cancelado'];

export default function Index({
    ordenes,
}: {
    ordenes: {
        data: Orden[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Orden | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        numero: '',
        producto: '',
        cantidad: 1,
        fecha_inicio: '',
        fecha_fin: '',
        progreso: 0,
        estado: 'pendiente',
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const ordenesFiltradas = useMemo(() => {
        return ordenes.data.filter((o) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !o.numero.toLowerCase().includes(busca) &&
                    !(o.producto || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && o.estado !== filtros.estado) return false;

            return true;
        });
    }, [ordenes.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const generarNumero = () => `OP-${Date.now().toString().slice(-6)}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/ordenes-produccion/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/ordenes-produccion', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (o: Orden) => {
        setEditando(o);
        setData({
            numero: o.numero,
            producto: o.producto || '',
            cantidad: o.cantidad,
            fecha_inicio: o.fecha_inicio || '',
            fecha_fin: o.fecha_fin || '',
            progreso: o.progreso,
            estado: o.estado,
            notas: o.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            numero: generarNumero(),
            producto: '',
            cantidad: 1,
            fecha_inicio: '',
            fecha_fin: '',
            progreso: 0,
            estado: 'pendiente',
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/ordenes-produccion/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            pendiente: 'bg-yellow-500',
            en_proceso: 'bg-blue-500',
            completado: 'bg-green-500',
            cancelado: 'bg-red-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Órdenes de Producción" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Órdenes de Producción
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de producción
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Orden
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes</CardTitle>
                            <CardDescription>
                                {ordenesFiltradas.length} órdenes encontradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por número o producto..."
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
                                    className="flex h-9 rounded-md border bg-background px-3 py-1 min-w-[150px]"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((est) => (
                                        <option key={est} value={est}>
                                            {est.replace('_', ' ').charAt(0).toUpperCase() + est.replace('_', ' ').slice(1)}
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
                                                Número
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Producto
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Cantidad
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Progreso
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
                                        {ordenesFiltradas.map((o) => (
                                            <tr
                                                key={o.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2 font-mono text-muted-foreground">
                                                    {o.numero}
                                                </td>
                                                <td className="py-2 font-medium">
                                                    {o.producto || '-'}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {o.cantidad}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${o.progreso}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground w-6">
                                                            {o.progreso}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(
                                                        o.estado,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(o)
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
                                                                    o.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {ordenesFiltradas.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron órdenes con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                links={ordenes.links}
                                meta={ordenes.meta}
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} Orden
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Número *</Label>
                                    <Input
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData('numero', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Producto</Label>
                                    <Input
                                        value={data.producto}
                                        onChange={(e) =>
                                            setData('producto', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.cantidad}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Progreso %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progreso}
                                        onChange={(e) =>
                                            setData(
                                                'progreso',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Inicio</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_inicio}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_inicio',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Fin</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_fin}
                                        onChange={(e) =>
                                            setData('fecha_fin', e.target.value)
                                        }
                                    />
                                </div>
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
        </>
    );
}
