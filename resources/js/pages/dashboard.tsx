import { Head, usePage, Link, Deferred } from '@inertiajs/react';
import { 
    Activity, 
    ArrowUpRight, 
    ArrowDownRight, 
    DollarSign, 
    TrendingUp, 
    Users, 
    Zap, 
    Target, 
    Wallet, 
    Warehouse, 
    ShoppingCart, 
    Calendar,
    Briefcase,
    AlertCircle,
    ChevronRight,
    PieChart,
    BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Corporativo',
        href: '/dashboard',
    },
];

interface MesData {
    mes: string;
    ingresos: number;
    egresos: number;
    balance: number;
}

interface Proyeccion {
    mes: string;
    total: number;
    es_proyeccion: boolean;
}

interface StatDetail {
    label: string;
    value: string | number;
    subValue: string;
    trend: 'up' | 'down' | 'neutral';
    color: string;
    url?: string;
}

interface TopProducto {
    nombre: string;
    total_cantidad: number;
    total_venta: number;
}

interface DashboardProps {
    stats: Record<string, StatDetail>;
    cashFlowData: MesData[];
    proyecciones: Proyeccion[];
    topProductos: TopProducto[];
    esSuperAdmin: boolean;
    esAdmin: boolean;
    esEmpleado: boolean;
    esCliente: boolean;
    mensajesSinLeer: number;
    userName: string;
}

// PREMIUM COMPONENTS
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 ${className}`}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10">{children}</div>
    </div>
);

const KPICard = ({ stat }: { stat: StatDetail }) => {
    const Icon = stat.color === 'indigo' ? DollarSign : 
                 stat.color === 'amber' ? Calendar :
                 stat.color === 'emerald' ? TrendingUp :
                 stat.color === 'blue' ? Wallet :
                 stat.color === 'rose' ? ShoppingCart : Warehouse;
    
    // Safety check for dynamic tailwind classes
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500',
        amber: 'bg-amber-500/20 text-amber-500 hover:bg-amber-500',
        emerald: 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500',
        blue: 'bg-blue-500/20 text-blue-500 hover:bg-blue-500',
        rose: 'bg-rose-500/20 text-rose-500 hover:bg-rose-500',
        orange: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500'
    };

    const colorKey = stat.color || 'indigo';
    
    return (
        <Link href={stat.url || '#'}>
            <GlassCard className="group transition-all hover:scale-[1.02] cursor-pointer ring-0 hover:ring-2 hover:ring-primary/20">
                <div className="flex items-start justify-between">
                    <div className={`rounded-2xl p-3 transition-all duration-300 ${colorClasses[colorKey] || colorClasses.indigo} group-hover:text-white`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {stat.trend !== 'neutral' && (
                        <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className="bg-opacity-20 text-[10px] font-bold">
                            {stat.trend === 'up' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                            {stat.trend === 'up' ? '+5.2%' : '-2.1%'}
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">{stat.subValue}</p>
                </div>
            </GlassCard>
        </Link>
    );
};

const CustomAreaChart = ({ data }: { data: MesData[] }) => {
    if (!data.length) return <div className="h-64 flex items-center justify-center text-muted-foreground">Sin datos suficientes</div>;
    
    // Normalize data for SVG
    const max = Math.max(...data.map(d => d.ingresos), ...data.map(d => d.egresos), 1);
    const height = 240;
    const width = 800;
    
    const getPath = (key: 'ingresos' | 'egresos') => {
        if (data.length < 2) return `0,${height} ${width},${height}`;
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d[key] / max) * height;
            return `${x},${y}`;
        }).join(' ');
    };

    return (
        <div className="relative h-[280px] w-full pt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => (
                    <line key={p} x1="0" y1={height * p} x2={width} y2={height * p} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4" />
                ))}

                {/* Areas */}
                <path d={`M 0 ${height} L ${getPath('ingresos')} L ${width} ${height} Z`} fill="url(#gradIngresos)" />
                <path d={`M 0 ${height} L ${getPath('egresos')} L ${width} ${height} Z`} fill="url(#gradEgresos)" />
                
                {/* Lines */}
                <path d={`M ${getPath('ingresos')}`} fill="none" stroke="rgb(99, 102, 241)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`M ${getPath('egresos')}`} fill="none" stroke="rgb(244, 63, 94)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Points */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - (d.ingresos / max) * height;
                    return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="rgb(99, 102, 241)" strokeWidth="2" />;
                })}
            </svg>
            <div className="mt-4 flex justify-between px-2 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                {data.map((d, i) => <span key={i}>{d.mes}</span>)}
            </div>
        </div>
    );
};

const CustomPieChart = ({ data }: { data: TopProducto[] }) => {
    if (!data.length) return <div className="h-48 flex items-center justify-center text-muted-foreground italic">Sin datos</div>;
    
    const total = data.reduce((acc, curr) => acc + Number(curr.total_venta), 0);
    let cumulativePercent = 0;
    
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e'];

    return (
        <div className="flex items-center gap-8 py-4">
            <div className="relative h-48 w-48 shrink-0">
                <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90 overflow-visible">
                    {data.map((p, i) => {
                        const percent = (Number(p.total_venta) / total) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;
                        
                        return (
                            <circle
                                key={i}
                                cx="16"
                                cy="16"
                                r="15.915"
                                fill="transparent"
                                stroke={colors[i % colors.length]}
                                strokeWidth="5"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out hover:stroke-white hover:stroke-[8px] cursor-pointer"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-card/80 backdrop-blur-md shadow-inner flex flex-col items-center justify-center">
                        <PieChart className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase">Market Share</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3 flex-1 overflow-hidden">
                {data.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs group">
                        <div className="flex items-center gap-2 truncate">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="font-bold truncate opacity-80 group-hover:opacity-100 transition-opacity">{p.nombre}</span>
                        </div>
                        <span className="font-black text-[10px] opacity-60">{( (Number(p.total_venta) / total) * 100 ).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Dashboard({ 
    stats, 
    cashFlowData, 
    proyecciones, 
    topProductos,
    userName,
    mensajesSinLeer
}: DashboardProps) {
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Premium Analytics Chile" />
            
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                            ¡Hola, <span className="text-primary bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-500">{userName.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-lg font-medium text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Link href="/mensajes" className="relative group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary transition-all duration-300">
                                <Zap className="h-6 w-6 group-hover:text-white" />
                            </div>
                            {mensajesSinLeer > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-4 ring-background">
                                    {mensajesSinLeer}
                                </span>
                            )}
                        </Link>
                        <GlassCard className="!p-3 flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Balance Total</p>
                                <p className="text-lg font-black">{stats.utilidad?.value || '$0'}</p>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <div className={`rounded-xl p-2 ${stats.utilidad?.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                <Activity className="h-5 w-5" />
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {Object.values(stats).map((s, i) => (
                        <KPICard key={i} stat={s} />
                    ))}
                </div>

                {/* CHARTS CONTAINER */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    
                    {/* CASH FLOW */}
                    <Card className="lg:col-span-8 border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="flex flex-row items-center justify-between p-8">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    Flujo de Caja (CLP)
                                </CardTitle>
                                <CardDescription>Comparativa entre Ingresos y Egresos Operativos</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 min-h-[300px]">
                            <Deferred
                                data="cashFlowData"
                                fallback={
                                    <div className="space-y-4 pt-12">
                                        <Skeleton className="h-[200px] w-full rounded-2xl opacity-10" />
                                        <div className="flex justify-between gap-4">
                                            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-4 w-12 rounded-full opacity-10" />)}
                                        </div>
                                    </div>
                                }
                            >
                                <CustomAreaChart data={cashFlowData || []} />
                            </Deferred>
                        </CardContent>
                    </Card>

                    {/* PREDICTIONS */}
                    <GlassCard className="lg:col-span-4 border-primary/20 bg-primary/5 rounded-[2.5rem] !p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
                                Proyección Pro
                            </h3>
                            <Badge className="bg-amber-500/20 text-amber-500 border-none">INTELLIGENT</Badge>
                        </div>
                        
                        <div className="space-y-6">
                            <Deferred 
                                data="proyecciones"
                                fallback={
                                    <div className="space-y-6">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="flex items-center justify-between">
                                                <Skeleton className="h-10 w-10 rounded-xl opacity-20" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-24 rounded-full opacity-20 ml-auto" />
                                                    <Skeleton className="h-3 w-16 rounded-full opacity-20 ml-auto" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                            >
                                {(proyecciones || []).slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-muted-foreground uppercase group-hover:bg-primary group-hover:text-white transition-all">
                                                {p.mes}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black">${new Intl.NumberFormat('es-CL').format(p.total)}</p>
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-60">Est. {(95 + i).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </Deferred>
                        </div>
                    </GlassCard>
                </div>

                {/* RANKING & ACTION CARDS */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    
                    {/* TOP PRODUCTS PIE CHART */}
                    <Card className="border-none shadow-xl bg-card/50 rounded-[2.5rem] p-8">
                         <CardTitle className="text-xl font-black flex items-center gap-3 mb-4">
                            <PieChart className="h-5 w-5 text-primary" />
                            Distribución Ventas
                        </CardTitle>
                        <Deferred 
                            data="topProductos"
                            fallback={
                                <div className="flex items-center gap-6 py-4 animate-pulse">
                                    <div className="w-32 h-32 rounded-full border-8 border-muted opacity-20" />
                                    <div className="space-y-3 flex-1">
                                        {[1,2,3,4].map(i => <div key={i} className="h-3 bg-muted rounded-full w-full opacity-20" />)}
                                    </div>
                                </div>
                            }
                        >
                            <CustomPieChart data={topProductos || []} />
                        </Deferred>
                    </Card>

                    {/* ACTIONS */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link href="/facturacion" className="group h-full">
                            <GlassCard className="h-full border-primary/20 hover:border-primary group-hover:bg-primary/5 transition-all">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="rounded-2xl bg-primary/10 p-4 w-fit">
                                        <Briefcase className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="mt-8">
                                        <h4 className="text-2xl font-black">Nueva Factura</h4>
                                        <p className="text-sm text-muted-foreground mt-2">Genera documentos tributarios electrónicos en segundos.</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                        
                        <Link href="/ventas" className="group h-full">
                            <GlassCard className="h-full border-indigo-500/20 hover:border-indigo-500 group-hover:bg-indigo-500/5 transition-all">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="rounded-2xl bg-indigo-500/10 p-4 w-fit">
                                        <Activity className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <div className="mt-8">
                                        <h4 className="text-2xl font-black">Registro POS</h4>
                                        <p className="text-sm text-muted-foreground mt-2">Punto de venta optimizado para transacciones rápidas.</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
