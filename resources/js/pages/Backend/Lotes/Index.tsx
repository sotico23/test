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

interface Lote {
    id: number;
    numero_lote: string;
    producto_id: number | null;
    cantidad: number;
    fecha_produccion: string | null;
    fecha_vencimiento: string | null;
    estado: string;
    almacen_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Lotes', href: '/lotes' },
];

const estados = ['activo', 'agotado', 'vencido', 'en_proceso', 'cancelado'];

export default function Index({ lotes }: { lotes: { data: Lote[]; links: any[]; from?: number; to?: number; total?: number; meta?: any } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Lote | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        numero_lote: '',
        producto_id: '' as string,
        cantidad: 0,
        fecha_produccion: '',
        fecha_vencimiento: '',
        estado: 'activo',
        almacen_id: '' as string,
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const lotesFiltrados = useMemo(() => {
        return lotes.data.filter((l) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (!l.numero_lote.toLowerCase().includes(busca)) {
                    return false;
                }
            }
            if (filtros.estado && l.estado !== filtros.estado) return false;

            return true;
        });
    }, [lotes.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            producto_id: data.producto_id ? Number(data.producto_id) : null,
            almacen_id: data.almacen_id ? Number(data.almacen_id) : null,
        };
        if (editando) {
            put(`/lotes/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/lotes', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (l: Lote) => {
        setEditando(l);
        setData({
            numero_lote: l.numero_lote,
            producto_id: String(l.producto_id || ''),
            cantidad: l.cantidad,
            fecha_produccion: l.fecha_produccion || '',
            fecha_vencimiento: l.fecha_vencimiento || '',
            estado: l.estado,
            almacen_id: String(l.almacen_id || ''),
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            numero_lote: `LOTE-${Date.now().toString().slice(-6)}`,
            producto_id: '',
            cantidad: 0,
            fecha_produccion: new Date().toISOString().split('T')[0],
            fecha_vencimiento: '',
            estado: 'activo',
            almacen_id: '',
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/lotes/${id}`);
    };

    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            activo: 'bg-green-500',
            agotado: 'bg-red-500',
            vencido: 'bg-orange-500',
            en_proceso: 'bg-blue-500',
            cancelado: 'bg-gray-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="Lotes" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Lotes</h1>
                            <p className="text-muted-foreground">
                                Gestión de lotes de inventario
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lotes</CardTitle>
                            <CardDescription>
                                {lotesFiltrados.length} registros encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por número de lote..."
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
                                                Número Lote
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Cantidad
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Producción
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Vencimiento
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
                                        {lotesFiltrados.map((l) => (
                                            <tr
                                                key={l.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2 font-mono text-muted-foreground">
                                                    {l.numero_lote}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {l.cantidad}
                                                </td>
                                                <td className="py-2">
                                                    {l.fecha_produccion
                                                        ? new Date(
                                                            l.fecha_produccion,
                                                        ).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="py-2">
                                                    {l.fecha_vencimiento
                                                        ? new Date(
                                                            l.fecha_vencimiento,
                                                        ).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(
                                                        l.estado,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(l)
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
                                                                    l.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {lotesFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron lotes con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination links={lotes.links} meta={lotes.meta || lotes} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout >
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Lote
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Número Lote *</Label>
                                <Input
                                    value={data.numero_lote}
                                    onChange={(e) =>
                                        setData('numero_lote', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cantidad *</Label>
                                    <Input
                                        type="number"
                                        value={data.cantidad}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Producción</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_produccion}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_produccion',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Vencimiento</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_vencimiento}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_vencimiento',
                                                e.target.value,
                                            )
                                        }
                                    />
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
        </>
    );
}
