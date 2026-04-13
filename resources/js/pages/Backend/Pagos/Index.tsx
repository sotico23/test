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
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Pago {
    id: number;
    factura_id: number | null;
    proveedor_id: number | null;
    monto: number;
    fecha_pago: string | null;
    metodo_pago: string | null;
    referencia: string | null;
    estado: string;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pagos', href: '/pagos' },
];

const estados = ['pendiente', 'pagado', 'rechazado', 'cancelado'];
const metodos = ['efectivo', 'transferencia', 'cheque', 'tarjeta', 'deposito'];

export default function Index({
    pagos,
}: {
    pagos: {
        data: Pago[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Pago | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Pago | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        factura_id: '' as string,
        proveedor_id: '' as string,
        monto: 0,
        fecha_pago: '',
        metodo_pago: '',
        referencia: '',
        estado: 'pendiente',
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
        metodo: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const pagosFiltrados = useMemo(() => {
        return pagos.data.filter((p: Pago) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !(p.referencia || '').toLowerCase().includes(busca) &&
                    !(p.notas || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && p.estado !== filtros.estado) return false;
            if (filtros.metodo && p.metodo_pago !== filtros.metodo)
                return false;
            if (
                filtros.fechaDesde &&
                p.fecha_pago &&
                p.fecha_pago < filtros.fechaDesde
            )
                return false;
            if (
                filtros.fechaHasta &&
                p.fecha_pago &&
                p.fecha_pago > filtros.fechaHasta
            )
                return false;

            return true;
        });
    }, [pagos.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
            metodo: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const handleView = (p: Pago) => {
        setViewing(p);
        setIsViewOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            factura_id: data.factura_id ? Number(data.factura_id) : null,
            proveedor_id: data.proveedor_id ? Number(data.proveedor_id) : null,
        };
        if (editando) {
            put(`/pagos/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/pagos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (p: Pago) => {
        setEditando(p);
        setData({
            factura_id: String(p.factura_id || ''),
            proveedor_id: String(p.proveedor_id || ''),
            monto: p.monto,
            fecha_pago: p.fecha_pago || '',
            metodo_pago: p.metodo_pago || '',
            referencia: p.referencia || '',
            estado: p.estado,
            notas: p.notas || '',
        });
        setIsOpen(true);
    };
    const handleNew = () => {
        reset();
        setData({
            factura_id: '',
            proveedor_id: '',
            monto: 0,
            fecha_pago: new Date().toISOString().split('T')[0],
            metodo_pago: 'efectivo',
            referencia: '',
            estado: 'pendiente',
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/pagos/${id}`);
    };
    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            pendiente: 'bg-yellow-500',
            pagado: 'bg-green-500',
            rechazado: 'bg-red-500',
            cancelado: 'bg-gray-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="Pagos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pagos</h1>
                            <p className="text-muted-foreground">
                                Gestión de pagos
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pagos</CardTitle>
                            <CardDescription>
                                {pagosFiltrados.length} registros encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por referencia o notas..."
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
                                    value={filtros.metodo}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            metodo: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los métodos</option>
                                    {metodos.map((m) => (
                                        <option key={m} value={m}>
                                            {m.charAt(0).toUpperCase() +
                                                m.slice(1)}
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
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((est) => (
                                        <option key={est} value={est}>
                                            {est.charAt(0).toUpperCase() +
                                                est.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={filtros.fechaDesde}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                fechaDesde: e.target.value,
                                            })
                                        }
                                        className="h-9 w-[130px]"
                                    />
                                    <span className="text-muted-foreground">
                                        -
                                    </span>
                                    <Input
                                        type="date"
                                        value={filtros.fechaHasta}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                fechaHasta: e.target.value,
                                            })
                                        }
                                        className="h-9 w-[130px]"
                                    />
                                </div>
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
                                            <th className="py-2 text-right font-medium">
                                                Monto
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Fecha Pago
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Método / Ref.
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
                                        {pagosFiltrados.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2 text-right font-bold text-green-600">
                                                    {formatCurrencyCLP(p.monto)}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                                                    {formatDateCLP(
                                                        p.fecha_pago,
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-[10px] font-medium whitespace-nowrap uppercase">
                                                        {p.metodo_pago || '-'}
                                                    </div>
                                                    <div className="max-w-[150px] truncate text-[10px] text-muted-foreground">
                                                        {p.referencia || ''}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(p.estado)}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleView(p)
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(p)
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
                                        ))}
                                        {pagosFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron pagos con
                                                    los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={pagos.links}
                                    meta={pagos.meta}
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
                            {editando ? 'Editar' : 'Nuevo'} Pago
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Monto *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.monto}
                                        onChange={(e) =>
                                            setData(
                                                'monto',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Pago</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_pago}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_pago',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Método</Label>
                                    <select
                                        value={data.metodo_pago}
                                        onChange={(e) =>
                                            setData(
                                                'metodo_pago',
                                                e.target.value,
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {metodos.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
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
                                <Label>Referencia</Label>
                                <Input
                                    value={data.referencia}
                                    onChange={(e) =>
                                        setData('referencia', e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notas</Label>
                                <Input
                                    value={data.notas}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
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
                title="Pago"
                badgeLabel="Detalle de Pago"
                colorScheme="orange"
                quickStats={[
                    {
                        label: 'Estado',
                        val: viewing?.estado?.toUpperCase() || 'PENDIENTE',
                        colorScheme:
                            viewing?.estado === 'pagado' ? 'green' : 'rose',
                    },
                    {
                        label: 'Método',
                        val: viewing?.metodo_pago?.toUpperCase() || '---',
                        colorScheme: 'blue',
                    },
                    {
                        label: 'Fecha',
                        val: viewing?.fecha_pago
                            ? new Date(viewing.fecha_pago).toLocaleDateString(
                                  'es-CL',
                              )
                            : '---',
                        colorScheme: 'purple',
                    },
                ]}
            >
                <Card className="border-none bg-gray-50/50 shadow-sm">
                    <CardHeader className="border-b border-gray-100 pb-3">
                        <CardTitle className="text-base font-bold text-gray-800">
                            Detalles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-5">
                        <div className="col-span-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                Referencia
                            </Label>
                            <p className="font-medium">
                                {viewing?.referencia || 'Sin referencia'}
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
        </>
    );
}
