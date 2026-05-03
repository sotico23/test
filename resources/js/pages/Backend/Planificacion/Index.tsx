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
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Planificacion {
    id: number;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    proyecto_id: number | null;
    responsable_id: number | null;
    estado: string;
    prioridad: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Planificación', href: '/planificacion' },
];

const estados = ['pendiente', 'en_progreso', 'completado', 'cancelado'];
const prioridades = ['baja', 'media', 'alta', 'urgente'];

export default function Index({
    planificaciones,
}: {
    planificaciones: {
        data: Planificacion[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Planificacion | null>(null);
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
        fecha_inicio: '',
        fecha_fin: '',
        proyecto_id: '' as string,
        responsable_id: '' as string,
        estado: 'pendiente',
        prioridad: 'media',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const planificacionesFiltradas = useMemo(() => {
        return planificaciones.data.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.titulo.toLowerCase().includes(busca) &&
                    !(p.descripcion || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && p.estado !== filtros.estado) return false;

            return true;
        });
    }, [planificaciones.data, filtros]);

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
            proyecto_id: data.proyecto_id ? Number(data.proyecto_id) : null,
            responsable_id: data.responsable_id
                ? Number(data.responsable_id)
                : null,
        };
        if (editando) {
            put(`/planificacion/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/planificacion', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (p: Planificacion) => {
        setEditando(p);
        setData({
            titulo: p.titulo,
            descripcion: p.descripcion || '',
            fecha_inicio: p.fecha_inicio || '',
            fecha_fin: p.fecha_fin || '',
            proyecto_id: String(p.proyecto_id || ''),
            responsable_id: String(p.responsable_id || ''),
            estado: p.estado,
            prioridad: p.prioridad || 'media',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            titulo: '',
            descripcion: '',
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            proyecto_id: '',
            responsable_id: '',
            estado: 'pendiente',
            prioridad: 'media',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/planificacion/${id}`);
    };
    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            pendiente: 'bg-yellow-500',
            en_progreso: 'bg-blue-500',
            completado: 'bg-green-500',
            cancelado: 'bg-gray-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="Planificación" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Planificación
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de planificación
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Planificaciones</CardTitle>
                            <CardDescription>
                                {planificacionesFiltradas.length} registros
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por título o descripción..."
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
                                    {estados.map((e) => (
                                        <option key={e} value={e}>
                                            {e.replace('_', ' ').toUpperCase()}
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
                                                Título / Descripción
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Fechas
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
                                        {planificacionesFiltradas.map(
                                            (p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-b transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="py-2">
                                                        <div className="font-medium">
                                                            {p.titulo}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                                            {p.descripcion}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="text-[10px] font-medium">
                                                            Inicio:{' '}
                                                            {p.fecha_inicio
                                                                ? formatDateCLP(
                                                                    p.fecha_inicio,
                                                                )
                                                                : '-'}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            Fin:{' '}
                                                            {p.fecha_fin
                                                                ? formatDateCLP(
                                                                    p.fecha_fin,
                                                                )
                                                                : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        {getEstadoBadge(
                                                            p.estado,
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        p,
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
                                                                        p.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        {planificacionesFiltradas.length ===
                                            0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        No se encontraron
                                                        planificaciones con los
                                                        filtros aplicados
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                links={planificaciones.links}
                                meta={planificaciones.meta}
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} Planificación
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
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
