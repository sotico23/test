import { Head, useForm, router } from '@inertiajs/react';
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
    Users,
    UserPlus,
    IdCard,
    Phone,
    Mail,
    MapPin,
    Eye,
    History,
    Edit3,
    ArrowDownZA,
    Info,
    ShieldCheck,
    MessageSquare
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { BulkActions } from '@/components/shared/BulkActions';
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
}

interface Cliente {
    id: number;
    nombre: string;
    nit: string | null;
    rut: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    region: string | null;
    comuna: string | null;
    giro: string | null;
    contacto: string | null;
    telefono_contacto: string | null;
    categoria_id: number | null;
    activo: boolean;
    notas: string | null;
    categoria?: Categoria;
    created_at: string;
    user_id: number | null;
    tiene_acceso: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clientes', href: '/clientes' },
];

export default function Index({
    clientes,
    categorias,
    filters,
}: {
    clientes: { data: Cliente[]; links: any[]; from?: number; to?: number; total?: number; meta?: any };
    categorias: Categoria[];
    filters: {
        search?: string;
        categoria_id?: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Cliente | null>(null);
    const [viendo, setViendo] = useState<Cliente | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoriaFilter, setCategoriaFilter] = useState(filters.categoria_id || 'all');

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
        rut: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        region: '',
        comuna: '',
        giro: '',
        contacto: '',
        telefono_contacto: '',
        categoria_id: '' as string,
        activo: true,
        notas: '',
        crear_usuario: false,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};
            if (searchTerm) query.search = searchTerm;
            if (categoriaFilter !== 'all') query.categoria_id = categoriaFilter;

            router.get('/clientes', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, categoriaFilter]);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setCategoriaFilter('all');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/clientes/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
            });
        } else {
            post('/clientes', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (cliente: Cliente) => {
        setEditando(cliente);
        setData({
            nombre: cliente.nombre,
            nit: cliente.nit || '',
            rut: cliente.rut || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            ciudad: cliente.ciudad || '',
            region: cliente.region || '',
            comuna: cliente.comuna || '',
            giro: cliente.giro || '',
            contacto: cliente.contacto || '',
            telefono_contacto: cliente.telefono_contacto || '',
            categoria_id: cliente.categoria_id?.toString() || '',
            activo: cliente.activo,
            notas: cliente.notas || '',
            crear_usuario: cliente.tiene_acceso || false,
        });
        setIsOpen(true);
    };

    const handleView = (cliente: Cliente) => {
        setViendo(cliente);
        setIsViewOpen(true);
    };

    const handleNew = () => {
        setEditando(null);
        reset();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este cliente?')) {
            destroy(`/clientes/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Cartera de Clientes" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Clientes</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Administración centralizada de prospectos y clientes recurrentes
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <BulkActions 
                            baseUrl="/clientes"
                            filters={{ 
                                search: searchTerm, 
                                categoria_id: categoriaFilter 
                            }}
                            modelName="Clientes"
                        />
                        
                        <Button onClick={handleNew} className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold rounded-full">
                            <UserPlus className="mr-2 h-4 w-4" /> Registrar Cliente
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <CardTitle>Base de Datos Principal</CardTitle>
                                </div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {clientes.total} Registros
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters Bar */}
                            <div className="flex flex-col p-4 gap-4 md:flex-row md:items-center bg-muted/20 border-b border-muted/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, RUT, email o teléfono..."
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
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-none bg-background/50" onClick={limpiarFiltros}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4 text-left">Cliente / Identificación</th>
                                            <th className="px-6 py-4 text-left">Contacto</th>
                                            <th className="px-6 py-4 text-left">Categoría</th>
                                            <th className="px-6 py-4 text-left">Acceso</th>
                                            <th className="px-6 py-4 text-left">Estado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/50">
                                        {clientes.data.map((c) => (
                                            <tr key={c.id} className="group transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-sm tracking-tight">{c.nombre}</div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground leading-none">
                                                            <IdCard className="h-2.5 w-2.5" />
                                                            {c.rut || c.nit || 'Sin RUT'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {c.telefono || 'N/A'}
                                                            {c.telefono && <WhatsAppButton phone={c.telefono} nombre={c.nombre} />}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            {c.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                                                        {c.categoria?.nombre || 'General'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {c.tiene_acceso ? (
                                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 border text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex w-fit gap-1 items-center">
                                                            <ShieldCheck className="h-2.5 w-2.5" /> Habilitado
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground/50 font-medium">Sin acceso</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {c.activo ? (
                                                        <Badge className="bg-green-500/10 text-green-600 border-green-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Activo</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-500/10 text-gray-500 border-gray-200 border text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Inactivo</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleView(c)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(c)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {clientes.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Users className="h-10 w-10 opacity-20" />
                                                        <p className="font-medium">No se encontraron clientes</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-muted/50">
                                <Pagination links={clientes.links} meta={clientes.meta || clientes} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-4xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <UserPlus className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Módulo CRM</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                            {editando ? 'Actualizar Ficha de Cliente' : 'Registro de Nuevo de Cliente'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-2 overflow-y-auto max-h-[80vh]">
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre / Razón Social *</Label>
                                    <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required className="h-11 border-none bg-muted/30 font-bold" />
                                    {errors.nombre && <p className="text-[10px] font-bold text-destructive">{errors.nombre}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">RUT / Identificación Tributaria</Label>
                                    <Input value={data.rut} onChange={(e) => setData('rut', e.target.value)} placeholder="12.345.678-9" className="h-11 border-none bg-muted/30 font-black" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico *</Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required className="h-11 border-none bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teléfono Principal</Label>
                                    <Input value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} className="h-11 border-none bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría de Cliente</Label>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Localización</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dirección</Label>
                                        <Input value={data.direccion} onChange={(e) => setData('direccion', e.target.value)} className="h-11 border-none bg-muted/30" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comuna</Label>
                                            <Input value={data.comuna} onChange={(e) => setData('comuna', e.target.value)} className="h-10 border-none bg-muted/30" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ciudad</Label>
                                            <Input value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)} className="h-10 border-none bg-muted/30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Seguridad y Acceso</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-black">Habilitar Acceso a Plataforma</Label>
                                            <p className="text-[10px] text-muted-foreground italic">Permite al cliente ver sus facturas y pedidos</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={data.crear_usuario}
                                            onChange={(e) => setData('crear_usuario', e.target.checked)}
                                            className="h-5 w-5 rounded-lg border-primary/30 text-primary focus:ring-primary shadow-sm"
                                        />
                                    </div>
                                    {data.crear_usuario && !editando && (
                                        <p className="text-[9px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                                            <Info className="h-3 w-3" /> Clave por defecto para el primer ingreso: <strong>cliente123</strong>
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                                        <Label className="text-xs font-black">Estado de la cuenta</Label>
                                        <Select value={data.activo ? '1' : '0'} onValueChange={(v) => setData('activo', v === '1')}>
                                            <SelectTrigger className="h-8 w-28 border-none bg-background rounded-full text-[10px] font-black uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Activo</SelectItem>
                                                <SelectItem value="0">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Notas Internas y Observaciones
                                </Label>
                                <textarea
                                    value={data.notas || ''}
                                    onChange={(e) => setData('notas', e.target.value)}
                                    className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                                    placeholder="Acuerdos comerciales, límites de crédito, conducta de pago..."
                                />
                            </div>
                        </div>
                        
                        <DialogFooter className="gap-2 border-t pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Cerrar</Button>
                            <Button type="submit" disabled={processing} className="rounded-full px-12 font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                                <Check className="mr-2 h-4 w-4" /> {editando ? 'Actualizar Ficha' : 'Dar de Alta Cliente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-3xl border-none shadow-2xl p-0 overflow-hidden">
                    {viendo && (
                        <>
                            <DialogHeader className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Users className="h-32 w-32 rotate-12 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-black uppercase tracking-widest mb-2 px-3">Expediente Cliente</Badge>
                                    <DialogTitle className="text-4xl font-black tracking-tight text-white">{viendo.nombre}</DialogTitle>
                                    <DialogDescription className="text-blue-100/70 font-medium">Información detallada de contacto y administrativa</DialogDescription>
                                </div>
                            </DialogHeader>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/30 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">RUT / Identificación</span>
                                        <p className="text-lg font-black font-mono">{viendo.rut || viendo.nit || '---'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoría</span>
                                        <Badge className="bg-primary/10 text-primary border-none text-xs font-bold block w-fit">{viendo.categoria?.nombre || 'General'}</Badge>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Antigüedad</span>
                                        <p className="text-lg font-black font-mono">{new Date(viendo.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Phone className="h-4 w-4" /> Canales de Contacto
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Teléfono Principal:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold">{viendo.telefono || '---'}</span>
                                                    {viendo.telefono && <WhatsAppButton phone={viendo.telefono} nombre={viendo.nombre} />}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Email Corporativo:</span>
                                                <span className="text-sm font-bold text-primary underline">{viendo.email || '---'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Contacto Alternativo:</span>
                                                <span className="text-sm font-bold">{viendo.contacto || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Ubicación Fiscal
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Comuna:</span>
                                                <span className="text-sm font-bold">{viendo.comuna || '---'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Ciudad:</span>
                                                <span className="text-sm font-bold">{viendo.ciudad || '---'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-muted py-2">
                                                <span className="text-xs font-medium text-muted-foreground">Dirección:</span>
                                                <span className="text-sm font-bold">{viendo.direccion || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {viendo.notas && (
                                    <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
                                        <MessageSquare className="h-6 w-6 text-amber-400 shrink-0 mt-1" />
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Observaciones Internas</span>
                                            <p className="text-sm text-amber-900 leading-relaxed italic">"{viendo.notas}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="p-8 border-t bg-muted/10">
                                <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-full px-8 font-black">Cerrar Expediente</Button>
                                <Button onClick={() => { setIsViewOpen(false); handleEdit(viendo); }} className="rounded-full px-8 font-black bg-primary">Editar Cliente</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
