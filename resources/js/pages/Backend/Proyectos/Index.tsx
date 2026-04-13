import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, X, Eye, Briefcase, Calendar, TrendingUp, Coins, ClipboardList } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import { formatCurrencyCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string | null;
    cliente: string | null;
    responsable: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    presupuesto: number;
    gasto_real: number;
    progreso: number;
    estado: string;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proyectos', href: '/proyectos' },
];

const estados = ['planeacion', 'activo', 'en_pausa', 'completado', 'cancelado'];

export default function Index({ proyectos }: { proyectos: { data: Proyecto[]; links: any[]; from?: number; to?: number; total?: number; meta?: any } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerOpen, setIsVerOpen] = useState(false);
    const [editando, setEditando] = useState<Proyecto | null>(null);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        descripcion: '',
        cliente: '',
        responsable: '',
        fecha_inicio: '',
        fecha_fin: '',
        presupuesto: 0,
        gasto_real: 0,
        progreso: 0,
        estado: 'planeacion',
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const proyectosFiltrados = useMemo(() => {
        return proyectos.data.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.nombre.toLowerCase().includes(busca) &&
                    !(p.cliente || '').toLowerCase().includes(busca) &&
                    !(p.responsable || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && p.estado !== filtros.estado) return false;

            return true;
        });
    }, [proyectos.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/proyectos/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/proyectos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (proj: Proyecto) => {
        setEditando(proj);
        setData({
            nombre: proj.nombre,
            descripcion: proj.descripcion || '',
            cliente: proj.cliente || '',
            responsable: proj.responsable || '',
            fecha_inicio: proj.fecha_inicio || '',
            fecha_fin: proj.fecha_fin || '',
            presupuesto: proj.presupuesto,
            gasto_real: proj.gasto_real,
            progreso: proj.progreso,
            estado: proj.estado,
            notas: proj.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            descripcion: '',
            cliente: '',
            responsable: '',
            fecha_inicio: '',
            fecha_fin: '',
            presupuesto: 0,
            gasto_real: 0,
            progreso: 0,
            estado: 'planeacion',
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleVer = (proj: Proyecto) => {
        setProyectoSeleccionado(proj);
        setIsVerOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/proyectos/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            planeacion: 'bg-gray-500',
            activo: 'bg-blue-500',
            en_pausa: 'bg-yellow-500',
            completado: 'bg-green-500',
            cancelado: 'bg-red-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Proyectos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Proyectos</h1>
                            <p className="text-muted-foreground">
                                Gestión de proyectos
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Proyectos</CardTitle>
                            <CardDescription>
                                {proyectosFiltrados.length} proyectos
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre, cliente o resp..."
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
                                    <SelectTrigger className="h-9 w-full sm:w-[180px] bg-background">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        {estados.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {e.replace('_', ' ').toUpperCase()}
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
                                            <th className="py-3 text-left font-medium">
                                                Nombre / Cliente
                                            </th>
                                            <th className="py-3 text-right font-medium">
                                                Presupuesto
                                            </th>
                                            <th className="py-3 text-center font-medium">
                                                Progreso
                                            </th>
                                            <th className="py-3 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="py-3 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proyectosFiltrados.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-3">
                                                    <div className="font-medium">
                                                        {p.nombre}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {p.cliente ||
                                                            'Sin cliente'}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right font-medium">
                                                    {formatCurrencyCLP(
                                                        p.presupuesto,
                                                    )}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${p.progreso}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px]">
                                                            {p.progreso}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    {getEstadoBadge(
                                                        p.estado,
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() =>
                                                                handleVer(p)
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
                                                                handleEdit(p)
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
                                                                    p.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {proyectosFiltrados.length ===
                                            0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        No se encontraron
                                                        proyectos con los
                                                        filtros aplicados
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                                <Pagination links={proyectos.links} meta={proyectos.meta || proyectos} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-[700px] overflow-y-auto max-h-[90vh] p-0 border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Editar' : 'Nuevo'} Proyecto
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="p-6 pt-0">
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre del Proyecto *</Label>
                                <Input
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    required
                                    placeholder="Ej: Planta Solar Atacama"
                                    className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30 font-bold text-lg"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</Label>
                                    <Input
                                        value={data.cliente || ''}
                                        onChange={(e) =>
                                            setData('cliente', e.target.value)
                                        }
                                        placeholder="Nombre de la empresa o cliente"
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Responsable</Label>
                                    <Input
                                        value={data.responsable || ''}
                                        onChange={(e) =>
                                            setData(
                                                'responsable',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Project Manager"
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha Inicio</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_inicio || ''}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_inicio',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha Fin</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_fin || ''}
                                        onChange={(e) =>
                                            setData('fecha_fin', e.target.value)
                                        }
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Presupuesto</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.presupuesto}
                                        onChange={(e) =>
                                            setData(
                                                'presupuesto',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gasto Real</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.gasto_real}
                                        onChange={(e) =>
                                            setData(
                                                'gasto_real',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progreso %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progreso}
                                        onChange={(e) =>
                                            setData(
                                                'progreso',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</Label>
                                <Select
                                    value={data.estado}
                                    onValueChange={(val) => setData('estado', val)}
                                >
                                    <SelectTrigger className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estados.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {e.replace('_', ' ').toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas y Observaciones</Label>
                                <Input
                                    value={data.notas || ''}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
                                    }
                                    className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 pt-6 border-t">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="w-full sm:w-auto font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-bold px-8 rounded-full shadow-lg shadow-primary/20">
                                {editando ? 'Guardar Cambios' : 'Crear Proyecto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Vista Detallada */}
            <Dialog open={isVerOpen} onOpenChange={setIsVerOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-3xl p-0 border-none shadow-2xl overflow-hidden">
                    {proyectoSeleccionado && (
                        <>
                            <DialogHeader className="p-8 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b border-primary/10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                            <Briefcase className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-3xl font-black tracking-tight flex items-baseline gap-3">
                                                {proyectoSeleccionado.nombre}
                                            </DialogTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getEstadoBadge(proyectoSeleccionado.estado)}
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">• ID #{proyectoSeleccionado.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 px-4 py-2 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Progreso Total</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-black text-primary">{proyectoSeleccionado.progreso}%</span>
                                            <div className="w-24 h-3 bg-primary/10 rounded-full overflow-hidden border border-primary/10">
                                                <div 
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000"
                                                    style={{ width: `${proyectoSeleccionado.progreso}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>
                            
                            <div className="p-0 bg-background overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
                                    <div className="p-6 space-y-2 bg-muted/5">
                                        <div className="flex items-center gap-2 text-primary/60">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Cronograma</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground">Inicio: <span className="text-foreground">{proyectoSeleccionado.fecha_inicio || 'TBD'}</span></p>
                                            <p className="text-xs font-bold text-muted-foreground">Fin: <span className="text-foreground">{proyectoSeleccionado.fecha_fin || 'TBD'}</span></p>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2">
                                        <div className="flex items-center gap-2 text-primary/60">
                                            <Coins className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Finanzas</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground">Presp: <span className="text-foreground">{formatCurrencyCLP(proyectoSeleccionado.presupuesto)}</span></p>
                                            <p className="text-xs font-bold text-muted-foreground">Gasto: <span className="text-destructive">{formatCurrencyCLP(proyectoSeleccionado.gasto_real)}</span></p>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2 bg-muted/5">
                                        <div className="flex items-center gap-2 text-primary/60">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Stakeholders</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground">Cliente: <span className="text-foreground truncate block">{proyectoSeleccionado.cliente || 'Independiente'}</span></p>
                                            <p className="text-xs font-bold text-muted-foreground">Líder: <span className="text-foreground truncate block">{proyectoSeleccionado.responsable || 'No asignado'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4 text-primary" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Descripción del Alcance</h3>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-muted/20 border border-dashed border-muted-foreground/30 relative">
                                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                                {proyectoSeleccionado.descripcion || 'No se ha proporcionado una descripción detallada para este proyecto operativo.'}
                                            </p>
                                            <div className="absolute -bottom-2 -right-2 p-2 bg-background rounded-full border shadow-sm">
                                                <div className="w-4 h-1 bg-primary/20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    {proyectoSeleccionado.notas && (
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Notas Adicionales</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                                                {proyectoSeleccionado.notas}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <DialogFooter className="p-6 bg-muted/10 border-t flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1 text-xs text-muted-foreground font-medium italic">
                                    * Última sincronización de estado realizada hace escasos minutos.
                                </div>
                                <Button onClick={() => setIsVerOpen(false)} className="w-full md:w-auto bg-foreground text-background hover:bg-foreground/90 font-black px-10 rounded-full shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                                    Cerrar Expediente
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
