import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Map,
    Gauge,
    Navigation,
    Eye,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
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
import MapaVehiculos from './MapaVehiculos';
import Pagination from '@/components/ui/Pagination';

interface Vehiculo {
    id: number;
    placa: string;
    imei: string | null;
    marca: string | null;
    modelo: string | null;
    tipo: string | null;
    año: number | null;
    color: string | null;
    lat: number | null;
    lng: number | null;
    velocidad: number;
    ultima_actualizacion: string | null;
    estado: string;
    kilometraje: number;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehículos', href: '/vehiculos' },
];

export default function Index({
    vehiculos,
}: {
    vehiculos: {
        data: Vehiculo[];
        links: any[];
        meta?: any;
        total: number;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerOpen, setIsVerOpen] = useState(false);
    const [editando, setEditando] = useState<Vehiculo | null>(null);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] =
        useState<Vehiculo | null>(null);
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
        placa: '',
        imei: '',
        marca: '',
        modelo: '',
        tipo: '',
        año: 2024,
        color: '',
        estado: 'disponible',
        kilometraje: 0,
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const vehiculosFiltrados = useMemo(() => {
        return vehiculos.data.filter((v) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !v.placa.toLowerCase().includes(busca) &&
                    !(v.marca || '').toLowerCase().includes(busca) &&
                    !(v.modelo || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && v.estado !== filtros.estado) return false;

            return true;
        });
    }, [vehiculos, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('placa', e.target.value.toUpperCase());
        if (errors.placa) {
            clearErrors('placa');
        }
    };

    const simularTracking = (id: number) => {
        if (confirm('¿Generar ubicación aleatoria en Chile para testing?')) {
            router.post(
                `/vehiculos/${id}/simular`,
                {},
                {
                    onSuccess: () => {
                        window.location.reload();
                    },
                },
            );
        }
    };

    const limpiarTracking = (id: number) => {
        if (confirm('¿Limpiar datos de tracking (ubicación, velocidad)?')) {
            router.post(
                `/vehiculos/${id}/limpiar`,
                {},
                {
                    onSuccess: () => {
                        window.location.reload();
                    },
                },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/vehiculos/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        else
            post('/vehiculos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
    };

    const handleEdit = (v: Vehiculo) => {
        setEditando(v);
        clearErrors();
        setData({
            placa: v.placa,
            imei: v.imei || '',
            marca: v.marca || '',
            modelo: v.modelo || '',
            tipo: v.tipo || '',
            año: v.año || 2024,
            color: v.color || '',
            estado: v.estado,
            kilometraje: v.kilometraje,
            notas: v.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        clearErrors();
        setData({
            placa: '',
            imei: '',
            marca: '',
            modelo: '',
            tipo: '',
            año: 2024,
            color: '',
            estado: 'disponible',
            kilometraje: 0,
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleVer = (v: Vehiculo) => {
        setVehiculoSeleccionado(v);
        setIsVerOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/vehiculos/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            disponible: 'bg-green-500 shadow-sm shadow-green-500/20',
            en_ruta: 'bg-blue-500 shadow-sm shadow-blue-500/20',
            mantenimiento: 'bg-amber-500 shadow-sm shadow-amber-500/20',
            fuera_servicio: 'bg-red-500 shadow-sm shadow-red-500/20',
            requiere_atencion: 'bg-purple-500 shadow-sm shadow-purple-500/20',
        };
        return (
            <Badge
                className={`${colores[e] || 'bg-gray-500'} rounded-full px-3 py-0.5 font-bold tracking-tight uppercase`}
            >
                {e.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Vehículos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Vehículos</h1>
                            <p className="text-muted-foreground">
                                Flota vehicular
                            </p>
                        </div>
                        <Button
                            onClick={handleNew}
                            className="rounded-full bg-primary px-6 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {/* Real-time map monitoring section */}
                        <div className="space-y-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                    <Map className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-foreground/90 uppercase">
                                    Monitoreo Satelital en Tiempo Real
                                </h2>
                            </div>
                            <MapaVehiculos vehiculos={vehiculos.data} />
                        </div>

                        <Card className="mt-4 border-none bg-card/60 shadow-xl ring-1 ring-border backdrop-blur-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-black">
                                    Flota Vehicular
                                </CardTitle>
                                <CardDescription>
                                    {vehiculos.total} vehículos en el radar de
                                    operaciones
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-col flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-sm sm:flex-row">
                                    <div className="min-w-[200px] flex-1">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por placa, marca o modelo..."
                                                value={filtros.busqueda}
                                                onChange={(e) =>
                                                    setFiltros({
                                                        ...filtros,
                                                        busqueda:
                                                            e.target.value,
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
                                                estado:
                                                    val === 'all' ? '' : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full bg-background sm:w-[180px]">
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Todos los estados
                                            </SelectItem>
                                            {[
                                                'disponible',
                                                'en_ruta',
                                                'mantenimiento',
                                                'fuera_servicio',
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
                                        className="h-9 w-full sm:w-auto"
                                        onClick={limpiarFiltros}
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Limpiar
                                    </Button>
                                </div>

                                {/* Responsive Table/Grid Layout */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2 text-left font-medium">
                                                    Placa / Marca / Modelo
                                                </th>
                                                <th className="py-2 text-left font-medium">
                                                    Tipo
                                                </th>
                                                <th className="py-2 text-right font-medium">
                                                    Km
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
                                            {vehiculosFiltrados.map((v) => (
                                                <tr
                                                    key={v.id}
                                                    className="border-b transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="py-2 font-mono">
                                                        <div className="font-bold">
                                                            {v.placa}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {v.marca || '-'} /{' '}
                                                            {v.modelo || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="text-[10px]">
                                                            {v.tipo || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right font-medium">
                                                        {Number(
                                                            v.kilometraje,
                                                        ).toFixed(0)}{' '}
                                                        km
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        {getEstadoBadge(
                                                            v.estado,
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                                onClick={() =>
                                                                    handleVer(v)
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
                                                                    handleEdit(
                                                                        v,
                                                                    )
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
                                                                        v.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {vehiculosFiltrados.length ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        No se encontraron
                                                        vehículos con los
                                                        filtros aplicados
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    links={vehiculos.links}
                                    meta={
                                        vehiculos.meta || {
                                            from: (vehiculos as any).from,
                                            to: (vehiculos as any).to,
                                            total: vehiculos.total,
                                        }
                                    }
                                />
                                {/* Mobile Grid Layout */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {vehiculosFiltrados.map((v) => (
                                        <div
                                            key={v.id}
                                            className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-card-foreground shadow-sm"
                                        >
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <div className="font-mono text-lg font-bold">
                                                    {v.placa}
                                                </div>
                                                {getEstadoBadge(v.estado)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="block text-xs text-muted-foreground">
                                                        Marca/Modelo
                                                    </span>
                                                    <span className="font-medium">
                                                        {v.marca || '-'} /{' '}
                                                        {v.modelo || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-muted-foreground">
                                                        Tipo
                                                    </span>
                                                    <span className="font-medium">
                                                        {v.tipo || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-muted-foreground">
                                                        Kilometraje
                                                    </span>
                                                    <span className="font-medium">
                                                        {Number(
                                                            v.kilometraje,
                                                        ).toFixed(0)}{' '}
                                                        km
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end gap-2 border-t pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full flex-1 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 sm:w-auto"
                                                    onClick={() => handleVer(v)}
                                                >
                                                    <Eye className="h-4 w-4" />{' '}
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full flex-1 gap-2 sm:w-auto"
                                                    onClick={() =>
                                                        handleEdit(v)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />{' '}
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full flex-1 gap-2 sm:w-auto"
                                                    onClick={() =>
                                                        handleDelete(v.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />{' '}
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {vehiculosFiltrados.length === 0 && (
                                        <div className="rounded-xl border py-8 text-center text-muted-foreground">
                                            No se encontraron vehículos.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto border-none p-0 shadow-2xl md:max-w-[600px]">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2">
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Editar' : 'Nuevo'} Vehículo
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="p-6 pt-0">
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Placa *
                                    </Label>
                                    <Input
                                        value={data.placa}
                                        onChange={handlePlacaChange}
                                        required
                                        placeholder="AB1234 o ABCD12"
                                        className={`h-11 border-none bg-muted/30 font-mono text-lg font-bold focus-visible:ring-primary/30 ${errors.placa ? 'ring-2 ring-destructive' : ''}`}
                                    />
                                    {errors.placa && (
                                        <p className="mt-1 text-xs font-medium text-destructive">
                                            {errors.placa}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        IMEI / ID Dispositivo
                                    </Label>
                                    <Input
                                        value={data.imei || ''}
                                        onChange={(e) =>
                                            setData('imei', e.target.value)
                                        }
                                        placeholder="ID para seguimiento"
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Tipo
                                    </Label>
                                    <Input
                                        value={data.tipo || ''}
                                        onChange={(e) =>
                                            setData('tipo', e.target.value)
                                        }
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Marca
                                    </Label>
                                    <Input
                                        value={data.marca || ''}
                                        onChange={(e) =>
                                            setData('marca', e.target.value)
                                        }
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Modelo
                                </Label>
                                <Input
                                    value={data.modelo || ''}
                                    onChange={(e) =>
                                        setData('modelo', e.target.value)
                                    }
                                    className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Año
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.año}
                                        onChange={(e) =>
                                            setData(
                                                'año',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Color
                                    </Label>
                                    <Input
                                        value={data.color || ''}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        className="h-11 border-none bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Kilometraje
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.kilometraje}
                                        onChange={(e) =>
                                            setData(
                                                'kilometraje',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 border-none bg-muted/30 font-bold focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Estado
                                    </Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(val) =>
                                            setData('estado', val)
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold focus-visible:ring-primary/30">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                'disponible',
                                                'en_ruta',
                                                'mantenimiento',
                                                'fuera_servicio',
                                                'requiere_atencion',
                                            ].map((e) => (
                                                <SelectItem key={e} value={e}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${
                                                                e ===
                                                                'disponible'
                                                                    ? 'bg-green-500'
                                                                    : e ===
                                                                        'en_ruta'
                                                                      ? 'bg-blue-500'
                                                                      : e ===
                                                                          'mantenimiento'
                                                                        ? 'bg-amber-500'
                                                                        : e ===
                                                                            'fuera_servicio'
                                                                          ? 'bg-red-500'
                                                                          : 'bg-purple-500'
                                                            }`}
                                                        />
                                                        {e
                                                            .toUpperCase()
                                                            .replace('_', ' ')}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Notas / Observaciones
                                </Label>
                                <textarea
                                    value={data.notas || ''}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
                                    }
                                    placeholder="Detalles adicionales, historial de mantenimiento, etc."
                                    className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-3 py-2 text-sm font-medium ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                                    : 'Registrar Vehículo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Vista Detallada */}
            <Dialog open={isVerOpen} onOpenChange={setIsVerOpen}>
                <DialogContent className="max-w-[95vw] overflow-hidden border-none p-0 shadow-2xl md:max-w-2xl">
                    {vehiculoSeleccionado && (
                        <>
                            <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-primary p-3 text-white shadow-lg shadow-primary/20">
                                        <Navigation className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                            {vehiculoSeleccionado.placa}
                                            {getEstadoBadge(
                                                vehiculoSeleccionado.estado,
                                            )}
                                        </DialogTitle>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {vehiculoSeleccionado.marca}{' '}
                                            {vehiculoSeleccionado.modelo} (
                                            {vehiculoSeleccionado.año})
                                        </p>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-6 bg-background p-6 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black tracking-widest text-primary/70 uppercase">
                                            Información Técnica
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    IMEI / ID
                                                </p>
                                                <p className="truncate font-mono text-sm font-bold">
                                                    {vehiculoSeleccionado.imei ||
                                                        'Sin asignar'}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Tipo
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {vehiculoSeleccionado.tipo ||
                                                        '-'}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Color
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {vehiculoSeleccionado.color ||
                                                        '-'}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Kilometraje
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {Number(
                                                        vehiculoSeleccionado.kilometraje,
                                                    ).toLocaleString()}{' '}
                                                    km
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black tracking-widest text-primary/70 uppercase">
                                                Estado de Seguimiento
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-2.5 w-2.5 rounded-full ${vehiculoSeleccionado.lat && vehiculoSeleccionado.lng && vehiculoSeleccionado.ultima_actualizacion ? 'animate-pulse bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-400'}`}
                                                ></div>
                                                <span className="text-[10px] font-bold uppercase">
                                                    {vehiculoSeleccionado.lat &&
                                                    vehiculoSeleccionado.lng &&
                                                    vehiculoSeleccionado.ultima_actualizacion
                                                        ? 'Conectado'
                                                        : 'Sin señal'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-bold">
                                                        Velocidad
                                                    </span>
                                                </div>
                                                <span className="text-lg font-black">
                                                    {
                                                        vehiculoSeleccionado.velocidad
                                                    }{' '}
                                                    <small className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        km/h
                                                    </small>
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Última Ubicación
                                                </p>
                                                <p
                                                    className={`rounded-lg border bg-white p-2 text-xs font-medium shadow-sm ${!vehiculoSeleccionado.lat || !vehiculoSeleccionado.lng ? 'text-red-500 italic' : 'font-mono'}`}
                                                >
                                                    {vehiculoSeleccionado.lat &&
                                                    vehiculoSeleccionado.lng
                                                        ? `${vehiculoSeleccionado.lat.toFixed(6)}, ${vehiculoSeleccionado.lng.toFixed(6)}`
                                                        : '⚠️ Sin coordenadas - Esperando señal GPS'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Último Reporte
                                                </p>
                                                <p
                                                    className={`text-xs font-medium ${!vehiculoSeleccionado.ultima_actualizacion ? 'text-red-500 italic' : ''}`}
                                                >
                                                    {vehiculoSeleccionado.ultima_actualizacion
                                                        ? new Date(
                                                              vehiculoSeleccionado.ultima_actualizacion,
                                                          ).toLocaleString(
                                                              'es-CL',
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                                  timeStyle:
                                                                      'short',
                                                              },
                                                          )
                                                        : '⚠️ Sin datos recientes - El dispositivo no ha reportado'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    simularTracking(
                                                        vehiculoSeleccionado.id,
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
                                                        vehiculoSeleccionado.id,
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

                                <div className="mt-2 space-y-4 border-t pt-2 md:col-span-2">
                                    <h3 className="text-xs font-black tracking-widest text-primary/70 uppercase">
                                        Observaciones y Notas
                                    </h3>
                                    <div className="min-h-[80px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
                                            {vehiculoSeleccionado.notas ||
                                                'Sin observaciones registradas para este vehículo.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="border-t bg-muted/10 p-6">
                                <Button
                                    onClick={() => setIsVerOpen(false)}
                                    className="w-full rounded-full bg-foreground px-8 font-bold text-background shadow-lg hover:bg-foreground/90 sm:w-auto"
                                >
                                    Cerrar Vista
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
