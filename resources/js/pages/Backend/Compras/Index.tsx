import { Head, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Search, X } from 'lucide-react';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Proveedor {
    id: number;
    nombre: string;
    telefono?: string;
}
interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    precio_compra: number;
}
interface DetalleCompra {
    id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    producto?: Producto;
}
interface Compra {
    id: number;
    numero: string;
    proveedor_id: number;
    fecha: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: 'pendiente' | 'recibida' | 'cancelada';
    notas: string | null;
    proveedor?: Proveedor;
    detalleCompras?: DetalleCompra[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Compras', href: '/compras' },
];

export default function Index({
    compras,
    proveedors,
    productos,
}: {
    compras: { data: Compra[]; links: any[]; from?: number; to?: number; total?: number; meta?: any };
    proveedors: Proveedor[];
    productos: Producto[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Compra | null>(null);
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
        numero: '',
        proveedor_id: '' as string,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente' as 'pendiente' | 'recibida' | 'cancelada',
        notas: '',
        productos: [] as {
            producto_id: string;
            cantidad: number;
            precio_unitario: number;
        }[],
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        proveedor_id: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const comprasFiltradas = useMemo(() => {
        return compras.data.filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.numero?.toLowerCase().includes(busca) &&
                    !c.proveedor?.nombre?.toLowerCase().includes(busca) &&
                    !c.notas?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.proveedor_id && c.proveedor_id.toString() !== filtros.proveedor_id)
                return false;
            if (filtros.estado && c.estado !== filtros.estado) return false;
            if (filtros.fechaDesde && c.fecha < filtros.fechaDesde)
                return false;
            if (filtros.fechaHasta && c.fecha > filtros.fechaHasta)
                return false;
            return true;
        });
    }, [compras.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            proveedor_id: '',
            estado: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const calcularTotales = useMemo(() => {
        const subtotal = data.productos.reduce((acc, p) => {
            const producto = productos.find(
                (prod) => prod.id === Number(p.producto_id),
            );
            const precio = producto?.precio_compra || p.precio_unitario || 0;
            return acc + p.cantidad * precio;
        }, 0);
        const iva = Math.round(subtotal * 0.19);
        const total = subtotal + iva;
        return { subtotal, iva: Math.round(iva), total: Math.round(total) };
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
                updated[index].precio_unitario = producto.precio_compra;
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

        transform((data) => ({
            ...data,
            proveedor_id: Number(data.proveedor_id),
            subtotal,
            iva,
            total,
            productos: data.productos.map((p: any) => ({
                producto_id: Number(p.producto_id),
                cantidad: p.cantidad,
                precio_unitario: p.precio_unitario,
            })),
        }));

        if (editando) {
            put(`/compras/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/compras', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (compra: Compra) => {
        setEditando(compra);
        setData({
            numero: compra.numero,
            proveedor_id: compra.proveedor_id.toString(),
            fecha: compra.fecha,
            estado: compra.estado,
            notas: compra.notas || '',
            productos:
                compra.detalleCompras?.map((d) => ({
                    producto_id: d.producto_id.toString(),
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario,
                })) || [],
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta compra?'))
            destroy(`/compras/${id}`);
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
            recibida: 'default',
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
            <Head title="Compras" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Compras</h1>
                    <Button
                        onClick={() => {
                            setEditando(null);
                            reset();
                            setData('productos', []);
                            setIsOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Compra
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Compras</CardTitle>
                        <CardDescription>
                            Gestione las compras del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar factura, proveedor o notas..."
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
                                value={filtros.proveedor_id}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        proveedor_id: e.target.value,
                                    })
                                }
                                className="flex h-9 rounded-md border bg-background px-3 py-1 min-w-[150px]"
                            >
                                <option value="">Todos los proveedores</option>
                                {proveedors.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre}
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
                                className="flex h-9 rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="recibida">Recibida</option>
                                <option value="cancelada">Cancelada</option>
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
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Factura
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Proveedor
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
                                    {comprasFiltradas.map((compra) => (
                                        <tr
                                            key={compra.id}
                                            className="border-b"
                                        >
                                            <td className="py-3 font-medium">
                                                {compra.numero}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-1">
                                                    <span>{compra.proveedor?.nombre}</span>
                                                    {compra.proveedor?.telefono && (
                                                        <WhatsAppButton phone={compra.proveedor.telefono} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {formatDateCLP(compra.fecha)}
                                            </td>
                                            <td className="py-3 font-medium">
                                                {formatCurrencyCLP(compra.total)}
                                            </td>
                                            <td className="py-3">
                                                {getEstadoBadge(compra.estado)}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEdit(compra)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                compra.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {compras.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-4 text-center"
                                            >
                                                No hay compras registradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <Pagination links={compras.links} meta={compras.meta || compras} />
                        </div>
                    </CardContent>
                </Card>
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => !open && handleClose()}
                >
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editando ? 'Editar Compra' : 'Nueva Compra'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                    <p className="font-semibold">
                                        Por favor corrija los siguientes errores:
                                    </p>
                                    <ul className="list-inside list-disc">
                                        {Object.values(errors).map((err, i) => (
                                            <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>No. Factura</Label>
                                        <Input
                                            value={data.numero}
                                            onChange={(e) =>
                                                setData(
                                                    'numero',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Proveedor</Label>
                                        <Select
                                            value={data.proveedor_id}
                                            onValueChange={(v) =>
                                                setData('proveedor_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {proveedors.map((p) => (
                                                    <SelectItem
                                                        key={p.id}
                                                        value={p.id.toString()}
                                                    >
                                                        {p.nombre}
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
                                                | 'recibida'
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
                                            <SelectItem value="recibida">
                                                Recibida
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
                                                    const precio =
                                                        producto.precio_unitario ||
                                                        prod?.precio_compra ||
                                                        0;
                                                    const subtotalItem =
                                                        producto.cantidad *
                                                        precio;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="grid grid-cols-1 md:grid-cols-12 items-end gap-3 rounded-md border border-dashed p-3 md:border-0 md:p-0"
                                                        >
                                                            <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-12 gap-3">
                                                                <div className="md:col-span-6">
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
                                                                            <SelectValue placeholder="Seleccionar" />
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
                                                                                        ({p.codigo})
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2 md:col-span-6">
                                                                    <div>
                                                                        <Label className="md:text-xs text-[10px]">
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
                                                                    <div>
                                                                        <Label className="md:text-xs text-[10px]">
                                                                            Precio
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
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
                                                                    <div>
                                                                        <Label className="md:text-xs text-[10px]">
                                                                            Subt.
                                                                        </Label>
                                                                        <Input
                                                                            value={formatCurrencyCLP(subtotalItem)}
                                                                            disabled
                                                                            className="bg-gray-50"
                                                                        />
                                                                    </div>
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
                                        <span className="font-medium">
                                            {formatCurrencyCLP(calcularTotales.subtotal)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex justify-between text-sm">
                                        <span>IVA (19%):</span>
                                        <span className="font-medium">
                                            {formatCurrencyCLP(calcularTotales.iva)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
                                        <span>Total:</span>
                                        <span>
                                            {formatCurrencyCLP(calcularTotales.total)}
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
                                        !data.proveedor_id
                                    }
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
