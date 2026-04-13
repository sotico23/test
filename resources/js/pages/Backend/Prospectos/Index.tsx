import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    GripVertical,
    Kanban,
    List,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Prospecto {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    empresa: string | null;
    descripcion: string | null;
    fuente: string | null;
    estado: string;
    valor_estimado: number;
    fecha_seguimiento: string | null;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prospectos', href: '/prospectos' },
];

const estados = ['nuevo', 'contactado', 'calificado', 'perdido', 'convertido'];

const estadoConfig: Record<
    string,
    { label: string; color: string; bgColor: string; borderColor: string }
> = {
    nuevo: {
        label: 'Nuevo',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    contactado: {
        label: 'Contactado',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
    },
    calificado: {
        label: 'Calificado',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
    },
    perdido: {
        label: 'Perdido',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    convertido: {
        label: 'Convertido',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
};

const fuentes = ['web', 'referido', 'telefono', 'feria', 'otro'];

export default function Index({ prospectos }: { prospectos: Prospecto[] }) {
    const [vistaKanban, setVistaKanban] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Prospecto | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [localProspectos, setLocalProspectos] = useState(prospectos);

    useEffect(() => {
        setLocalProspectos(prospectos);
    }, [prospectos]);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
        fuente: '',
        valorMin: '',
        valorMax: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const prospectosPorEstado = useMemo(() => {
        const filtrados = localProspectos.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.nombre?.toLowerCase().includes(busca) &&
                    !p.email?.toLowerCase().includes(busca) &&
                    !p.empresa?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && p.estado !== filtros.estado) return false;
            if (filtros.fuente && p.fuente !== filtros.fuente) return false;
            if (
                filtros.valorMin &&
                Number(p.valor_estimado) < Number(filtros.valorMin)
            )
                return false;
            if (
                filtros.valorMax &&
                Number(p.valor_estimado) > Number(filtros.valorMax)
            )
                return false;
            if (
                filtros.fechaDesde &&
                p.fecha_seguimiento &&
                p.fecha_seguimiento < filtros.fechaDesde
            )
                return false;
            if (
                filtros.fechaHasta &&
                p.fecha_seguimiento &&
                p.fecha_seguimiento > filtros.fechaHasta
            )
                return false;
            return true;
        });

        const grouped: Record<string, Prospecto[]> = {};
        estados.forEach((e) => (grouped[e] = []));
        filtrados.forEach((p) => {
            if (grouped[p.estado]) {
                grouped[p.estado].push(p);
            } else {
                grouped['nuevo'].push(p);
            }
        });
        return grouped;
    }, [localProspectos, filtros]);

    const prospectosFiltrados = useMemo(() => {
        return localProspectos.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.nombre?.toLowerCase().includes(busca) &&
                    !p.email?.toLowerCase().includes(busca) &&
                    !p.empresa?.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && p.estado !== filtros.estado) return false;
            if (filtros.fuente && p.fuente !== filtros.fuente) return false;
            if (
                filtros.valorMin &&
                Number(p.valor_estimado) < Number(filtros.valorMin)
            )
                return false;
            if (
                filtros.valorMax &&
                Number(p.valor_estimado) > Number(filtros.valorMax)
            )
                return false;
            if (
                filtros.fechaDesde &&
                p.fecha_seguimiento &&
                p.fecha_seguimiento < filtros.fechaDesde
            )
                return false;
            if (
                filtros.fechaHasta &&
                p.fecha_seguimiento &&
                p.fecha_seguimiento > filtros.fechaHasta
            )
                return false;
            return true;
        });
    }, [localProspectos, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
            fuente: '',
            valorMin: '',
            valorMax: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        descripcion: '',
        fuente: '',
        estado: 'nuevo',
        valor_estimado: 0,
        fecha_seguimiento: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/prospectos/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/prospectos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (prospecto: Prospecto) => {
        setEditando(prospecto);
        setData({
            nombre: prospecto.nombre,
            email: prospecto.email || '',
            telefono: prospecto.telefono || '',
            empresa: prospecto.empresa || '',
            descripcion: prospecto.descripcion || '',
            fuente: prospecto.fuente || '',
            estado: prospecto.estado,
            valor_estimado: prospecto.valor_estimado,
            fecha_seguimiento: prospecto.fecha_seguimiento || '',
            notas: prospecto.notas || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/prospectos/${id}`);
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, nuevoEstado: string) => {
        e.preventDefault();
        if (draggingId === null) return;

        const prospecto = localProspectos.find((p) => p.id === draggingId);
        if (!prospecto || prospecto.estado === nuevoEstado) {
            setDraggingId(null);
            return;
        }

        router.patch(
            `/prospectos/${draggingId}/estado`,
            { estado: nuevoEstado },
            {
                onSuccess: () => {
                    setLocalProspectos((prev) =>
                        prev.map((p) =>
                            p.id === draggingId
                                ? { ...p, estado: nuevoEstado }
                                : p,
                        ),
                    );
                    setDraggingId(null);
                },
            },
        );
    };

    const getTotalValor = (estado: string) => {
        return (
            prospectosPorEstado[estado]?.reduce(
                (sum, p) => sum + Number(p.valor_estimado),
                0,
            ) || 0
        );
    };

    const getTotalProspectos = (estado: string) => {
        return prospectosPorEstado[estado]?.length || 0;
    };

    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            nuevo: 'bg-blue-500',
            contactado: 'bg-yellow-500',
            calificado: 'bg-purple-500',
            perdido: 'bg-red-500',
            convertido: 'bg-green-500',
        };
        return (
            <Badge
                className={`${colores[estado] || 'bg-gray-500'} h-5 px-1.5 text-[10px] uppercase`}
            >
                {estado}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Prospectos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Prospectos</h1>
                            <p className="text-muted-foreground">
                                Pipeline de ventas
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={vistaKanban ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setVistaKanban(true)}
                                title="Vista Kanban"
                            >
                                <Kanban className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={!vistaKanban ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setVistaKanban(false)}
                                title="Vista Lista"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => {
                                    setEditando(null);
                                    reset();
                                    setIsOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Nuevo
                                Prospecto
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    {vistaKanban
                                        ? 'Pipeline de Ventas'
                                        : 'Lista de Prospectos'}
                                </CardTitle>
                                <CardDescription>
                                    {vistaKanban
                                        ? `${localProspectos.length} prospectos en pipeline • ${formatCurrencyCLP(localProspectos.reduce((sum, p) => sum + Number(p.valor_estimado), 0))} valor total`
                                        : `${prospectosFiltrados.length} prospectos ${prospectosFiltrados.length !== localProspectos.length ? `de ${localProspectos.length} registrados` : 'registrados'}`}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-2">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre, email o empresa..."
                                            value={filtros.busqueda}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    busqueda: e.target.value,
                                                })
                                            }
                                            className="h-8 pl-8 text-xs"
                                        />
                                    </div>
                                </div>
                                {!vistaKanban && (
                                    <>
                                        <select
                                            value={filtros.estado}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    estado: e.target.value,
                                                })
                                            }
                                            className="flex h-8 rounded-md border bg-background px-2 py-1 text-xs"
                                        >
                                            <option value="">
                                                Todos los estados
                                            </option>
                                            {estados.map((e) => (
                                                <option key={e} value={e}>
                                                    {e.charAt(0).toUpperCase() +
                                                        e.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={filtros.fuente}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    fuente: e.target.value,
                                                })
                                            }
                                            className="flex h-8 rounded-md border bg-background px-2 py-1 text-xs"
                                        >
                                            <option value="">
                                                Todas las fuentes
                                            </option>
                                            {fuentes.map((f) => (
                                                <option key={f} value={f}>
                                                    {f.charAt(0).toUpperCase() +
                                                        f.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            type="number"
                                            placeholder="Valor mín"
                                            value={filtros.valorMin}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    valorMin: e.target.value,
                                                })
                                            }
                                            className="h-8 w-[90px] text-xs"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Valor máx"
                                            value={filtros.valorMax}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    valorMax: e.target.value,
                                                })
                                            }
                                            className="h-8 w-[90px] text-xs"
                                        />
                                        <Input
                                            type="date"
                                            placeholder="Desde"
                                            value={filtros.fechaDesde}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    fechaDesde: e.target.value,
                                                })
                                            }
                                            className="h-8 w-[120px] text-xs"
                                        />
                                        <Input
                                            type="date"
                                            placeholder="Hasta"
                                            value={filtros.fechaHasta}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    fechaHasta: e.target.value,
                                                })
                                            }
                                            className="h-8 w-[120px] text-xs"
                                        />
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={limpiarFiltros}
                                    title="Limpiar filtros"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {vistaKanban ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {estados.map((estado) => {
                                        const config = estadoConfig[estado];
                                        const prospectosEnEstado =
                                            prospectosPorEstado[estado] || [];
                                        const isDraggingOver =
                                            draggingId !== null;

                                        return (
                                            <div
                                                key={estado}
                                                className={`relative overflow-hidden rounded-2xl border-0 shadow-sm ${isDraggingOver ? 'ring-2 ring-primary/30' : ''} ${estado === 'nuevo'
                                                        ? 'bg-gradient-to-b from-blue-50/80 to-blue-100/30'
                                                        : estado ===
                                                            'contactado'
                                                            ? 'bg-gradient-to-b from-amber-50/80 to-amber-100/30'
                                                            : estado ===
                                                                'calificado'
                                                                ? 'bg-gradient-to-b from-violet-50/80 to-violet-100/30'
                                                                : estado ===
                                                                    'perdido'
                                                                    ? 'bg-gradient-to-b from-rose-50/80 to-rose-100/30'
                                                                    : 'bg-gradient-to-b from-emerald-50/80 to-emerald-100/30'
                                                    }`}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) =>
                                                    handleDrop(e, estado)
                                                }
                                            >
                                                <div className="px-4 py-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded-xl ${estado ===
                                                                        'nuevo'
                                                                        ? 'bg-blue-100'
                                                                        : estado ===
                                                                            'contactado'
                                                                            ? 'bg-amber-100'
                                                                            : estado ===
                                                                                'calificado'
                                                                                ? 'bg-violet-100'
                                                                                : estado ===
                                                                                    'perdido'
                                                                                    ? 'bg-rose-100'
                                                                                    : 'bg-emerald-100'
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`text-sm font-bold ${estado ===
                                                                            'nuevo'
                                                                            ? 'text-blue-600'
                                                                            : estado ===
                                                                                'contactado'
                                                                                ? 'text-amber-600'
                                                                                : estado ===
                                                                                    'calificado'
                                                                                    ? 'text-violet-600'
                                                                                    : estado ===
                                                                                        'perdido'
                                                                                        ? 'text-rose-600'
                                                                                        : 'text-emerald-600'
                                                                        }`}
                                                                >
                                                                    {getTotalProspectos(
                                                                        estado,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-gray-800">
                                                                    {
                                                                        config.label
                                                                    }
                                                                </h3>
                                                                <p className="text-xs font-medium text-gray-500">
                                                                    {formatCurrencyCLP(
                                                                        getTotalValor(
                                                                            estado,
                                                                        ),
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 px-2 pb-3">
                                                    {prospectosEnEstado.length ===
                                                        0 ? (
                                                        <div className="py-8 text-center text-xs text-gray-400">
                                                            Sin prospectos
                                                        </div>
                                                    ) : (
                                                        prospectosEnEstado.map(
                                                            (prospecto) => (
                                                                <Card
                                                                    key={
                                                                        prospecto.id
                                                                    }
                                                                    draggable
                                                                    onDragStart={(
                                                                        e,
                                                                    ) =>
                                                                        handleDragStart(
                                                                            e,
                                                                            prospecto.id,
                                                                        )
                                                                    }
                                                                    className="mx-1 cursor-grab rounded-xl border-0 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-md"
                                                                >
                                                                    <CardContent className="p-3">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                                                    {
                                                                                        prospecto.nombre
                                                                                    }
                                                                                </p>
                                                                                {prospecto.empresa && (
                                                                                    <p className="truncate text-xs text-gray-500">
                                                                                        {
                                                                                            prospecto.empresa
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            {prospecto.telefono && (
                                                                                <WhatsAppButton
                                                                                    phone={
                                                                                        prospecto.telefono
                                                                                    }
                                                                                    nombre={
                                                                                        prospecto.nombre
                                                                                    }
                                                                                    className="h-6 w-6"
                                                                                />
                                                                            )}
                                                                            <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                                                                                {formatCurrencyCLP(
                                                                                    prospecto.valor_estimado,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {prospecto.fecha_seguimiento && (
                                                                            <p className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                                                                                <svg
                                                                                    className="h-3 w-3"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                    />
                                                                                </svg>
                                                                                {formatDateCLP(
                                                                                    prospecto.fecha_seguimiento,
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                        <div className="mt-2 flex gap-1 border-t border-gray-100 pt-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 hover:bg-gray-100"
                                                                                onClick={() =>
                                                                                    handleEdit(
                                                                                        prospecto,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Pencil className="h-3 w-3 text-gray-500" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 hover:bg-red-50"
                                                                                onClick={() =>
                                                                                    handleDelete(
                                                                                        prospecto.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-3 w-3 text-red-400" />
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : prospectosFiltrados.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    No hay prospectos
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-sm">
                                                <th className="px-2 py-2 text-left font-medium">
                                                    Nombre
                                                </th>
                                                <th className="px-2 py-2 text-left font-medium">
                                                    Teléfono
                                                </th>
                                                <th className="hidden px-2 py-2 text-left font-medium md:table-cell">
                                                    Empresa
                                                </th>
                                                <th className="hidden px-2 py-2 text-left font-medium sm:table-cell">
                                                    Email
                                                </th>
                                                <th className="hidden px-2 py-2 text-left font-medium lg:table-cell">
                                                    Fuente
                                                </th>
                                                <th className="hidden px-2 py-2 text-right font-medium lg:table-cell">
                                                    Valor
                                                </th>
                                                <th className="px-2 py-2 text-center font-medium">
                                                    Estado
                                                </th>
                                                <th className="px-2 py-2 text-right font-medium">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prospectosFiltrados.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-b"
                                                >
                                                    <td className="px-2 py-2 font-medium">
                                                        {p.nombre}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex items-center gap-1">
                                                            {p.telefono || (
                                                                <span className="text-muted-foreground">
                                                                    -
                                                                </span>
                                                            )}
                                                            <WhatsAppButton
                                                                phone={
                                                                    p.telefono
                                                                }
                                                                nombre={
                                                                    p.nombre
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="hidden max-w-[200px] truncate px-2 py-2 md:table-cell">
                                                        {p.empresa || (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="hidden max-w-[200px] truncate px-2 py-2 sm:table-cell">
                                                        {p.email || (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="hidden px-2 py-2 lg:table-cell">
                                                        {p.fuente ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize"
                                                            >
                                                                {p.fuente}
                                                            </Badge>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="hidden px-2 py-2 text-right font-bold whitespace-nowrap text-green-600 lg:table-cell">
                                                        {formatCurrencyCLP(
                                                            p.valor_estimado,
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                                        {getEstadoBadge(
                                                            p.estado,
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEdit(p)
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    p.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-2xl md:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Prospecto
                        </DialogTitle>
                    </DialogHeader>
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="text-sm text-red-700">
                                <strong>Corrija los siguientes errores:</strong>
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
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Teléfono *</Label>
                                    <Input
                                        value={data.telefono}
                                        onChange={(e) =>
                                            setData('telefono', e.target.value)
                                        }
                                        placeholder="+52 123 456 7890"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Empresa</Label>
                                    <Input
                                        value={data.empresa}
                                        onChange={(e) =>
                                            setData('empresa', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fuente</Label>
                                    <select
                                        value={data.fuente}
                                        onChange={(e) =>
                                            setData('fuente', e.target.value)
                                        }
                                        className="flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm capitalize"
                                    >
                                        <option value="">Seleccionar</option>
                                        {fuentes.map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <select
                                        value={data.estado}
                                        onChange={(e) =>
                                            setData('estado', e.target.value)
                                        }
                                        className="flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm capitalize"
                                    >
                                        {estados.map((e) => (
                                            <option key={e} value={e}>
                                                {e}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor Estimado</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.valor_estimado}
                                        onChange={(e) =>
                                            setData(
                                                'valor_estimado',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Seguimiento</Label>
                                <Input
                                    type="date"
                                    value={data.fecha_seguimiento}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_seguimiento',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                />
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
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
