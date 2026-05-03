import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Download,
    Upload,
} from 'lucide-react';
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
import { BulkActions } from '@/components/shared/BulkActions';
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Impuesto {
    id: number;
    nombre: string;
    codigo: string | null;
    tasa: number;
    tipo: string | null;
    descripcion: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Impuestos', href: '/impuestos' },
];

const estados = ['activo', 'inactivo', 'pendiente'];
const tipos = ['fijo', 'porcentaje', 'variable'];

export default function Index({
    impuestos,
}: {
    impuestos: {
        data: Impuesto[];
        links: any[];
        from?: number;
        to?: number;
        total?: number;
        meta?: any;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Impuesto | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        codigo: '',
        tasa: 0,
        tipo: 'porcentaje',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const impuestosFiltrados = useMemo(() => {
        return impuestos.data.filter((i) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !i.nombre.toLowerCase().includes(busca) &&
                    !(i.codigo || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && i.estado !== filtros.estado) return false;

            return true;
        });
    }, [impuestos.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/impuestos/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/impuestos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (i: Impuesto) => {
        setEditando(i);
        setData({
            nombre: i.nombre,
            codigo: i.codigo || '',
            tasa: i.tasa,
            tipo: i.tipo || 'porcentaje',
            descripcion: i.descripcion || '',
            fecha_inicio: i.fecha_inicio || '',
            fecha_fin: i.fecha_fin || '',
            estado: i.estado,
        });
        setIsOpen(true);
    };
    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            codigo: '',
            tasa: 0,
            tipo: 'porcentaje',
            descripcion: '',
            fecha_inicio: '',
            fecha_fin: '',
            estado: 'activo',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/impuestos/${id}`);
    };
    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            activo: 'bg-green-500',
            inactivo: 'bg-gray-500',
            pendiente: 'bg-yellow-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="Impuestos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Impuestos</h1>
                            <p className="text-muted-foreground">
                                Gestión de impuestos
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo
                            </Button>
                            <BulkActions
                                baseUrl="/impuestos"
                                filters={{}}
                                modelName="Impuestos"
                            />
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Impuestos</CardTitle>
                            <CardDescription>
                                {impuestosFiltrados.length} registros
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o código..."
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
                                    {estados.map((e) => (
                                        <option key={e} value={e}>
                                            {e.toUpperCase()}
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
                                            <th className="py-3 text-left font-medium">
                                                Nombre / Código
                                            </th>
                                            <th className="py-3 text-right font-medium">
                                                Tasa
                                            </th>
                                            <th className="py-3 text-left font-medium">
                                                Tipo
                                            </th>
                                            <th className="py-3 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="py-3 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {impuestosFiltrados.map((i) => (
                                            <tr
                                                key={i.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-3">
                                                    <div className="font-medium">
                                                        {i.nombre}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {i.codigo || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right font-bold text-primary">
                                                    {i.tasa}%
                                                </td>
                                                <td className="py-3">
                                                    <div className="text-[10px] font-medium uppercase">
                                                        {i.tipo || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    {getEstadoBadge(i.estado)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(i)
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
                                                                    i.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {impuestosFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron impuestos
                                                    con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={impuestos.links}
                                    meta={impuestos.meta || impuestos}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Impuesto
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Código</Label>
                                    <Input
                                        value={data.codigo}
                                        onChange={(e) =>
                                            setData('codigo', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Tasa *</Label>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={data.tasa}
                                        onChange={(e) =>
                                            setData(
                                                'tasa',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <select
                                        value={data.tipo}
                                        onChange={(e) =>
                                            setData('tipo', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {tipos.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <Label>Descripción</Label>
                                <Input
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
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
