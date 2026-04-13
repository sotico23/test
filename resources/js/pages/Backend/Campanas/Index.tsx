import { Head, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Search, X, Eye } from 'lucide-react';
import { ModalShow } from '@/components/ui/ModalShow';
import { useState } from 'react';
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
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
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
    presupuesto: number | null;
    presupuesto_real: number | null;
    visitas: number | null;
    leads: number | null;
    conversiones: number | null;
    roi: number | null;
    estado: string;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campañas', href: '/campanas' },
];

export default function Index({
    campanas,
}: {
    campanas: {
        data: Campana[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Campana | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Campana | null>(null);

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
        descripcion: '',
        tipo: '',
        canal: '',
        objetivo: '',
        fecha_inicio: '',
        fecha_fin: '',
        presupuesto: '',
        presupuesto_real: '',
        visitas: '',
        leads: '',
        conversiones: '',
        roi: '',
        estado: 'activa',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        estado: '',
    });

    const campanasFiltradas = useMemo(() => {
        return campanas.data.filter((c: Campana) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.nombre.toLowerCase().includes(busca) &&
                    !(c.descripcion || '').toLowerCase().includes(busca) &&
                    !(c.objetivo || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.tipo && c.tipo !== filtros.tipo) return false;
            if (filtros.estado && c.estado !== filtros.estado) return false;

            return true;
        });
    }, [campanas.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: '',
            estado: '',
        });
    };

    const handleView = (c: Campana) => {
        setViewing(c);
        setIsViewOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            presupuesto: data.presupuesto
                ? parseFloat(data.presupuesto.toString())
                : null,
            presupuesto_real: data.presupuesto_real
                ? parseFloat(data.presupuesto_real.toString())
                : null,
            visitas: data.visitas ? parseInt(data.visitas.toString()) : null,
            leads: data.leads ? parseInt(data.leads.toString()) : null,
            conversiones: data.conversiones
                ? parseInt(data.conversiones.toString())
                : null,
            roi: data.roi ? parseFloat(data.roi.toString()) : null,
        };
        if (editando) {
            put(`/campanas/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                    clearErrors();
                },
            });
        } else {
            post('/campanas', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    clearErrors();
                },
            });
        }
    };

    const handleEdit = (campana: Campana) => {
        clearErrors();
        setEditando(campana);
        setData({
            nombre: campana.nombre,
            descripcion: campana.descripcion || '',
            tipo: campana.tipo || '',
            canal: campana.canal || '',
            objetivo: campana.objetivo || '',
            fecha_inicio: campana.fecha_inicio
                ? campana.fecha_inicio.substring(0, 10)
                : '',
            fecha_fin: campana.fecha_fin
                ? campana.fecha_fin.substring(0, 10)
                : '',
            presupuesto: campana.presupuesto?.toString() || '',
            presupuesto_real: campana.presupuesto_real?.toString() || '',
            visitas: campana.visitas?.toString() || '',
            leads: campana.leads?.toString() || '',
            conversiones: campana.conversiones?.toString() || '',
            roi: campana.roi?.toString() || '',
            estado: campana.estado,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta campaña?'))
            destroy(`/campanas/${id}`);
    };

    const getEstadoBadge = (estado: string) => {
        const variants: Record<
            string,
            'default' | 'destructive' | 'secondary' | 'outline'
        > = {
            activa: 'default',
            pausada: 'secondary',
            finalizada: 'outline',
            cancelada: 'destructive',
        };
        const labels: Record<string, string> = {
            activa: 'Activa',
            pausada: 'Pausada',
            finalizada: 'Finalizada',
            cancelada: 'Cancelada',
        };
        return (
            <Badge variant={variants[estado] || 'outline'}>
                {labels[estado] || estado}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Campañas</h1>
                    <Button
                        onClick={() => {
                            clearErrors();
                            setEditando(null);
                            reset();
                            setIsOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Campaña
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Campañas</CardTitle>
                        <CardDescription>
                            {campanasFiltradas.length} campañas encontradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, objetivo..."
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
                            <select
                                value={filtros.tipo}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        tipo: e.target.value,
                                    })
                                }
                                className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="Email">Email</option>
                                <option value="Redes Sociales">
                                    Redes Sociales
                                </option>
                                <option value="SEO">SEO</option>
                                <option value="PPC">PPC</option>
                                <option value="Evento">Evento</option>
                            </select>
                            <select
                                value={filtros.estado}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        estado: e.target.value,
                                    })
                                }
                                className="flex h-9 rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todos los estados</option>
                                <option value="activa">Activa</option>
                                <option value="pausada">Pausada</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
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
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Nombre
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Tipo
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Fecha Inicio
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Fecha Fin
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Presupuesto
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Estado
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campanasFiltradas.map((campana) => (
                                        <tr
                                            key={campana.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 font-medium">
                                                {campana.nombre}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {campana.tipo || '-'}
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm md:table-cell">
                                                {campana.fecha_inicio
                                                    ? new Date(
                                                          campana.fecha_inicio,
                                                      ).toLocaleDateString(
                                                          'es-CL',
                                                      )
                                                    : '-'}
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm lg:table-cell">
                                                {campana.fecha_fin
                                                    ? new Date(
                                                          campana.fecha_fin,
                                                      ).toLocaleDateString(
                                                          'es-CL',
                                                      )
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-sm">
                                                {campana.presupuesto
                                                    ? `$${campana.presupuesto.toLocaleString('es-CL')}`
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {getEstadoBadge(campana.estado)}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleView(campana)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleEdit(campana)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                campana.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {campanasFiltradas.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron campañas con
                                                los filtros aplicados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <Pagination
                                links={campanas.links}
                                meta={campanas.meta}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-2xl md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editando ? 'Editar Campaña' : 'Nueva Campaña'}
                            </DialogTitle>
                            <DialogDescription>
                                {editando
                                    ? 'Modifique los datos de la campaña'
                                    : 'Ingrese los datos de la nueva campaña'}
                            </DialogDescription>
                        </DialogHeader>
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                                <div className="text-sm text-red-700">
                                    <strong>
                                        Corrija los siguientes errores:
                                    </strong>
                                    <ul className="mt-1 list-disc pl-5">
                                        {Object.entries(errors).map(
                                            ([key, error]) => (
                                                <li key={key}>
                                                    {key}: {error as string}
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
                                <div className="grid gap-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descripción</Label>
                                    <Input
                                        value={data.descripcion}
                                        onChange={(e) =>
                                            setData(
                                                'descripcion',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Tipo</Label>
                                        <Select
                                            value={data.tipo}
                                            onValueChange={(v) =>
                                                setData('tipo', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="marketing">
                                                    Marketing
                                                </SelectItem>
                                                <SelectItem value="ventas">
                                                    Ventas
                                                </SelectItem>
                                                <SelectItem value="publicidad">
                                                    Publicidad
                                                </SelectItem>
                                                <SelectItem value="promocion">
                                                    Promoción
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Canal</Label>
                                        <Select
                                            value={data.canal}
                                            onValueChange={(v) =>
                                                setData('canal', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar canal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="digital">
                                                    Digital
                                                </SelectItem>
                                                <SelectItem value="tv">
                                                    TV
                                                </SelectItem>
                                                <SelectItem value="radio">
                                                    Radio
                                                </SelectItem>
                                                <SelectItem value="prensa">
                                                    Prensa
                                                </SelectItem>
                                                <SelectItem value="eventos">
                                                    Eventos
                                                </SelectItem>
                                                <SelectItem value="email">
                                                    Email
                                                </SelectItem>
                                                <SelectItem value="redes_sociales">
                                                    Redes Sociales
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Objetivo</Label>
                                    <Input
                                        value={data.objetivo}
                                        onChange={(e) =>
                                            setData('objetivo', e.target.value)
                                        }
                                        placeholder="Ej: Aumentar ventas en 20%"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Fecha Inicio</Label>
                                        <Input
                                            type="date"
                                            value={data.fecha_inicio}
                                            onChange={(e) =>
                                                setData(
                                                    'fecha_inicio',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Fecha Fin</Label>
                                        <Input
                                            type="date"
                                            value={data.fecha_fin}
                                            onChange={(e) =>
                                                setData(
                                                    'fecha_fin',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Presupuesto Planificado</Label>
                                        <Input
                                            type="number"
                                            value={data.presupuesto}
                                            onChange={(e) =>
                                                setData(
                                                    'presupuesto',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Presupuesto Real</Label>
                                        <Input
                                            type="number"
                                            value={data.presupuesto_real}
                                            onChange={(e) =>
                                                setData(
                                                    'presupuesto_real',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Visitas</Label>
                                        <Input
                                            type="number"
                                            value={data.visitas}
                                            onChange={(e) =>
                                                setData(
                                                    'visitas',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Leads</Label>
                                        <Input
                                            type="number"
                                            value={data.leads}
                                            onChange={(e) =>
                                                setData('leads', e.target.value)
                                            }
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Conversiones</Label>
                                        <Input
                                            type="number"
                                            value={data.conversiones}
                                            onChange={(e) =>
                                                setData(
                                                    'conversiones',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(v) =>
                                            setData('estado', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activa">
                                                Activa
                                            </SelectItem>
                                            <SelectItem value="pausada">
                                                Pausada
                                            </SelectItem>
                                            <SelectItem value="finalizada">
                                                Finalizada
                                            </SelectItem>
                                            <SelectItem value="cancelada">
                                                Cancelada
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                <Button type="submit">
                                    <Check className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <ModalShow
                    isOpen={isViewOpen}
                    setIsOpen={setIsViewOpen}
                    item={viewing}
                    title="Campaña"
                    badgeLabel="Detalle de Campaña"
                    colorScheme="purple"
                    quickStats={[
                        {
                            label: 'Tipo',
                            val: viewing?.tipo || '---',
                            colorScheme: 'blue',
                        },
                        {
                            label: 'Canal',
                            val: viewing?.canal || '---',
                            colorScheme: 'teal',
                        },
                        {
                            label: 'Estado',
                            val: viewing?.estado || 'Activa',
                            colorScheme:
                                viewing?.estado === 'activa' ? 'green' : 'rose',
                        },
                    ]}
                >
                    <Card className="border-none bg-gray-50/50 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-3">
                            <CardTitle className="text-base font-bold text-gray-800">
                                Fechas y Presupuesto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 p-5">
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Inicio
                                </Label>
                                <p className="font-medium">
                                    {viewing?.fecha_inicio
                                        ? new Date(
                                              viewing.fecha_inicio,
                                          ).toLocaleDateString('es-CL')
                                        : 'Sin fecha'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Término
                                </Label>
                                <p className="font-medium">
                                    {viewing?.fecha_fin
                                        ? new Date(
                                              viewing.fecha_fin,
                                          ).toLocaleDateString('es-CL')
                                        : 'Sin fecha'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Presupuesto
                                </Label>
                                <p className="font-medium">
                                    {viewing?.presupuesto
                                        ? `$${Number(viewing.presupuesto).toLocaleString('es-CL')}`
                                        : '0'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Visitas
                                </Label>
                                <p className="font-medium">
                                    {viewing?.visitas || '0'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </ModalShow>
            </div>
        </AppLayout>
    );
}
