import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    Package,
    Warehouse,
    Tag,
    AlertTriangle,
    Eye,
    Image as ImageIcon,
    Video,
    History,
    Edit3,
    ArrowDownZA,
    Info,
    MoreHorizontal,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { BulkActions } from '@/components/shared/BulkActions';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
}
interface Inventario {
    id: number;
    cantidad: number;
    cantidad_minima: number;
}
interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    categoria_id: number | null;
    precio_compra: number;
    precio_venta: number;
    stock_minimo: number;
    unidad_medida: 'unidad' | 'kg' | 'lt';
    activo: boolean;
    imagen: string | null;
    imagen2: string | null;
    imagen3: string | null;
    imagen4: string | null;
    imagen5: string | null;
    video: string | null;
    categoria?: Categoria;
    inventario?: Inventario;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/productos' },
];

export default function Index({
    productos,
    categorias,
    almacenes = [],
    filters,
}: {
    productos: {
        data: Producto[];
        links: any[];
        from?: number;
        to?: number;
        total?: number;
        meta?: any;
    };
    categorias: Categoria[];
    almacenes: { id: number; nombre: string }[];
    filters: {
        search?: string;
        categoria_id?: string;
        stock_bajo?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Producto | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoriaFilter, setCategoriaFilter] = useState(
        filters.categoria_id || 'all',
    );
    const [stockBajoFilter, setStockBajoFilter] = useState(
        filters.stock_bajo === '1',
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
        transform,
    } = useForm({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria_id: '' as string,
        precio_compra: 0,
        precio_venta: 0,
        stock_minimo: 0,
        stock: 0,
        almacen_id: '',
        unidad_medida: 'unidad' as 'unidad' | 'kg' | 'lt',
        activo: true,
        envase_retornable: false,
        medida_pesable: false,
        tipo_medida: 'unidad' as 'unidad' | 'kilo' | 'litro',
        cantidad_medida: 0,
        tipo_envase: '',
        imagen: null as File | null,
        imagen2: null as File | null,
        imagen3: null as File | null,
        imagen4: null as File | null,
        imagen5: null as File | null,
        video: null as File | null,
        mostrar_en_perfil: true,
        contenido_por_unidad: 1,
        peso_base: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (categoriaFilter !== 'all') query.categoria_id = categoriaFilter;
            if (stockBajoFilter) query.stock_bajo = '1';

            router.get('/productos', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, categoriaFilter, stockBajoFilter]);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setCategoriaFilter('all');
        setStockBajoFilter(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editando) {
            // Put request with _method=PUT because of FormData limitation with files in PUT
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null) {
                    if (typeof value === 'boolean') {
                        formData.append(key, value ? '1' : '0');
                    } else {
                        formData.append(key, value as string | Blob);
                    }
                }
            });
            router.post(`/productos/${editando.id}?_method=PUT`, formData, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/productos', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (producto: Producto) => {
        setEditando(producto);
        setData({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            categoria_id: producto.categoria_id?.toString() || '',
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta,
            stock_minimo: producto.stock_minimo,
            stock: producto.inventario?.cantidad || 0,
            almacen_id: '',
            unidad_medida: producto.unidad_medida || 'unidad',
            activo: producto.activo,
            envase_retornable: Boolean((producto as any).envase_retornable),
            medida_pesable: Boolean((producto as any).medida_pesable),
            tipo_medida:
                ((producto as any).tipo_medida as
                    | 'unidad'
                    | 'kilo'
                    | 'litro') || 'unidad',
            cantidad_medida: Number((producto as any).cantidad_medida) || 0,
            tipo_envase: (producto as any).tipo_envase || '',
            imagen: null,
            imagen2: null,
            imagen3: null,
            imagen4: null,
            imagen5: null,
            video: null,
            mostrar_en_perfil: (producto as any).mostrar_en_perfil ?? true,
            contenido_por_unidad: Number((producto as any).contenido_por_unidad) || 1,
            peso_base: Number((producto as any).peso_base) || 0,
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        setEditando(null);
        reset();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            destroy(`/productos/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Productos e Inventario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Catálogo
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Administración de productos, precios y niveles de
                            inventario maestro
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <BulkActions
                            baseUrl="/productos"
                            filters={{
                                search: searchTerm,
                                categoria_id: categoriaFilter,
                                stock_bajo: stockBajoFilter ? '1' : '',
                            }}
                            modelName="Productos"
                        />

                        <Button
                            onClick={handleNew}
                            className="h-9 rounded-full bg-primary px-5 font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="overflow-hidden border-none shadow-xl shadow-foreground/5">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <CardTitle>Productos Registrados</CardTitle>
                                </div>
                                <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    {productos.total} SKUs
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col gap-4 border-b border-muted/30 bg-muted/20 p-4 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, SKU o descripción..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="h-10 border-none bg-background/50 pl-10 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        value={categoriaFilter}
                                        onValueChange={setCategoriaFilter}
                                    >
                                        <SelectTrigger className="h-10 w-[200px] border-none bg-background/50">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Todas las categorías
                                            </SelectItem>
                                            {categorias.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant={
                                            stockBajoFilter
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className={`h-10 gap-2 border-none px-4 shadow-sm ${stockBajoFilter ? 'bg-destructive text-destructive-foreground' : 'bg-background/50 text-muted-foreground'}`}
                                        onClick={() =>
                                            setStockBajoFilter(!stockBajoFilter)
                                        }
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Stock Bajo
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 border-none bg-background/50"
                                        onClick={limpiarFiltros}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                            <th className="px-6 py-4 text-left">
                                                SKU / Producto
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                Categoría
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Precio Venta
                                            </th>
                                            <th className="px-6 py-4 text-center">
                                                Stock Actual
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                Estado
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {productos.data.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-muted-foreground/10 bg-muted shadow-sm">
                                                            {p.imagen ? (
                                                                <img
                                                                    src={`/storage/${p.imagen}`}
                                                                    className="h-full w-full object-cover"
                                                                    alt={
                                                                        p.nombre
                                                                    }
                                                                />
                                                            ) : (
                                                                <ImageIcon className="h-full w-full p-2 text-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold tracking-tight">
                                                                {p.nombre}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-mono text-[10px] leading-none text-muted-foreground">
                                                                <ArrowDownZA className="h-2.5 w-2.5" />
                                                                {p.codigo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-primary/20 bg-primary/5 text-[10px] font-bold text-primary"
                                                    >
                                                        {p.categoria?.nombre ||
                                                            'General'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-black text-foreground">
                                                    {formatCurrencyCLP(
                                                        p.precio_venta,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div
                                                        className={`inline-flex items-center gap-1 text-sm font-black ${p.inventario && p.inventario.cantidad <= p.inventario.cantidad_minima ? 'text-red-500' : 'text-green-600'}`}
                                                    >
                                                        {p.inventario
                                                            ?.cantidad || 0}
                                                        <span className="text-[10px] font-medium text-muted-foreground lowercase italic">
                                                            /{' '}
                                                            {p.inventario
                                                                ?.cantidad_minima ||
                                                                0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.activo ? (
                                                        <Badge className="rounded-full border border-green-200 bg-green-500/10 px-2 py-0.5 text-[10px] font-black text-green-600 uppercase">
                                                            Activo
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="rounded-full border border-gray-200 bg-gray-500/10 px-2 py-0.5 text-[10px] font-black text-gray-500 uppercase">
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:bg-primary/10"
                                                            onClick={() =>
                                                                handleEdit(p)
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
                                        {productos.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-20 text-center"
                                                >
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Package className="h-10 w-10 opacity-20" />
                                                        <p className="font-medium">
                                                            No se encontraron
                                                            productos
                                                            coincidentes
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-muted/50 p-4">
                                <Pagination
                                    links={productos.links}
                                    meta={productos.meta || productos}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden border-none p-0 shadow-2xl md:max-w-5xl">
                    <DialogHeader className="shrink-0 bg-gradient-to-r from-primary/10 to-transparent p-6 pb-4 text-left">
                        <div className="mb-1 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black tracking-widest text-primary/70 uppercase">
                                Módulo de Catálogo
                            </span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando
                                ? 'Modificar Ficha de Producto'
                                : 'Alta de Nuevo Producto'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="grid gap-8 py-4">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                    {/* Left Column: Info */}
                                    <div className="space-y-6 md:col-span-8">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Código SKU *
                                                </Label>
                                                <Input
                                                    value={data.codigo}
                                                    onChange={(e) =>
                                                        setData(
                                                            'codigo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="h-11 border-none bg-muted/30 font-black focus-visible:ring-primary/20"
                                                />
                                                {errors.codigo && (
                                                    <p className="text-[10px] font-bold text-destructive">
                                                        {errors.codigo}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Nombre Comercial *
                                                </Label>
                                                <Input
                                                    value={data.nombre}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nombre',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="h-11 border-none bg-muted/30 font-bold"
                                                />
                                                {errors.nombre && (
                                                    <p className="text-[10px] font-bold text-destructive">
                                                        {errors.nombre}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Categoría Principal
                                                </Label>
                                                <Select
                                                    value={data.categoria_id}
                                                    onValueChange={(v) =>
                                                        setData('categoria_id', v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categorias.map((c) => (
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
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Almacén Principal
                                                </Label>
                                                <Select
                                                    value={data.almacen_id}
                                                    onValueChange={(v) =>
                                                        setData('almacen_id', v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                                        <SelectValue placeholder="Seleccione Almacén..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {almacenes.map((a) => (
                                                            <SelectItem
                                                                key={a.id}
                                                                value={a.id.toString()}
                                                            >
                                                                {a.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4 rounded-xl border border-blue-500/10 bg-blue-50 p-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                                                        Unidad de Medida *
                                                    </Label>
                                                    <Select
                                                        value={data.unidad_medida}
                                                        onValueChange={(v: any) => setData('unidad_medida', v)}
                                                    >
                                                        <SelectTrigger className="h-11 border-none bg-background font-bold">
                                                            <SelectValue placeholder="Seleccione..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unidad">Unidad (Pza / Cilindro)</SelectItem>
                                                            <SelectItem value="kg">Kilogramo (KG)</SelectItem>
                                                            <SelectItem value="lt">Litro (LT)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between pt-6">
                                                    <div>
                                                        <Label className="text-xs font-bold text-blue-600 uppercase">
                                                            ¿Es pesable / métrico?
                                                        </Label>
                                                    </div>
                                                    <Switch
                                                        checked={data.medida_pesable || data.unidad_medida !== 'unidad'}
                                                        onCheckedChange={(v) => setData('medida_pesable', v)}
                                                        disabled={data.unidad_medida !== 'unidad'}
                                                    />
                                                </div>
                                            </div>

                                            {(data.unidad_medida !== 'unidad' || data.medida_pesable) && (
                                                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-blue-600">
                                                            ¿Cuántos kilos/litros contiene cada unidad?
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={data.contenido_por_unidad}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'contenido_por_unidad',
                                                                    parseFloat(e.target.value) || 0,
                                                                )
                                                            }
                                                            className="h-10 border-none bg-background font-black"
                                                            placeholder="Ej: 15"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-blue-600">
                                                            Peso Base / Envase (Tara)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={data.peso_base}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'peso_base',
                                                                    parseFloat(e.target.value) || 0,
                                                                )
                                                            }
                                                            className="h-10 border-none bg-background font-black"
                                                            placeholder="Ej: 0.5"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Descripción Detallada
                                            </Label>
                                            <textarea
                                                value={data.descripcion}
                                                onChange={(e) =>
                                                    setData(
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                placeholder="Detalles técnicos, características, beneficios..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2 rounded-2xl border border-primary/10 bg-primary/5 p-4 transition-all hover:bg-primary/10">
                                                <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-primary uppercase">
                                                    <ArrowDownZA className="h-3 w-3" />{' '}
                                                    Costo Adq.
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={data.precio_compra}
                                                    onChange={(e) =>
                                                        setData(
                                                            'precio_compra',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-10 border-none bg-background text-lg font-black shadow-inner focus-visible:ring-primary/20"
                                                />
                                            </div>
                                            <div className="space-y-2 rounded-2xl border border-green-500/10 bg-green-500/5 p-4 transition-all hover:bg-green-500/10">
                                                <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-green-600 uppercase">
                                                    <Tag className="h-3 w-3" />{' '}
                                                    Precio Venta
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={data.precio_venta}
                                                    onChange={(e) =>
                                                        setData(
                                                            'precio_venta',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-10 border-none bg-background text-lg font-black text-green-600 shadow-inner focus-visible:ring-green-500/20"
                                                />
                                            </div>
                                            <div className="space-y-2 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10">
                                                <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-amber-600 uppercase">
                                                    <AlertTriangle className="h-3 w-3" />{' '}
                                                    Stock Mín.
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={data.stock_minimo}
                                                    onChange={(e) =>
                                                        setData(
                                                            'stock_minimo',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-10 border-none bg-background text-lg font-black text-amber-600 shadow-inner focus-visible:ring-amber-500/20"
                                                />
                                            </div>
                                            <div className="space-y-2 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 transition-all hover:bg-blue-500/10">
                                                <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-600 uppercase">
                                                    <Package className="h-3 w-3" />{' '}
                                                    Stock Inicial
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={data.stock}
                                                    onChange={(e) =>
                                                        setData(
                                                            'stock',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-10 border-none bg-background text-lg font-black text-blue-600 shadow-inner focus-visible:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Media */}
                                    <div className="space-y-6 md:col-span-4">
                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-2 text-xs font-black tracking-wider text-muted-foreground uppercase">
                                                <ImageIcon className="h-4 w-4" />{' '}
                                                Multimedia Principal
                                            </Label>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10">
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            setData(
                                                                'imagen',
                                                                e.target
                                                                    .files?.[0] ||
                                                                    null,
                                                            )
                                                        }
                                                    />
                                                    {data.imagen ||
                                                    (editando &&
                                                        editando.imagen) ? (
                                                        <img
                                                            src={
                                                                data.imagen
                                                                    ? URL.createObjectURL(
                                                                          data.imagen,
                                                                      )
                                                                    : `/storage/${editando?.imagen}`
                                                            }
                                                            className="h-full w-full object-cover"
                                                            alt="Preview"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full flex-col items-center justify-center opacity-40 transition-opacity group-hover:opacity-100">
                                                            <Plus className="mb-1 h-6 w-6" />
                                                            <span className="text-[9px] font-black uppercase">
                                                                Portada
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2">
                                                    {[2, 3, 4, 5].map((i) => {
                                                        const key =
                                                            `imagen${i}` as keyof typeof data;
                                                        const img =
                                                            (data as any)[
                                                                key
                                                            ] ||
                                                            (editando &&
                                                                (
                                                                    editando as any
                                                                )[key]);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className="group relative overflow-hidden rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10"
                                                            >
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                                                    accept="image/*"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            key as any,
                                                                            e
                                                                                .target
                                                                                .files?.[0] ||
                                                                                null,
                                                                        )
                                                                    }
                                                                />
                                                                {img ? (
                                                                    <img
                                                                        src={
                                                                            (
                                                                                data as any
                                                                            )[
                                                                                key
                                                                            ]
                                                                                ? URL.createObjectURL(
                                                                                      (
                                                                                          data as any
                                                                                      )[
                                                                                          key
                                                                                      ],
                                                                                  )
                                                                                : `/storage/${(editando as any)[key]}`
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        alt="Preview"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center opacity-30 group-hover:opacity-100">
                                                                        <Plus className="h-4 w-4" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-4 rounded-2xl border border-muted-foreground/5 bg-muted/30 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Video className="h-4 w-4 text-primary" />
                                                        <span className="text-[10px] font-bold tracking-wide uppercase">
                                                            Video Demo
                                                        </span>
                                                    </div>
                                                    {editando?.video && (
                                                        <Badge className="bg-primary/20 text-[8px] text-primary">
                                                            Preexistente
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) =>
                                                        setData(
                                                            'video',
                                                            e.target
                                                                .files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                    className="h-8 border-none bg-transparent p-0 text-[10px]"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between px-2">
                                                    <Label className="text-[10px] font-bold uppercase">
                                                        Estado de Visibilidad
                                                    </Label>
                                                    <Select
                                                        value={
                                                            data.activo
                                                                ? '1'
                                                                : '0'
                                                        }
                                                        onValueChange={(v) =>
                                                            setData(
                                                                'activo',
                                                                v === '1',
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-7 w-24 rounded-full border-none bg-muted/50 text-[10px] font-black uppercase">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">
                                                                Activo
                                                            </SelectItem>
                                                            <SelectItem value="0">
                                                                Inactivo
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center justify-between px-2">
                                                    <Label className="text-[10px] font-bold uppercase">
                                                        Mostrar en Landing
                                                    </Label>
                                                    <Select
                                                        value={
                                                            data.mostrar_en_perfil
                                                                ? '1'
                                                                : '0'
                                                        }
                                                        onValueChange={(v) =>
                                                            setData(
                                                                'mostrar_en_perfil',
                                                                v === '1',
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-7 w-24 rounded-full border-none bg-muted/50 text-[10px] font-black uppercase">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">
                                                                Sí
                                                            </SelectItem>
                                                            <SelectItem value="0">
                                                                No
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="shrink-0 gap-2 border-t bg-muted/10 p-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-full bg-primary px-10 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
                            >
                                <Check className="mr-2 h-4 w-4" />{' '}
                                {editando
                                    ? 'Actualizar Ficha'
                                    : 'Guardar Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
