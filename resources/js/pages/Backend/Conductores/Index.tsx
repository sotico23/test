import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Eye,
    User,
    IdCard,
    Phone,
    Mail,
    FileText,
    ShieldAlert,
    MapPin,
    Navigation,
} from 'lucide-react';
import { WhatsAppButton } from '@/components/whatsapp-button';
import Pagination from '@/components/ui/Pagination';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Conductor {
    id: number;
    nombre: string;
    rut: string | null;
    licencia: string | null;
    telefono: string | null;
    email: string | null;
    estado: string;
    notas: string | null;
    lat: number | null;
    lng: number | null;
    ultima_actualizacion: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Conductores', href: '/conductores' },
];

export default function Index({
    conductores,
}: {
    conductores: { data: Conductor[]; links: any[]; meta?: any; total: number };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerOpen, setIsVerOpen] = useState(false);
    const [editando, setEditando] = useState<Conductor | null>(null);
    const [conductorSeleccionado, setConductorSeleccionado] =
        useState<Conductor | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        clearErrors,
    } = useForm({
        nombre: '',
        rut: '',
        licencia: '',
        telefono: '',
        email: '',
        estado: 'activo',
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const conductoresFiltrados = useMemo(() => {
        return (conductores.data || []).filter((c: Conductor) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.nombre.toLowerCase().includes(busca) &&
                    !(c.licencia || '').toLowerCase().includes(busca) &&
                    !(c.rut || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && c.estado !== filtros.estado) return false;

            return true;
        });
    }, [conductores, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Auto convert to uppercase and basic format helper
        setData('rut', e.target.value.toUpperCase());
        if (errors.rut) {
            clearErrors('rut');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/conductores/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        else
            post('/conductores', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
    };

    const handleEdit = (c: Conductor) => {
        setEditando(c);
        clearErrors();
        setData({
            nombre: c.nombre,
            rut: c.rut || '',
            licencia: c.licencia || '',
            telefono: c.telefono || '',
            email: c.email || '',
            estado: c.estado,
            notas: c.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        clearErrors();
        setData({
            nombre: '',
            rut: '',
            licencia: '',
            telefono: '',
            email: '',
            estado: 'activo',
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleVer = (c: Conductor) => {
        setConductorSeleccionado(c);
        setIsVerOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/conductores/${id}`);
    };

    const simularTracking = (id: number) => {
        router.post(`/conductores/${id}/simular`);
    };

    const limpiarTracking = (id: number) => {
        router.post(`/conductores/${id}/limpiar`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            activo: 'bg-green-500',
            inactivo: 'bg-gray-500',
            licencia_vencida: 'bg-red-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Conductores" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Conductores</h1>
                            <p className="text-muted-foreground">
                                Personal de transporte
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Conductor
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Conductores</CardTitle>
                            <CardDescription>
                                {conductoresFiltrados.length} conductores
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o licencia..."
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
                                    <SelectTrigger className="h-9 w-full bg-background sm:w-[150px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        {[
                                            'activo',
                                            'inactivo',
                                            'licencia_vencida',
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
                                                Nombre / Licencia
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Contacto
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
                                        {conductoresFiltrados.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {c.nombre}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        RUT: {c.rut || '-'} | L:{' '}
                                                        {c.licencia || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-[10px]">
                                                        {c.telefono || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {c.email || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    <Select
                                                        value={c.estado}
                                                        onValueChange={(val) =>
                                                            router.put(
                                                                `/conductores/${c.id}`,
                                                                { estado: val },
                                                                {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-7 w-28 px-2 py-0 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[
                                                                'activo',
                                                                'inactivo',
                                                                'licencia_vencida',
                                                            ].map((e) => (
                                                                <SelectItem
                                                                    key={e}
                                                                    value={e}
                                                                >
                                                                    {e
                                                                        .toUpperCase()
                                                                        .replace(
                                                                            '_',
                                                                            ' ',
                                                                        )}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={() =>
                                                                handleVer(c)
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
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {conductoresFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron
                                                    conductores con los filtros
                                                    aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={conductores.links}
                                    meta={conductores.meta}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] border-none p-0 shadow-2xl md:max-w-xl">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2">
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Editar' : 'Nuevo'} Conductor
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="p-6 pt-0">
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Nombre Completo *
                                    </Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                        placeholder="Ej: Juan Pérez"
                                        className={`h-11 border-none bg-muted/30 font-bold focus-visible:ring-primary/30 ${errors.nombre ? 'ring-2 ring-destructive' : ''}`}
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        RUT (Documento ID)
                                    </Label>
                                    <Input
                                        value={data.rut || ''}
                                        onChange={handleRutChange}
                                        placeholder="12.345.678-9"
                                        className={`h-11 border-none bg-muted/30 font-mono focus-visible:ring-primary/30 ${errors.rut ? 'ring-2 ring-destructive' : ''}`}
                                    />
                                    {errors.rut && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.rut}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        N° Licencia
                                    </Label>
                                    <Input
                                        value={data.licencia || ''}
                                        onChange={(e) =>
                                            setData('licencia', e.target.value)
                                        }
                                        className="h-11 border-none bg-muted/30 font-mono focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Teléfono
                                    </Label>
                                    <Input
                                        value={data.telefono || ''}
                                        onChange={(e) =>
                                            setData('telefono', e.target.value)
                                        }
                                        placeholder="+56 9..."
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Correo Electrónico
                                    </Label>
                                    <Input
                                        type="email"
                                        value={data.email || ''}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Estado Operativo
                                    </Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(val) =>
                                            setData('estado', val)
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                'activo',
                                                'inactivo',
                                                'licencia_vencida',
                                            ].map((e) => (
                                                <SelectItem key={e} value={e}>
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
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Notas Internas
                                </Label>
                                <Input
                                    value={data.notas || ''}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
                                    }
                                    className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                />
                            </div>
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
                                className="w-full rounded-full bg-primary px-8 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 sm:w-auto"
                            >
                                {editando
                                    ? 'Guardar Cambios'
                                    : 'Registrar Conductor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isVerOpen} onOpenChange={setIsVerOpen}>
                <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-none bg-background p-0 shadow-2xl md:max-w-2xl">
                    {conductorSeleccionado && (
                        <>
                            <DialogHeader className="border-b bg-gradient-to-br from-primary/10 via-background to-transparent p-8">
                                <div className="flex items-center gap-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-primary/20 bg-primary/10 text-primary shadow-inner">
                                        <User className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <DialogTitle className="flex items-center gap-3 text-3xl font-black tracking-tight">
                                            {conductorSeleccionado.nombre}
                                            {getEstadoBadge(
                                                conductorSeleccionado.estado,
                                            )}
                                        </DialogTitle>
                                        <div className="mt-2 flex gap-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                                <IdCard className="h-3.5 w-3.5" />
                                                {conductorSeleccionado.rut ||
                                                    'SIN RUT'}
                                            </div>
                                            <div className="flex items-center gap-1.5 border-l pl-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                                <FileText className="h-3.5 w-3.5" />
                                                L:{' '}
                                                {conductorSeleccionado.licencia ||
                                                    '---'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black tracking-[0.2em] text-primary/70 uppercase">
                                            Contacto Directo
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                                                <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm transition-transform group-hover:scale-110">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-1 items-center justify-between">
                                                    <div>
                                                        <p className="mb-1 text-[10px] leading-none font-black text-muted-foreground uppercase">
                                                            Celular / Red Fija
                                                        </p>
                                                        <p className="text-sm font-bold">
                                                            {conductorSeleccionado.telefono ||
                                                                'No disponible'}
                                                        </p>
                                                    </div>
                                                    {conductorSeleccionado.telefono && (
                                                        <WhatsAppButton
                                                            phone={
                                                                conductorSeleccionado.telefono
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                                                <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm transition-transform group-hover:scale-110">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-[10px] leading-none font-black text-muted-foreground uppercase">
                                                        Email Oficial
                                                    </p>
                                                    <p className="truncate text-sm font-bold">
                                                        {conductorSeleccionado.email ||
                                                            'Sin correo registrado'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black tracking-[0.2em] text-primary/70 uppercase">
                                            Estado de Alertas
                                        </h3>
                                        <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-primary/5 bg-primary/[0.03] p-6 text-center">
                                            {conductorSeleccionado.estado ===
                                            'licencia_vencida' ? (
                                                <>
                                                    <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                                        <ShieldAlert className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-destructive uppercase">
                                                            Licencia no Vigente
                                                        </p>
                                                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                                                            Requiere
                                                            actualización
                                                            inmediata antes de
                                                            asignar rutas.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black tracking-tight text-green-600 uppercase">
                                                            Habilitado para
                                                            Conducir
                                                        </p>
                                                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                                                            Documentación al día
                                                            y estado operativo
                                                            disponible.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 md:col-span-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black tracking-[0.2em] text-primary/70 uppercase">
                                                Estado de Seguimiento
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-2.5 w-2.5 rounded-full ${conductorSeleccionado.lat && conductorSeleccionado.lng && conductorSeleccionado.ultima_actualizacion ? 'animate-pulse bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-400'}`}
                                                ></div>
                                                <span className="text-[10px] font-bold uppercase">
                                                    {conductorSeleccionado.lat &&
                                                    conductorSeleccionado.lng &&
                                                    conductorSeleccionado.ultima_actualizacion
                                                        ? 'Conectado'
                                                        : 'Sin señal'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Última Ubicación
                                                </p>
                                                <p
                                                    className={`rounded-lg border bg-white p-2 text-xs font-medium shadow-sm ${!conductorSeleccionado.lat || !conductorSeleccionado.lng ? 'text-red-500 italic' : 'font-mono'}`}
                                                >
                                                    {conductorSeleccionado.lat &&
                                                    conductorSeleccionado.lng
                                                        ? `${conductorSeleccionado.lat.toFixed(6)}, ${conductorSeleccionado.lng.toFixed(6)}`
                                                        : '⚠️ Sin coordenadas - Esperando señal'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Último Reporte
                                                </p>
                                                <p
                                                    className={`text-xs font-medium ${!conductorSeleccionado.ultima_actualizacion ? 'text-red-500 italic' : ''}`}
                                                >
                                                    {conductorSeleccionado.ultima_actualizacion
                                                        ? new Date(
                                                              conductorSeleccionado.ultima_actualizacion,
                                                          ).toLocaleString(
                                                              'es-CL',
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                                  timeStyle:
                                                                      'short',
                                                              },
                                                          )
                                                        : '⚠️ Sin datos recientes'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    simularTracking(
                                                        conductorSeleccionado.id,
                                                    )
                                                }
                                                className="text-xs font-bold"
                                            >
                                                <Navigation className="mr-1 h-3 w-3" />{' '}
                                                Simular
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    limpiarTracking(
                                                        conductorSeleccionado.id,
                                                    )
                                                }
                                                className="text-xs font-bold text-red-500"
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />{' '}
                                                Limpiar
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 md:col-span-2">
                                    <h3 className="mb-4 text-xs font-black tracking-[0.2em] text-primary/70 uppercase">
                                        Notas y Observaciones
                                    </h3>
                                    <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-5 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
                                        {conductorSeleccionado.notas ||
                                            'No existen anotaciones especiales en el perfil de este conductor operativo.'}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="border-t bg-muted/5 p-6">
                                <Button
                                    onClick={() => setIsVerOpen(false)}
                                    className="w-full rounded-full bg-foreground px-10 font-black text-background shadow-lg shadow-foreground/10 transition-all hover:bg-foreground/90 active:scale-95 sm:w-auto"
                                >
                                    Cerrar Perfil
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
