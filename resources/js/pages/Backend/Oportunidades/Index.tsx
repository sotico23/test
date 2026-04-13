import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Eye, Search, X } from 'lucide-react';
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
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Cliente {
    id: number;
    nombre: string;
    telefono: string | null;
}
interface Oportunidad {
    id: number;
    nombre: string;
    cliente_id: number;
    valor: number;
    etapa: string;
    probabilidad: number;
    fecha_cierre_estimada: string | null;
    descripcion: string | null;
    cliente?: Cliente;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Oportunidades', href: '/oportunidades' },
];

const etapas = [
    { value: 'prospecting', label: 'Prospección' },
    { value: 'qualification', label: 'Calificación' },
    { value: 'proposal', label: 'Propuesta' },
    { value: 'negotiation', label: 'Negociación' },
    { value: 'closed_won', label: 'Cerrada Ganada' },
    { value: 'closed_lost', label: 'Cerrada Perdida' },
];

const etapasMap: Record<string, string> = {
    prospecting: 'Prospección',
    qualification: 'Calificación',
    proposal: 'Propuesta',
    negotiation: 'Negociación',
    closed_won: 'Cerrada Ganada',
    closed_lost: 'Cerrada Perdida',
};

import Pagination from '@/components/ui/Pagination';

export default function Index({
    oportunidades,
    clientes,
}: {
    oportunidades: {
        data: Oportunidad[];
        links: { url: string | null; label: string; active: boolean }[];
        meta: { from: number; to: number; total: number };
    };
    clientes: Cliente[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viendo, setViendo] = useState<Oportunidad | null>(null);
    const [editando, setEditando] = useState<Oportunidad | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        clearErrors,
        errors,
        transform,
    } = useForm({
        nombre: '',
        cliente_id: '' as string,
        valor: 0,
        etapa: 'prospecting',
        probabilidad: 10,
        fecha_cierre_estimada: '',
        descripcion: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        cliente_id: '',
        etapa: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const oportunidadesFiltradas = useMemo(() => {
        return oportunidades.data.filter((op: Oportunidad) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !op.nombre.toLowerCase().includes(busca) &&
                    !op.cliente?.nombre.toLowerCase().includes(busca) &&
                    !op.descripcion?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.cliente_id &&
                op.cliente_id.toString() !== filtros.cliente_id
            )
                return false;
            if (filtros.etapa && op.etapa !== filtros.etapa) return false;
            if (
                filtros.fechaDesde &&
                op.fecha_cierre_estimada &&
                op.fecha_cierre_estimada < filtros.fechaDesde
            )
                return false;
            if (
                filtros.fechaHasta &&
                op.fecha_cierre_estimada &&
                op.fecha_cierre_estimada > filtros.fechaHasta
            )
                return false;
            return true;
        });
    }, [oportunidades.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            cliente_id: '',
            etapa: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data: any) => ({
            ...data,
            cliente_id: Number(data.cliente_id),
            valor: Math.round(Number(data.valor) || 0),
            probabilidad: Math.round(Number(data.probabilidad) || 0),
        }));

        if (editando) {
            put(`/oportunidades/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                    setEditando(null);
                },
            });
        } else {
            post('/oportunidades', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        }
    };

    const handleEdit = (op: Oportunidad) => {
        clearErrors();
        setEditando(op);
        setData({
            nombre: op.nombre,
            cliente_id: String(op.cliente_id),
            valor: op.valor,
            etapa: op.etapa,
            probabilidad: op.probabilidad,
            fecha_cierre_estimada: op.fecha_cierre_estimada
                ? op.fecha_cierre_estimada.substring(0, 10)
                : '',
            descripcion: op.descripcion || '',
        });
        setIsOpen(true);
    };

    const handleView = (op: Oportunidad) => {
        setViendo(op);
        setIsViewOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/oportunidades/${id}`);
    };

    const getEtapaBadge = (etapa: string) => {
        const colores: Record<string, string> = {
            prospecting: 'bg-blue-500',
            qualification: 'bg-yellow-500',
            proposal: 'bg-purple-500',
            negotiation: 'bg-orange-500',
            closed_won: 'bg-green-500',
            closed_lost: 'bg-red-500',
        };
        return (
            <Badge className={colores[etapa] || 'bg-gray-500'}>
                {etapasMap[etapa] || etapa}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Oportunidades" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Oportunidades
                            </h1>
                            <p className="text-muted-foreground">
                                Pipeline de ventas
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                clearErrors();
                                setEditando(null);
                                reset();
                                setIsOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Nueva Oportunidad
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Oportunidades</CardTitle>
                            <CardDescription>
                                {oportunidadesFiltradas.length} oportunidades
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar..."
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
                                    value={filtros.cliente_id}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            cliente_id: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los clientes</option>
                                    {clientes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filtros.etapa}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            etapa: e.target.value,
                                        })
                                    }
                                    className="flex h-9 rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todas las etapas</option>
                                    {etapas.map((e) => (
                                        <option key={e.value} value={e.value}>
                                            {e.label}
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
                            {oportunidadesFiltradas.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    No hay oportunidades
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="text-sm">
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                                    Oportunidad
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                                    Cliente
                                                </th>
                                                <th className="hidden px-4 py-3 text-left font-medium whitespace-nowrap sm:table-cell">
                                                    Teléfono
                                                </th>
                                                <th className="hidden px-4 py-3 text-right font-medium whitespace-nowrap md:table-cell">
                                                    Valor
                                                </th>
                                                <th className="hidden px-4 py-3 text-center font-medium whitespace-nowrap lg:table-cell">
                                                    Progreso
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {oportunidadesFiltradas.map(
                                                (op) => (
                                                    <tr
                                                        key={op.id}
                                                        className="border-b transition-colors hover:bg-muted/30"
                                                    >
                                                        <td className="px-4 py-2 font-medium">
                                                            <span
                                                                className="block max-w-[150px] truncate"
                                                                title={
                                                                    op.nombre
                                                                }
                                                            >
                                                                {op.nombre}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-sm">
                                                            <span
                                                                className="block max-w-[150px] truncate"
                                                                title={
                                                                    op.cliente
                                                                        ?.nombre
                                                                }
                                                            >
                                                                {op.cliente
                                                                    ?.nombre || (
                                                                    <span className="text-muted-foreground">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="hidden px-4 py-2 sm:table-cell">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                {op.cliente
                                                                    ?.telefono || (
                                                                    <span className="text-muted-foreground">
                                                                        -
                                                                    </span>
                                                                )}
                                                                <WhatsAppButton
                                                                    phone={
                                                                        op
                                                                            .cliente
                                                                            ?.telefono
                                                                    }
                                                                    nombre={
                                                                        op
                                                                            .cliente
                                                                            ?.nombre
                                                                    }
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-4 py-2 text-right text-sm font-bold text-green-700 md:table-cell">
                                                            {formatCurrencyCLP(
                                                                op.valor,
                                                            )}
                                                        </td>
                                                        <td className="hidden px-4 py-2 lg:table-cell">
                                                            <div className="flex flex-col items-center justify-center gap-0.5">
                                                                {getEtapaBadge(
                                                                    op.etapa,
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {
                                                                        op.probabilidad
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() =>
                                                                        handleView(
                                                                            op,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            op,
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
                                                                            op.id,
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
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Pagination
                        links={oportunidades.links}
                        meta={oportunidades.meta}
                    />
                </div>
            </AppLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-x-hidden overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} Oportunidad
                        </DialogTitle>
                        <DialogDescription>
                            {editando
                                ? 'Modifique los datos de la oportunidad'
                                : 'Ingrese los datos de la nueva oportunidad'}
                        </DialogDescription>
                    </DialogHeader>
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="text-sm text-red-700">
                                <strong>Corrija los siguientes errores:</strong>
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
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nombre de la Oportunidad *</Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.nombre && (
                                        <p className="text-xs text-destructive">
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Cliente *</Label>
                                    <select
                                        value={data.cliente_id}
                                        onChange={(e) =>
                                            setData(
                                                'cliente_id',
                                                e.target.value,
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                        required
                                    >
                                        <option value="">Seleccionar</option>
                                        {clientes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cliente_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.cliente_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Valor estimado</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.valor}
                                        onChange={(e) =>
                                            setData(
                                                'valor',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.valor && (
                                        <p className="text-xs text-destructive">
                                            {errors.valor}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Probabilidad %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.probabilidad}
                                        onChange={(e) =>
                                            setData(
                                                'probabilidad',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.probabilidad && (
                                        <p className="text-xs text-destructive">
                                            {errors.probabilidad}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Etapa</Label>
                                    <select
                                        value={data.etapa}
                                        onChange={(e) =>
                                            setData('etapa', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    >
                                        {etapas.map((e) => (
                                            <option
                                                key={e.value}
                                                value={e.value}
                                            >
                                                {e.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.etapa && (
                                        <p className="text-xs text-destructive">
                                            {errors.etapa}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha de Cierre Estimada</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_cierre_estimada}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_cierre_estimada',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.fecha_cierre_estimada && (
                                        <p className="text-xs text-destructive">
                                            {errors.fecha_cierre_estimada}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label>Notas y Descripción</Label>
                                    <Input
                                        value={data.descripcion}
                                        onChange={(e) =>
                                            setData(
                                                'descripcion',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.descripcion && (
                                        <p className="text-xs text-destructive">
                                            {errors.descripcion}
                                        </p>
                                    )}
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
                            <Button type="submit">Guardar Oportunidad</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {viendo && (
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden border-none bg-white p-0 shadow-xl">
                        <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-800 to-teal-950 opacity-100" />
                            <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                                <Eye className="h-24 w-24 rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-1 text-white">
                                <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                    Detalle de Oportunidad
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                                    {viendo.nombre}
                                </DialogTitle>
                                <DialogDescription className="text-lg font-medium text-green-100/80">
                                    Gestión y seguimiento comercial.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(85vh)] flex-col gap-6 overflow-y-auto px-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getEtapaBadge(viendo.etapa)}
                                </div>
                            </div>
                            <div className="grid gap-4 text-sm">
                                <div className="space-y-3 rounded-lg border bg-muted/30 p-4 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-semibold text-muted-foreground">
                                            Cliente:
                                        </span>
                                        <span>
                                            {viendo.cliente?.nombre || '-'}
                                        </span>

                                        <span className="font-semibold text-muted-foreground">
                                            Teléfono:
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {viendo.cliente?.telefono || (
                                                <span className="text-muted-foreground">
                                                    Sin teléfono
                                                </span>
                                            )}
                                            <WhatsAppButton
                                                phone={viendo.cliente?.telefono}
                                                nombre={viendo.cliente?.nombre}
                                            />
                                        </div>

                                        <span className="font-semibold text-muted-foreground">
                                            Progreso:
                                        </span>
                                        <span>
                                            {viendo.probabilidad}% completado
                                        </span>

                                        <span className="font-semibold text-muted-foreground">
                                            Valor Estimado:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrencyCLP(viendo.valor)}
                                        </span>

                                        <span className="font-semibold text-muted-foreground">
                                            Fecha Estimada de Cierre:
                                        </span>
                                        <span>
                                            {formatDateCLP(
                                                viendo.fecha_cierre_estimada,
                                            )}
                                        </span>
                                    </div>
                                    {viendo.descripcion && (
                                        <div className="mt-2 w-full overflow-hidden border-t pt-2">
                                            <span className="mb-1 block font-semibold text-muted-foreground">
                                                Descripción y Notas:
                                            </span>
                                            <p className="break-all whitespace-pre-wrap text-foreground">
                                                {viendo.descripcion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4 flex flex-row justify-end space-x-2 border-t bg-gray-50 p-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsViewOpen(false);
                                    handleEdit(viendo);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </Button>
                            <Button onClick={() => setIsViewOpen(false)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
