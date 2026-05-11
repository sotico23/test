import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    Users,
    Truck,
    Package,
    Weight,
    Droplets,
    Download,
    Upload,
    FileSpreadsheet,
    FileJson,
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Miembro {
    id: number;
    name: string;
    email: string;
}

interface Empleado {
    id: number;
    name: string;
    email: string;
}

interface Conductor {
    id: number;
    nombre: string;
    rut: string;
    licencia: string;
    telefono: string;
}

interface GrupoTrabajo {
    id: number;
    nombre: string;
    descripcion: string | null;
    color: string;
    estado: string;
    miembros: Miembro[];
    conductores?: Conductor[];
    total_ventas?: number;
    cantidad_ventas?: number;
    total_kg?: number;
    total_l?: number;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos de Trabajo', href: '/grupos-trabajo' },
];

export default function Index({
    grupos,
    empleados,
    conductores,
    puedeGestionar = false,
}: {
    grupos: GrupoTrabajo[];
    empleados: Empleado[];
    conductores: Conductor[];
    puedeGestionar?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<GrupoTrabajo | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [buscarConductor, setBuscarConductor] = useState('');
    const [buscarEmpleado, setBuscarEmpleado] = useState('');

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
        descripcion: '',
        color: '#3B82F6',
        estado: 'activo',
        miembros: [] as number[],
        conductores: [] as number[],
    });

    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleImportCSV = () => {
        csvInputRef.current?.click();
    };

    const handleImportExcel = () => {
        excelInputRef.current?.click();
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'csv' | 'excel',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post('/grupos-trabajo/importar', formData, {
            forceFormData: true,
            onSuccess: () => {
                e.target.value = '';
            },
        });
    };

    const gruposFiltrados = useMemo(() => {
        if (!busqueda) return grupos;
        const busca = busqueda.toLowerCase();
        return grupos.filter(
            (g) =>
                g.nombre.toLowerCase().includes(busca) ||
                (g.descripcion || '').toLowerCase().includes(busca),
        );
    }, [grupos, busqueda]);

    const conductoresFiltradosModal = useMemo(() => {
        if (!buscarConductor) return conductores;
        const b = buscarConductor.toLowerCase();
        return conductores.filter(
            (c) =>
                c.nombre.toLowerCase().includes(b) ||
                (c.rut && c.rut.toLowerCase().includes(b)),
        );
    }, [conductores, buscarConductor]);

    const empleadosFiltradosModal = useMemo(() => {
        if (!buscarEmpleado) return empleados;
        const b = buscarEmpleado.toLowerCase();
        return empleados.filter((e) => e.name.toLowerCase().includes(b));
    }, [empleados, buscarEmpleado]);

    const handleOpenNew = () => {
        reset();
        setData((prev) => ({ ...prev, miembros: [], conductores: [] }));
        setEditando(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (grupo: GrupoTrabajo) => {
        setData({
            nombre: grupo.nombre,
            descripcion: grupo.descripcion || '',
            color: grupo.color,
            estado: grupo.estado,
            miembros: grupo.miembros?.map((m) => m.id) || [],
            conductores: grupo.conductores?.map((c) => c.id) || [],
        });
        setEditando(grupo);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/grupos-trabajo/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditando(null);
                },
            });
        } else {
            post('/grupos-trabajo', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este grupo?')) {
            destroy(`/grupos-trabajo/${id}`);
        }
    };

    const toggleMiembro = (id: number) => {
        const current = data.miembros || [];
        if (current.includes(id)) {
            setData(
                'miembros',
                current.filter((m) => m !== id),
            );
        } else {
            setData('miembros', [...current, id]);
        }
    };

    const toggleConductor = (id: number) => {
        const current = data.conductores || [];
        if (current.includes(id)) {
            setData(
                'conductores',
                current.filter((m) => m !== id),
            );
        } else {
            setData('conductores', [...current, id]);
        }
    };

    const getEstadoBadge = (estado: string) => {
        return estado === 'activo' ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Activo
            </Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                Inactivo
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos de Trabajo" />
            <div className="mx-auto max-w-[1600px] p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {puedeGestionar
                                ? 'Grupos de Trabajo'
                                : 'Mis Grupos de Trabajo'}
                        </h1>
                        <p className="text-muted-foreground">
                            {puedeGestionar
                                ? 'Administra los equipos de trabajo'
                                : 'Los grupos de trabajo a los que perteneces'}
                        </p>
                    </div>
                    {puedeGestionar && (
                        <div className="flex items-center gap-2">
                            <Button onClick={handleOpenNew} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nuevo Grupo
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-2 rounded-xl border-muted-foreground/10 font-bold"
                                    >
                                        <Download className="h-4 w-4 text-primary" />
                                        <span>Herramientas</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem onClick={handleImportCSV}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Importar CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleImportExcel}
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Importar Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.get(
                                                '/grupos-trabajo/exportar?format=json',
                                            )
                                        }
                                    >
                                        <FileJson className="mr-2 h-4 w-4" />
                                        Exportar JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.get(
                                                '/grupos-trabajo/exportar?format=excel',
                                            )
                                        }
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Exportar Excel
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar grupos..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gruposFiltrados.map((grupo) => (
                        <Card key={grupo.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: grupo.color,
                                            }}
                                        />
                                        <CardTitle className="text-lg">
                                            {grupo.nombre}
                                        </CardTitle>
                                    </div>
                                    {getEstadoBadge(grupo.estado)}
                                </div>
                                {grupo.descripcion && (
                                    <CardDescription>
                                        {grupo.descripcion}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span>Miembros:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {grupo.miembros &&
                                            grupo.miembros.length > 0 &&
                                            grupo.miembros.map((miembro) => (
                                                <Badge
                                                    key={miembro.id}
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {miembro.name}
                                                </Badge>
                                            ))}
                                        {grupo.conductores &&
                                            grupo.conductores.length > 0 &&
                                            grupo.conductores.map(
                                                (conductor) => (
                                                    <Badge
                                                        key={conductor.id}
                                                        variant="secondary"
                                                        className="bg-blue-50 text-[10px] text-blue-700 hover:bg-blue-100"
                                                    >
                                                        <Truck className="mr-1 h-3 w-3" />
                                                        {conductor.nombre}
                                                    </Badge>
                                                ),
                                            )}
                                        {(!grupo.miembros ||
                                            grupo.miembros.length === 0) &&
                                            (!grupo.conductores ||
                                                grupo.conductores.length ===
                                                    0) && (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Sin miembros ni conductores
                                                </span>
                                            )}
                                    </div>
                                </div>

                                {/* Métricas de Producción/Ventas */}
                                <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Package className="h-3 w-3" />
                                            <span>Ventas</span>
                                        </div>
                                        <p className="text-sm font-bold">
                                            {new Intl.NumberFormat('es-CL', {
                                                style: 'currency',
                                                currency: 'CLP',
                                            }).format(grupo.total_ventas || 0)}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground">
                                            {grupo.cantidad_ventas || 0} pedidos
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                            <Weight className="h-3 w-3" />
                                            <span>Producción</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-orange-600">
                                                {(
                                                    grupo.total_kg || 0
                                                ).toLocaleString('es-CL')}{' '}
                                                Kg
                                            </p>
                                            <p className="text-xs font-medium text-blue-600">
                                                <Droplets className="mr-1 inline h-3 w-3" />
                                                {(
                                                    grupo.total_l || 0
                                                ).toLocaleString('es-CL')}{' '}
                                                L
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {puedeGestionar && (
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleOpenEdit(grupo)
                                            }
                                        >
                                            <Pencil className="mr-1 h-3 w-3" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(grupo.id)
                                            }
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Eliminar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {gruposFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                            {puedeGestionar
                                ? 'No hay grupos de trabajo'
                                : 'No perteneces a ningún grupo'}
                        </h3>
                        <p className="text-muted-foreground">
                            {puedeGestionar
                                ? 'Crea tu primer grupo de trabajo'
                                : 'Contacta a tu administrador para asignarte a un grupo'}
                        </p>
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editando
                                ? 'Editar Grupo'
                                : 'Nuevo Grupo de Trabajo'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    placeholder="Ej: Equipo de entregas"
                                />
                                {errors.nombre && (
                                    <p className="text-sm text-red-500">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Input
                                    id="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                    placeholder="Descripción opcional"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        id="color"
                                        value={data.color}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        className="h-10 w-14 cursor-pointer rounded border"
                                    />
                                    <Input
                                        value={data.color}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="estado">Estado</Label>
                                <select
                                    id="estado"
                                    value={data.estado}
                                    onChange={(e) =>
                                        setData('estado', e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>Conductores</Label>
                                    <Input
                                        placeholder="Buscar conductor..."
                                        value={buscarConductor}
                                        onChange={(e) =>
                                            setBuscarConductor(e.target.value)
                                        }
                                        className="h-7 w-48 text-xs"
                                    />
                                </div>
                                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                                    {conductoresFiltradosModal.length === 0 ? (
                                        <p className="p-2 text-sm text-muted-foreground">
                                            No hay conductores disponibles o
                                            coincidentes
                                        </p>
                                    ) : (
                                        conductoresFiltradosModal.map(
                                            (conductor) => (
                                                <label
                                                    key={conductor.id}
                                                    className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-accent"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            data.conductores?.includes(
                                                                conductor.id,
                                                            ) || false
                                                        }
                                                        onChange={() =>
                                                            toggleConductor(
                                                                conductor.id,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {conductor.nombre} -{' '}
                                                        {conductor.rut}
                                                    </span>
                                                </label>
                                            ),
                                        )
                                    )}
                                </div>
                                {errors.conductores && (
                                    <p className="mt-1 text-sm text-red-500">
                                        Error en conductores:{' '}
                                        {errors.conductores}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>Empleados</Label>
                                    <Input
                                        placeholder="Buscar empleado..."
                                        value={buscarEmpleado}
                                        onChange={(e) =>
                                            setBuscarEmpleado(e.target.value)
                                        }
                                        className="h-7 w-48 text-xs"
                                    />
                                </div>
                                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                                    {empleadosFiltradosModal.length === 0 ? (
                                        <p className="p-2 text-sm text-muted-foreground">
                                            No hay empleados disponibles o
                                            coincidentes
                                        </p>
                                    ) : (
                                        empleadosFiltradosModal.map(
                                            (empleado) => (
                                                <label
                                                    key={empleado.id}
                                                    className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-accent"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            data.miembros?.includes(
                                                                empleado.id,
                                                            ) || false
                                                        }
                                                        onChange={() =>
                                                            toggleMiembro(
                                                                empleado.id,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {empleado.name}
                                                    </span>
                                                </label>
                                            ),
                                        )
                                    )}
                                </div>
                                {errors.miembros && (
                                    <p className="mt-1 text-sm text-red-500">
                                        Error en empleados: {errors.miembros}
                                    </p>
                                )}
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
                                {editando ? 'Guardar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'csv')}
            />
            <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'excel')}
            />
        </AppLayout>
    );
}
