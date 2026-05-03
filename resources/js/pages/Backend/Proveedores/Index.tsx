import { Head, useForm, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    ShieldCheck,
    AlertCircle,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    CheckCircle2,
    LayoutGrid,
    MoreVertical,
    ArrowUpRight,
    Store,
    Tag,
    Globe,
    CreditCard,
    DollarSign,
    Briefcase
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
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
    DialogDescription,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface Categoria {
    id: number;
    nombre: string;
}

interface Proveedor {
    id: number;
    nombre: string;
    nit: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    activo: boolean;
    notas: string | null;
    categoria_id: number | null;
    categoria?: Categoria;
    nombre_empresa: string | null;
    contacto_principal: string | null;
    sitio_web: string | null;
    terminos_pago: string | null;
    tiene_acceso: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventarios', href: '/inventarios' },
    { title: 'Gestión de Proveedores', href: '/proveedors' },
];

export default function Index({
    proveedors,
    categorias,
    filters,
}: {
    proveedors: { data: Proveedor[]; links: any[]; meta: any };
    categorias: Categoria[];
    filters: {
        search?: string;
        categoria_id?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Proveedor | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoriaFilter, setCategoriaFilter] = useState(filters.categoria_id || 'all');
    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
    } = useForm({
        nombre: '',
        nit: '',
        email: '',
        telefono: '',
        direccion: '',
        activo: true,
        notas: '',
        categoria_id: '' as string | number,
        nombre_empresa: '',
        contacto_principal: '',
        sitio_web: '',
        terminos_pago: '',
        crear_usuario: false,
        password: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (categoriaFilter !== 'all') query.categoria_id = categoriaFilter;

            router.get('/proveedors', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, categoriaFilter]);

    const handleExport = (type: 'csv' | 'excel') => {
        const baseUrl = type === 'csv' ? '/proveedors/export' : '/proveedors/export-excel';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (categoriaFilter !== 'all') params.append('categoria_id', categoriaFilter);
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'excel') => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            router.post('/proveedors/import', formData, {
                onSuccess: () => {
                    if (csvInputRef.current) csvInputRef.current.value = '';
                    if (excelInputRef.current) excelInputRef.current.value = '';
                    toast.success('Proveedores importados');
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/proveedors/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                    toast.success('Proveedor actualizado');
                },
            });
        } else {
            post('/proveedors', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Proveedor registrado');
                },
            });
        }
    };

    const handleEdit = (p: Proveedor) => {
        setEditando(p);
        setData({
            nombre: p.nombre,
            nit: p.nit || '',
            email: p.email || '',
            telefono: p.telefono || '',
            direccion: p.direccion || '',
            activo: p.activo,
            notas: p.notas || '',
            categoria_id: p.categoria_id || '',
            nombre_empresa: p.nombre_empresa || '',
            contacto_principal: p.contacto_principal || '',
            sitio_web: p.sitio_web || '',
            terminos_pago: p.terminos_pago || '',
            crear_usuario: p.tiene_acceso,
            password: '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Desea eliminar este proveedor?')) {
            destroy(`/proveedors/${id}`, {
                onSuccess: () => toast.success('Proveedor eliminado'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Proveedores" />
            <Toaster position="bottom-right" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Supply Chain Division</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Proveedores</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Administre su red de suministros y relaciones comerciales
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={(e) => handleImport(e, 'csv')} />
                        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => handleImport(e, 'excel')} />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 px-3 gap-2 rounded-xl">
                                    <Download className="h-4 w-4 text-primary" /> Herramientas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-none shadow-2xl">
                                <DropdownMenuItem onClick={() => csvInputRef.current?.click()} className="rounded-lg py-3">
                                    <Upload className="mr-2 h-4 w-4 text-blue-500" /> Importar Proveedores
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('csv')} className="rounded-lg py-3">
                                    <Download className="mr-2 h-4 w-4 text-green-500" /> Exportar a CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button onClick={() => { setEditando(null); reset(); setIsOpen(true); }} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/40 rounded-3xl border border-muted/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, RUT, o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-12 border-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                                <SelectTrigger className="h-11 w-[200px] border-none bg-background shadow-sm rounded-2xl font-bold">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categorias.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-11 w-11 border-none bg-background shadow-sm rounded-2xl text-muted-foreground" onClick={() => { setSearchTerm(''); setCategoriaFilter('all'); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proveedors.data.map((p) => (
                            <Card key={p.id} className="border-none shadow-xl shadow-foreground/5 rounded-3xl overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-1">
                                            <Badge variant="outline" className={`${p.activo ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'} border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-full`}>
                                                {p.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                            {p.categoria && (
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                                    {p.categoria.nombre}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10" onClick={() => handleEdit(p)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{p.nombre}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 font-bold">
                                        <Tag className="h-3 w-3" /> {p.nit || 'Sin RUT'}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-2xl group/item">
                                            <div className="p-2 bg-background rounded-xl shadow-sm text-primary group-hover/item:scale-110 transition-transform">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <span className="truncate">{p.email || 'No registrado'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-2xl group/item">
                                            <div className="p-2 bg-background rounded-xl shadow-sm text-green-600 group-hover/item:scale-110 transition-transform">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <span>{p.telefono || 'No registrado'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-2xl group/item">
                                            <div className="p-2 bg-background rounded-xl shadow-sm text-orange-600 group-hover/item:scale-110 transition-transform">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <span className="truncate">{p.direccion || 'No registrada'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-muted/50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                                                {p.contacto_principal || 'Sin contacto'}
                                            </span>
                                        </div>
                                        {p.tiene_acceso && (
                                            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 text-[8px] font-black">
                                                <ShieldCheck className="h-2 w-2 mr-1" /> ACCESO PORTAL
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <div className="bg-background border border-muted shadow-sm rounded-3xl p-4">
                        <Pagination links={proveedors.links} meta={proveedors.meta} />
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-4xl border-none shadow-2xl p-0 overflow-hidden rounded-[40px]">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8 pb-4 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Partnership Enrollment</span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-primary">
                            {editando ? 'Actualizar Proveedor' : 'Registrar Nuevo Proveedor'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">Configure los detalles comerciales y fiscales del socio de suministro.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-8 pt-2 overflow-y-auto max-h-[80vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Store className="h-4 w-4" /> Información Comercial
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre Comercial / Razon Social *</Label>
                                        <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required className="h-12 border-none bg-muted/30 font-bold rounded-2xl" placeholder="Ej: Importaciones Globales S.A." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">RUT / NIT *</Label>
                                            <Input value={data.nit} onChange={(e) => setData('nit', e.target.value)} required className="h-12 border-none bg-muted/30 font-bold rounded-2xl" placeholder="12.345.678-9" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Categoría</Label>
                                            <Select value={String(data.categoria_id)} onValueChange={(v) => setData('categoria_id', v)}>
                                                <SelectTrigger className="h-12 border-none bg-muted/30 font-bold rounded-2xl">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categorias.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Email de Contacto</Label>
                                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-12 border-none bg-muted/30 font-bold rounded-2xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Teléfono</Label>
                                            <Input value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} className="h-12 border-none bg-muted/30 font-bold rounded-2xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Dirección</Label>
                                        <Input value={data.direccion} onChange={(e) => setData('direccion', e.target.value)} className="h-12 border-none bg-muted/30 font-bold rounded-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Detalles Operativos
                                </h3>
                                <div className="space-y-4 p-8 rounded-[40px] bg-primary/5 border-2 border-dashed border-primary/20">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Contacto Principal</Label>
                                        <Input value={data.contacto_principal} onChange={(e) => setData('contacto_principal', e.target.value)} className="h-11 border-none bg-background shadow-sm font-bold rounded-xl" placeholder="Nombre de la persona" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Términos de Pago</Label>
                                            <Input value={data.terminos_pago} onChange={(e) => setData('terminos_pago', e.target.value)} className="h-11 border-none bg-background shadow-sm font-bold rounded-xl" placeholder="Ej: 30 días" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Estado</Label>
                                            <div className="flex items-center justify-center h-11 bg-background rounded-xl border">
                                                <Label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                                    <span className="text-xs font-black uppercase">{data.activo ? 'Activo' : 'Inactivo'}</span>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-primary/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-xs font-black uppercase text-primary">Acceso al Portal</Label>
                                            <input type="checkbox" checked={data.crear_usuario} onChange={(e) => setData('crear_usuario', e.target.checked)} className="h-4 w-4" />
                                        </div>
                                        {data.crear_usuario && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Contraseña (Mín. 8 caracteres)</Label>
                                                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="h-11 border-none bg-background shadow-sm font-bold rounded-xl" placeholder="Dejar en blanco para default" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-6 pt-6 border-t">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Notas Internas</Label>
                            <textarea 
                                value={data.notas} 
                                onChange={(e) => setData('notas', e.target.value)} 
                                className="flex min-h-[100px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none" 
                                placeholder="Historial, acuerdos especiales, etc."
                            />
                        </div>
                        
                        <DialogFooter className="gap-2 mt-8 pt-6 border-t uppercase font-black">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full px-8">Cancelar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> {editando ? 'Sincronizar Datos' : 'Registrar Socio'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
