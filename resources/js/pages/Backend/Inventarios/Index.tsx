import { Head, useForm, router } from '@inertiajs/react';
import { 
    Check, 
    Pencil, 
    Plus, 
    Trash2, 
    Search, 
    X, 
    AlertTriangle, 
    Download, 
    Upload, 
    FileSpreadsheet, 
    FileText,
    Boxes,
    Package,
    Warehouse,
    MapPin,
    ArrowDownZA,
    History,
    Edit3
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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

interface Producto {
    id: number;
    codigo: string;
    nombre: string;
}
interface Almacen {
    id: number;
    nombre: string;
}
interface Inventario {
    id: number;
    producto_id: number;
    almacen_id: number;
    cantidad: number;
    cantidad_minima: number;
    ubicacion: string | null;
    producto?: Producto;
    almacen?: Almacen;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventarios' },
];

export default function Index({
    inventarios,
    productos,
    almacenes,
    filters,
}: {
    inventarios: {
        data: Inventario[];
        links: any[];
        meta?: any;
        total: number;
    };
    productos: Producto[];
    almacenes: Almacen[];
    filters: {
        search?: string;
        stock_bajo?: string;
        almacen_id?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Inventario | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [almacenFilter, setAlmacenFilter] = useState(filters.almacen_id || 'all');
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
        producto_id: '' as string,
        almacen_id: '' as string,
        cantidad: 0,
        cantidad_minima: 0,
        ubicacion: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (almacenFilter !== 'all') query.almacen_id = almacenFilter;
            if (stockBajoFilter) query.stock_bajo = '1';

            router.get('/inventarios', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, almacenFilter, stockBajoFilter]);

    const handleExport = (type: 'csv' | 'excel') => {
        const baseUrl = type === 'csv' ? '/inventarios/export' : '/inventarios/export-excel';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (almacenFilter !== 'all') params.append('almacen_id', almacenFilter);
        if (stockBajoFilter) params.append('stock_bajo', '1');
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'excel') => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            router.post(type === 'csv' ? '/inventarios/import' : '/inventarios/import-excel', formData, {
                onSuccess: () => {
                    if (csvInputRef.current) csvInputRef.current.value = '';
                    if (excelInputRef.current) excelInputRef.current.value = '';
                },
            });
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setAlmacenFilter('all');
        setStockBajoFilter(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        transform((d) => ({
            ...d,
            producto_id: Number(d.producto_id),
            almacen_id: Number(d.almacen_id),
            cantidad: Number(d.cantidad),
            cantidad_minima: Number(d.cantidad_minima),
        }));

        if (editando) {
            put(`/inventarios/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/inventarios', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (inv: Inventario) => {
        setEditando(inv);
        setData({
            producto_id: inv.producto_id.toString(),
            almacen_id: inv.almacen_id.toString(),
            cantidad: inv.cantidad,
            cantidad_minima: inv.cantidad_minima,
            ubicacion: inv.ubicacion || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        setEditando(null);
        reset();
        setData({
            producto_id: '',
            almacen_id: '',
            cantidad: 0,
            cantidad_minima: 0,
            ubicacion: '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro de inventario?')) {
            destroy(`/inventarios/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control de Stock e Inventario" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Inventario</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Control centralizado de existencias, bodegaje y alertas de stock bajo
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={(e) => handleImport(e, 'csv')} />
                        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => handleImport(e, 'excel')} />
                        
                        <div className="flex gap-1 mr-2">
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => csvInputRef.current?.click()}>
                                <Upload className="h-4 w-4" />
                                <span className="hidden lg:inline">Importar</span> CSV
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => excelInputRef.current?.click()}>
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden lg:inline">Importar</span> Excel
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => handleExport('csv')}>
                                <Download className="h-4 w-4" />
                                <span className="hidden lg:inline">Exportar</span> CSV
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2" onClick={() => handleExport('excel')}>
                                <FileText className="h-4 w-4" />
                                <span className="hidden lg:inline">Exportar</span> Excel
                            </Button>
                        </div>
                        
                        <Button onClick={handleNew} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Stock
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Boxes className="h-5 w-5 text-primary" />
                                    <CardTitle>Listado de Existencias</CardTitle>
                                </div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {inventarios.total} SKUs
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/20 border-b border-muted/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por producto, código o ubicación..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 pl-10 border-none bg-background/50 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={almacenFilter} onValueChange={setAlmacenFilter}>
                                        <SelectTrigger className="h-10 w-[200px] border-none bg-background/50">
                                            <SelectValue placeholder="Almacén / Bodega" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las bodegas</SelectItem>
                                            {almacenes.map((a) => (
                                                <SelectItem key={a.id} value={a.id.toString()}>{a.nombre}</SelectItem>
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
                                            <th className="px-6 py-4 text-left">Ubicación Logística</th>
                                            <th className="px-6 py-4 text-center">Cant. Actual</th>
                                            <th className="px-6 py-4 text-center">Nivel Crítico</th>
                                            <th className="px-6 py-4 text-left">Estado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {inventarios.data.map((inv) => (
                                            <tr key={inv.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm tracking-tight">{inv.producto?.nombre}</div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground leading-none">
                                                                <ArrowDownZA className="h-2.5 w-2.5" />
                                                                {inv.producto?.codigo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                            <Warehouse className="h-3 w-3 text-primary" />
                                                            {inv.almacen?.nombre || 'General'}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <MapPin className="h-2.5 w-2.5" />
                                                            {inv.ubicacion || 'Sin asignar'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex h-9 min-w-[70px] items-center justify-center rounded-xl font-mono text-lg font-black shadow-sm ${inv.cantidad <= inv.cantidad_minima ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                                                        {inv.cantidad}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                                        <AlertTriangle className={`h-3 w-3 ${inv.cantidad <= inv.cantidad_minima ? 'text-red-500' : 'text-muted-foreground/30'}`} />
                                                        {inv.cantidad_minima}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {inv.cantidad <= inv.cantidad_minima ? (
                                                        <Badge className="bg-red-500/10 text-red-600 border-red-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Abastecimiento Necesario</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-500/10 text-green-600 border-green-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Stock Óptimo</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(inv)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(inv.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {inventarios.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Boxes className="h-10 w-10 opacity-20" />
                                                        <p className="font-medium">No hay existencias registradas</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-muted/50">
                                <Pagination links={inventarios.links} meta={inventarios.meta || inventarios} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <History className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Módulo de Logística</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Actualizar Ficha de Stock' : 'Alta de Registro de Inventario'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-2">
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Producto / Artículo SKUs *</Label>
                                <Select value={data.producto_id} onValueChange={(v) => setData('producto_id', v)}>
                                    <SelectTrigger className="h-11 border-none bg-muted/30 font-bold focus-visible:ring-primary/20">
                                        <SelectValue placeholder="Seleccione el producto para inventariar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productos.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.nombre} ({p.codigo})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.producto_id && <p className="text-[10px] font-bold text-destructive">{errors.producto_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Cantidad Actual</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            value={data.cantidad}
                                            onChange={(e) => setData('cantidad', parseInt(e.target.value) || 0)}
                                            className="h-12 border-none bg-background shadow-inner font-black text-2xl text-primary text-center"
                                            required
                                        />
                                        <Edit3 className="h-5 w-5 text-primary/40" />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic leading-tight">Stock físico disponible en el almacén</p>
                                </div>
                                <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Nivel Crítico (Mínimo)</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            value={data.cantidad_minima}
                                            onChange={(e) => setData('cantidad_minima', parseInt(e.target.value) || 0)}
                                            className="h-12 border-none bg-background shadow-inner font-black text-2xl text-amber-600 text-center"
                                            required
                                        />
                                        <AlertTriangle className="h-5 w-5 text-amber-500/40" />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic leading-tight">Gatilla alertas de reabastecimiento</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Almacén / Bodega Principal *</Label>
                                    <Select value={data.almacen_id} onValueChange={(v) => setData('almacen_id', v)}>
                                        <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                                            <SelectValue placeholder="Destino logístico..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {almacenes.map((a) => (
                                                <SelectItem key={a.id} value={a.id.toString()}>{a.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.almacen_id && <p className="text-[10px] font-bold text-destructive">{errors.almacen_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubicación Detallada</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={data.ubicacion}
                                            onChange={(e) => setData('ubicacion', e.target.value)}
                                            placeholder="Ej: Pasillo 3, Nivel B, Rack 42"
                                            className="h-11 pl-10 border-none bg-muted/30 font-medium"
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic">Referencia para picking y despacho</p>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 border-t pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-10 font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> {editando ? 'Actualizar Registro' : 'Confirmar Stock'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
