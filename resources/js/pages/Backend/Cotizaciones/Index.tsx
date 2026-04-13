import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Pencil, Plus, Trash2, Download, Search, X, Eye, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface Cliente {
    id: number;
    nombre: string;
}
interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_venta: number;
}
interface CotizacionDetalle {
    producto_id?: number | null;
    descripcion: string;
    cantidad: number;
    precio: number;
}
interface Cotizacion {
    id: number;
    numero: string;
    cliente_id: number;
    fecha: string;
    fecha_validez: string | null;
    subtotal: number;
    impuesto: number;
    total: number;
    estado: string;
    notas: string | null;
    detalles: CotizacionDetalle[] | null;
    condiciones: string | null;
    iva_personalizado: number;
    descuento_tipo: 'monto' | 'porcentaje' | null;
    descuento_monto: number | null;
    cliente?: Cliente;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cotizaciones', href: '/cotizaciones' },
];

const estados = ['borrador', 'enviada', 'aceptada', 'rechazada', 'expirada'];

export default function Index({
    cotizaciones,
    clientes,
    productos,
}: {
    cotizaciones: {
        data: Cotizacion[];
        links: any[];
        meta?: any;
        total: number;
    };
    clientes: Cliente[];
    productos: Producto[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Cotizacion | null>(null);
    const [viendo, setViendo] = useState<Cotizacion | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        clearErrors,
        transform,
    } = useForm({
        numero: '',
        cliente_id: '' as string,
        fecha: '',
        fecha_validez: '',
        subtotal: 0,
        impuesto: 0,
        total: 0,
        estado: 'borrador',
        notas: '',
        detalles: [] as CotizacionDetalle[],
        condiciones:
            'Condiciones de pago: 50% al aprobar, 50% contra entrega.\nValidez de la oferta: 15 días.',
        iva_personalizado: 19,
        descuento_tipo: null as 'monto' | 'porcentaje' | null,
        descuento_monto: 0,
    });

    const [filtroMontoHasta, setFiltroMontoHasta] = useState('');
    
    // Preview HTML state for the "Ver" modal
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const [filtros, setFiltros] = useState({
        busqueda: '',
        cliente_id: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const cotizacionesFiltradas = useMemo(() => {
        return cotizaciones.data.filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.numero?.toLowerCase().includes(busca) &&
                    !c.cliente?.nombre?.toLowerCase().includes(busca) &&
                    !c.notas?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.cliente_id &&
                filtros.cliente_id !== 'all' &&
                c.cliente_id.toString() !== filtros.cliente_id
            )
                return false;
            if (filtros.estado && filtros.estado !== 'all' && c.estado !== filtros.estado) return false;
            if (filtros.fechaDesde && c.fecha < filtros.fechaDesde)
                return false;
            if (filtros.fechaHasta && c.fecha > filtros.fechaHasta)
                return false;
            return true;
        });
    }, [cotizaciones, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            cliente_id: 'all',
            estado: 'all',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const generarNumero = () => `COT-${Date.now().toString().slice(-6)}`;

    // Recalcular totales cuando cambien los detalles o los descuentos/iva
    useEffect(() => {
        let nSubtotal = 0;
        data.detalles.forEach((d) => {
            const precio = Math.round(d.precio || 0);
            nSubtotal += Math.round((d.cantidad || 0) * precio);
        });

        let descuentoAplicado = 0;
        if (data.descuento_tipo === 'monto' && data.descuento_monto) {
            descuentoAplicado = Math.round(Number(data.descuento_monto));
        } else if (
            data.descuento_tipo === 'porcentaje' &&
            data.descuento_monto
        ) {
            descuentoAplicado = Math.round(
                nSubtotal * (Number(data.descuento_monto) / 100)
            );
        }

        const nNeto = Math.round(nSubtotal - descuentoAplicado);
        const porcIva =
            Number(data.iva_personalizado) >= 0
                ? Number(data.iva_personalizado)
                : 19;
        const nImpuesto = Math.round(nNeto * (porcIva / 100));
        const nTotal = nNeto + nImpuesto;

        setData((prev) => ({
            ...prev,
            subtotal: Math.round(nSubtotal),
            impuesto: nImpuesto,
            total: nTotal,
        }));
    }, [
        data.detalles,
        data.descuento_tipo,
        data.descuento_monto,
        data.iva_personalizado,
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            cliente_id: Number(data.cliente_id),
            detalles: data.detalles.map((d: any) => ({
                ...d,
                producto_id: d.producto_id ? Number(d.producto_id) : null,
            })),
        }));

        if (editando) {
            put(`/cotizaciones/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        } else {
            post('/cotizaciones', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        }
    };

    const openVerModal = (cotizacion: Cotizacion) => {
        setViendo(cotizacion);
        setPreviewHtml(null);
        setIsLoadingPreview(true);
        setIsViewOpen(true);
        
        fetch(`/cotizaciones/${cotizacion.id}/preview`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(res => res.text())
        .then(html => {
            setPreviewHtml(html);
            setIsLoadingPreview(false);
        })
        .catch(err => {
            console.error("Error cargando preview:", err);
            setIsLoadingPreview(false);
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        let url = '/cotizaciones/export?';
        const params = new URLSearchParams();
        if (filtros.fechaDesde) params.append('fecha_desde', filtros.fechaDesde);
        if (filtros.fechaHasta) params.append('fecha_hasta', filtros.fechaHasta);
        window.location.href = url + params.toString();
    };

    const handleExportExcel = () => {
        let url = '/cotizaciones/export-excel?';
        const params = new URLSearchParams();
        if (filtros.fechaDesde) params.append('fecha_desde', filtros.fechaDesde);
        if (filtros.fechaHasta) params.append('fecha_hasta', filtros.fechaHasta);
        window.location.href = url + params.toString();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            router.post('/cotizaciones/import', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        }
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleEdit = (cot: Cotizacion) => {
        setEditando(cot);
        clearErrors();
        setData({
            numero: cot.numero,
            cliente_id: String(cot.cliente_id),
            fecha: cot.fecha ? cot.fecha.substring(0, 10) : '',
            fecha_validez: cot.fecha_validez
                ? cot.fecha_validez.substring(0, 10)
                : '',
            subtotal: Number(cot.subtotal) || 0,
            impuesto: Number(cot.impuesto) || 0,
            total: Number(cot.total) || 0,
            estado: cot.estado,
            notas: cot.notas || '',
            detalles: cot.detalles || [],
            condiciones: cot.condiciones || '',
            iva_personalizado:
                cot.iva_personalizado !== null &&
                cot.iva_personalizado !== undefined
                    ? Number(cot.iva_personalizado)
                    : 19,
            descuento_tipo:
                (cot.descuento_tipo as 'monto' | 'porcentaje') || null,
            descuento_monto: cot.descuento_monto
                ? Number(cot.descuento_monto)
                : 0,
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        clearErrors();
        setData({
            numero: generarNumero(),
            cliente_id: '',
            fecha: new Date().toISOString().split('T')[0],
            fecha_validez: '',
            subtotal: 0,
            impuesto: 0,
            total: 0,
            estado: 'borrador',
            notas: '',
            detalles: [
                { producto_id: null, descripcion: '', cantidad: 1, precio: 0 },
            ],
            condiciones:
                'Condiciones de pago: 50% al aprobar, 50% contra entrega.\nValidez de la oferta: 15 días.',
            iva_personalizado: 19,
            descuento_tipo: null,
            descuento_monto: 0,
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/cotizaciones/${id}`);
    };

    const addDetalle = () => {
        setData('detalles', [
            ...data.detalles,
            { producto_id: null, descripcion: '', cantidad: 1, precio: 0 },
        ]);
    };

    const updateDetalle = (
        index: number,
        field: keyof CotizacionDetalle,
        value: any,
    ) => {
        const newDetalles = [...data.detalles];
        newDetalles[index] = { ...newDetalles[index], [field]: value };

        // If product changes, auto-fill description and price
        if (field === 'producto_id' && value) {
            const prod = productos.find((p) => p.id === Number(value));
            if (prod) {
                newDetalles[index].descripcion =
                    prod.nombre +
                    (prod.descripcion ? ` - ${prod.descripcion}` : '');
                newDetalles[index].precio = Number(prod.precio_venta) || 0;
            }
        } else if (field === 'producto_id' && !value) {
            newDetalles[index].descripcion = '';
            newDetalles[index].precio = 0;
        }

        setData('detalles', newDetalles);
    };

    const removeDetalle = (index: number) => {
        setData(
            'detalles',
            data.detalles.filter((_, i) => i !== index),
        );
    };

    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            borrador: 'bg-gray-500',
            enviada: 'bg-blue-500',
            aceptada: 'bg-green-500',
            rechazada: 'bg-red-500',
            expirada: 'bg-orange-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="Cotizaciones" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Cotizaciones</h1>
                            <p className="text-muted-foreground">
                                Gestión de cotizaciones en formato chileno
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".csv" 
                                onChange={handleImport} 
                            />
                            <Button variant="outline" onClick={triggerImport} className="gap-2">
                                <Upload className="h-4 w-4" /> Importar CSV
                            </Button>
                             <Button variant="outline" onClick={handleExport} className="gap-2">
                                <Download className="h-4 w-4" /> Exportar CSV
                            </Button>
                            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                                <Download className="h-4 w-4" /> Exportar Excel
                            </Button>
                            <Button onClick={handleNew} className="gap-2">
                                <Plus className="h-4 w-4" /> Nueva Cotización
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Cotizaciones</CardTitle>
                            <CardDescription>
                                {cotizacionesFiltradas.length} registros
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-muted/50 p-4 border shadow-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative group">
                                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            placeholder="Buscar número, cliente o notas..."
                                            value={filtros.busqueda}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    busqueda: e.target.value,
                                                })
                                            }
                                            className="h-10 pl-9 transition-all border-muted-foreground/20 focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <Select
                                    value={filtros.cliente_id}
                                    onValueChange={(v) =>
                                        setFiltros({
                                            ...filtros,
                                            cliente_id: v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[200px] h-10 bg-background border-muted-foreground/20">
                                        <SelectValue placeholder="Todos los clientes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los clientes</SelectItem>
                                        {clientes.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filtros.estado}
                                    onValueChange={(v) =>
                                        setFiltros({
                                            ...filtros,
                                            estado: v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[180px] h-10 bg-background border-muted-foreground/20">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        {estados.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {e.charAt(0).toUpperCase() + e.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-4 border-muted-foreground/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                    onClick={limpiarFiltros}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Limpiar Filtros
                                </Button>
                            </div>
                            {cotizaciones.data.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    No hay cotizaciones
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                                    Número
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                                    Cliente
                                                </th>
                                                <th className="hidden px-4 py-3 text-left font-medium whitespace-nowrap sm:table-cell">
                                                    Fecha
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                                                    Estado
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cotizacionesFiltradas.map((c) => (
                                                <tr
                                                    key={c.id}
                                                    className="border-b transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 font-mono whitespace-nowrap">
                                                        {c.numero}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span
                                                            className="block max-w-[150px] truncate"
                                                            title={
                                                                c.cliente
                                                                    ?.nombre
                                                            }
                                                        >
                                                            {c.cliente
                                                                ?.nombre || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">
                                                        {formatDateCLP(c.fecha)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-green-600">
                                                        {formatCurrencyCLP(
                                                            c.total,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        {getEstadoBadge(
                                                            c.estado,
                                                        )}
                                                    </td>
                                                    <td className="flex items-center justify-end gap-1 px-4 py-2 text-right whitespace-nowrap">
                                                        <a
                                                            href={`/cotizaciones/${c.id}/pdf`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Descargar PDF"
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => openVerModal(c)}
                                                            title="Ver Cotización"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(c)
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
                                                                    c.id,
                                                                )
                                                            }
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {cotizacionesFiltradas.length ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        No se encontraron
                                                        cotizaciones con los
                                                        filtros aplicados
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <Pagination 
                                links={cotizaciones.links} 
                                meta={cotizaciones.meta || {
                                    from: (cotizaciones as any).from,
                                    to: (cotizaciones as any).to,
                                    total: cotizaciones.total
                                }} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-4xl md:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} Cotización
                        </DialogTitle>
                    </DialogHeader>
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="text-sm text-red-700">
                                <strong>Corrija los siguientes errores:</strong>
                                <ul className="mt-1 list-disc pl-5">
                                    {Object.entries(errors).map(
                                        ([key, error]) => (
                                            <li key={key}>
                                                {key}: {error}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Número *</Label>
                                    <Input
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData('numero', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.numero} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha}
                                        onChange={(e) =>
                                            setData('fecha', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.fecha} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Venc. (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_validez}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_validez',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.fecha_validez}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                    <InputError message={errors.cliente_id} />
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

                            <div className="mt-4 rounded-md border bg-muted/20 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        Detalles de la Cotización
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addDetalle}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />{' '}
                                        Agregar Ítem
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {data.detalles.map((detalle, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-start gap-2 border-b pb-3 md:flex-row md:items-center md:border-0 md:pb-0"
                                        >
                                            <div className="w-full shrink-0 md:w-48 md:min-w-[200px]">
                                                <Label className="mb-1 text-xs text-muted-foreground md:hidden">
                                                    Producto
                                                </Label>
                                                <select
                                                    value={
                                                        detalle.producto_id ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        updateDetalle(
                                                            idx,
                                                            'producto_id',
                                                            e.target.value
                                                                ? Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : null,
                                                        )
                                                    }
                                                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Personalizado...
                                                    </option>
                                                    {productos.map((p) => (
                                                        <option
                                                            key={p.id}
                                                            value={p.id}
                                                        >
                                                            {p.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-full flex-1 md:min-w-[200px]">
                                                <Label className="mb-1 text-xs text-muted-foreground md:hidden">
                                                    Descripción
                                                </Label>
                                                <Input
                                                    placeholder="Descripción del producto o servicio"
                                                    value={detalle.descripcion}
                                                    onChange={(e) =>
                                                        updateDetalle(
                                                            idx,
                                                            'descripcion',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="w-full shrink-0 md:w-24 md:min-w-[80px]">
                                                <Label className="mb-1 text-xs text-muted-foreground md:hidden">
                                                    Cant.
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Cant."
                                                    value={detalle.cantidad}
                                                    onChange={(e) =>
                                                        updateDetalle(
                                                            idx,
                                                            'cantidad',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="w-full shrink-0 md:w-32 md:min-w-[120px]">
                                                <Label className="mb-1 text-xs text-muted-foreground md:hidden">
                                                    Precio Unitario
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Precio"
                                                    value={detalle.precio}
                                                    onChange={(e) =>
                                                        updateDetalle(
                                                            idx,
                                                            'precio',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="flex w-full justify-end md:w-auto">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-4 text-destructive md:mt-0"
                                                    onClick={() =>
                                                        removeDetalle(idx)
                                                    }
                                                    disabled={
                                                        data.detalles.length ===
                                                        1
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 border-t pt-4 sm:flex-row sm:justify-between">
                                <div className="space-y-4 sm:w-1/2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Aplicar Descuento
                                            </Label>
                                            <select
                                                value={
                                                    data.descuento_tipo || ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'descuento_tipo',
                                                        e.target.value
                                                            ? (e.target
                                                                  .value as
                                                                  | 'monto'
                                                                  | 'porcentaje')
                                                            : null,
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                                            >
                                                <option value="">
                                                    Ninguno
                                                </option>
                                                <option value="monto">
                                                    Fijo ($)
                                                </option>
                                                <option value="porcentaje">
                                                    Porcentaje (%)
                                                </option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Monto/Porcentaje
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.descuento_monto || 0
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'descuento_monto',
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                disabled={!data.descuento_tipo}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-1/2 space-y-1">
                                        <Label className="text-xs">
                                            IVA Personalizado (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.iva_personalizado}
                                            onChange={(e) =>
                                                setData(
                                                    'iva_personalizado',
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1 text-sm sm:w-1/2">
                                    <div className="flex w-full justify-between sm:w-64">
                                        <span className="text-muted-foreground">
                                            Subtotal:
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrencyCLP(data.subtotal)}
                                        </span>
                                    </div>
                                    {data.descuento_tipo && (
                                        <div className="flex w-full justify-between text-red-600 sm:w-64">
                                            <span>
                                                Desc. (
                                                {data.descuento_tipo ===
                                                'porcentaje'
                                                    ? `${data.descuento_monto}%`
                                                    : '$'}
                                                ):
                                            </span>
                                            <span>
                                                -
                                                {formatCurrencyCLP(
                                                    Number(data.subtotal) -
                                                        (Number(data.subtotal) -
                                                            (data.descuento_tipo ===
                                                            'monto'
                                                                ? Number(
                                                                      data.descuento_monto,
                                                                  )
                                                                : Number(
                                                                      data.subtotal,
                                                                  ) *
                                                                  (Number(
                                                                      data.descuento_monto,
                                                                  ) /
                                                                      100))),
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex w-full justify-between sm:w-64">
                                        <span className="text-muted-foreground">
                                            IVA ({data.iva_personalizado}%):
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrencyCLP(data.impuesto)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex w-full justify-between border-t pt-2 text-base sm:w-64">
                                        <span className="font-bold">
                                            Total:
                                        </span>
                                        <span className="font-bold text-green-600">
                                            {formatCurrencyCLP(data.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>
                                        Condiciones y Notas Comerciales
                                    </Label>
                                    <textarea
                                        value={data.condiciones}
                                        onChange={(e) =>
                                            setData(
                                                'condiciones',
                                                e.target.value,
                                            )
                                        }
                                        className="flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        placeholder="Términos comerciales, de pago u otras condiciones..."
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
                            <Button type="submit">Guardar Cotización</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Vista Premium (Estilo Proforma) */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white shadow-2xl h-[90vh] flex flex-col">
                    <DialogHeader className="hidden">
                        <DialogTitle>Ver Cotización</DialogTitle>
                    </DialogHeader>
                    {viendo && (
                        <div className="flex flex-col h-full w-full">
                            <div className="flex justify-between items-center bg-slate-100 p-4 border-b shrink-0">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Badge className="bg-blue-500 uppercase">Cotización</Badge>
                                    {viendo.numero}
                                </h3>
                                <a
                                    href={`/cotizaciones/${viendo.id}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                        <Download className="mr-2 h-4 w-4" /> Exportar PDF
                                    </Button>
                                </a>
                            </div>
                            <div className="flex-1 w-full bg-slate-200/80 p-6 overflow-y-auto overflow-x-hidden relative flex justify-center">
                                <div className="bg-white shadow-xl ring-1 ring-slate-900/5 w-full h-[297mm] min-h-[min-content] relative overflow-hidden" style={{ maxWidth: '210mm' }}>
                                    {isLoadingPreview && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                    {previewHtml && (
                                        <iframe 
                                            srcDoc={previewHtml} 
                                            className="w-full h-full border-none" 
                                            title="Vista Previa Cotización"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
