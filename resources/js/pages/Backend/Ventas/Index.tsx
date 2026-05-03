import { Head, useForm, router } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Search, X, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
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
import Pagination from '@/components/ui/Pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Cliente {
    id: number;
    nombre: string;
    telefono?: string;
}
interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    precio_venta: number;
}
interface DetalleVenta {
    id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    producto?: Producto;
}
interface Venta {
    id: number;
    numero_factura: string;
    cliente_id: number;
    fecha: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: 'pendiente' | 'pagada' | 'cancelada';
    notas: string | null;
    cliente?: Cliente;
    detalleVentas?: DetalleVenta[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/ventas' },
];

export default function Index({
    ventas,
    clientes,
    productos,
}: {
    ventas: {
        data: Venta[];
        links: any[];
        meta?: any;
        total: number;
    };
    clientes: Cliente[];
    productos: Producto[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Venta | null>(null);
    const [verModalOpen, setVerModalOpen] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(
        null,
    );
    const [filtros, setFiltros] = useState({
        busqueda: '',
        cliente_id: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const ventasFiltradas = useMemo(() => {
        return ventas.data.filter((v) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !v.numero_factura?.toLowerCase().includes(busca) &&
                    !v.cliente?.nombre?.toLowerCase().includes(busca) &&
                    !v.notas?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.cliente_id &&
                filtros.cliente_id !== 'all' &&
                v.cliente_id.toString() !== filtros.cliente_id
            )
                return false;
            if (
                filtros.estado &&
                filtros.estado !== 'all' &&
                v.estado !== filtros.estado
            )
                return false;
            if (filtros.fechaDesde && v.fecha < filtros.fechaDesde)
                return false;
            if (filtros.fechaHasta && v.fecha > filtros.fechaHasta)
                return false;
            return true;
        });
    }, [ventas, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            cliente_id: '',
            estado: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams(filtros);
        window.location.href = `/ventas/export?${params.toString()}`;
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams(filtros);
        window.location.href = `/ventas/export-excel?${params.toString()}`;
    };

    const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        router.post('/ventas/import', formData, {
            onSuccess: () => {
                alert('Importación completada');
            },
            onError: (err) => {
                console.error(err);
                alert('Error al importar: ' + Object.values(err)[0]);
            },
        });
    };

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        transform,
    } = useForm({
        numero_factura: '',
        cliente_id: '' as string,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente' as 'pendiente' | 'pagada' | 'cancelada',
        notas: '',
        productos: [] as {
            producto_id: string;
            cantidad: number;
            precio_unitario: number;
        }[],
    });

    const calcularTotales = useMemo(() => {
        let subtotal = 0;
        data.productos.forEach((p) => {
            const producto = productos.find(
                (prod) => prod.id === Number(p.producto_id),
            );
            const precio = Math.round(
                producto?.precio_venta || p.precio_unitario || 0,
            );
            subtotal += Math.round(p.cantidad * precio);
        });
        const iva = Math.round(subtotal * 0.19);
        const total = subtotal + iva;
        return { subtotal, iva, total };
    }, [data.productos, productos]);

    const addProducto = () => {
        setData('productos', [
            ...data.productos,
            { producto_id: '', cantidad: 1, precio_unitario: 0 },
        ]);
    };

    const updateProducto = (
        index: number,
        field: string,
        value: string | number,
    ) => {
        const updated = [...data.productos];
        (updated[index] as any)[field] = value;

        if (field === 'producto_id') {
            const producto = productos.find((p) => p.id === Number(value));
            if (producto) {
                updated[index].precio_unitario = producto.precio_venta;
            }
        }

        setData('productos', updated);
    };

    const removeProducto = (index: number) => {
        setData(
            'productos',
            data.productos.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { subtotal, iva, total } = calcularTotales;

        // Use Inertia's transform to modify data before sending
        const transformData = (data: any) => ({
            ...data,
            cliente_id: Number(data.cliente_id),
            subtotal,
            iva,
            total,
            productos: data.productos.map((p: any) => ({
                producto_id: Number(p.producto_id),
                cantidad: p.cantidad,
                precio_unitario: p.precio_unitario,
            })),
        });

        if (editando) {
            put(`/ventas/${editando.id}`, {
                onBefore: () => transform(transformData),
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/ventas', {
                onBefore: () => transform(transformData),
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (venta: Venta) => {
        setEditando(venta);
        setData({
            numero_factura: venta.numero_factura,
            cliente_id: venta.cliente_id.toString(),
            fecha: venta.fecha,
            estado: venta.estado,
            notas: venta.notas || '',
            productos:
                venta.detalleVentas?.map((d) => ({
                    producto_id: d.producto_id.toString(),
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario,
                })) || [],
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta venta?'))
            destroy(`/ventas/${id}`);
    };

    const handleVer = (venta: Venta) => {
        setVentaSeleccionada(venta);
        setVerModalOpen(true);
    };

    const handleUpdateStatus = (venta: Venta, nuevoEstado: string) => {
        router.patch(
            `/ventas/${venta.id}/status`,
            { estado: nuevoEstado },
            {
                preserveScroll: true,
            },
        );
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditando(null);
        reset();
        setData('productos', []);
    };

    const getEstadoBadge = (estado: string) => {
        const variants = {
            pendiente: 'secondary',
            pagada: 'default',
            cancelada: 'destructive',
        } as const;
        return (
            <Badge variant={variants[estado as keyof typeof variants]}>
                {estado}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Ventas</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportCsv}>
                            Exportar CSV
                        </Button>
                        <Button variant="outline" onClick={handleExportExcel}>
                            Exportar Excel
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImportCsv}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <Button variant="outline">Importar CSV</Button>
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImportCsv}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <Button variant="outline">Importar Excel</Button>
                        </div>
                        <Button
                            onClick={() => {
                                setEditando(null);
                                reset();
                                setData('productos', []);
                                setIsOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Ventas</CardTitle>
                        <CardDescription>
                            {ventasFiltradas.length} registros encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-muted/50 p-4 shadow-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="group relative">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Buscar por factura, cliente o notas..."
                                        value={filtros.busqueda}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                busqueda: e.target.value,
                                            })
                                        }
                                        className="h-10 border-muted-foreground/20 pl-9 transition-all focus:border-primary"
                                    />
                                </div>
                            </div>

                            <Select
                                value={filtros.estado}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        estado: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[180px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los estados
                                    </SelectItem>
                                    <SelectItem value="pendiente">
                                        Pendiente
                                    </SelectItem>
                                    <SelectItem value="pagada">
                                        Pagada
                                    </SelectItem>
                                    <SelectItem value="cancelada">
                                        Cancelada
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filtros.cliente_id}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        cliente_id: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[200px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todos los clientes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los clientes
                                    </SelectItem>
                                    {clientes.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id.toString()}
                                        >
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="Desde"
                                value={filtros.fechaDesde}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        fechaDesde: e.target.value,
                                    })
                                }
                                className="h-10 w-[150px] border-muted-foreground/20"
                            />
                            <Input
                                type="date"
                                placeholder="Hasta"
                                value={filtros.fechaHasta}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        fechaHasta: e.target.value,
                                    })
                                }
                                className="h-10 w-[150px] border-muted-foreground/20"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={limpiarFiltros}
                                className="h-10 w-10 border-muted-foreground/20 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                title="Limpiar filtros"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Factura
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Cliente
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Fecha
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Total
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
                                    {ventasFiltradas.map((venta) => (
                                        <tr key={venta.id} className="border-b">
                                            <td className="py-3 font-medium">
                                                {venta.numero_factura}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-1">
                                                    <span
                                                        className="block max-w-[150px] truncate"
                                                        title={
                                                            venta.cliente
                                                                ?.nombre
                                                        }
                                                    >
                                                        {venta.cliente?.nombre}
                                                    </span>
                                                    {venta.cliente
                                                        ?.telefono && (
                                                        <WhatsAppButton
                                                            phone={
                                                                venta.cliente
                                                                    .telefono
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {formatDateCLP(venta.fecha)}
                                            </td>
                                            <td className="py-3 font-medium">
                                                {formatCurrencyCLP(venta.total)}
                                            </td>
                                            <td className="py-3">
                                                <Select
                                                    value={venta.estado}
                                                    onValueChange={(v) =>
                                                        handleUpdateStatus(
                                                            venta,
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 w-[120px] border-none bg-transparent p-0 hover:bg-transparent focus:ring-0">
                                                        <SelectValue>
                                                            {getEstadoBadge(
                                                                venta.estado,
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pendiente">
                                                            Pendiente
                                                        </SelectItem>
                                                        <SelectItem value="pagada">
                                                            Pagada
                                                        </SelectItem>
                                                        <SelectItem value="cancelada">
                                                            Cancelada
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleVer(venta)
                                                        }
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            window.open(
                                                                `/ventas/${venta.id}/download`,
                                                                '_blank',
                                                            )
                                                        }
                                                        title="Descargar PDF"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEdit(venta)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                venta.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ventasFiltradas.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-4 text-center"
                                            >
                                                {ventas.data.length === 0
                                                    ? 'No hay ventas registradas'
                                                    : 'No hay ventas que coincidan con los filtros'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={ventas.links}
                            meta={
                                ventas.meta || {
                                    from: (ventas as any).from,
                                    to: (ventas as any).to,
                                    total: ventas.total,
                                }
                            }
                        />
                    </CardContent>
                </Card>
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => !open && handleClose()}
                >
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editando ? 'Editar Venta' : 'Nueva Venta'}
                            </DialogTitle>
                            <DialogDescription>
                                Complete los datos de la venta
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                    <p className="font-semibold">
                                        Por favor corrija los siguientes
                                        errores:
                                    </p>
                                    <ul className="list-inside list-disc">
                                        {Object.values(errors).map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>No. Factura</Label>
                                        <Input
                                            value={data.numero_factura}
                                            onChange={(e) =>
                                                setData(
                                                    'numero_factura',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cliente</Label>
                                        <Select
                                            value={data.cliente_id}
                                            onValueChange={(v) =>
                                                setData('cliente_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clientes.map((c) => (
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
                                    <div className="grid gap-2">
                                        <Label>Fecha</Label>
                                        <Input
                                            type="date"
                                            value={data.fecha}
                                            onChange={(e) =>
                                                setData('fecha', e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(v) =>
                                            setData(
                                                'estado',
                                                v as
                                                    | 'pendiente'
                                                    | 'pagada'
                                                    | 'cancelada',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pendiente">
                                                Pendiente
                                            </SelectItem>
                                            <SelectItem value="pagada">
                                                Pagada
                                            </SelectItem>
                                            <SelectItem value="cancelada">
                                                Cancelada
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <Label className="text-base font-semibold">
                                            Productos
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addProducto}
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Agregar Producto
                                        </Button>
                                    </div>

                                    {data.productos.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-gray-500">
                                            No hay productos agregados. Haga
                                            clic en "Agregar Producto"
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {data.productos.map(
                                                (producto, index) => {
                                                    const prod = productos.find(
                                                        (p) =>
                                                            p.id ===
                                                            Number(
                                                                producto.producto_id,
                                                            ),
                                                    );
                                                    const precio = Math.round(
                                                        producto.precio_unitario ||
                                                            prod?.precio_venta ||
                                                            0,
                                                    );
                                                    const subtotalItem =
                                                        Math.round(
                                                            producto.cantidad *
                                                                precio,
                                                        );

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="grid grid-cols-1 items-end gap-3 rounded-md border border-dashed p-3 md:grid-cols-12 md:border-0 md:p-0"
                                                        >
                                                            <div className="md:col-span-5">
                                                                <Label className="md:text-xs">
                                                                    Producto
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        producto.producto_id
                                                                    }
                                                                    onValueChange={(
                                                                        v,
                                                                    ) =>
                                                                        updateProducto(
                                                                            index,
                                                                            'producto_id',
                                                                            v,
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue>
                                                                            {productos.find(
                                                                                (
                                                                                    p,
                                                                                ) =>
                                                                                    p.id ===
                                                                                    Number(
                                                                                        producto.producto_id,
                                                                                    ),
                                                                            )
                                                                                ?.nombre ||
                                                                                'Seleccionar'}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {productos.map(
                                                                            (
                                                                                p,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        p.id
                                                                                    }
                                                                                    value={p.id.toString()}
                                                                                >
                                                                                    {
                                                                                        p.nombre
                                                                                    }{' '}
                                                                                    (
                                                                                    {
                                                                                        p.codigo
                                                                                    }

                                                                                    )
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 md:col-span-6 md:grid-cols-12">
                                                                <div className="md:col-span-4">
                                                                    <Label className="md:text-xs">
                                                                        Cant.
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={
                                                                            producto.cantidad
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateProducto(
                                                                                index,
                                                                                'cantidad',
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    1,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-4">
                                                                    <Label className="md:text-xs">
                                                                        Precio
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        value={
                                                                            producto.precio_unitario
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateProducto(
                                                                                index,
                                                                                'precio_unitario',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    0,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-4">
                                                                    <Label className="md:text-xs">
                                                                        Subt.
                                                                    </Label>
                                                                    <Input
                                                                        value={formatCurrencyCLP(
                                                                            subtotalItem,
                                                                        )}
                                                                        disabled
                                                                        className="bg-gray-50"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end md:col-span-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeProducto(
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border bg-gray-50 p-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span className="text-lg font-medium">
                                            {formatCurrencyCLP(
                                                calcularTotales.subtotal,
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex justify-between text-sm">
                                        <span>IVA (19%):</span>
                                        <span className="font-medium">
                                            {formatCurrencyCLP(
                                                calcularTotales.iva,
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
                                        <span>Total:</span>
                                        <span className="text-xl">
                                            {formatCurrencyCLP(
                                                calcularTotales.total,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
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
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        data.productos.length === 0 ||
                                        !data.cliente_id
                                    }
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Vista Premium (Solo lectura) */}
                <Dialog open={verModalOpen} onOpenChange={setVerModalOpen}>
                    <DialogContent className="max-w-3xl overflow-hidden border-none bg-white p-0 shadow-2xl">
                        <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                            {/* Fondo decorativo con gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 opacity-100" />
                            <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                                <Eye className="h-24 w-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-1 text-white">
                                <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                    Detalle de Venta
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                    Venta #{ventaSeleccionada?.numero_factura}
                                </DialogTitle>
                                <DialogDescription className="text-lg font-medium text-blue-100/80">
                                    Información administrativa y financiera del
                                    registro.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        {ventaSeleccionada && (
                            <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(90vh-180px)] flex-col gap-6 overflow-y-auto px-8">
                                {/* Dashboard de estados rápidos */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    {[
                                        {
                                            label: 'Cliente',
                                            val: ventaSeleccionada.cliente
                                                ?.nombre,
                                            color: 'border-blue-200 bg-blue-50 text-blue-800',
                                        },
                                        {
                                            label: 'Fecha Emisión',
                                            val: formatDateCLP(
                                                ventaSeleccionada.fecha,
                                            ),
                                            color: 'border-gray-200 bg-gray-50 text-gray-800',
                                        },
                                        {
                                            label: 'Estado Actual',
                                            val: ventaSeleccionada.estado.toUpperCase(),
                                            color:
                                                ventaSeleccionada.estado ===
                                                'pagada'
                                                    ? 'border-green-200 bg-green-50 text-green-800'
                                                    : ventaSeleccionada.estado ===
                                                        'cancelada'
                                                      ? 'border-red-200 bg-red-50 text-red-800'
                                                      : 'border-amber-200 bg-amber-50 text-amber-800',
                                        },
                                        {
                                            label: 'Total Documento',
                                            val: formatCurrencyCLP(
                                                ventaSeleccionada.total,
                                            ),
                                            color: 'border-indigo-200 bg-indigo-50 text-indigo-800 font-bold',
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`group rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${item.color}`}
                                        >
                                            <p className="mb-1 text-[10px] font-extrabold tracking-wider uppercase opacity-70">
                                                {item.label}
                                            </p>
                                            <p className="truncate text-sm font-semibold">
                                                {item.val}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                    {/* Columna Principal - Tabla de Productos */}
                                    <div className="flex flex-col gap-6 lg:col-span-2">
                                        <Card className="border-none bg-gray-50/50 shadow-sm">
                                            <CardHeader className="border-b border-gray-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-md bg-indigo-100 p-1.5 text-indigo-700">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-base font-bold text-gray-800">
                                                        Productos Detallados
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="w-full overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b bg-gray-100/50 text-[10px] font-bold text-gray-500 uppercase">
                                                                <th className="px-5 py-3 text-left">
                                                                    Producto
                                                                </th>
                                                                <th className="px-5 py-3 text-center">
                                                                    Cant.
                                                                </th>
                                                                <th className="px-5 py-3 text-right">
                                                                    Unitario
                                                                </th>
                                                                <th className="px-5 py-3 text-right">
                                                                    Subtotal
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 bg-white">
                                                            {ventaSeleccionada.detalleVentas?.map(
                                                                (
                                                                    detalle,
                                                                    i,
                                                                ) => (
                                                                    <tr
                                                                        key={i}
                                                                        className="group transition-colors hover:bg-blue-50/30"
                                                                    >
                                                                        <td className="px-5 py-3.5">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-bold text-gray-700 transition-colors group-hover:text-primary">
                                                                                    {detalle
                                                                                        .producto
                                                                                        ?.nombre ||
                                                                                        'Producto'}
                                                                                </span>
                                                                                <span className="font-mono text-[10px] tracking-tight text-gray-400">
                                                                                    SKU:{' '}
                                                                                    {detalle
                                                                                        .producto
                                                                                        ?.codigo ||
                                                                                        '---'}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-5 py-3.5 text-center font-mono text-gray-600 italic">
                                                                            {
                                                                                detalle.cantidad
                                                                            }
                                                                        </td>
                                                                        <td className="px-5 py-3.5 text-right font-medium text-gray-500">
                                                                            {formatCurrencyCLP(
                                                                                detalle.precio_unitario,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-5 py-3.5 text-right font-bold text-indigo-600">
                                                                            {formatCurrencyCLP(
                                                                                detalle.subtotal,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {ventaSeleccionada.notas && (
                                            <Card className="border-none bg-amber-50/30 shadow-sm">
                                                <CardHeader className="border-b border-amber-100 px-5 py-3">
                                                    <CardTitle className="text-xs font-black tracking-widest text-amber-700 uppercase">
                                                        Observaciones
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-5 text-sm leading-relaxed font-medium text-amber-900/70 italic">
                                                    {ventaSeleccionada.notas}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Resumen Financiero Lateral */}
                                    <div className="flex flex-col gap-6">
                                        <Card className="overflow-hidden border-none bg-indigo-950 text-white shadow-xl">
                                            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                                            <CardHeader className="relative pb-2">
                                                <CardTitle className="text-xs font-extrabold tracking-widest text-blue-300 uppercase opacity-80">
                                                    Liquidación Final
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="relative flex flex-col gap-4">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
                                                    <span className="font-medium text-blue-100/60">
                                                        Subtotal
                                                    </span>
                                                    <span className="font-mono text-blue-50">
                                                        {formatCurrencyCLP(
                                                            ventaSeleccionada.subtotal,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
                                                    <span className="font-medium text-blue-100/60">
                                                        IVA (19%)
                                                    </span>
                                                    <span className="font-mono text-blue-50">
                                                        {formatCurrencyCLP(
                                                            ventaSeleccionada.iva,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 py-4">
                                                    <span className="text-center text-[10px] font-black tracking-tighter text-white/40 uppercase">
                                                        Monto Total Recaudado
                                                    </span>
                                                    <span className="scale-y-110 text-center text-4xl font-black tracking-tighter text-white drop-shadow-lg">
                                                        {formatCurrencyCLP(
                                                            ventaSeleccionada.total,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-2 rounded-xl border border-white/10 bg-white/10 p-3 text-center text-[10px] leading-tight font-medium tracking-widest text-blue-200/70 uppercase">
                                                    Registro de operación
                                                    financiera autorizada
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Contacto del Cliente */}
                                        <Card className="border shadow-sm">
                                            <CardHeader className="border-b bg-gray-50 py-3">
                                                <CardTitle className="text-xs font-bold text-gray-600">
                                                    Soporte Cliente
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 rounded-lg bg-gray-100 p-2.5">
                                                            <p className="mb-1 text-[10px] leading-none font-black text-gray-400 uppercase">
                                                                Nombre
                                                            </p>
                                                            <p className="truncate text-xs font-bold text-gray-700">
                                                                {
                                                                    ventaSeleccionada
                                                                        .cliente
                                                                        ?.nombre
                                                                }
                                                            </p>
                                                        </div>
                                                        <WhatsAppButton
                                                            phone={
                                                                ventaSeleccionada
                                                                    .cliente
                                                                    ?.telefono
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 border-t bg-gray-50 p-6">
                            <Button
                                variant="outline"
                                onClick={() => setVerModalOpen(false)}
                                className="w-full border-gray-200 px-10 font-bold shadow-sm transition-all hover:bg-white hover:text-primary active:scale-95 sm:w-auto"
                            >
                                Cerrar Documento
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
