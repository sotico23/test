import { Head, useForm, router } from '@inertiajs/react';
import { 
    Check, 
    Pencil, 
    Plus, 
    Trash2, 
    Search, 
    X, 
    Download, 
    Upload, 
    FileSpreadsheet, 
    FileText,
    Eye,
    Calculator,
    Calendar,
    User,
    Package,
    ShoppingCart,
    FileCheck,
    AlertCircle,
    Printer,
    ClipboardList,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { BulkActions } from '@/components/shared/BulkActions';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

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
    cliente?: Cliente;
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/cotizaciones' },
    { title: 'Presupuestos y Cotizaciones', href: '/cotizaciones' },
];

const ESTADOS = [
    { value: 'borrador', label: 'Borrador', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
    { value: 'enviada', label: 'Enviada', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'aceptada', label: 'Aceptada', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { value: 'rechazada', label: 'Rechazada', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'expirada', label: 'Expirada', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
];


export default function Index({
    cotizaciones,
    clientes,
    productos,
    filters,
}: {
    cotizaciones: { data: Cotizacion[]; links: any[]; meta: any };
    clientes: Cliente[];
    productos: Producto[];
    filters: {
        search?: string;
        cliente_id?: string;
        estado?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Cotizacion | null>(null);
    const [viendo, setViendo] = useState<Cotizacion | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [clienteFilter, setClienteFilter] = useState(filters.cliente_id || 'all');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado || 'all');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
        clearErrors,
    } = useForm({
        numero: '',
        cliente_id: '' as string | number,
        fecha: new Date().toISOString().split('T')[0],
        fecha_validez: '',
        subtotal: 0,
        impuesto: 0,
        total: 0,
        estado: 'borrador',
        notas: '',
        detalles: [] as CotizacionDetalle[],
        condiciones: 'Condiciones de pago: 50% al aprobar, 50% contra entrega.\nValidez de la oferta: 15 días.',
        iva_personalizado: 19,
        descuento_tipo: null as 'monto' | 'porcentaje' | null,
        descuento_monto: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (clienteFilter !== 'all') query.cliente_id = clienteFilter;
            if (estadoFilter !== 'all') query.estado = estadoFilter;

            router.get('/cotizaciones', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, clienteFilter, estadoFilter]);

    // Totals Calculation logic
    useEffect(() => {
        let nSubtotal = 0;
        data.detalles.forEach((d) => {
            const precio = Math.round(d.precio || 0);
            nSubtotal += Math.round((d.cantidad || 0) * precio);
        });

        let descuentoAplicado = 0;
        if (data.descuento_tipo === 'monto' && data.descuento_monto) {
            descuentoAplicado = Math.round(Number(data.descuento_monto));
        } else if (data.descuento_tipo === 'porcentaje' && data.descuento_monto) {
            descuentoAplicado = Math.round(nSubtotal * (Number(data.descuento_monto) / 100));
        }

        const nNeto = Math.round(nSubtotal - descuentoAplicado);
        const porcIva = Number(data.iva_personalizado) >= 0 ? Number(data.iva_personalizado) : 19;
        const nImpuesto = Math.round(nNeto * (porcIva / 100));
        const nTotal = nNeto + nImpuesto;

        setData((prev) => ({
            ...prev,
            subtotal: Math.round(nSubtotal),
            impuesto: nImpuesto,
            total: nTotal,
        }));
    }, [data.detalles, data.descuento_tipo, data.descuento_monto, data.iva_personalizado]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...data,
            cliente_id: Number(data.cliente_id),
            detalles: data.detalles.map(d => ({
                ...d,
                producto_id: d.producto_id ? Number(d.producto_id) : null
            }))
        };

        if (editando) {
            put(`/cotizaciones/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/cotizaciones', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (cot: Cotizacion) => {
        setEditando(cot);
        setData({
            numero: cot.numero,
            cliente_id: String(cot.cliente_id),
            fecha: cot.fecha ? cot.fecha.substring(0, 10) : '',
            fecha_validez: cot.fecha_validez ? cot.fecha_validez.substring(0, 10) : '',
            subtotal: Number(cot.subtotal) || 0,
            impuesto: Number(cot.impuesto) || 0,
            total: Number(cot.total) || 0,
            estado: cot.estado,
            notas: cot.notas || '',
            detalles: cot.detalles || [],
            condiciones: cot.condiciones || '',
            iva_personalizado: cot.iva_personalizado ?? 19,
            descuento_tipo: cot.descuento_tipo || null,
            descuento_monto: Number(cot.descuento_monto) || 0,
        });
        setIsOpen(true);
    };

    const handleView = (cot: Cotizacion) => {
        setViendo(cot);
        setIsViewOpen(true);
    };

    const handleNew = () => {
        setEditando(null);
        reset();
        setData((prev) => ({
            ...prev,
            numero: `COT-${Date.now().toString().slice(-6)}`,
            detalles: [
                { producto_id: null, descripcion: '', cantidad: 1, precio: 0 },
            ],
        }));
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta cotización?')) {
            destroy(`/cotizaciones/${id}`);
        }
    };

    const addDetalle = () => {
        setData('detalles', [
            ...data.detalles,
            { producto_id: null, descripcion: '', cantidad: 1, precio: 0 },
        ]);
    };

    const updateDetalle = (index: number, field: keyof CotizacionDetalle, value: any) => {
        const newDetalles = [...data.detalles];
        newDetalles[index] = { ...newDetalles[index], [field]: value };

        if (field === 'producto_id' && value) {
            const prod = productos.find(p => p.id === Number(value));
            if (prod) {
                newDetalles[index].descripcion = prod.nombre + (prod.descripcion ? ` - ${prod.descripcion}` : '');
                newDetalles[index].precio = Number(prod.precio_venta) || 0;
            }
        }
        setData('detalles', newDetalles);
    };

    const removeDetalle = (index: number) => {
        setData('detalles', data.detalles.filter((_, i) => i !== index));
    };

    const getEstadoConfig = (val: string) => {
        return ESTADOS.find(e => e.value === val) || { label: val, color: 'bg-gray-500/10 text-gray-600 border-gray-200' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Presupuestos y Cotizaciones" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FileCheck className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Sales Management System</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Cotizaciones</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Cree y gestione presupuestos profesionales para sus clientes
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <BulkActions 
                            baseUrl="/cotizaciones"
                            filters={{ 
                                search: searchTerm, 
                                cliente_id: clienteFilter, 
                                estado: estadoFilter 
                            }}
                            modelName="Cotizaciones"
                        />
                        
                        <Button onClick={handleNew} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                    <CardTitle>Historial de Presupuestos</CardTitle>
                                </div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {cotizaciones.meta?.total || cotizaciones.data.length} Cotizaciones
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/20 border-b border-muted/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por número, cliente o notas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 pl-10 border-none bg-background/50 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={clienteFilter} onValueChange={setClienteFilter}>
                                        <SelectTrigger className="h-10 w-[200px] border-none bg-background/50">
                                            <SelectValue placeholder="Cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los clientes</SelectItem>
                                            {clientes.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                        <SelectTrigger className="h-10 w-[160px] border-none bg-background/50">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            {ESTADOS.map((e) => (
                                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-none bg-background/50" onClick={() => { setSearchTerm(''); setClienteFilter('all'); setEstadoFilter('all'); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">Número / Vence</th>
                                            <th className="px-6 py-4 text-left">Cliente</th>
                                            <th className="px-6 py-4 text-right">Total (CLP)</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {cotizaciones.data.map((c) => (
                                            <tr key={c.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-sm tracking-tight text-foreground">{c.numero}</div>
                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {formatDateCLP(c.fecha)}
                                                            {c.fecha_validez && (
                                                                <span className="text-orange-500 ml-1">Vence: {formatDateCLP(c.fecha_validez)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                            {c.cliente?.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">{c.cliente?.nombre || 'General'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="font-black text-sm text-primary">
                                                        {formatCurrencyCLP(c.total)}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground block">Imp: {formatCurrencyCLP(c.impuesto)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className={`${getEstadoConfig(c.estado).color} border text-[9px] uppercase font-black px-2 py-0.5 rounded-full`}>
                                                        {getEstadoConfig(c.estado).label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a href={`/cotizaciones/${c.id}/pdf`} target="_blank" rel="noreferrer">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleView(c)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(c)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-muted/50">
                                <Pagination links={cotizaciones.links} meta={cotizaciones.meta} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-5xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <Calculator className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Financial Document</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? `Editar Cotización ${editando.numero}` : 'Nueva Cotización de Venta'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-2 overflow-y-auto max-h-[85vh]">
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de Documento</Label>
                                    <Input value={data.numero} onChange={(e) => setData('numero', e.target.value)} required className="h-10 border-none bg-muted/30 font-mono font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha Emisión</Label>
                                    <Input type="date" value={data.fecha} onChange={(e) => setData('fecha', e.target.value)} required className="h-10 border-none bg-muted/30 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vencimiento</Label>
                                    <Input type="date" value={data.fecha_validez} onChange={(e) => setData('fecha_validez', e.target.value)} className="h-10 border-none bg-muted/30 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</Label>
                                    <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                                        <SelectTrigger className="h-10 border-none bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS.map((e) => (
                                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente Asignado *</Label>
                                <Select value={data.cliente_id.toString()} onValueChange={(v) => setData('cliente_id', v)}>
                                    <SelectTrigger className="h-11 border-none bg-muted/30 font-bold text-lg">
                                        <SelectValue placeholder="Seleccione un cliente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Detalle de Productos */}
                            <div className="space-y-4 border-t pt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Package className="h-4 w-4" /> Líneas de Cotización
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addDetalle} className="h-8 px-4 rounded-full font-bold border-primary/20 text-primary hover:bg-primary/5">
                                        <Plus className="mr-2 h-3 w-3" /> Agregar Item
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.detalles.map((detalle, idx) => (
                                        <div key={idx} className="group relative grid grid-cols-12 gap-3 p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                                            <div className="col-span-12 md:col-span-5 space-y-1">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Producto / Descripción</Label>
                                                <div className="flex gap-2">
                                                    <Select value={detalle.producto_id?.toString() || ''} onValueChange={(v) => updateDetalle(idx, 'producto_id', v)}>
                                                        <SelectTrigger className="h-9 border-none bg-background/50 font-medium">
                                                            <SelectValue placeholder="Seleccionar producto..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Manual / Sin producto</SelectItem>
                                                            {productos.map((p) => (
                                                                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input 
                                                        value={detalle.descripcion} 
                                                        onChange={(e) => updateDetalle(idx, 'descripcion', e.target.value)}
                                                        placeholder="Descripción personalizada..."
                                                        className="h-9 border-none bg-background/50 font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-1">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Cant.</Label>
                                                <Input 
                                                    type="number" 
                                                    value={detalle.cantidad} 
                                                    onChange={(e) => updateDetalle(idx, 'cantidad', parseFloat(e.target.value))}
                                                    className="h-9 border-none bg-background/50 font-bold"
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-3 space-y-1">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Precio Unit.</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                    <Input 
                                                        type="number" 
                                                        value={detalle.precio} 
                                                        onChange={(e) => updateDetalle(idx, 'precio', parseFloat(e.target.value))}
                                                        className="h-9 pl-6 border-none bg-background/50 font-bold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-3 md:col-span-1 flex items-end justify-end pb-1">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeDetalle(idx)} className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totales y Notas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4" /> Términos y Condiciones
                                        </Label>
                                        <textarea
                                            value={data.condiciones || ''}
                                            onChange={(e) => setData('condiciones', e.target.value)}
                                            className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" /> Notas Internas
                                        </Label>
                                        <textarea
                                            value={data.notas || ''}
                                            onChange={(e) => setData('notas', e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-muted/10 rounded-3xl p-6 space-y-4 border border-muted/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Subtotal Neto</span>
                                        <span className="font-mono font-bold">{formatCurrencyCLP(data.subtotal)}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Descuento</span>
                                            <Select value={data.descuento_tipo || 'none'} onValueChange={(v) => setData('descuento_tipo', v === 'none' ? null : v as any)}>
                                                <SelectTrigger className="h-7 w-24 border-none bg-background py-0 text-[10px] font-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin Desc.</SelectItem>
                                                    <SelectItem value="monto">$ CLP</SelectItem>
                                                    <SelectItem value="porcentaje">% Porc.</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Input 
                                            type="number" 
                                            value={data.descuento_monto || 0} 
                                            disabled={!data.descuento_tipo}
                                            onChange={(e) => setData('descuento_monto', parseFloat(e.target.value))}
                                            className="h-8 border-none bg-background text-right font-bold text-xs"
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">IVA</span>
                                            <Input 
                                                type="number" 
                                                value={data.iva_personalizado || 0} 
                                                onChange={(e) => setData('iva_personalizado', parseFloat(e.target.value))}
                                                className="h-7 w-16 border-none bg-background py-0 text-center font-black text-[10px]"
                                            />
                                            <span className="text-[10px] font-black">%</span>
                                        </div>
                                        <span className="font-mono font-bold text-muted-foreground">{formatCurrencyCLP(data.impuesto)}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                                        <span className="text-xs font-black uppercase tracking-widest text-primary">Total Final</span>
                                        <span className="text-2xl font-black text-primary font-mono">{formatCurrencyCLP(data.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 border-t pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-bold rounded-full px-8">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> {editando ? 'Guardar Cambios' : 'Confirmar y Crear Cotización'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-4xl border-none shadow-2xl p-0 overflow-hidden">
                    {viendo && (
                        <>
                            <DialogHeader className="bg-slate-950 p-10 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <ShoppingCart className="h-40 w-40 rotate-12 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex gap-3 items-center mb-4">
                                        <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-widest px-4 py-1">PRESUPUESTO {viendo.numero}</Badge>
                                        <Badge variant="outline" className={`${getEstadoConfig(viendo.estado).color} border-none text-[10px] font-black uppercase px-4 py-1`}>
                                            {getEstadoConfig(viendo.estado).label}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-4xl font-black tracking-tight text-white mb-2">Resumen de Cotización</DialogTitle>
                                    <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Emitida: {formatDateCLP(viendo.fecha)}</span>
                                        {viendo.fecha_validez && <span className="flex items-center gap-2 text-orange-400"><AlertCircle className="h-4 w-4" /> Vence: {formatDateCLP(viendo.fecha_validez)}</span>}
                                    </div>
                                </div>
                            </DialogHeader>
                            
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Información del Cliente</h3>
                                        <div className="p-6 rounded-3xl bg-muted/20 border border-muted/50 space-y-2">
                                            <p className="text-xl font-black text-foreground">{viendo.cliente?.nombre || 'General'}</p>
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground italic">
                                                <User className="h-3.5 w-3.5" /> Registro Maestro de Clientes
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-right">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Consolidado Financiero</h3>
                                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monto Total a Facturar</p>
                                            <p className="text-3xl font-black text-primary font-mono">{formatCurrencyCLP(viendo.total)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Detalle de Partidas</h3>
                                    <div className="rounded-3xl border border-muted/50 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-muted/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">Descripción del Item</th>
                                                    <th className="px-6 py-4 text-center">Cant.</th>
                                                    <th className="px-6 py-4 text-right">Unitario</th>
                                                    <th className="px-6 py-4 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-muted/30">
                                                {viendo.detalles?.map((d, i) => (
                                                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-foreground">{d.descripcion}</td>
                                                        <td className="px-6 py-4 text-center font-mono font-bold text-muted-foreground">{d.cantidad}</td>
                                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">{formatCurrencyCLP(d.precio)}</td>
                                                        <td className="px-6 py-4 text-right font-mono font-bold text-primary">{formatCurrencyCLP(d.cantidad * d.precio)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {(viendo.condiciones || viendo.notas) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10">
                                        {viendo.condiciones && (
                                            <div className="space-y-3">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                    <FileCheck className="h-4 w-4" /> Condiciones de Venta
                                                </h3>
                                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                    "{viendo.condiciones}"
                                                </p>
                                            </div>
                                        )}
                                        {viendo.notas && (
                                            <div className="space-y-3">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                    <MoreHorizontal className="h-4 w-4" /> Notas Adicionales
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                    {viendo.notas}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <DialogFooter className="p-10 border-t bg-muted/10 items-center justify-between">
                                <p className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Validéz legal según normativa vigente.
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-full px-10 font-black h-11">Cerrar</Button>
                                    <a href={`/cotizaciones/${viendo.id}/pdf`} target="_blank" rel="noreferrer">
                                        <Button className="rounded-full px-10 font-black h-11 bg-primary">
                                            <Printer className="mr-2 h-4 w-4" /> Imprimir Documento
                                        </Button>
                                    </a>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
