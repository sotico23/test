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
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Control {
    id: number;
    lote: string | null;
    producto: string | null;
    tipo: string | null;
    resultado: string | null;
    cantidad_muestra: number;
    cantidad_defectuosa: number;
    observaciones: string | null;
    fecha: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control de Calidad', href: '/calidad' },
];

const resultados = ['aprobado', 'rechazado', 'pendiente'];

import { BulkActions } from '@/components/shared/BulkActions';

export default function Index({
    controles,
}: {
    controles: {
        data: Control[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Control | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        lote: '',
        producto: '',
        tipo: '',
        resultado: 'pendiente',
        cantidad_muestra: 0,
        cantidad_defectuosa: 0,
        observaciones: '',
        fecha: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        resultado: '',
    });

    const controlesFiltrados = useMemo(() => {
        return controles.data.filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !(c.lote || '').toLowerCase().includes(busca) &&
                    !(c.producto || '').toLowerCase().includes(busca) &&
                    !(c.tipo || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.resultado && c.resultado !== filtros.resultado)
                return false;

            return true;
        });
    }, [controles.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            resultado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/calidad/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/calidad', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (c: Control) => {
        setEditando(c);
        setData({
            lote: c.lote || '',
            producto: c.producto || '',
            tipo: c.tipo || '',
            resultado: c.resultado || 'pendiente',
            cantidad_muestra: c.cantidad_muestra,
            cantidad_defectuosa: c.cantidad_defectuosa,
            observaciones: c.observaciones || '',
            fecha: c.fecha || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            lote: '',
            producto: '',
            tipo: '',
            resultado: 'pendiente',
            cantidad_muestra: 0,
            cantidad_defectuosa: 0,
            observaciones: '',
            fecha: new Date().toISOString().split('T')[0],
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/calidad/${id}`);
    };

    const getResultadoBadge = (r: string | null) => {
        const colores: Record<string, string> = {
            aprobado: 'bg-green-500',
            rechazado: 'bg-red-500',
            pendiente: 'bg-yellow-500',
        };
        return (
            <Badge className={colores[r || ''] || 'bg-gray-500'}>
                {r || '-'}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Control de Calidad" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Control de Calidad
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de calidad
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <BulkActions 
                                baseUrl="/calidad" 
                                modelName="Controles"
                                filters={{
                                    search: filtros.busqueda,
                                    resultado: filtros.resultado
                                }}
                            />
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Control
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Controles</CardTitle>
                            <CardDescription>
                                {controlesFiltrados.length} registros encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por lote, producto o tipo..."
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
                                    value={filtros.resultado}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            resultado: e.target.value,
                                        })
                                    }
                                    className="flex h-9 rounded-md border bg-background px-3 py-1 min-w-[150px]"
                                >
                                    <option value="">Todos los resultados</option>
                                    {resultados.map((r) => (
                                        <option key={r} value={r}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
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
                                                Lote / Producto
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Muestra / Def.
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Tipo / Fecha
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Resultado
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {controlesFiltrados.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-mono font-medium">
                                                        {c.lote || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                        {c.producto || ''}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    <div className="font-medium">
                                                        {c.cantidad_muestra}
                                                    </div>
                                                    <div className="text-[10px] text-destructive">
                                                        {c.cantidad_defectuosa} defectuosos
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-[10px] uppercase font-medium">
                                                        {c.tipo || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {formatDateCLP(c.fecha)}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getResultadoBadge(
                                                        c.resultado,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(c)
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
                                                                    c.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {controlesFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron registros con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                links={controles.links}
                                meta={controles.meta}
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Control
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Lote</Label>
                                    <Input
                                        value={data.lote}
                                        onChange={(e) =>
                                            setData('lote', e.target.value)
                                        }
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
                                    <Label>Tipo</Label>
                                    <Input
                                        value={data.tipo}
                                        onChange={(e) =>
                                            setData('tipo', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Resultado</Label>
                                    <select
                                        value={data.resultado}
                                        onChange={(e) =>
                                            setData('resultado', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {resultados.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cantidad Muestra</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.cantidad_muestra}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad_muestra',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Defectuosos</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.cantidad_defectuosa}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad_defectuosa',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={data.fecha}
                                    onChange={(e) =>
                                        setData('fecha', e.target.value)
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
        </>
    );
}
