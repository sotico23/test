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
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Nomina {
    id: number;
    periodo: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    total_bruto: number;
    total_deducciones: number;
    total_neto: number;
    estado: string;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Nómina', href: '/nominas' },
];

const estados = ['borrador', 'procesada', 'pagada'];

export default function Index({ nominas }: { nominas: { data: Nomina[]; links: any[]; from?: number; to?: number; total?: number; meta?: any } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Nomina | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        periodo: '',
        fecha_inicio: '',
        fecha_fin: '',
        total_bruto: 0,
        total_deducciones: 0,
        total_neto: 0,
        estado: 'borrador',
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const nominasFiltradas = useMemo(() => {
        return nominas.data.filter((n) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !(n.periodo || '').toLowerCase().includes(busca) &&
                    !(n.notas || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && n.estado !== filtros.estado) return false;

            return true;
        });
    }, [nominas.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/nominas/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/nominas', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (n: Nomina) => {
        setEditando(n);
        setData({
            periodo: n.periodo || '',
            fecha_inicio: n.fecha_inicio || '',
            fecha_fin: n.fecha_fin || '',
            total_bruto: n.total_bruto,
            total_deducciones: n.total_deducciones,
            total_neto: n.total_neto,
            estado: n.estado,
            notas: n.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            periodo: '',
            fecha_inicio: '',
            fecha_fin: '',
            total_bruto: 0,
            total_deducciones: 0,
            total_neto: 0,
            estado: 'borrador',
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/nominas/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            borrador: 'bg-gray-500',
            procesada: 'bg-blue-500',
            pagada: 'bg-green-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Nómina" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Nómina</h1>
                            <p className="text-muted-foreground">
                                Gestión de nóminas
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Nómina
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Nóminas</CardTitle>
                            <CardDescription>
                                {nominasFiltradas.length} períodos encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por período o notas..."
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
                                            {est.charAt(0).toUpperCase() + est.slice(1)}
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
                                                Período
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Bruto
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Deducciones
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Neto
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
                                        {nominasFiltradas.map((n) => (
                                            <tr
                                                key={n.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {n.periodo || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                        {n.notas || ''}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right text-muted-foreground">
                                                    {formatCurrencyCLP(n.total_bruto)}
                                                </td>
                                                <td className="py-2 text-right text-destructive/70">
                                                    {formatCurrencyCLP(n.total_deducciones)}
                                                </td>
                                                <td className="py-2 text-right font-bold text-primary">
                                                    {formatCurrencyCLP(n.total_neto)}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(
                                                        n.estado,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(n)
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
                                                                    n.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {nominasFiltradas.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron períodos con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination links={nominas.links} meta={nominas.meta || nominas} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} Nómina
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Período *</Label>
                                <Input
                                    value={data.periodo}
                                    onChange={(e) =>
                                        setData('periodo', e.target.value)
                                    }
                                    placeholder="2026-02"
                                    required
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Bruto</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.total_bruto}
                                        onChange={(e) =>
                                            setData(
                                                'total_bruto',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deducciones</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.total_deducciones}
                                        onChange={(e) =>
                                            setData(
                                                'total_deducciones',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Neto</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.total_neto}
                                        onChange={(e) =>
                                            setData(
                                                'total_neto',
                                                Number(e.target.value),
                                            )
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
