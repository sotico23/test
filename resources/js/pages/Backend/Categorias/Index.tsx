import { Head, router } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Image as ImageIcon,
    X,
    Search,
    Eye,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useMemo } from 'react';
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
import Pagination from '@/components/ui/Pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: 'producto' | 'cliente' | 'proveedor';
    activo: boolean;
    imagen: string | null;
    mostrar_en_perfil: boolean;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categorías', href: '/categorias' },
];

export default function Index({
    categorias,
}: {
    categorias: {
        data: Categoria[];
        links: any[];
        meta: { from: number; to: number; total: number };
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Categoria | null>(null);
    const [viendo, setViendo] = useState<Categoria | null>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'producto' as 'producto' | 'cliente' | 'proveedor',
        activo: true,
        imagen: null as File | null,
        mostrar_en_perfil: true,
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        activo: '',
    });

    const categoriasFiltradas = useMemo(() => {
        return categorias.data.filter((c) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !c.nombre.toLowerCase().includes(busca) &&
                    !(c.descripcion || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.tipo &&
                filtros.tipo !== 'all' &&
                c.tipo !== filtros.tipo
            )
                return false;

            if (filtros.activo && filtros.activo !== 'all') {
                const isActivo = filtros.activo === '1';
                if (c.activo !== isActivo) return false;
            }

            return true;
        });
    }, [categorias.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: 'all',
            activo: 'all',
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, imagen: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, imagen: null });
        setImagenPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            _method: editando ? 'PUT' : 'POST',
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            tipo: formData.tipo,
            activo: formData.activo,
            imagen: formData.imagen,
            mostrar_en_perfil: formData.mostrar_en_perfil,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                setEditando(null);
                setFormData({
                    nombre: '',
                    descripcion: '',
                    tipo: 'producto',
                    activo: true,
                    imagen: null,
                    mostrar_en_perfil: true,
                });
                setImagenPreview(null);
            },
        };

        if (editando) {
            router.post(
                `/categorias/${editando.id}`,
                submitData as any,
                options,
            );
        } else {
            router.post('/categorias', submitData as any, options);
        }
    };

    const handleEdit = (categoria: Categoria) => {
        setEditando(categoria);
        setFormData({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '',
            tipo: categoria.tipo,
            activo: categoria.activo,
            imagen: null,
            mostrar_en_perfil: (categoria as any).mostrar_en_perfil ?? true,
        });
        setImagenPreview(
            categoria.imagen ? `/storage/${categoria.imagen}` : null,
        );
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta categoría?')) {
            router.delete(`/categorias/${id}`);
        }
    };

    const openNew = () => {
        setEditando(null);
        setFormData({
            nombre: '',
            descripcion: '',
            tipo: 'producto',
            activo: true,
            imagen: null,
            mostrar_en_perfil: true,
        });
        setImagenPreview(null);
        setIsOpen(true);
    };

    const toggleActivo = (categoria: Categoria) => {
        router.post(
            `/categorias/${categoria.id}`,
            {
                _method: 'PUT',
                nombre: categoria.nombre,
                descripcion: categoria.descripcion || '',
                tipo: categoria.tipo,
                activo: !categoria.activo,
                mostrar_en_perfil: categoria.mostrar_en_perfil,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categorías</h1>
                    <Button onClick={openNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Categorías</CardTitle>
                        <CardDescription>
                            {categoriasFiltradas.length} categorías encontradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-muted/50 p-4 shadow-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="group relative">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Buscar por nombre o descripción..."
                                        value={filtros.busqueda}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                busqueda: e.target.value,
                                            })
                                        }
                                        className="h-10 border-muted-foreground/20 pl-9 transition-all focus:border-primary"
                                    />
                                </div>
                            </div>

                            <Select
                                value={filtros.tipo}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        tipo: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[180px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todos los tipos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los tipos
                                    </SelectItem>
                                    <SelectItem value="producto">
                                        Producto
                                    </SelectItem>
                                    <SelectItem value="cliente">
                                        Cliente
                                    </SelectItem>
                                    <SelectItem value="proveedor">
                                        Proveedor
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filtros.activo}
                                onValueChange={(v) =>
                                    setFiltros({
                                        ...filtros,
                                        activo: v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-[180px] border-muted-foreground/20 bg-background">
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los estados
                                    </SelectItem>
                                    <SelectItem value="1">Activos</SelectItem>
                                    <SelectItem value="0">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 border-muted-foreground/20 px-4 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                onClick={limpiarFiltros}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtros
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Imagen
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Nombre
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Tipo
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Descripción
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Estado
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoriasFiltradas.map((categoria) => (
                                        <tr
                                            key={categoria.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 text-center sm:text-left">
                                                {categoria.imagen ? (
                                                    <img
                                                        src={`/storage/${categoria.imagen}`}
                                                        alt={categoria.nombre}
                                                        className="mx-auto h-8 w-8 rounded object-cover sm:mx-0"
                                                    />
                                                ) : (
                                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-muted sm:mx-0">
                                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 font-medium">
                                                {categoria.nombre}
                                            </td>
                                            <td className="px-4 py-2 text-sm capitalize">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-bold uppercase"
                                                >
                                                    {categoria.tipo}
                                                </Badge>
                                            </td>
                                            <td className="hidden px-4 py-2 text-sm md:table-cell">
                                                {categoria.descripcion || '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() =>
                                                        toggleActivo(categoria)
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <Badge
                                                        variant={
                                                            categoria.activo
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className="px-1.5 py-0 text-[10px]"
                                                    >
                                                        {categoria.activo
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setViendo(
                                                                categoria,
                                                            );
                                                            setIsViewOpen(true);
                                                        }}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleEdit(
                                                                categoria,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                categoria.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categoriasFiltradas.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron categorías con
                                                los filtros aplicados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={categorias.links}
                            meta={categorias.meta}
                        />
                    </CardContent>
                </Card>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editando
                                    ? 'Editar Categoría'
                                    : 'Nueva Categoría'}
                            </DialogTitle>
                            <DialogDescription>
                                {editando
                                    ? 'Modifique los datos de la categoría'
                                    : 'Ingrese los datos de la nueva categoría'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nombre: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion">
                                        Descripción
                                    </Label>
                                    <Input
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                descripcion: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select
                                        value={formData.tipo}
                                        onValueChange={(v: string) =>
                                            setFormData({
                                                ...formData,
                                                tipo: v as
                                                    | 'producto'
                                                    | 'cliente'
                                                    | 'proveedor',
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="producto">
                                                Producto
                                            </SelectItem>
                                            <SelectItem value="cliente">
                                                Cliente
                                            </SelectItem>
                                            <SelectItem value="proveedor">
                                                Proveedor
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={formData.activo}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                activo: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="activo">
                                        Categoría activa
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <input
                                        type="checkbox"
                                        id="mostrar-en-perfil"
                                        checked={formData.mostrar_en_perfil}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mostrar_en_perfil:
                                                    e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="mostrar-en-perfil"
                                        className="font-medium text-blue-800"
                                    >
                                        Mostrar en perfil público de tienda
                                    </Label>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Imagen</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="imagen-upload"
                                            />
                                            <Label
                                                htmlFor="imagen-upload"
                                                className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground hover:bg-muted"
                                            >
                                                {imagenPreview ? (
                                                    <img
                                                        src={imagenPreview}
                                                        alt="Preview"
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8" />
                                                        <span className="text-sm">
                                                            Click para subir
                                                        </span>
                                                    </div>
                                                )}
                                            </Label>
                                        </div>
                                        {(imagenPreview || formData.imagen) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
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

                {/* Modal de Vista Premium */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-none bg-white p-0 shadow-2xl">
                        <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                            {/* Fondo decorativo con gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-950 opacity-100" />
                            <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                                <Eye className="h-24 w-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-1 text-white">
                                <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                    Detalle de Categoría
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                                    {viendo?.nombre}
                                </DialogTitle>
                                <DialogDescription className="text-lg font-medium text-purple-100/80">
                                    Clasificación y configuración de
                                    visualización.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        {viendo && (
                            <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(90vh-180px)] flex-col gap-6 overflow-y-auto px-8">
                                {/* Dashboard de estados rápidos */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[
                                        {
                                            label: 'Tipo',
                                            val: viendo.tipo,
                                            color: 'border-purple-200 bg-purple-50 text-purple-800',
                                        },
                                        {
                                            label: 'Estado',
                                            val: viendo.activo
                                                ? 'ACTIVO'
                                                : 'INACTIVO',
                                            color: viendo.activo
                                                ? 'border-green-200 bg-green-50 text-green-800'
                                                : 'border-red-200 bg-red-50 text-red-800',
                                        },
                                        {
                                            label: 'Perfil Público',
                                            val: viendo.mostrar_en_perfil
                                                ? 'SÍ'
                                                : 'NO',
                                            color: viendo.mostrar_en_perfil
                                                ? 'border-blue-200 bg-blue-50 text-blue-800'
                                                : 'border-gray-200 bg-gray-50 text-gray-800',
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`group rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${item.color}`}
                                        >
                                            <p className="mb-1 text-[10px] font-extrabold tracking-wider uppercase opacity-70">
                                                {item.label}
                                            </p>
                                            <p className="truncate text-sm font-semibold uppercase">
                                                {item.val}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                                    {/* Imagen de Categoría */}
                                    <div className="flex flex-col gap-3">
                                        <Label className="ml-1 text-[10px] font-bold text-muted-foreground uppercase">
                                            Imagen Representativa
                                        </Label>
                                        <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 shadow-sm">
                                            {viendo.imagen ? (
                                                <img
                                                    src={`/storage/${viendo.imagen}`}
                                                    alt={viendo.nombre}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-40">
                                                    <ImageIcon className="h-12 w-12" />
                                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                                        Sin Imagen
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descripción y Detalles */}
                                    <div className="flex flex-col gap-6">
                                        <Card className="border-none bg-gray-50/50 shadow-sm">
                                            <CardHeader className="border-b border-gray-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-md bg-purple-100 p-1.5 text-purple-700">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-base font-bold text-gray-800">
                                                        Descripción
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-5 text-sm leading-relaxed font-medium text-gray-600 italic">
                                                {viendo.descripcion ||
                                                    'Esta categoría no cuenta con una descripción detallada en el sistema.'}
                                            </CardContent>
                                        </Card>

                                        <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                                            <div className="mt-1 rounded-full bg-amber-200 p-1">
                                                <Check className="h-3 w-3 text-amber-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-amber-900">
                                                    Configuración de
                                                    Visualización
                                                </p>
                                                <p className="text-[10px] leading-relaxed font-medium text-amber-800/70">
                                                    {viendo.mostrar_en_perfil
                                                        ? 'Esta categoría será visible en el catálogo público de la tienda.'
                                                        : 'Esta categoría se mantiene para uso administrativo interno solamente.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 border-t bg-gray-50 p-6">
                            <Button
                                variant="outline"
                                onClick={() => setIsViewOpen(false)}
                                className="w-full border-gray-200 px-10 font-bold shadow-sm transition-all hover:bg-white hover:text-primary active:scale-95 sm:w-auto"
                            >
                                Cerrar Detalle
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
