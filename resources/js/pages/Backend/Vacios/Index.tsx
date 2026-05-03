import { Head, useForm, router } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    RotateCcw,
    Package,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    tipo_envase: string | null;
}

interface Vacio {
    id: number;
    producto_id: number;
    cantidad: number;
    cantidad_minima: number;
    estado: string;
    ubicacion: string | null;
    observaciones: string | null;
    producto?: Producto;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vacíos', href: '/vacios' },
];

const estados = ['disponible', 'entregado', 'retornado', 'perdido'];

const estadoConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
> = {
    disponible: {
        label: 'Disponible',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
    },
    entregado: {
        label: 'Entregado',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    retornado: {
        label: 'Retornado',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    perdido: { label: 'Perdido', color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function Index({
    vacios,
    productos,
    filters,
}: {
    vacios: Vacio[];
    productos: Producto[];
    filters: {
        search?: string;
        estado?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Vacio | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);
    const importExcelRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/vacios',
                {
                    search: searchTerm,
                    estado: estadoFilter,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, estadoFilter]);

    const handleExport = (type: 'csv' | 'excel') => {
        const baseUrl = type === 'csv' ? '/vacios/export' : '/vacios/export-excel';
        const params = new URLSearchParams({
            search: searchTerm,
            estado: estadoFilter,
        });
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, isExcel = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        router.post(isExcel ? '/vacios/import-excel' : '/vacios/import', formData, {
            onSuccess: () => {
                if (importFileRef.current) importFileRef.current.value = '';
                if (importExcelRef.current) importExcelRef.current.value = '';
            },
        });
    };

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        producto_id: '' as string,
        cantidad: 0,
        cantidad_minima: 5,
        estado: 'disponible',
        ubicacion: '',
        observaciones: '',
    });

    const limpiarFiltros = () => {
        setSearchTerm('');
        setEstadoFilter('');
    };

    const getTotalVacios = () => vacios.reduce((sum, v) => sum + v.cantidad, 0);
    const getVaciosDisponibles = () =>
        vacios
            .filter((v) => v.estado === 'disponible')
            .reduce((sum, v) => sum + v.cantidad, 0);
    const getVaciosEntregados = () =>
        vacios
            .filter((v) => v.estado === 'entregado')
            .reduce((sum, v) => sum + v.cantidad, 0);
    const getVaciosPerdidos = () =>
        vacios
            .filter((v) => v.estado === 'perdido')
            .reduce((sum, v) => sum + v.cantidad, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/vacios/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/vacios', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (vacio: Vacio) => {
        setEditando(vacio);
        setData({
            producto_id: vacio.producto_id.toString(),
            cantidad: vacio.cantidad,
            cantidad_minima: vacio.cantidad_minima,
            estado: vacio.estado,
            ubicacion: vacio.ubicacion || '',
            observaciones: vacio.observaciones || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro de vacío?'))
            destroy(`/vacios/${id}`);
    };

    const handleRetornar = (vacio: Vacio) => {
        const cantidad = prompt('¿Cuántos envases va a retornar?', '1');
        if (cantidad && Number(cantidad) > 0) {
            router.patch(`/vacios/${vacio.id}/retornar`, {
                cantidad: Number(cantidad),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vacíos - Envases Retornables" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vacíos</h1>
                        <p className="text-muted-foreground">
                            Control de envases retornables
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="file"
                            ref={importFileRef}
                            className="hidden"
                            accept=".csv,.txt"
                            onChange={(e) => handleImport(e)}
                        />
                        <input
                            type="file"
                            ref={importExcelRef}
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={(e) => handleImport(e, true)}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => importFileRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Importar CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => importExcelRef.current?.click()}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Importar Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('csv')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('excel')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Exportar Excel
                        </Button>
                        <Button
                            onClick={() => {
                                setEditando(null);
                                reset();
                                setIsOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Registro
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Vacíos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Package className="h-5 w-5 text-gray-500" />
                                {getTotalVacios()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {getVaciosDisponibles()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Entregados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {getVaciosEntregados()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Perdidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {getVaciosPerdidos()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Control de Vacíos</CardTitle>
                        <CardDescription>
                            {vacios.length} registros encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por producto o ubicación..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <select
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                                className="flex h-9 rounded-md border bg-background px-3 py-1 text-sm"
                            >
                                <option value="">Todos los estados</option>
                                {estados.map((e) => (
                                    <option key={e} value={e}>
                                        {estadoConfig[e].label}
                                    </option>
                                ))}
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={limpiarFiltros}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Limpiar
                            </Button>
                        </div>

                        {vacios.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No hay registros de vacíos
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-2 py-2 text-left font-medium">
                                                Producto
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Tipo
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Cantidad
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Mín
                                            </th>
                                            <th className="px-2 py-2 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Ubicación
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vacios.map((v) => (
                                            <tr key={v.id} className="border-b">
                                                <td className="px-2 py-2 font-medium">
                                                    {v.producto?.nombre}
                                                </td>
                                                <td className="px-2 py-2 text-muted-foreground">
                                                    {v.producto?.tipo_envase ||
                                                        '-'}
                                                </td>
                                                <td className="px-2 py-2 text-right font-bold">
                                                    {v.cantidad}
                                                </td>
                                                <td className="px-2 py-2 text-right text-muted-foreground">
                                                    {v.cantidad_minima}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span
                                                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${estadoConfig[v.estado]?.bgColor} ${estadoConfig[v.estado]?.color}`}
                                                    >
                                                        {
                                                            estadoConfig[
                                                                v.estado
                                                            ]?.label
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-muted-foreground">
                                                    {v.ubicacion || '-'}
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                    {v.estado ===
                                                        'entregado' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Registrar retorno"
                                                            onClick={() =>
                                                                handleRetornar(
                                                                    v,
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            handleEdit(v)
                                                        }
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                                        onClick={() =>
                                                            handleDelete(v.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar Vacío' : 'Nuevo Vacío'}
                        </DialogTitle>
                        <DialogDescription>
                            {editando
                                ? 'Modifique los datos del vacío'
                                : 'Ingrese los datos del vacío'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            {!editando && (
                                <div className="grid gap-2">
                                    <Label>Producto</Label>
                                    <Select
                                        value={data.producto_id}
                                        onValueChange={(v) =>
                                            setData('producto_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productos.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id.toString()}
                                                >
                                                    {p.nombre} ({p.codigo})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        value={data.cantidad}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Stock Mínimo</Label>
                                    <Input
                                        type="number"
                                        value={data.cantidad_minima}
                                        onChange={(e) =>
                                            setData(
                                                'cantidad_minima',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Estado</Label>
                                <Select
                                    value={data.estado}
                                    onValueChange={(v) => setData('estado', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estados.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {estadoConfig[e].label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Ubicación</Label>
                                <Input
                                    value={data.ubicacion}
                                    onChange={(e) =>
                                        setData('ubicacion', e.target.value)
                                    }
                                    placeholder="Ej: Bodega A"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Observaciones</Label>
                                <Input
                                    value={data.observaciones}
                                    onChange={(e) =>
                                        setData('observaciones', e.target.value)
                                    }
                                    placeholder="Notas adicionales"
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
                            <Button type="submit">
                                <Check className="mr-2 h-4 w-4" />
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
