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
    MoreHorizontal
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { BulkActions } from '@/components/shared/BulkActions';
import Pagination from '@/components/ui/Pagination';
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
    filters,
}: {
    productos: { data: Producto[]; links: any[]; from?: number; to?: number; total?: number; meta?: any };
    categorias: Categoria[];
    filters: {
        search?: string;
        categoria_id?: string;
        stock_bajo?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Producto | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoriaFilter, setCategoriaFilter] = useState(filters.categoria_id || 'all');
    const [stockBajoFilter, setStockBajoFilter] = useState(filters.stock_bajo === '1');

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
                tipo_medida: ((producto as any).tipo_medida as 'unidad' | 'kilo' | 'litro') || 'unidad',
                cantidad_medida: Number((producto as any).cantidad_medida) || 0,
                tipo_envase: (producto as any).tipo_envase || '',
                imagen: null,
                imagen2: null,
                imagen3: null,
                imagen4: null,
                imagen5: null,
                video: null,
                mostrar_en_perfil: (producto as any).mostrar_en_perfil ?? true,
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
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Catálogo</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Administración de productos, precios y niveles de inventario maestro
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <BulkActions 
                            baseUrl="/productos"
                            filters={{ 
                                search: searchTerm, 
                                categoria_id: categoriaFilter, 
                                stock_bajo: stockBajoFilter ? '1' : '' 
                            }}
                            modelName="Productos"
                        />
                        
                        <Button onClick={handleNew} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <CardTitle>Productos Registrados</CardTitle>
                                </div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {productos.total} SKUs
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/20 border-b border-muted/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, SKU o descripción..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 pl-10 border-none bg-background/50 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                                        <SelectTrigger className="h-10 w-[200px] border-none bg-background/50">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {categorias.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant={stockBajoFilter ? 'destructive' : 'outline'}
                                        className={`h-10 px-4 gap-2 border-none shadow-sm ${stockBajoFilter ? 'bg-destructive text-destructive-foreground' : 'bg-background/50 text-muted-foreground'}`}
                                        onClick={() => setStockBajoFilter(!stockBajoFilter)}
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="hidden sm:inline">Stock Bajo</span>
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-none bg-background/50" onClick={limpiarFiltros}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">SKU / Producto</th>
                                            <th className="px-6 py-4 text-left">Categoría</th>
                                            <th className="px-6 py-4 text-right">Precio Venta</th>
                                            <th className="px-6 py-4 text-center">Stock Actual</th>
                                            <th className="px-6 py-4 text-left">Estado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {productos.data.map((p) => (
                                            <tr key={p.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted border border-muted-foreground/10 shadow-sm">
                                                            {p.imagen ? (
                                                                <img src={`/storage/${p.imagen}`} className="h-full w-full object-cover" alt={p.nombre} />
                                                            ) : (
                                                                <ImageIcon className="h-full w-full p-2 text-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm tracking-tight">{p.nombre}</div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground leading-none">
                                                                <ArrowDownZA className="h-2.5 w-2.5" />
                                                                {p.codigo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                                                        {p.categoria?.nombre || 'General'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-black text-foreground">
                                                    {formatCurrencyCLP(p.precio_venta)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center gap-1 text-sm font-black ${p.inventario && p.inventario.cantidad <= p.inventario.cantidad_minima ? 'text-red-500' : 'text-green-600'}`}>
                                                        {p.inventario?.cantidad || 0}
                                                        <span className="text-[10px] text-muted-foreground font-medium lowercase italic">
                                                            / {p.inventario?.cantidad_minima || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.activo ? (
                                                        <Badge className="bg-green-500/10 text-green-600 border-green-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Activo</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-500/10 text-gray-500 border-gray-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Inactivo</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(p)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {productos.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Package className="h-10 w-10 opacity-20" />
                                                        <p className="font-medium">No se encontraron productos coincidentes</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-muted/50">
                                <Pagination links={productos.links} meta={productos.meta || productos} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-5xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <Tag className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Módulo de Catálogo</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Modificar Ficha de Producto' : 'Alta de Nuevo Producto'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-2 overflow-y-auto max-h-[80vh]">
                        <div className="grid gap-8 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Column: Info */}
                                <div className="md:col-span-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Código SKU *</Label>
                                            <Input value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required className="h-11 border-none bg-muted/30 font-black focus-visible:ring-primary/20" />
                                            {errors.codigo && <p className="text-[10px] font-bold text-destructive">{errors.codigo}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Comercial *</Label>
                                            <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required className="h-11 border-none bg-muted/30 font-bold" />
                                            {errors.nombre && <p className="text-[10px] font-bold text-destructive">{errors.nombre}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría Principal</Label>
                                            <Select value={data.categoria_id} onValueChange={(v) => setData('categoria_id', v)}>
                                                <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categorias.map((c) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unidad de Medida</Label>
                                            <Select value={data.unidad_medida} onValueChange={(v: any) => setData('unidad_medida', v)}>
                                                <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unidad">Unidad (UN)</SelectItem>
                                                    <SelectItem value="kg">Kilogramos (KG)</SelectItem>
                                                    <SelectItem value="lt">Litros (LT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción Detallada</Label>
                                        <textarea
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                                            placeholder="Detalles técnicos, características, beneficios..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Costo Adquisición</Label>
                                            <Input type="number" value={data.precio_compra} onChange={(e) => setData('precio_compra', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-background shadow-inner font-black text-lg" />
                                        </div>
                                        <div className="space-y-2 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-green-600">Precio Venta</Label>
                                            <Input type="number" value={data.precio_venta} onChange={(e) => setData('precio_venta', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-background shadow-inner font-black text-lg text-green-600" />
                                        </div>
                                        <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Nivel Alerta Stock</Label>
                                            <Input type="number" value={data.stock_minimo} onChange={(e) => setData('stock_minimo', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-background shadow-inner font-black text-lg text-amber-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media */}
                                <div className="md:col-span-4 space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" /> Multimedia Principal
                                        </Label>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 overflow-hidden group">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => setData('imagen', e.target.files?.[0] || null)} />
                                                {data.imagen || (editando && editando.imagen) ? (
                                                    <img src={data.imagen ? URL.createObjectURL(data.imagen) : `/storage/${editando?.imagen}`} className="h-full w-full object-cover" alt="Preview" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="h-6 w-6 mb-1" />
                                                        <span className="text-[9px] font-black uppercase">Portada</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-square">
                                                {[2, 3, 4, 5].map((i) => {
                                                    const key = `imagen${i}` as keyof typeof data;
                                                    const img = (data as any)[key] || (editando && (editando as any)[key]);
                                                    return (
                                                        <div key={i} className="relative rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10 overflow-hidden group">
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => setData(key as any, e.target.files?.[0] || null)} />
                                                            {img ? (
                                                                <img src={(data as any)[key] ? URL.createObjectURL((data as any)[key]) : `/storage/${(editando as any)[key]}`} className="h-full w-full object-cover" alt="Preview" />
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
                                        
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-primary" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Video Demo</span>
                                                </div>
                                                {editando?.video && <Badge className="text-[8px] bg-primary/20 text-primary">Preexistente</Badge>}
                                            </div>
                                            <Input type="file" accept="video/*" onChange={(e) => setData('video', e.target.files?.[0] || null)} className="h-8 p-0 border-none bg-transparent text-[10px]" />
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between px-2">
                                                <Label className="text-[10px] font-bold uppercase">Estado de Visibilidad</Label>
                                                <Select value={data.activo ? '1' : '0'} onValueChange={(v) => setData('activo', v === '1')}>
                                                    <SelectTrigger className="h-7 w-24 border-none bg-muted/50 rounded-full text-[10px] font-black uppercase">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Activo</SelectItem>
                                                        <SelectItem value="0">Inactivo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center justify-between px-2">
                                                <Label className="text-[10px] font-bold uppercase">Mostrar en Landing</Label>
                                                <Select value={data.mostrar_en_perfil ? '1' : '0'} onValueChange={(v) => setData('mostrar_en_perfil', v === '1')}>
                                                    <SelectTrigger className="h-7 w-24 border-none bg-muted/50 rounded-full text-[10px] font-black uppercase">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Sí</SelectItem>
                                                        <SelectItem value="0">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 border-t pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-10 font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> {editando ? 'Actualizar Ficha' : 'Guardar Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
