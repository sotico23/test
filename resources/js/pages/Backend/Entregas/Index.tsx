import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Eye,
    Truck,
    Calendar,
    MapPin,
    User,
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Entrega {
    id: number;
    venta_id: number | null;
    vehiculo_id: number | null;
    conductor_id: number | null;
    cliente: string | null;
    direccion: string | null;
    fecha_entrega: string | null;
    estado: string;
    notas: string | null;
    productos_json: string | null;
}

interface Vehiculo {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
}

interface Conductor {
    id: number;
    nombre: string;
}

interface Cliente {
    id: number;
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    comuna: string | null;
    region: string | null;
}

interface DetalleVenta {
    id: number;
    producto_id: number | null;
    producto?: { nombre: string };
    cantidad: number;
    precio_unitario: number;
}

interface Venta {
    id: number;
    numero: string;
    numero_factura?: string;
    cliente_id: number | null;
    cliente?: { nombre: string; telefono?: string; direccion?: string };
    estado: string;
    detalle_ventas: DetalleVenta[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Entregas', href: '/entregas' },
];

export default function Index({
    entregas,
    vehiculos,
    conductores,
    clientes,
    ventas,
}: {
    entregas: { data: Entrega[]; links: any[]; meta?: any; total: number };
    vehiculos: Vehiculo[];
    conductores: Conductor[];
    clientes: Cliente[];
    ventas: Venta[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerOpen, setIsVerOpen] = useState(false);
    const [editando, setEditando] = useState<Entrega | null>(null);
    const [entregaSeleccionada, setEntregaSeleccionada] =
        useState<Entrega | null>(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState<{
        [key: number]: number;
    }>({});
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        venta_id: '',
        vehiculo_id: '',
        conductor_id: '',
        cliente: '',
        direccion: '',
        fecha_entrega: '',
        estado: 'pendiente',
        notas: '',
        productos_json: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const entregasFiltradas = useMemo(() => {
        return (entregas.data || []).filter((e: Entrega) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !(e.cliente || '').toLowerCase().includes(busca) &&
                    !(e.direccion || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && e.estado !== filtros.estado) return false;

            return true;
        });
    }, [entregas, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const getSelectedVenta = () => {
        return ventas.find((v) => v.id.toString() === data.venta_id);
    };

    const handleVentaChange = (ventaId: string) => {
        const venta = ventas.find((v) => v.id.toString() === ventaId);
        setData('venta_id', ventaId);

        // Auto-fill from venta
        if (venta) {
            setData('cliente', venta.cliente?.nombre || '');
            const fullAddress = venta.cliente?.direccion || '';
            setData('direccion', fullAddress);

            // Set productos seleccionados from venta detalle_ventas
            const productos: { [key: number]: number } = {};
            venta.detalle_ventas.forEach((item) => {
                productos[item.producto_id || item.id] = item.cantidad;
            });
            setProductosSeleccionados(productos);
        } else {
            setProductosSeleccionados({});
        }
    };

    const handleCantidadChange = (itemId: number, cantidad: number) => {
        setProductosSeleccionados((prev) => ({
            ...prev,
            [itemId]: cantidad,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Build productos_json from selected items
        const venta = getSelectedVenta();
        let productosJson = '';
        if (venta && Object.keys(productosSeleccionados).length > 0) {
            const items = venta.detalle_ventas.map((item) => ({
                producto_id: item.producto_id || item.id,
                nombre_producto: item.producto?.nombre || 'Producto',
                cantidad:
                    productosSeleccionados[item.producto_id || item.id] ||
                    item.cantidad,
                precio_unitario: item.precio_unitario,
            }));
            productosJson = JSON.stringify(items);
        }

        // Clean data for submission
        const cleanData = {
            ...data,
            venta_id: data.venta_id === '' ? null : data.venta_id,
            vehiculo_id: data.vehiculo_id === '' ? null : data.vehiculo_id,
            conductor_id: data.conductor_id === '' ? null : data.conductor_id,
            productos_json: productosJson,
        };

        if (editando) {
            import('@inertiajs/react').then(({ router }) => {
                router.put(`/entregas/${editando.id}`, cleanData, {
                    onSuccess: () => {
                        setIsOpen(false);
                        setEditando(null);
                        setProductosSeleccionados({});
                        reset();
                    },
                });
            });
        } else {
            import('@inertiajs/react').then(({ router }) => {
                router.post('/entregas', cleanData, {
                    onSuccess: () => {
                        setIsOpen(false);
                        setProductosSeleccionados({});
                        reset();
                    },
                });
            });
        }
    };

    const handleEdit = (e: Entrega) => {
        setEditando(e);

        // Format date string (YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD)
        const datePart = e.fecha_entrega ? e.fecha_entrega.split('T')[0] : '';

        setData({
            venta_id: e.venta_id?.toString() || '',
            vehiculo_id: e.vehiculo_id?.toString() || '',
            conductor_id: e.conductor_id?.toString() || '',
            cliente: e.cliente || '',
            direccion: e.direccion || '',
            fecha_entrega: datePart,
            estado: e.estado,
            notas: e.notas || '',
            productos_json: e.productos_json || '',
        });

        // Load productos from entrega if exists
        if (e.productos_json) {
            try {
                const items = JSON.parse(e.productos_json);
                const productos: { [key: number]: number } = {};
                items.forEach((item: any) => {
                    productos[item.producto_id] = item.cantidad;
                });
                setProductosSeleccionados(productos);
            } catch {
                setProductosSeleccionados({});
            }
        } else {
            setProductosSeleccionados({});
        }
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            venta_id: '',
            vehiculo_id: '',
            conductor_id: '',
            cliente: '',
            direccion: '',
            fecha_entrega: '',
            estado: 'pendiente',
            notas: '',
            productos_json: '',
        });
        setProductosSeleccionados({});
        setEditando(null);
        setIsOpen(true);
    };

    const handleVer = (e: Entrega) => {
        setEntregaSeleccionada(e);
        setIsVerOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/entregas/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            pendiente: 'bg-yellow-500',
            en_ruta: 'bg-blue-500',
            entregado: 'bg-green-500',
            cancelado: 'bg-red-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Entregas" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Entregas</h1>
                            <p className="text-muted-foreground">
                                Gestión de entregas
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Entrega
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Entregas</CardTitle>
                            <CardDescription>
                                {entregasFiltradas.length} entregas encontradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por cliente o dirección..."
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
                                <Select
                                    value={filtros.estado}
                                    onValueChange={(val) =>
                                        setFiltros({
                                            ...filtros,
                                            estado: val === 'all' ? '' : val,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full bg-background sm:w-[180px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        {[
                                            'pendiente',
                                            'en_ruta',
                                            'entregado',
                                            'cancelado',
                                        ].map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {e
                                                    .toUpperCase()
                                                    .replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                                Pedido / Cliente
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Dirección
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Fecha
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
                                        {entregasFiltradas.map((e) => (
                                            <tr
                                                key={e.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-bold">
                                                        #{e.venta_id || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">
                                                        {e.cliente || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="line-clamp-1 text-[10px]">
                                                        {e.direccion || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-[10px]">
                                                        {e.fecha_entrega
                                                            ? e.fecha_entrega.split(
                                                                  'T',
                                                              )[0]
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(e.estado)}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() =>
                                                                handleVer(e)
                                                            }
                                                            title="Ver Detalles"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(e)
                                                            }
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    e.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {entregasFiltradas.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron entregas
                                                    con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={entregas.links}
                                    meta={entregas.meta}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-none bg-background p-0 shadow-2xl md:max-w-2xl">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2">
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando
                                ? 'Modificar Registro'
                                : 'Nueva Planificación'}{' '}
                            de Entrega
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Seleccionar Pedido
                                        </Label>
                                        <Select
                                            value={data.venta_id}
                                            onValueChange={handleVentaChange}
                                        >
                                            <SelectTrigger className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Seleccionar Pedido" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ventas.map((v) => (
                                                    <SelectItem
                                                        key={v.id}
                                                        value={v.id.toString()}
                                                    >
                                                        {v.numero} -{' '}
                                                        {v.cliente?.nombre ||
                                                            'Sin cliente'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Fecha Estimada
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                value={data.fecha_entrega}
                                                onChange={(e) =>
                                                    setData(
                                                        'fecha_entrega',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 border-none bg-muted/30 pl-10 font-bold focus-visible:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Unidad de Transporte
                                        </Label>
                                        <Select
                                            value={data.vehiculo_id || ''}
                                            onValueChange={(val) =>
                                                setData('vehiculo_id', val)
                                            }
                                        >
                                            <SelectTrigger className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Asignar Vehículo" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehiculos.map((v) => (
                                                    <SelectItem
                                                        key={v.id}
                                                        value={v.id.toString()}
                                                    >
                                                        {v.placa} ({v.marca}{' '}
                                                        {v.modelo})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Conductor Responsable
                                        </Label>
                                        <Select
                                            value={data.conductor_id || ''}
                                            onValueChange={(val) =>
                                                setData('conductor_id', val)
                                            }
                                        >
                                            <SelectTrigger className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Asignar Conductor" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {conductores.map((c) => (
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
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Destinatario / Cliente
                                        </Label>
                                        <Select
                                            value={data.cliente}
                                            onValueChange={(val) => {
                                                const selected = clientes.find(
                                                    (c) => c.nombre === val,
                                                );
                                                setData('cliente', val);
                                                if (selected) {
                                                    const fullAddress = [
                                                        selected.direccion,
                                                        selected.comuna,
                                                        selected.ciudad,
                                                        selected.region,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ');
                                                    setData(
                                                        'direccion',
                                                        fullAddress || '',
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-11 border-none bg-muted/30 font-bold italic focus-visible:ring-primary/20">
                                                <SelectValue placeholder="Seleccionar Cliente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clientes.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.nombre}
                                                    >
                                                        {c.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Etapa Operativa
                                        </Label>
                                        <Select
                                            value={data.estado}
                                            onValueChange={(val) =>
                                                setData('estado', val)
                                            }
                                        >
                                            <SelectTrigger className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20">
                                                <SelectValue placeholder="Estado inicial" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'pendiente',
                                                    'en_ruta',
                                                    'entregado',
                                                    'cancelado',
                                                ].map((e) => (
                                                    <SelectItem
                                                        key={e}
                                                        value={e}
                                                    >
                                                        {e
                                                            .toUpperCase()
                                                            .replace('_', ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                        Punto de Destino / Dirección
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={data.direccion}
                                            onChange={(e) =>
                                                setData(
                                                    'direccion',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Calle, Número, Ciudad..."
                                            className="h-11 border-none bg-muted/30 pl-10 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                        Comentarios Adicionales
                                    </Label>
                                    <Input
                                        value={data.notas}
                                        onChange={(e) =>
                                            setData('notas', e.target.value)
                                        }
                                        placeholder="Instrucciones para la entrega..."
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
                                    />
                                </div>

                                {/* Productos Section */}
                                {getSelectedVenta()?.detalle_ventas &&
                                    getSelectedVenta()!.detalle_ventas.length >
                                        0 && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                Productos a Entregar
                                            </Label>
                                            <div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
                                                {getSelectedVenta()?.detalle_ventas.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold">
                                                                    {
                                                                        item
                                                                            .producto
                                                                            ?.nombre
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    $
                                                                    {(
                                                                        item.precio_unitario ||
                                                                        0
                                                                    ).toLocaleString(
                                                                        'es-CL',
                                                                    )}{' '}
                                                                    x{' '}
                                                                    {
                                                                        item.cantidad
                                                                    }{' '}
                                                                    = $
                                                                    {(
                                                                        item.precio_unitario *
                                                                        item.cantidad
                                                                    ).toLocaleString(
                                                                        'es-CL',
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={
                                                                    item.cantidad
                                                                }
                                                                value={
                                                                    productosSeleccionados[
                                                                        item.producto_id ||
                                                                            item.id
                                                                    ] ||
                                                                    item.cantidad
                                                                }
                                                                onChange={(e) =>
                                                                    handleCantidadChange(
                                                                        item.producto_id ||
                                                                            item.id,
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                                className="h-8 w-20 text-center"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <DialogFooter className="gap-2 border-t pt-6 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full font-bold sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full rounded-full bg-primary px-12 font-black shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 sm:w-auto"
                                >
                                    {editando
                                        ? 'Guardar Cambios'
                                        : 'Confirmar Entrega'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isVerOpen} onOpenChange={setIsVerOpen}>
                <DialogContent className="max-w-[95vw] overflow-hidden rounded-3xl border-none bg-background p-0 shadow-2xl md:max-w-3xl">
                    {entregaSeleccionada && (
                        <>
                            <div className="relative">
                                <div className="pointer-events-none absolute top-0 left-0 h-32 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                                <DialogHeader className="relative z-10 p-8 pb-4">
                                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/10 bg-white text-primary shadow-xl">
                                                <Truck className="h-10 w-10" />
                                            </div>
                                            <div>
                                                <div className="mb-1 flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-primary/30 bg-white px-3 py-1 font-black text-primary"
                                                    >
                                                        PEDIDO #
                                                        {
                                                            entregaSeleccionada.venta_id
                                                        }
                                                    </Badge>
                                                    {getEstadoBadge(
                                                        entregaSeleccionada.estado,
                                                    )}
                                                </div>
                                                <DialogTitle className="text-4xl leading-tight font-black tracking-tighter text-foreground">
                                                    Detalles de Entrega
                                                </DialogTitle>
                                            </div>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            <div className="grid grid-cols-1 gap-8 p-8 pt-4 md:grid-cols-3">
                                <div className="space-y-8 md:col-span-2">
                                    <section>
                                        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-primary/70 uppercase">
                                            <MapPin className="h-3 w-3" />{' '}
                                            Información de Destino
                                        </h3>
                                        <div className="space-y-4 rounded-3xl border border-border/50 bg-muted/30 p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs leading-none font-black text-muted-foreground uppercase">
                                                        Cliente / Destinatario
                                                    </p>
                                                    <p className="text-lg leading-snug font-bold text-foreground">
                                                        {entregaSeleccionada.cliente ||
                                                            'Consumidor Final'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 border-t border-border/50 pt-4">
                                                <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs leading-none font-black text-muted-foreground uppercase">
                                                        Dirección de Despacho
                                                    </p>
                                                    <p className="text-sm leading-relaxed font-bold text-foreground">
                                                        {entregaSeleccionada.direccion ||
                                                            'No especificada'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-primary/70 uppercase">
                                            <Info className="h-3 w-3" /> Notas
                                            Operativas
                                        </h3>
                                        <div className="flex min-h-[100px] items-start gap-4 rounded-3xl border-2 border-dashed border-border bg-muted/10 p-6 text-muted-foreground italic">
                                            {entregaSeleccionada.notas ||
                                                'No se han registrado instrucciones especiales para este despacho.'}
                                        </div>
                                    </section>

                                    {entregaSeleccionada.productos_json && (
                                        <section>
                                            <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-primary/70 uppercase">
                                                <Package className="h-3 w-3" />{' '}
                                                Productos a Entregar
                                            </h3>
                                            <div className="space-y-2 rounded-3xl border border-primary/10 bg-primary/[0.03] p-4">
                                                {(() => {
                                                    try {
                                                        const items =
                                                            JSON.parse(
                                                                entregaSeleccionada.productos_json,
                                                            );
                                                        return items.map(
                                                            (
                                                                item: any,
                                                                idx: number,
                                                            ) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center justify-between border-b border-border/30 pb-2 last:border-0"
                                                                >
                                                                    <div>
                                                                        <p className="text-xs font-bold">
                                                                            {
                                                                                item.nombre_producto
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            $
                                                                            {(
                                                                                item.precio_unitario ||
                                                                                0
                                                                            ).toLocaleString(
                                                                                'es-CL',
                                                                            )}{' '}
                                                                            c/u
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-black">
                                                                            x
                                                                            {
                                                                                item.cantidad
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            $
                                                                            {(
                                                                                (item.precio_unitario ||
                                                                                    0) *
                                                                                item.cantidad
                                                                            ).toLocaleString(
                                                                                'es-CL',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        );
                                                    } catch {
                                                        return null;
                                                    }
                                                })()}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className="mb-4 text-[10px] font-black tracking-[0.2em] text-primary/70 uppercase">
                                            Logística
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-primary/[0.03] p-5">
                                                <div className="rounded-xl border border-primary/5 bg-white p-2 shadow-sm">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-[9px] leading-none font-black text-primary/60 uppercase">
                                                        Fecha
                                                    </p>
                                                    <p className="text-xs leading-none font-black">
                                                        {entregaSeleccionada.fecha_entrega
                                                            ? entregaSeleccionada.fecha_entrega.split(
                                                                  'T',
                                                              )[0]
                                                            : 'No agendada'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-primary/[0.03] p-5">
                                                <div className="rounded-xl border border-primary/5 bg-white p-2 shadow-sm">
                                                    <Truck className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-[9px] leading-none font-black text-primary/60 uppercase">
                                                        Vehículo
                                                    </p>
                                                    <p className="text-xs leading-none font-black">
                                                        {vehiculos.find(
                                                            (v) =>
                                                                v.id.toString() ===
                                                                entregaSeleccionada.vehiculo_id?.toString(),
                                                        )?.placa ||
                                                            'No asignado'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-primary/[0.03] p-5">
                                                <div className="rounded-xl border border-primary/5 bg-white p-2 shadow-sm">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-[9px] leading-none font-black text-primary/60 uppercase">
                                                        Conductor
                                                    </p>
                                                    <p className="w-32 truncate text-xs leading-none font-black">
                                                        {conductores.find(
                                                            (c) =>
                                                                c.id.toString() ===
                                                                entregaSeleccionada.conductor_id?.toString(),
                                                        )?.nombre ||
                                                            'Pendiente'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="mb-4 text-[10px] font-black tracking-[0.2em] text-primary/70 uppercase">
                                            Línea de Vida
                                        </h3>
                                        <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[2px] before:rounded-full before:bg-muted">
                                            <div className="group relative flex items-center gap-3">
                                                <div className="absolute -left-6 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 shadow-sm ring-4 ring-white transition-transform group-hover:scale-125">
                                                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <p className="text-[10px] font-bold text-muted-foreground">
                                                    Pedido Procesado
                                                </p>
                                            </div>
                                            <div className="group relative flex items-center gap-3">
                                                <div
                                                    className={`absolute -left-6 h-4 w-4 rounded-full ${['en_ruta', 'entregado'].includes(entregaSeleccionada.estado) ? 'bg-blue-500' : 'bg-muted'} z-10 flex items-center justify-center shadow-sm ring-4 ring-white transition-transform group-hover:scale-125`}
                                                >
                                                    <Truck className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <p className="text-[10px] font-bold text-muted-foreground">
                                                    Despacho en Tránsito
                                                </p>
                                            </div>
                                            <div className="group relative flex items-center gap-3">
                                                <div
                                                    className={`absolute -left-6 h-4 w-4 rounded-full ${entregaSeleccionada.estado === 'entregado' ? 'bg-green-500' : 'bg-muted'} z-10 flex items-center justify-center shadow-sm ring-4 ring-white transition-transform group-hover:scale-125`}
                                                >
                                                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <p className="text-[10px] font-bold text-muted-foreground">
                                                    Entrega Realizada
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <DialogFooter className="border-t border-border/50 bg-muted/5 p-8 pt-4">
                                <Button
                                    onClick={() => setIsVerOpen(false)}
                                    className="h-12 w-full rounded-[20px] bg-foreground px-12 text-lg font-black tracking-tighter text-background shadow-xl shadow-foreground/10 transition-all hover:bg-foreground/90 active:scale-95"
                                >
                                    Cerrar Seguimiento
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
