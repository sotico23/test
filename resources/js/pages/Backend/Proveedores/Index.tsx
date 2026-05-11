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
    Briefcase,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/ui/Pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
    const [categoriaFilter, setCategoriaFilter] = useState(
        filters.categoria_id || 'all',
    );
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
        const baseUrl =
            type === 'csv' ? '/proveedors/export' : '/proveedors/export-excel';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (categoriaFilter !== 'all')
            params.append('categoria_id', categoriaFilter);
        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const handleImport = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'csv' | 'excel',
    ) => {
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
                        <div className="mb-1 flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black tracking-widest text-primary/70 uppercase">
                                Supply Chain Division
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Proveedores
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Administre su red de suministros y relaciones
                            comerciales
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input
                            type="file"
                            ref={csvInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={(e) => handleImport(e, 'csv')}
                        />
                        <input
                            type="file"
                            ref={excelInputRef}
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={(e) => handleImport(e, 'excel')}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 rounded-xl px-3"
                                >
                                    <Download className="h-4 w-4 text-primary" />{' '}
                                    Herramientas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-xl border-none p-2 shadow-2xl"
                            >
                                <DropdownMenuItem
                                    onClick={() => csvInputRef.current?.click()}
                                    className="rounded-lg py-3"
                                >
                                    <Upload className="mr-2 h-4 w-4 text-blue-500" />{' '}
                                    Importar Proveedores
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleExport('csv')}
                                    className="rounded-lg py-3"
                                >
                                    <Download className="mr-2 h-4 w-4 text-green-500" />{' '}
                                    Exportar a CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            onClick={() => {
                                setEditando(null);
                                reset();
                                setIsOpen(true);
                            }}
                            className="h-9 rounded-full bg-primary px-5 font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col gap-4 rounded-3xl border border-muted/50 bg-muted/40 p-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, RUT, o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 rounded-2xl border-none bg-background pl-12 shadow-sm focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={categoriaFilter}
                                onValueChange={setCategoriaFilter}
                            >
                                <SelectTrigger className="h-11 w-[200px] rounded-2xl border-none bg-background font-bold shadow-sm">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todas las categorías
                                    </SelectItem>
                                    {categorias.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 rounded-2xl border-none bg-background text-muted-foreground shadow-sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoriaFilter('all');
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {proveedors.data.map((p) => (
                            <Card
                                key={p.id}
                                className="group overflow-hidden rounded-3xl border-none shadow-xl shadow-foreground/5 transition-all duration-300 hover:ring-2 hover:ring-primary/20"
                            >
                                <CardHeader className="pb-4">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex gap-1">
                                            <Badge
                                                variant="outline"
                                                className={`${p.activo ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'} rounded-full border-none px-2 py-0.5 text-[9px] font-black uppercase`}
                                            >
                                                {p.activo
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                            {p.categoria && (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-none bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary uppercase"
                                                >
                                                    {p.categoria.nombre}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                                                onClick={() => handleEdit(p)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    handleDelete(p.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-black transition-colors group-hover:text-primary">
                                        {p.nombre}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 font-bold">
                                        <Tag className="h-3 w-3" />{' '}
                                        {p.nit || 'Sin RUT'}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="group/item flex items-center gap-3 rounded-2xl bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
                                            <div className="rounded-xl bg-background p-2 text-primary shadow-sm transition-transform group-hover/item:scale-110">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <span className="truncate">
                                                {p.email || 'No registrado'}
                                            </span>
                                        </div>
                                        <div className="group/item flex items-center gap-3 rounded-2xl bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
                                            <div className="rounded-xl bg-background p-2 text-green-600 shadow-sm transition-transform group-hover/item:scale-110">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <span>
                                                {p.telefono || 'No registrado'}
                                            </span>
                                        </div>
                                        <div className="group/item flex items-center gap-3 rounded-2xl bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
                                            <div className="rounded-xl bg-background p-2 text-orange-600 shadow-sm transition-transform group-hover/item:scale-110">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <span className="truncate">
                                                {p.direccion || 'No registrada'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-muted/50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-[10px] font-black tracking-tight text-muted-foreground uppercase">
                                                {p.contacto_principal ||
                                                    'Sin contacto'}
                                            </span>
                                        </div>
                                        {p.tiene_acceso && (
                                            <Badge
                                                variant="outline"
                                                className="border-green-500/20 bg-green-500/5 text-[8px] font-black text-green-600"
                                            >
                                                <ShieldCheck className="mr-1 h-2 w-2" />{' '}
                                                ACCESO PORTAL
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="rounded-3xl border border-muted bg-background p-4 shadow-sm">
                        <Pagination
                            links={proveedors.links}
                            meta={proveedors.meta}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] overflow-hidden rounded-[40px] border-none p-0 shadow-2xl md:max-w-4xl">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8 pb-4 text-left">
                        <div className="mb-1 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black tracking-widest text-primary/70 uppercase">
                                Partnership Enrollment
                            </span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-primary">
                            {editando
                                ? 'Actualizar Proveedor'
                                : 'Registrar Nuevo Proveedor'}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Configure los detalles comerciales y fiscales del
                            socio de suministro.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="max-h-[80vh] overflow-y-auto p-8 pt-2"
                    >
                        <div className="grid grid-cols-1 gap-10 py-4 md:grid-cols-2">
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-[11px] font-black tracking-widest text-primary uppercase">
                                    <Store className="h-4 w-4" /> Información
                                    Comercial
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                                            Nombre Comercial / Razon Social *
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
                                            className="h-12 rounded-2xl border-none bg-muted/30 font-bold"
                                            placeholder="Ej: Importaciones Globales S.A."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                RUT / NIT *
                                            </Label>
                                            <Input
                                                value={data.nit}
                                                onChange={(e) =>
                                                    setData(
                                                        'nit',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="h-12 rounded-2xl border-none bg-muted/30 font-bold"
                                                placeholder="12.345.678-9"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                Categoría
                                            </Label>
                                            <Select
                                                value={String(
                                                    data.categoria_id,
                                                )}
                                                onValueChange={(v) =>
                                                    setData('categoria_id', v)
                                                }
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl border-none bg-muted/30 font-bold">
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categorias.map((c) => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={String(c.id)}
                                                        >
                                                            {c.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                Email de Contacto
                                            </Label>
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-2xl border-none bg-muted/30 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                Teléfono
                                            </Label>
                                            <Input
                                                value={data.telefono}
                                                onChange={(e) =>
                                                    setData(
                                                        'telefono',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-2xl border-none bg-muted/30 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                                            Dirección
                                        </Label>
                                        <Input
                                            value={data.direccion}
                                            onChange={(e) =>
                                                setData(
                                                    'direccion',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12 rounded-2xl border-none bg-muted/30 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-[11px] font-black tracking-widest text-primary uppercase">
                                    <Globe className="h-4 w-4" /> Detalles
                                    Operativos
                                </h3>
                                <div className="space-y-4 rounded-[40px] border-2 border-dashed border-primary/20 bg-primary/5 p-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                                            Contacto Principal
                                        </Label>
                                        <Input
                                            value={data.contacto_principal}
                                            onChange={(e) =>
                                                setData(
                                                    'contacto_principal',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 rounded-xl border-none bg-background font-bold shadow-sm"
                                            placeholder="Nombre de la persona"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                Términos de Pago
                                            </Label>
                                            <Input
                                                value={data.terminos_pago}
                                                onChange={(e) =>
                                                    setData(
                                                        'terminos_pago',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 rounded-xl border-none bg-background font-bold shadow-sm"
                                                placeholder="Ej: 30 días"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                Estado
                                            </Label>
                                            <div className="flex h-11 items-center justify-center rounded-xl border bg-background">
                                                <Label className="flex cursor-pointer items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.activo}
                                                        onChange={(e) =>
                                                            setData(
                                                                'activo',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-xs font-black uppercase">
                                                        {data.activo
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </span>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-primary/10 pt-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <Label className="text-xs font-black text-primary uppercase">
                                                Acceso al Portal
                                            </Label>
                                            <input
                                                type="checkbox"
                                                checked={data.crear_usuario}
                                                onChange={(e) =>
                                                    setData(
                                                        'crear_usuario',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                        </div>
                                        {data.crear_usuario && (
                                            <div className="animate-in space-y-4 duration-300 fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-muted-foreground uppercase">
                                                        Contraseña (Mín. 8
                                                        caracteres)
                                                    </Label>
                                                    <PasswordInput
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                'password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-11 rounded-xl border-none bg-background font-bold shadow-sm"
                                                        placeholder="Dejar en blanco para default"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2 border-t pt-6">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                Notas Internas
                            </Label>
                            <textarea
                                value={data.notas}
                                onChange={(e) =>
                                    setData('notas', e.target.value)
                                }
                                className="flex min-h-[100px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                placeholder="Historial, acuerdos especiales, etc."
                            />
                        </div>

                        <DialogFooter className="mt-8 gap-2 border-t pt-6 font-black uppercase">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full px-8"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-full bg-primary px-12 shadow-lg shadow-primary/20 hover:bg-primary/90"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                {editando
                                    ? 'Sincronizar Datos'
                                    : 'Registrar Socio'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
