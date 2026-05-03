import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Eye,
    Truck,
    Calendar,
    User,
    Package,
    CheckCircle2,
    AlertCircle,
    Download,
    Upload,
    FileSpreadsheet,
    FileJson,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo, useRef } from 'react';
import { router } from '@inertiajs/react';
import { FormInput } from '@/components/form-input';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface CargaDiaria {
    id: number;
    vehiculo_id: number;
    conductor_id: number;
    fecha: string;
    estado: string;
    ventas_totales: number;
    devoluciones_totales: number;
    notas: string | null;
    vehiculo?: { placa: string; marca: string; modelo: string };
    conductor?: { nombre: string };
    productos?: {
        id: number;
        producto_id: number;
        cantidad_bordo: number;
        cantidad_vendida: number;
        cantidad_devuelta: number;
        producto?: { nombre: string };
    }[];
}

interface Vehiculo {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
}

interface Conductor {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cargas Diarias', href: '/cargas-diarias' },
];

export default function Index({
    cargas,
    vehiculos,
    conductores,
    productos,
}: {
    cargas: { data: CargaDiaria[]; links: any[]; meta?: any; total: number };
    vehiculos: Vehiculo[];
    conductores: Conductor[];
    productos: Producto[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerOpen, setIsVerOpen] = useState(false);
    const [editando, setEditando] = useState<CargaDiaria | null>(null);
    const [cargaSeleccionada, setCargaSeleccionada] =
        useState<CargaDiaria | null>(null);

    const [productosCarga, setProductosCarga] = useState<
        { producto_id: number; cantidad: number }[]
    >([]);

    const {
        data,
        setData,
        post,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        vehiculo_id: '',
        conductor_id: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente',
        notas: '',
        productos: [] as { producto_id: number; cantidad: number }[],
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
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

        router.post('/cargas-diarias/importar', formData, {
            forceFormData: true,
            onSuccess: () => {
                e.target.value = '';
            },
        });
    };

    const cargasFiltradas = useMemo(() => {
        return (cargas.data || []).filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                const vehiculoMatch =
                    c.vehiculo?.placa.toLowerCase().includes(busca) || false;
                const conductorMatch =
                    c.conductor?.nombre.toLowerCase().includes(busca) || false;
                if (!vehiculoMatch && !conductorMatch) {
                    return false;
                }
            }
            if (filtros.estado && c.estado !== filtros.estado) return false;
            return true;
        });
    }, [cargas, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleAddProducto = () => {
        setProductosCarga([...productosCarga, { producto_id: 0, cantidad: 1 }]);
    };

    const handleRemoveProducto = (index: number) => {
        const newList = [...productosCarga];
        newList.splice(index, 1);
        setProductosCarga(newList);
    };

    const handleProductoChange = (index: number, field: string, value: any) => {
        const newList = [...productosCarga];
        newList[index] = { ...newList[index], [field]: value };
        setProductosCarga(newList);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanData = {
            ...data,
            productos: productosCarga.filter(
                (p) => p.producto_id > 0 && p.cantidad > 0,
            ),
        };

        if (editando) {
            import('@inertiajs/react').then(({ router }) => {
                router.put(`/cargas-diarias/${editando.id}`, cleanData, {
                    onSuccess: () => {
                        setIsOpen(false);
                        setEditando(null);
                        reset();
                    },
                });
            });
        } else {
            import('@inertiajs/react').then(({ router }) => {
                router.post('/cargas-diarias', cleanData, {
                    onSuccess: () => {
                        setIsOpen(false);
                        reset();
                        setProductosCarga([]);
                    },
                });
            });
        }
    };

    const handleEdit = (c: CargaDiaria) => {
        setEditando(c);
        setData({
            vehiculo_id: c.vehiculo_id.toString(),
            conductor_id: c.conductor_id.toString(),
            fecha: c.fecha.split('T')[0],
            estado: c.estado,
            notas: c.notas || '',
            productos: [],
        });
        setProductosCarga([]); // Editing products is usually appending or fixed, here we reset for simplicity
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setEditando(null);
        setProductosCarga([]);
        setIsOpen(true);
    };

    const handleVer = (c: CargaDiaria) => {
        setCargaSeleccionada(c);
        setIsVerOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta carga diaria?'))
            destroy(`/cargas-diarias/${id}`);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            pendiente: 'bg-yellow-500',
            en_ruta: 'bg-blue-500',
            cerrado: 'bg-green-500',
        };
        return (
            <Badge className={colores[e] || 'bg-gray-500'}>
                {e.toUpperCase().replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Cargas Diarias (En Ruta)" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Cargas Diarias
                            </h1>
                            <p className="text-muted-foreground">
                                Asignación de inventario a vehículos
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" /> Nueva
                                Asignación
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
                                                '/cargas-diarias/exportar?format=json',
                                            )
                                        }
                                    >
                                        <FileJson className="mr-2 h-4 w-4" />
                                        Exportar JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.get(
                                                '/cargas-diarias/exportar?format=excel',
                                            )
                                        }
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Exportar Excel
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Rutas y Vehículos</CardTitle>
                            <CardDescription>
                                {cargasFiltradas.length} cargas registradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por placa o conductor..."
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
                                    <SelectTrigger className="h-9 w-full bg-background sm:w-[180px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        <SelectItem value="pendiente">
                                            PENDIENTE
                                        </SelectItem>
                                        <SelectItem value="en_ruta">
                                            EN RUTA
                                        </SelectItem>
                                        <SelectItem value="cerrado">
                                            CERRADO
                                        </SelectItem>
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
                                                Fecha
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Vehículo
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Conductor
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
                                        {cargasFiltradas.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2 font-bold">
                                                    {c.fecha
                                                        ? c.fecha.split('T')[0]
                                                        : ''}
                                                </td>
                                                <td className="py-2">
                                                    <div className="font-bold uppercase">
                                                        {c.vehiculo?.placa ||
                                                            '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {c.vehiculo?.marca}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    {c.conductor?.nombre || '-'}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(c.estado)}
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
                                        {cargasFiltradas.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron cargas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {cargas.links && (
                                    <Pagination
                                        links={cargas.links}
                                        meta={cargas.meta}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>

            {/* Modal Crear/Editar */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto border-none bg-background p-0 shadow-2xl md:max-w-2xl">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2">
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Modificar' : 'Nueva'} Carga Diaria /
                            Ruta
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Fecha"
                                    id="fecha"
                                    type="date"
                                    value={data.fecha}
                                    onChange={(e) =>
                                        setData('fecha', e.target.value)
                                    }
                                    error={errors.fecha}
                                    required
                                />
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(val) =>
                                            setData('estado', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pendiente">
                                                Pendiente
                                            </SelectItem>
                                            <SelectItem value="en_ruta">
                                                En Ruta
                                            </SelectItem>
                                            <SelectItem value="cerrado">
                                                Cerrado
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vehículo</Label>
                                    <Select
                                        value={data.vehiculo_id}
                                        onValueChange={(val) =>
                                            setData('vehiculo_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehiculos.map((v) => (
                                                <SelectItem
                                                    key={v.id}
                                                    value={v.id.toString()}
                                                >
                                                    {v.placa} - {v.marca}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Conductor</Label>
                                    <Select
                                        value={data.conductor_id}
                                        onValueChange={(val) =>
                                            setData('conductor_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conductores.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <FormInput
                                label="Notas"
                                id="notas"
                                value={data.notas}
                                onChange={(e) =>
                                    setData('notas', e.target.value)
                                }
                                error={errors.notas}
                            />

                            {!editando && (
                                <div className="mt-4 space-y-2 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold">
                                            Inventario Inicial (Productos en
                                            Vehículo)
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddProducto}
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Agregar Producto
                                        </Button>
                                    </div>
                                    {productosCarga.map((pc, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2"
                                        >
                                            <Select
                                                value={
                                                    pc.producto_id > 0
                                                        ? pc.producto_id.toString()
                                                        : ''
                                                }
                                                onValueChange={(val) =>
                                                    handleProductoChange(
                                                        idx,
                                                        'producto_id',
                                                        parseInt(val),
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Producto" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {productos.map((p) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={p.id.toString()}
                                                        >
                                                            {p.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormInput
                                                id={`cant-${idx}`}
                                                type="number"
                                                min="1"
                                                className="w-24"
                                                value={pc.cantidad}
                                                onChange={(e) =>
                                                    handleProductoChange(
                                                        idx,
                                                        'cantidad',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveProducto(idx)
                                                }
                                                className="text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Ver Detalles */}
            <Dialog open={isVerOpen} onOpenChange={setIsVerOpen}>
                <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-none bg-background p-0 shadow-2xl md:max-w-2xl">
                    <DialogHeader className="bg-gradient-to-r from-blue-500/10 to-transparent p-6 pb-2">
                        <DialogTitle className="text-2xl font-black tracking-tight text-blue-700">
                            Detalles de la Carga Diaria
                        </DialogTitle>
                    </DialogHeader>
                    {cargaSeleccionada && (
                        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6 pt-0">
                            <div className="grid gap-6">
                                {/* Info Base */}
                                <div className="grid grid-cols-2 gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Fecha
                                        </p>
                                        <p className="font-bold">
                                            {cargaSeleccionada.fecha
                                                ? cargaSeleccionada.fecha.split(
                                                      'T',
                                                  )[0]
                                                : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Estado
                                        </p>
                                        <div className="mt-1">
                                            {getEstadoBadge(
                                                cargaSeleccionada.estado,
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Vehículo
                                        </p>
                                        <p className="font-bold uppercase">
                                            {cargaSeleccionada.vehiculo?.placa}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {cargaSeleccionada.vehiculo?.marca}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Conductor asignado
                                        </p>
                                        <p className="font-medium">
                                            {
                                                cargaSeleccionada.conductor
                                                    ?.nombre
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Productos */}
                                <div>
                                    <h4 className="mb-3 text-sm font-bold text-foreground">
                                        Inventario Cargado
                                    </h4>
                                    {cargaSeleccionada.productos &&
                                    cargaSeleccionada.productos.length > 0 ? (
                                        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                                            {cargaSeleccionada.productos.map(
                                                (p) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center justify-between rounded border bg-white p-2"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {
                                                                    p.producto
                                                                        ?.nombre
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-muted-foreground">
                                                                Cantidad Abordo
                                                            </p>
                                                            <p className="text-lg font-black">
                                                                {
                                                                    p.cantidad_bordo
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center text-muted-foreground">
                                            No hay productos registrados en esta
                                            carga.
                                        </div>
                                    )}
                                </div>

                                {cargaSeleccionada.notas && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-bold text-foreground">
                                            Notas Adicionales
                                        </h4>
                                        <p className="rounded-lg bg-muted/30 p-3 text-sm">
                                            {cargaSeleccionada.notas}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
        </>
    );
}
