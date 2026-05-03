import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Calendar,
    BarChart3,
    Megaphone,
    Target,
    Users,
    MousePointer2,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    LayoutGrid,
    PieChart,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BulkActions } from '@/components/shared/BulkActions';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import type { BreadcrumbItem } from '@/types';

interface Campana {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: string | null;
    canal: string | null;
    objetivo: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    presupuesto: number;
    presupuesto_real: number;
    visitas: number;
    leads: number;
    conversiones: number;
    roi: number;
    estado: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marketing', href: '/campanas' },
    { title: 'Campañas Publicitarias', href: '/campanas' },
];

const ESTADOS = [
    { value: 'borrador', label: 'Borrador', color: 'bg-slate-500/10 text-slate-600', icon: Clock },
    { value: 'planificada', label: 'Planificada', color: 'bg-blue-500/10 text-blue-600', icon: Calendar },
    { value: 'activa', label: 'Activa', color: 'bg-green-500/10 text-green-600', icon: Megaphone },
    { value: 'pausada', label: 'Pausada', color: 'bg-orange-500/10 text-orange-600', icon: Clock },
    { value: 'finalizada', label: 'Finalizada', color: 'bg-purple-500/10 text-purple-600', icon: CheckCircle2 },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500/10 text-red-600', icon: X },
];

const CANALES = ['Facebook', 'Instagram', 'Google Ads', 'Email Marketing', 'LinkedIn', 'WhatsApp', 'YouTube', 'TikTok', 'Radio', 'Prensa', 'Otro'];

export default function Index({
    campanas,
    filters,
}: {
    campanas: { data: Campana[]; links: any[]; meta: any };
    filters: {
        search?: string;
        estado?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Campana | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
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
    } = useForm({
        nombre: '',
        descripcion: '',
        tipo: '',
        canal: '',
        objetivo: '',
        fecha_inicio: '',
        fecha_fin: '',
        presupuesto: 0,
        presupuesto_real: 0,
        visitas: 0,
        leads: 0,
        conversiones: 0,
        roi: 0,
        estado: 'borrador',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (estadoFilter !== 'all') query.estado = estadoFilter;

            router.get('/campanas', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, estadoFilter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/campanas/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/campanas', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (cam: Campana) => {
        setEditando(cam);
        setData({
            nombre: cam.nombre,
            descripcion: cam.descripcion || '',
            tipo: cam.tipo || '',
            canal: cam.canal || '',
            objetivo: cam.objetivo || '',
            fecha_inicio: cam.fecha_inicio ? cam.fecha_inicio.substring(0, 10) : '',
            fecha_fin: cam.fecha_fin ? cam.fecha_fin.substring(0, 10) : '',
            presupuesto: cam.presupuesto,
            presupuesto_real: cam.presupuesto_real,
            visitas: cam.visitas,
            leads: cam.leads,
            conversiones: cam.conversiones,
            roi: cam.roi,
            estado: cam.estado,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Desea eliminar esta campaña?')) {
            destroy(`/campanas/${id}`);
        }
    };

    const getEstadoConfig = (val: string) => {
        return ESTADOS.find(e => e.value === val) || { label: val, color: 'bg-gray-500/10 text-gray-600', icon: AlertCircle };
    };

    const stats = useMemo(() => {
        const totalPresupuesto = campanas.data.reduce((sum, c) => sum + Number(c.presupuesto), 0);
        const totalLeads = campanas.data.reduce((sum, c) => sum + Number(c.leads), 0);
        const activeCount = campanas.data.filter(c => c.estado === 'activa').length;
        
        return { totalPresupuesto, totalLeads, activeCount };
    }, [campanas.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Campañas" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <PieChart className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Marketing Performance Suite</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Campañas</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Planifique y analice el rendimiento de sus esfuerzos de marketing
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <BulkActions 
                            baseUrl="/campanas"
                            filters={{ 
                                search: searchTerm, 
                                estado: estadoFilter 
                            }}
                            modelName="Campañas"
                        />
                        
                        <Button onClick={() => { setEditando(null); reset(); setIsOpen(true); }} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Campaña
                        </Button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm bg-blue-500/5 rounded-3xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-1">Inversión Total</p>
                                <h3 className="text-2xl font-black text-blue-700">{formatCurrencyCLP(stats.totalPresupuesto)}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <DollarSign className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-green-500/5 rounded-3xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-600/70 mb-1">Leads Generados</p>
                                <h3 className="text-2xl font-black text-green-700">{stats.totalLeads}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-purple-500/5 rounded-3xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-600/70 mb-1">Campañas Activas</p>
                                <h3 className="text-2xl font-black text-purple-700">{stats.activeCount}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                <Megaphone className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/40 rounded-3xl border border-muted/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, descripción o canal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-12 border-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                <SelectTrigger className="h-11 w-[180px] border-none bg-background shadow-sm rounded-2xl font-bold">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    {ESTADOS.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-11 w-11 border-none bg-background shadow-sm rounded-2xl text-muted-foreground" onClick={() => { setSearchTerm(''); setEstadoFilter('all'); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campanas.data.map((cam) => {
                            const config = getEstadoConfig(cam.estado);
                            return (
                                <Card key={cam.id} className="border-none shadow-xl shadow-foreground/5 rounded-3xl overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all duration-300">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className={`${config.color} border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-full`}>
                                                {config.label}
                                            </Badge>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10" onClick={() => handleEdit(cam)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cam.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{cam.nombre}</CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">{cam.descripcion || 'Sin descripción detallada.'}</CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/30 rounded-2xl border border-muted/50">
                                                <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Presupuesto</div>
                                                <div className="text-sm font-black text-foreground">{formatCurrencyCLP(cam.presupuesto)}</div>
                                            </div>
                                            <div className="p-3 bg-muted/30 rounded-2xl border border-muted/50">
                                                <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Canal</div>
                                                <div className="text-sm font-black text-primary truncate">{cam.canal || 'Directo'}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-bold">Leads Generados</span>
                                                <span className="font-black text-foreground">{cam.leads}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-bold">Conversiones</span>
                                                <span className="font-black text-green-600">{cam.conversiones}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-bold">ROI Estimado</span>
                                                <span className="font-black text-blue-600">{cam.roi}%</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-muted/50 flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {cam.fecha_inicio ? formatDateCLP(cam.fecha_inicio) : 'N/A'}
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-primary" />
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {cam.fecha_fin ? formatDateCLP(cam.fecha_fin) : 'N/A'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    
                    <div className="bg-background border border-muted shadow-sm rounded-3xl p-4">
                        <Pagination links={campanas.links} meta={campanas.meta} />
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-4xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-4 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Campaign Strategy Builder</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Editar Campaña Publicitaria' : 'Nueva Campaña Publicitaria'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">Defina los parámetros y presupuesto para su próxima acción de marketing.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-8 pt-2 overflow-y-auto max-h-[80vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
                            {/* Columna Principal: Definición */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <LayoutGrid className="h-4 w-4" /> Definición de Campaña
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre de la Campaña *</Label>
                                        <Input 
                                            placeholder="Ej: Hot Sale 2024 - Google Ads"
                                            value={data.nombre} 
                                            onChange={(e) => setData('nombre', e.target.value)} 
                                            required 
                                            className="h-11 border-none bg-muted/30 font-bold rounded-xl" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Canal</Label>
                                            <Select value={data.canal} onValueChange={(v) => setData('canal', v)}>
                                                <SelectTrigger className="h-11 border-none bg-muted/30 font-bold rounded-xl">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CANALES.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Estado</Label>
                                            <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                                                <SelectTrigger className="h-11 border-none bg-muted/10 border-2 border-primary/20 font-bold rounded-xl">
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Fecha Inicio</Label>
                                            <Input type="date" value={data.fecha_inicio} onChange={(e) => setData('fecha_inicio', e.target.value)} className="h-11 border-none bg-muted/30 font-bold rounded-xl text-center" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Fecha Fin</Label>
                                            <Input type="date" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} className="h-11 border-none bg-muted/30 font-bold rounded-xl text-center" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Objetivo Principal</Label>
                                        <Input placeholder="Ej: Aumentar leads en un 20%" value={data.objetivo} onChange={(e) => setData('objetivo', e.target.value)} className="h-11 border-none bg-muted/30 font-bold rounded-xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Columna: Métricas y Presupuesto */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" /> Métricas y Finanzas
                                </h3>
                                <div className="space-y-4 p-8 rounded-[40px] bg-primary/5 border-2 border-dashed border-primary/20">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Presupuesto (CLP)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                <Input type="number" value={data.presupuesto} onChange={(e) => setData('presupuesto', parseFloat(e.target.value))} className="h-11 pl-10 border-none bg-background shadow-sm font-black text-primary rounded-xl" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Gasto Real</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                                                <Input type="number" value={data.presupuesto_real} onChange={(e) => setData('presupuesto_real', parseFloat(e.target.value))} className="h-11 pl-10 border-none bg-background shadow-sm font-black text-red-600 rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Visitas</Label>
                                            <Input type="number" value={data.visitas} onChange={(e) => setData('visitas', parseInt(e.target.value))} className="h-10 text-center border-none bg-background shadow-sm font-bold rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Leads</Label>
                                            <Input type="number" value={data.leads} onChange={(e) => setData('leads', parseInt(e.target.value))} className="h-10 text-center border-none bg-background shadow-sm font-bold rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Conv.</Label>
                                            <Input type="number" value={data.conversiones} onChange={(e) => setData('conversiones', parseInt(e.target.value))} className="h-10 text-center border-none bg-background shadow-sm font-bold rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">ROI Calculado (%)</Label>
                                        <div className="relative">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                                            <Input type="number" value={data.roi} onChange={(e) => setData('roi', parseFloat(e.target.value))} className="h-11 pl-10 border-none bg-background shadow-sm font-black text-blue-600 rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-6 pt-6 border-t">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Descripción Detallada / Estrategia</Label>
                            <textarea 
                                value={data.descripcion} 
                                onChange={(e) => setData('descripcion', e.target.value)} 
                                className="flex min-h-[100px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none" 
                                placeholder="Escribe aquí los detalles de la campaña..."
                            />
                        </div>
                        
                        <DialogFooter className="gap-2 mt-8 pt-6 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full px-8 font-bold text-muted-foreground">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 font-black">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> {editando ? 'Guardar Cambios' : 'Lanzar Campaña'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
