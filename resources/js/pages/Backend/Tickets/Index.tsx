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
    LifeBuoy,
    MessageSquare,
    Clock,
    AlertCircle,
    User,
    Package,
    Eye,
    TrendingUp,
    ShieldAlert,
    Activity,
    Users,
    ClipboardList
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Ticket {
    id: number;
    titulo: string;
    descripcion: string | null;
    cliente_id: number | null;
    cliente?: { id: number; nombre: string } | null;
    producto_id: number | null;
    producto?: { id: number; nombre: string } | null;
    prioridad: string;
    estado: string;
    categoria: string | null;
    asignado_a: string | null;
    created_at: string;
}

interface Cliente {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'CRM', href: '/tickets' },
    { title: 'Centro de Soporte', href: '/tickets' },
];

const PRIORIDADES = [
    { value: 'baja', label: 'Baja', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { value: 'media', label: 'Media', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-500/10 text-red-600 border-red-200' },
];

const ESTADOS = [
    { value: 'abierto', label: 'Abierto', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { value: 'pendiente', label: 'Pendiente', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { value: 'resuelto', label: 'Resuelto', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { value: 'cerrado', label: 'Cerrado', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
];

export default function Index({
    tickets,
    clientes,
    productos,
    filters,
}: {
    tickets: { data: Ticket[]; links: any[]; meta: any };
    clientes: Cliente[];
    productos: Producto[];
    filters: {
        search?: string;
        estado?: string;
        prioridad?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Ticket | null>(null);
    const [viendo, setViendo] = useState<Ticket | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado || 'all');
    const [prioridadFilter, setPrioridadFilter] = useState(filters.prioridad || 'all');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
    } = useForm({
        titulo: '',
        descripcion: '',
        cliente_id: '' as string | number,
        producto_id: '' as string | number,
        prioridad: 'media',
        estado: 'abierto',
        categoria: '',
        asignado_a: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (estadoFilter !== 'all') query.estado = estadoFilter;
            if (prioridadFilter !== 'all') query.prioridad = prioridadFilter;

            router.get('/tickets', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, estadoFilter, prioridadFilter]);

    const handleExport = (type: 'csv' | 'excel') => {
        const baseUrl = type === 'csv' ? '/tickets/export' : '/tickets/export-excel';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (estadoFilter !== 'all') params.append('estado', estadoFilter);
        if (prioridadFilter !== 'all') params.append('prioridad', prioridadFilter);
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'excel') => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            router.post(type === 'csv' ? '/tickets/import' : '/tickets/import-excel', formData, {
                onSuccess: () => {
                    if (csvInputRef.current) csvInputRef.current.value = '';
                    if (excelInputRef.current) excelInputRef.current.value = '';
                },
            });
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setEstadoFilter('all');
        setPrioridadFilter('all');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/tickets/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/tickets', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (ticket: Ticket) => {
        setEditando(ticket);
        setData({
            titulo: ticket.titulo,
            descripcion: ticket.descripcion || '',
            cliente_id: ticket.cliente_id || '',
            producto_id: ticket.producto_id || '',
            prioridad: ticket.prioridad,
            estado: ticket.estado,
            categoria: ticket.categoria || '',
            asignado_a: ticket.asignado_a || '',
        });
        setIsOpen(true);
    };

    const handleView = (ticket: Ticket) => {
        setViendo(ticket);
        setIsViewOpen(true);
    };

    const handleNew = () => {
        setEditando(null);
        reset();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este ticket?')) {
            destroy(`/tickets/${id}`);
        }
    };

    const getPrioridadConfig = (val: string) => {
        return PRIORIDADES.find(p => p.value === val) || { label: val, color: 'bg-gray-500/10 text-gray-600 border-gray-200' };
    };

    const getEstadoConfig = (val: string) => {
        return ESTADOS.find(e => e.value === val) || { label: val, color: 'bg-gray-500/10 text-gray-600 border-gray-200' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centro de Soporte y Tickets" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <LifeBuoy className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Support Operations</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Soporte Técnico</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Gestión centralizada de incidencias, requerimientos y atención al cliente
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={(e) => handleImport(e, 'csv')} />
                        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => handleImport(e, 'excel')} />
                        
                        <div className="flex gap-1 mr-2">
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => csvInputRef.current?.click()}>
                                <Upload className="h-4 w-4" />
                                <span className="hidden lg:inline">Importar</span> CSV
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => excelInputRef.current?.click()}>
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden lg:inline">Importar</span> Excel
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => handleExport('csv')}>
                                <Download className="h-4 w-4" />
                                <span className="hidden lg:inline">Exportar</span> CSV
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => handleExport('excel')}>
                                <FileText className="h-4 w-4" />
                                <span className="hidden lg:inline">Exportar</span> Excel
                            </Button>
                        </div>
                        
                        <Button onClick={handleNew} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    <CardTitle>Cola de Atención</CardTitle>
                                </div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {tickets.meta?.total || tickets.data.length} Registros
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/20 border-b border-muted/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título, cliente o asignado..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 pl-10 border-none bg-background/50 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
                                        <SelectTrigger className="h-10 w-[160px] border-none bg-background/50">
                                            <SelectValue placeholder="Prioridad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {PRIORIDADES.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                        <SelectTrigger className="h-10 w-[160px] border-none bg-background/50">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {ESTADOS.map((e) => (
                                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-none bg-background/50" onClick={limpiarFiltros}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">Asunto / ID</th>
                                            <th className="px-6 py-4 text-left">Cliente / Producto</th>
                                            <th className="px-6 py-4 text-center">Prioridad</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                            <th className="px-6 py-4 text-left">Asignado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {tickets.data.map((t) => (
                                            <tr key={t.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-sm tracking-tight text-foreground line-clamp-1">{t.titulo}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">TK-{t.id.toString().padStart(5, '0')}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <Users className="h-3 w-3 text-primary/60" />
                                                            {t.cliente?.nombre || 'General'}
                                                        </div>
                                                        {t.producto && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                <Package className="h-2.5 w-2.5" />
                                                                {t.producto.nombre}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className={`${getPrioridadConfig(t.prioridad).color} border text-[9px] uppercase font-black px-2 py-0.5 rounded-full`}>
                                                        {getPrioridadConfig(t.prioridad).label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className={`${getEstadoConfig(t.estado).color} border text-[9px] uppercase font-black px-2 py-0.5 rounded-full`}>
                                                        {getEstadoConfig(t.estado).label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                            {t.asignado_a ? t.asignado_a.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <span className="text-xs font-medium text-muted-foreground">{t.asignado_a || 'Sin asignar'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleView(t)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(t)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {tickets.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Activity className="h-10 w-10 opacity-20" />
                                                        <p className="font-medium">No hay tickets que coincidan con la búsqueda</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-muted/50">
                                <Pagination links={tickets.links} meta={tickets.meta || tickets} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Incidence Management</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Modificar Ticket' : 'Registrar Nuevo Incidente'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-2 overflow-y-auto max-h-[80vh]">
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título / Asunto *</Label>
                                <Input value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} required placeholder="Ej: No puedo acceder al panel de inventarios" className="h-11 border-none bg-muted/30 font-bold" />
                                {errors.titulo && <p className="text-[10px] font-bold text-destructive">{errors.titulo}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente Relacionado</Label>
                                    <Select value={data.cliente_id.toString()} onValueChange={(v) => setData('cliente_id', v)}>
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                            <SelectValue placeholder="Seleccione cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Sin cliente (General)</SelectItem>
                                            {clientes.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Producto Afectado</Label>
                                    <Select value={data.producto_id.toString()} onValueChange={(v) => setData('producto_id', v)}>
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                            <SelectValue placeholder="Asociar a producto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Ningún producto en particular</SelectItem>
                                            {productos.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prioridad</Label>
                                    <Select value={data.prioridad} onValueChange={(v) => setData('prioridad', v)}>
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORIDADES.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</Label>
                                    <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS.map((e) => (
                                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asignar a</Label>
                                    <Input value={data.asignado_a} onChange={(e) => setData('asignado_a', e.target.value)} placeholder="Nombre del responsable" className="h-11 border-none bg-muted/30 font-bold" />
                                </div>
                            </div>
                            
                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4" /> Descripción Detallada
                                </Label>
                                <textarea
                                    value={data.descripcion || ''}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className="flex min-h-[120px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                                    placeholder="Explique el problema, pasos para reproducir o requerimiento técnico..."
                                />
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 border-t pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Cerrar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> {editando ? 'Actualizar Información' : 'Generar Ticket'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-2xl border-none shadow-2xl p-0 overflow-hidden">
                    {viendo && (
                        <>
                            <DialogHeader className="bg-gradient-to-br from-slate-950 to-indigo-950 p-8 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <LifeBuoy className="h-32 w-32 rotate-12 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex gap-2 items-center mb-3">
                                        <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black uppercase tracking-widest px-3">Ticket ID: TK-{viendo.id.toString().padStart(5, '0')}</Badge>
                                        <Badge variant="outline" className={`${getPrioridadConfig(viendo.prioridad).color} border-none text-[9px] font-black uppercase px-3 py-1`}>
                                            {getPrioridadConfig(viendo.prioridad).label}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-3xl font-black tracking-tight text-white leading-tight">{viendo.titulo}</DialogTitle>
                                    <DialogDescription className="text-indigo-200/60 font-medium">Cronología y seguimiento de incidencia operativa</DialogDescription>
                                </div>
                            </DialogHeader>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <User className="h-4 w-4" /> Intervinientes
                                        </h3>
                                        <div className="space-y-3 p-5 rounded-2xl border border-muted/50 bg-muted/10">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Solicitante</span>
                                                <p className="text-sm font-bold">{viendo.cliente?.nombre || 'General / Interno'}</p>
                                            </div>
                                            <div className="pt-3 border-t border-muted/50">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsable Asignado</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">
                                                        {viendo.asignado_a ? viendo.asignado_a.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <p className="text-xs font-bold italic">{viendo.asignado_a || 'Pendiente de asignación'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> Estado Operativo
                                        </h3>
                                        <div className="space-y-4 p-5 rounded-2xl border border-muted/50 bg-muted/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estado</span>
                                                <Badge className={`${getEstadoConfig(viendo.estado).color} border-none text-[10px] font-black uppercase px-3 py-1`}>
                                                    {getEstadoConfig(viendo.estado).label}
                                                </Badge>
                                            </div>
                                            <div className="pt-3 border-t border-muted/50 space-y-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" /> Fecha de Apertura
                                                </span>
                                                <p className="text-xs font-bold">{new Date(viendo.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {viendo.producto && (
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 flex items-center gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground">Ítem Relacionado</span>
                                            <p className="text-xs font-bold">{viendo.producto.nombre}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-background border text-[9px] font-black text-muted-foreground">MÓDULO PRODUCTOS</div>
                                    </div>
                                )}
                                
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="h-4 w-4 text-slate-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expedición de Motivos</span>
                                        </div>
                                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                            {viendo.descripcion || 'Sin descripción técnica detallada.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-8 border-t bg-muted/10 items-center justify-between">
                                <p className="text-[10px] font-bold text-muted-foreground italic max-w-[200px]">Este ticket forma parte del registro de calidad ISO-9001.</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-full px-8 font-black">Cerrar</Button>
                                    <Button onClick={() => { setIsViewOpen(false); handleEdit(viendo); }} className="rounded-full px-8 font-black bg-primary">Intervenir Ticket</Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
