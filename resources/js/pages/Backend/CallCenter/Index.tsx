import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Phone,
    PhoneCall,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    Clock,
    Calendar,
    User,
    UserPlus,
    Building2,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    MessageSquare,
    Check,
    Ban,
    Hash,
    MoreVertical,
    ChevronRight,
    ArrowUpRight,
    Mic,
    LayoutGrid,
    List
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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

interface Contacto {
    id: number | null;
    nombre: string;
    telefono: string | null;
    tipo: 'cliente' | 'prospecto' | 'empleado' | 'marketplace';
}

interface Llamada {
    id: number;
    user_id: number;
    cliente_id: number | null;
    prospecto_id: number | null;
    tipo: 'entrante' | 'saliente';
    numero_telefono: string | null;
    estado: 'completada' | 'perdida' | 'ocupado' | 'no_contesta' | 'equivocado';
    duracion: number;
    fecha: string;
    notas: string | null;
    cliente?: { id: number; nombre: string };
    prospecto?: { id: number; nombre: string };
    gestiones?: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customer Support', href: '/call-center' },
    { title: 'Centro de Llamadas', href: '/call-center' },
];

const ESTADOS = [
    { value: 'completada', label: 'Completada', color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
    { value: 'perdida', label: 'Perdida', color: 'bg-red-500/10 text-red-600', icon: PhoneMissed },
    { value: 'ocupado', label: 'Ocupado', color: 'bg-orange-500/10 text-orange-600', icon: Ban },
    { value: 'no_contesta', label: 'Sin Respuesta', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
    { value: 'equivocado', label: 'Equivocado', color: 'bg-slate-500/10 text-slate-600', icon: AlertCircle },
];


export default function Index({
    llamadas,
    contactos,
    stats,
    filters,
}: {
    llamadas: { data: Llamada[]; links: any[]; meta: any };
    contactos: Contacto[];
    stats: {
        total_llamadas: number;
        llamadas_hoy: number;
        gestiones_hoy: number;
        promedio_duracion: number;
    };
    filters: {
        search?: string;
        tipo?: string;
        estado?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters.tipo || 'all');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado || 'all');

    const {
        data,
        setData,
        post,
        reset,
        processing,
        errors,
    } = useForm({
        cliente_id: '' as string | number,
        prospecto_id: '' as string | number,
        tipo: 'saliente',
        numero_telefono: '',
        estado: 'completada',
        duracion: 0,
        fecha: new Date().toISOString().substring(0, 16),
        notas: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (tipoFilter !== 'all') query.tipo = tipoFilter;
            if (estadoFilter !== 'all') query.estado = estadoFilter;

            router.get('/call-center', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, tipoFilter, estadoFilter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/call-center/llamadas', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
                toast.success('Llamada registrada correctamente');
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Desea eliminar este registro de llamada?')) {
            router.delete(`/call-center/llamadas/${id}`, {
                onSuccess: () => toast.success('Registro eliminado'),
            });
        }
    };

    const getEstadoConfig = (val: string) => {
        return ESTADOS.find(e => e.value === val) || { label: val, color: 'bg-gray-500/10 text-gray-600', icon: AlertCircle };
    };

    const getTipoIcon = (tipo: string) => {
        return tipo === 'entrante' ? <PhoneIncoming className="h-4 w-4 text-blue-500" /> : <PhoneOutgoing className="h-4 w-4 text-green-500" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Call Center Management" />
            <Toaster position="bottom-right" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Mic className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Voice Response Center</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Call Center</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Gestión centralizada de comunicaciones y atención al cliente
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <BulkActions 
                            baseUrl="/call-center"
                            filters={{ 
                                search: searchTerm, 
                                tipo: tipoFilter, 
                                estado: estadoFilter 
                            }}
                            modelName="Llamadas"
                        />
                        
                        <Button onClick={() => { reset(); setIsOpen(true); }} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <PhoneCall className="mr-2 h-4 w-4" /> Registrar Llamada
                        </Button>
                    </div>
                </div>

                {/* Performance Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Llamadas Totales', val: stats.total_llamadas, icon: Phone, color: 'blue' },
                        { label: 'Atención Hoy', val: stats.llamadas_hoy, icon: PhoneIncoming, color: 'green' },
                        { label: 'Gestiones Hoy', val: stats.gestiones_hoy, icon: MessageSquare, color: 'purple' },
                        { label: 'Duración Promedio', val: `${stats.promedio_duracion}s`, icon: Clock, color: 'orange' },
                    ].map((s, idx) => (
                        <Card key={idx} className={`border-none shadow-sm bg-${s.color}-500/5 rounded-3xl`}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-${s.color}-600/70 mb-1`}>{s.label}</p>
                                    <h3 className={`text-2xl font-black text-${s.color}-700`}>{s.val}</h3>
                                </div>
                                <div className={`h-12 w-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-600`}>
                                    <s.icon className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/40 rounded-3xl border border-muted/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por teléfono o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-12 border-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={tipoFilter} onValueChange={setTipoFilter}>
                                <SelectTrigger className="h-11 w-[150px] border-none bg-background shadow-sm rounded-2xl font-bold">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tipos</SelectItem>
                                    <SelectItem value="entrante">Entrantes</SelectItem>
                                    <SelectItem value="saliente">Salientes</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                <SelectTrigger className="h-11 w-[160px] border-none bg-background shadow-sm rounded-2xl font-bold">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Estados</SelectItem>
                                    {ESTADOS.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-11 w-11 border-none bg-background shadow-sm rounded-2xl text-muted-foreground" onClick={() => { setSearchTerm(''); setTipoFilter('all'); setEstadoFilter('all'); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden rounded-[32px]">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">Dirección</th>
                                            <th className="px-6 py-4 text-left">Contacto / Cliente</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                            <th className="px-6 py-4 text-center">Duración</th>
                                            <th className="px-6 py-4 text-center">Fecha / Hora</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {llamadas.data.map((l) => (
                                            <tr key={l.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            {getTipoIcon(l.tipo)}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{l.tipo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                                                            {l.cliente?.nombre || l.prospecto?.nombre || 'Contacto Desconocido'}
                                                            <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 opacity-70">
                                                                {l.cliente_id ? 'Cliente' : l.prospecto_id ? 'Prospecto' : 'Directa'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-primary flex items-center gap-1 mt-0.5">
                                                            <Hash className="h-2.5 w-2.5" /> {l.numero_telefono || 'S/N'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className={`${getEstadoConfig(l.estado).color} border-none text-[9px] font-black uppercase px-2.5 py-1 rounded-full`}>
                                                        {getEstadoConfig(l.estado).label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-black text-xs text-foreground bg-muted/30 px-2 py-1 rounded-lg inline-block">
                                                        {Math.floor(l.duracion / 60)}m {l.duracion % 60}s
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-xs font-bold text-foreground">{formatDateCLP(l.fecha)}</div>
                                                    <div className="text-[9px] text-muted-foreground font-bold uppercase">{l.fecha.split(' ')[1] || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl">
                                                            <TrendingUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(l.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t border-muted/50 bg-muted/5">
                                <Pagination links={llamadas.links} meta={llamadas.meta} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-3xl border-none shadow-2xl p-0 overflow-hidden rounded-[32px]">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8 pb-4 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <PhoneCall className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Communication Log Entry</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">Registar Llamada</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">Ingrese los detalles de la interacción telefónica para mantener el historial actualizado.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-8 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Tipo de Comunicación</Label>
                                    <div className="grid grid-cols-2 gap-2 bg-muted/20 p-1 rounded-2xl">
                                        <Button type="button" variant={data.tipo === 'saliente' ? 'default' : 'ghost'} onClick={() => setData('tipo', 'saliente')} className="rounded-xl h-10 font-bold">Saliente</Button>
                                        <Button type="button" variant={data.tipo === 'entrante' ? 'default' : 'ghost'} onClick={() => setData('tipo', 'entrante')} className="rounded-xl h-10 font-bold">Entrante</Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Vincular Contacto</Label>
                                    <Select value={data.cliente_id ? `c-${data.cliente_id}` : data.prospecto_id ? `p-${data.prospecto_id}` : ''} onValueChange={(v) => {
                                        if (v.startsWith('c-')) { setData({ ...data, cliente_id: v.split('-')[1], prospecto_id: '' }); }
                                        else if (v.startsWith('p-')) { setData({ ...data, prospecto_id: v.split('-')[1], cliente_id: '' }); }
                                    }}>
                                        <SelectTrigger className="h-12 border-none bg-muted/30 font-bold rounded-2xl">
                                            <SelectValue placeholder="Seleccione un contacto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contactos.map((c, idx) => (
                                                <SelectItem key={idx} value={`${c.tipo === 'cliente' ? 'c' : 'p'}-${c.id}`}>
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-3 w-3 opacity-50" /> {c.nombre} <Badge variant="outline" className="text-[7px]">{c.tipo}</Badge>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Número Telefónico</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={data.numero_telefono} onChange={(e) => setData('numero_telefono', e.target.value)} className="h-12 pl-12 border-none bg-muted/30 font-bold rounded-2xl" placeholder="+56 9 ..." />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Estado Resultante</Label>
                                        <Select value={data.estado} onValueChange={(v: any) => setData('estado', v)}>
                                            <SelectTrigger className="h-12 border-none bg-muted/10 border-2 border-primary/20 font-bold rounded-2xl">
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
                                        <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Duración (seg)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" value={data.duracion} onChange={(e) => setData('duracion', parseInt(e.target.value))} className="h-12 pl-12 border-none bg-muted/30 font-black rounded-2xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Fecha y Hora</Label>
                                    <Input type="datetime-local" value={data.fecha} onChange={(e) => setData('fecha', e.target.value)} className="h-12 border-none bg-muted/30 font-bold rounded-2xl text-center" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Notas de la Conversación</Label>
                                    <textarea 
                                        value={data.notas || ''} 
                                        onChange={(e) => setData('notas', e.target.value)} 
                                        className="flex min-h-[100px] w-full rounded-[24px] border-none bg-muted/30 px-5 py-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none" 
                                        placeholder="Breve resumen de lo conversado..."
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 mt-8 pt-6 border-t font-black">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full px-8">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> Registrar Comunicación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
