import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    ArrowLeftRight,
    ArrowUpCircle,
    ArrowDownCircle,
    Package,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    Hash,
    MoreHorizontal,
    MoreVertical,
    ChevronRight,
    ArrowUpRight,
    LayoutGrid,
    Warehouse,
    History,
    FileJson,
    LibraryBig
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
    DialogDescription,
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
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Movimiento {
    id: number;
    producto: string;
    tipo: string;
    cantidad: number;
    almacen_origen: string | null;
    almacen_destino: string | null;
    referencia: string | null;
    notas: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventarios', href: '/inventarios' },
    { title: 'Registro de Movimientos', href: '/movimientos' },
];

const TIPOS = [
    { value: 'entrada', label: 'Entrada', color: 'bg-green-500/10 text-green-600', icon: ArrowDownCircle },
    { value: 'salida', label: 'Salida', color: 'bg-red-500/10 text-red-600', icon: ArrowUpCircle },
    { value: 'transferencia', label: 'Transferencia', color: 'bg-blue-500/10 text-blue-600', icon: ArrowLeftRight },
    { value: 'ajuste', label: 'Ajuste', color: 'bg-orange-500/10 text-orange-600', icon: History },
];

export default function Index({
    movimientos,
    filters,
}: {
    movimientos: { data: Movimiento[]; links: any[]; meta: any };
    filters: {
        search?: string;
        tipo?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Movimiento | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters.tipo || 'all');
    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

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
        producto: '',
        tipo: 'entrada',
        cantidad: 0,
        almacen_origen: '',
        almacen_destino: '',
        referencia: '',
        notas: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (tipoFilter !== 'all') query.tipo = tipoFilter;

            router.get('/movimientos', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, tipoFilter]);

    const handleExport = (type: 'csv' | 'excel') => {
        const baseUrl = type === 'csv' ? '/movimientos/export' : '/movimientos/export-excel';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (tipoFilter !== 'all') params.append('tipo', tipoFilter);
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'excel') => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            router.post('/movimientos/import', formData, {
                onSuccess: () => {
                    if (csvInputRef.current) csvInputRef.current.value = '';
                    if (excelInputRef.current) excelInputRef.current.value = '';
                    toast.success('Movimientos importados correctamente');
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/movimientos/${editando.id}`, {
                onSuccess: () => { setIsOpen(false); setEditando(null); reset(); toast.success('Movimiento actualizado'); },
            });
        } else {
            post('/movimientos', {
                onSuccess: () => { setIsOpen(false); reset(); toast.success('Movimiento registrado'); },
            });
        }
    };

    const handleEdit = (m: Movimiento) => {
        setEditando(m);
        setData({
            producto: m.producto,
            tipo: m.tipo,
            cantidad: m.cantidad,
            almacen_origen: m.almacen_origen || '',
            almacen_destino: m.almacen_destino || '',
            referencia: m.referencia || '',
            notas: m.notas || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Desea eliminar este registro de movimiento?')) {
            destroy(`/movimientos/${id}`, {
                onSuccess: () => toast.success('Movimiento eliminado'),
            });
        }
    };

    const getTipoConfig = (val: string) => {
        return TIPOS.find(t => t.value.toLowerCase() === val.toLowerCase()) || { label: val, color: 'bg-gray-500/10 text-gray-600', icon: AlertCircle };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Movimientos" />
            <Toaster position="bottom-right" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <History className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Stock Flux Monitor</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Movimientos de Stock</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Bitácora histórica de ingresos, egresos y traslados de mercadería
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={(e) => handleImport(e, 'csv')} />
                        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => handleImport(e, 'excel')} />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 px-3 gap-2 rounded-xl">
                                    <Download className="h-4 w-4 text-primary" /> Herramientas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-none shadow-2xl">
                                <DropdownMenuItem onClick={() => csvInputRef.current?.click()} className="rounded-lg py-3">
                                    <Upload className="mr-2 h-4 w-4 text-blue-500" /> Importar Historial
                                </DropdownMenuItem>
                                <hr className="my-2" />
                                <DropdownMenuItem onClick={() => handleExport('csv')} className="rounded-lg py-3">
                                    <Download className="mr-2 h-4 w-4 text-green-500" /> Exportar a CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button onClick={() => { setEditando(null); reset(); setIsOpen(true); }} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Ajuste
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/40 rounded-3xl border border-muted/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por producto, referencia o almacén..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-12 border-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={tipoFilter} onValueChange={setTipoFilter}>
                                <SelectTrigger className="h-11 w-[180px] border-none bg-background shadow-sm rounded-2xl font-bold">
                                    <SelectValue placeholder="Tipo Flux" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los flujos</SelectItem>
                                    {TIPOS.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-11 w-11 border-none bg-background shadow-sm rounded-2xl text-muted-foreground" onClick={() => { setSearchTerm(''); setTipoFilter('all'); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden rounded-[32px]">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">Flujo / Producto</th>
                                            <th className="px-6 py-4 text-center">Cantidad</th>
                                            <th className="px-6 py-4 text-left">Logística (Origen {'>'} Destino)</th>
                                            <th className="px-6 py-4 text-left">Referencia</th>
                                            <th className="px-6 py-4 text-center">Fecha Registro</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50 font-medium">
                                        {movimientos.data.map((m) => {
                                            const config = getTipoConfig(m.tipo);
                                            return (
                                                <tr key={m.id} className="group transition-colors hover:bg-muted/30">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl shadow-sm ${config.color.split(' ')[0]} group-hover:scale-110 transition-transform`}>
                                                                <config.icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-foreground">{m.producto}</span>
                                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${config.color.split(' ')[1]}`}>{config.label}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-black ${m.tipo === 'entrada' ? 'text-green-600' : m.tipo === 'salida' ? 'text-red-600' : 'text-foreground'}`}>
                                                            {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : ''}{m.cantidad}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                            <Warehouse className="h-3 w-3" />
                                                            <span>{m.almacen_origen || 'Externo'}</span>
                                                            <ChevronRight className="h-3 w-3" />
                                                            <span>{m.almacen_destino || 'Externo'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-foreground">{m.referencia || 'Sin referencia'}</span>
                                                            {m.notas && <span className="text-[9px] text-muted-foreground italic truncate max-w-[150px]">{m.notas}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-xs font-black text-muted-foreground">{formatDateCLP(m.created_at)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl" onClick={() => handleEdit(m)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(m.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t border-muted/50 bg-muted/5">
                                <Pagination links={movimientos.links} meta={movimientos.meta} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-3xl border-none shadow-2xl p-0 overflow-hidden rounded-[40px]">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8 pb-4 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <History className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Inventory Reconciliation Tool</span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-primary">
                            {editando ? 'Modificar Registro Histórico' : 'Registrar Ajuste de Stock'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">Asigne parámetros de identificación y control de calidad al movimiento.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-8 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Definición de flujo
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Producto / SKU Asociado *</Label>
                                        <Input value={data.producto} onChange={(e) => setData('producto', e.target.value)} required className="h-12 border-none bg-muted/30 font-bold rounded-2xl" placeholder="Nombre completo o código" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Tipo de Operación</Label>
                                            <Select value={data.tipo} onValueChange={(v: any) => setData('tipo', v)}>
                                                <SelectTrigger className="h-12 border-none bg-muted/10 border-2 border-primary/20 font-bold rounded-2xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIPOS.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Cantidad *</Label>
                                            <Input type="number" value={data.cantidad} onChange={(e) => setData('cantidad', parseInt(e.target.value))} required className="h-12 border-none bg-muted/30 font-bold rounded-2xl text-center" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Referencia / Documento</Label>
                                        <Input value={data.referencia} onChange={(e) => setData('referencia', e.target.value)} className="h-12 border-none bg-muted/30 font-bold rounded-2xl" placeholder="N° Factura, OC, Ticket..." />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Warehouse className="h-4 w-4" /> Logística de Ubicación
                                </h3>
                                <div className="space-y-4 p-8 rounded-[40px] bg-primary/5 border-2 border-dashed border-primary/20">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Almacén Origen</Label>
                                            <Input value={data.almacen_origen} onChange={(e) => setData('almacen_origen', e.target.value)} className="h-11 border-none bg-background shadow-sm font-bold rounded-xl" placeholder="Dejar vacío si es ingreso externo" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Almacén Destino</Label>
                                            <Input value={data.almacen_destino} onChange={(e) => setData('almacen_destino', e.target.value)} className="h-11 border-none bg-background shadow-sm font-bold rounded-xl" placeholder="Dejar vacío si es salida externa" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Justificación del Movimiento</Label>
                                        <textarea 
                                            value={data.notas} 
                                            onChange={(e) => setData('notas', e.target.value)} 
                                            className="flex min-h-[100px] w-full rounded-[24px] border-none bg-background shadow-sm px-5 py-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none mt-2" 
                                            placeholder="Detalles sobre roturas, traslados especiales, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 mt-8 pt-6 border-t uppercase font-black">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full px-8">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> {editando ? 'Actualizar Registro' : 'Confirmar Flux'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
