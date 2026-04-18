import { Head, router, Link } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Image as ImageIcon,
    Video,
    X,
    Search,
    Eye,
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
import Pagination from '@/components/ui/Pagination';

function ActiveDropdown({ activo, onChange }: { activo: boolean; onChange: (v: boolean) => void }) {
    return (
        <Select
            value={activo ? '1' : '0'}
            onValueChange={(v) => onChange(v === '1')}
        >
            <SelectTrigger
                className={`h-7 w-24 rounded-full border px-2.5 text-xs font-semibold shadow-sm transition-all focus:ring-0 focus:ring-offset-0 ${
                    activo
                        ? 'border-green-600 bg-green-500 text-white hover:bg-green-600'
                        : 'border-gray-500 bg-gray-500 text-white hover:bg-gray-600'
                }`}
            >
                <SelectValue>
                    {activo ? 'Activo' : 'Inactivo'}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="1" className="text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Activo
                    </div>
                </SelectItem>
                <SelectItem value="0" className="text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                        Inactivo
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}

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
}: {
    productos: {
        data: Producto[];
        links: any[];
        meta?: any;
        total: number;
        current_page: number;
        last_page: number;
    };
    categorias: Categoria[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Producto | null>(null);
    const [modoVista, setModoVista] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Producto | null>(null);
    const [imagenesPreview, setImagenesPreview] = useState<(string | null)[]>([
        null,
        null,
        null,
        null,
        null,
    ]);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const fileInputsRef = useRef<(HTMLInputElement | null)[]>([
        null,
        null,
        null,
        null,
        null,
    ]);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<{
        codigo: string;
        nombre: string;
        descripcion: string;
        categoria_id: string;
        precio_compra: number;
        precio_venta: number;
        stock_minimo: number;
        stock: number;
        unidad_medida: 'unidad' | 'kg' | 'lt';
        activo: boolean;
        envase_retornable: boolean;
        medida_pesable: boolean;
        tipo_medida: 'unidad' | 'kilo' | 'litro';
        cantidad_medida: number;
        tipo_envase: string;
        imagen: File | null;
        imagen2: File | null;
        imagen3: File | null;
        imagen4: File | null;
        imagen5: File | null;
        video: File | null;
        mostrar_en_perfil: boolean;
    }>({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria_id: '' as string,
        precio_compra: 0,
        precio_venta: 0,
        stock_minimo: 0,
        stock: 0,
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

    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria_id: '',
        activo: '',
    });

    const productosFiltrados = useMemo(() => {
        return productos.data.filter((p) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !p.nombre.toLowerCase().includes(busca) &&
                    !p.codigo.toLowerCase().includes(busca) &&
                    !(p.descripcion || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (
                filtros.categoria_id &&
                p.categoria_id?.toString() !== filtros.categoria_id
            )
                return false;

            if (filtros.activo !== '') {
                const isActivo = filtros.activo === '1';
                if (p.activo !== isActivo) return false;
            }

            return true;
        });
    }, [productos, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            categoria_id: '',
            activo: '',
        });
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams(filtros);
        window.location.href = `/productos/export?${params.toString()}`;
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams(filtros);
        window.location.href = `/productos/export-excel?${params.toString()}`;
    };

    const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        router.post('/productos/import', formData, {
            onSuccess: () => {
                alert('Importación completada');
            },
            onError: (err) => {
                console.error(err);
                alert('Error al importar: ' + Object.values(err)[0]);
            },
        });
    };

    const handleImageChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const newFormData = { ...formData };
            const keys = [
                'imagen',
                'imagen2',
                'imagen3',
                'imagen4',
                'imagen5',
            ] as const;
            (newFormData as any)[keys[index]] = file;
            setFormData(newFormData);

            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...imagenesPreview];
                newPreviews[index] = reader.result as string;
                setImagenesPreview(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, video: file });
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const removeImage = (index: number) => {
        const newFormData = { ...formData };
        const keys = [
            'imagen',
            'imagen2',
            'imagen3',
            'imagen4',
            'imagen5',
        ] as const;
        (newFormData as any)[keys[index]] = null;
        setFormData(newFormData);

        const newPreviews = [...imagenesPreview];
        newPreviews[index] = null;
        setImagenesPreview(newPreviews);

        if (fileInputsRef.current[index]) {
            fileInputsRef.current[index]!.value = '';
        }
    };

    const removeVideo = () => {
        setFormData({ ...formData, video: null });
        setVideoPreview(null);
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const countNewImages = [
            formData.imagen,
            formData.imagen2,
            formData.imagen3,
            formData.imagen4,
            formData.imagen5,
        ].filter(Boolean).length;

        const existingImages = editando
            ? [
                  editando.imagen,
                  editando.imagen2,
                  editando.imagen3,
                  editando.imagen4,
                  editando.imagen5,
              ].filter(Boolean).length
            : 0;

        if (!editando && countNewImages < 1) {
            alert('Debe subir al menos 1 imagen del producto');
            return;
        }

        if (editando && countNewImages === 0 && existingImages === 0) {
            alert('Debe subir al menos 1 imagen del producto');
            return;
        }

        const data = new FormData();
        data.append('codigo', formData.codigo);
        data.append('nombre', formData.nombre);
        data.append('unidad_medida', formData.unidad_medida);
        data.append('descripcion', formData.descripcion);
        data.append('categoria_id', formData.categoria_id || '');
        data.append('precio_compra', formData.precio_compra.toString());
        data.append('precio_venta', formData.precio_venta.toString());
        data.append('stock_minimo', formData.stock_minimo.toString());
        data.append('stock', formData.stock.toString());
        data.append('activo', formData.activo ? '1' : '0');
        data.append(
            'envase_retornable',
            formData.envase_retornable ? '1' : '0',
        );
        data.append('medida_pesable', formData.medida_pesable ? '1' : '0');
        data.append(
            'mostrar_en_perfil',
            formData.mostrar_en_perfil ? '1' : '0',
        );
        if (formData.tipo_envase)
            data.append('tipo_envase', formData.tipo_envase);
        if (formData.medida_pesable) {
            data.append('tipo_medida', formData.tipo_medida);
            if (formData.cantidad_medida > 0)
                data.append(
                    'cantidad_medida',
                    formData.cantidad_medida.toString(),
                );
        }

        if (formData.imagen) data.append('imagen', formData.imagen);
        if (formData.imagen2) data.append('imagen2', formData.imagen2);
        if (formData.imagen3) data.append('imagen3', formData.imagen3);
        if (formData.imagen4) data.append('imagen4', formData.imagen4);
        if (formData.imagen5) data.append('imagen5', formData.imagen5);
        if (formData.video) data.append('video', formData.video);

        if (editando) {
            router.post(`/productos/${editando.id}?_method=PUT`, data);
        } else {
            router.post('/productos', data);
        }

        setIsOpen(false);
        setEditando(null);
        setModoVista(false);
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria_id: '',
            precio_compra: 0,
            precio_venta: 0,
            stock_minimo: 0,
            stock: 0,
            unidad_medida: 'unidad',
            activo: true,
            envase_retornable: false,
            medida_pesable: false,
            tipo_medida: 'unidad',
            cantidad_medida: 0,
            tipo_envase: '',
            imagen: null,
            imagen2: null,
            imagen3: null,
            imagen4: null,
            imagen5: null,
            video: null,
            mostrar_en_perfil: true,
        });
        setImagenesPreview([null, null, null, null, null]);
        setVideoPreview(null);
    };

    const handleEdit = (producto: Producto) => {
        setEditando(producto);
        setModoVista(false);
        setFormData({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            categoria_id: producto.categoria_id?.toString() || '',
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta,
            stock_minimo: producto.stock_minimo,
            stock: producto.inventario?.cantidad || 0,
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
        });
        setImagenesPreview([
            producto.imagen ? `/storage/${producto.imagen}` : null,
            producto.imagen2 ? `/storage/${producto.imagen2}` : null,
            producto.imagen3 ? `/storage/${producto.imagen3}` : null,
            producto.imagen4 ? `/storage/${producto.imagen4}` : null,
            producto.imagen5 ? `/storage/${producto.imagen5}` : null,
        ]);
        setVideoPreview(producto.video ? `/storage/${producto.video}` : null);
        setIsOpen(true);
    };

    const handleView = (producto: Producto) => {
        setViewing(producto);
        setIsViewOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            router.delete(`/productos/${id}`);
        }
    };

    const openNew = () => {
        setEditando(null);
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria_id: '',
            precio_compra: 0,
            precio_venta: 0,
            stock_minimo: 0,
            stock: 0,
            unidad_medida: 'unidad',
            activo: true,
            envase_retornable: false,
            medida_pesable: false,
            tipo_medida: 'unidad',
            cantidad_medida: 0,
            tipo_envase: '',
            imagen: null,
            imagen2: null,
            imagen3: null,
            imagen4: null,
            imagen5: null,
            video: null,
            mostrar_en_perfil: true,
        });
        setImagenesPreview([null, null, null, null, null]);
        setVideoPreview(null);
        setIsOpen(true);
    };

    const toggleActivo = (producto: Producto) => {
        const data = new FormData();
        data.append('codigo', producto.codigo);
        data.append('nombre', producto.nombre);
        data.append('unidad_medida', producto.unidad_medida || 'unidad');
        data.append('descripcion', producto.descripcion || '');
        data.append('categoria_id', producto.categoria_id?.toString() || '');
        data.append('precio_compra', producto.precio_compra.toString());
        data.append('precio_venta', producto.precio_venta.toString());
        data.append('stock_minimo', producto.stock_minimo.toString());
        data.append('stock', (producto.inventario?.cantidad || 0).toString());
        data.append('activo', producto.activo ? '0' : '1');
        data.append(
            'envase_retornable',
            String((producto as any).envase_retornable ? 1 : 0),
        );
        data.append(
            'medida_pesable',
            String((producto as any).medida_pesable ? 1 : 0),
        );
        if ((producto as any).tipo_envase)
            data.append('tipo_envase', (producto as any).tipo_envase);
        if ((producto as any).medida_pesable) {
            data.append(
                'tipo_medida',
                (producto as any).tipo_medida || 'unidad',
            );
            if ((producto as any).cantidad_medida)
                data.append(
                    'cantidad_medida',
                    String((producto as any).cantidad_medida),
                );
        }

        router.post(`/productos/${producto.id}?_method=PUT`, data);
    };

    const renderImageUpload = (index: number, label: string) => {
        const hasImage =
            imagenesPreview[index] ||
            (editando &&
                ['imagen', 'imagen2', 'imagen3', 'imagen4', 'imagen5'][index] &&
                editando[
                    ['imagen', 'imagen2', 'imagen3', 'imagen4', 'imagen5'][
                        index
                    ] as keyof typeof editando
                ]);

        return (
            <div className="grid gap-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <input
                            ref={(el) => {
                                fileInputsRef.current[index] = el;
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="hidden"
                            id={`imagen-${index}-upload`}
                        />
                        <Label
                            htmlFor={`imagen-${index}-upload`}
                            className={`flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground ${modoVista ? 'opacity-50' : 'cursor-pointer hover:bg-muted'}`}
                        >
                            {imagenesPreview[index] ? (
                                <img
                                    src={imagenesPreview[index]!}
                                    alt={`Imagen ${index + 1}`}
                                    className="h-full w-full rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                    <ImageIcon className="h-5 w-5" />
                                    <span className="text-xs">
                                        Imagen {index + 1}
                                    </span>
                                </div>
                            )}
                        </Label>
                    </div>
                    {(imagenesPreview[index] ||
                        (editando &&
                            (editando as any)[
                                [
                                    'imagen',
                                    'imagen2',
                                    'imagen3',
                                    'imagen4',
                                    'imagen5',
                                ][index]
                            ])) &&
                        !modoVista && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Productos</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportCsv}>
                            Exportar CSV
                        </Button>
                        <Button variant="outline" onClick={handleExportExcel}>
                            Exportar Excel
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImportCsv}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <Button variant="outline">Importar CSV</Button>
                        </div>
                        <Button onClick={openNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Productos</CardTitle>
                        <CardDescription>
                            {productos.total} productos total (Página{' '}
                            {productos.current_page} de {productos.last_page})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o código..."
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
                            <select
                                value={filtros.categoria_id}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        categoria_id: e.target.value,
                                    })
                                }
                                className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filtros.activo}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        activo: e.target.value,
                                    })
                                }
                                className="flex h-9 rounded-md border bg-background px-3 py-1"
                            >
                                <option value="">Todos los estados</option>
                                <option value="1">Activos</option>
                                <option value="0">Inactivos</option>
                            </select>
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
                                        <th className="pb-3 text-left font-medium">
                                            Imagen
                                        </th>
                                        <th className="pb-3 text-left font-medium">
                                            Código/Nombre
                                        </th>
                                        <th className="pb-3 text-left font-medium">
                                            Categoría
                                        </th>
                                        <th className="pb-3 text-right font-medium">
                                            Precios
                                        </th>
                                        <th className="pb-3 text-center font-medium">
                                            Stock
                                        </th>
                                        <th className="pb-3 text-center font-medium">
                                            Estado
                                        </th>
                                        <th className="pb-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosFiltrados.map((producto) => (
                                        <tr
                                            key={producto.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="px-1 py-2">
                                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-muted">
                                                    {producto.imagen ? (
                                                        <img
                                                            src={`/storage/${producto.imagen}`}
                                                            alt={
                                                                producto.nombre
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-1 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-blue-600">
                                                        {producto.codigo}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {producto.nombre}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-1 py-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px]"
                                                >
                                                    {producto.categoria
                                                        ?.nombre ||
                                                        'Sin categoría'}
                                                </Badge>
                                            </td>
                                            <td className="px-1 py-2 text-right">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">
                                                        {formatCurrencyCLP(
                                                            producto.precio_venta,
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Compra:{' '}
                                                        {formatCurrencyCLP(
                                                            producto.precio_compra,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-1 py-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className={`font-bold ${
                                                            Math.round(producto.inventario
                                                                ?.cantidad || 0) <=
                                                            Math.round(producto.stock_minimo ||
                                                                0)
                                                                ? 'text-destructive'
                                                                : 'text-blue-600'
                                                        }`}
                                                    >
                                                        {Math.round(producto.inventario
                                                            ?.cantidad || 0)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Mín:{' '}
                                                        {Math.round(producto.stock_minimo || 0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-1 py-2 text-center">
                                                <ActiveDropdown
                                                    activo={producto.activo}
                                                    onChange={(val) => {
                                                        if (val !== producto.activo) {
                                                            toggleActivo(producto);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleView(producto)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleEdit(producto)
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
                                                                producto.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {productosFiltrados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron productos con
                                                los filtros aplicados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={productos.links}
                            meta={
                                productos.meta || {
                                    from: (productos as any).from,
                                    to: (productos as any).to,
                                    total: productos.total,
                                }
                            }
                        />
                    </CardContent>
                </Card>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {modoVista
                                    ? 'Ver Producto'
                                    : editando
                                      ? 'Editar Producto'
                                      : 'Nuevo Producto'}
                            </DialogTitle>
                            <DialogDescription>
                                {modoVista
                                    ? 'Detalles del producto'
                                    : editando
                                      ? 'Modifique los datos del producto'
                                      : 'Ingrese los datos del nuevo producto'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Código</Label>
                                        <Input
                                            value={formData.codigo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    codigo: e.target.value,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Nombre</Label>
                                        <Input
                                            value={formData.nombre}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nombre: e.target.value,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descripción</Label>
                                    <Input
                                        value={formData.descripcion}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                descripcion: e.target.value,
                                            })
                                        }
                                        disabled={modoVista}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Categoría</Label>
                                    <Select
                                        value={formData.categoria_id}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                categoria_id: v,
                                            })
                                        }
                                        disabled={modoVista}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
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
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="grid gap-2">
                                        <Label>Precio Compra</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_compra}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    precio_compra:
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Precio Venta</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_venta}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    precio_venta:
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Stock Actual</Label>
                                        <Input
                                            type="number"
                                            step={
                                                !formData.medida_pesable
                                                    ? '1'
                                                    : '0.001'
                                            }
                                            value={formData.stock}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    stock:
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Stock Mínimo</Label>
                                        <Input
                                            type="number"
                                            step={
                                                !formData.medida_pesable
                                                    ? '1'
                                                    : '0.001'
                                            }
                                            value={formData.stock_minimo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    stock_minimo:
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            required
                                            disabled={modoVista}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <input
                                            type="checkbox"
                                            id="envase-retornable"
                                            checked={
                                                formData.envase_retornable ||
                                                false
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    envase_retornable:
                                                        e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4"
                                            disabled={modoVista}
                                        />
                                        <Label
                                            htmlFor="envase-retornable"
                                            className="font-medium text-amber-800"
                                        >
                                            Envase retornable (cilindro de gas,
                                            agua, etc.)
                                        </Label>
                                    </div>
                                    {formData.envase_retornable && (
                                        <div className="grid gap-2">
                                            <Label>Tipo de Envase</Label>
                                            <Select
                                                value={
                                                    formData.tipo_envase || ''
                                                }
                                                onValueChange={(v) =>
                                                    setFormData({
                                                        ...formData,
                                                        tipo_envase: v,
                                                    })
                                                }
                                                disabled={modoVista}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cilindro_gas">
                                                        Cilindro de Gas
                                                    </SelectItem>
                                                    <SelectItem value="cilindro_agua">
                                                        Cilindro de Agua
                                                    </SelectItem>
                                                    <SelectItem value="botella">
                                                        Botella
                                                    </SelectItem>
                                                    <SelectItem value="otro">
                                                        Otro
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                {/* Medida Pesable */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="medida-pesable"
                                        checked={formData.medida_pesable}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                medida_pesable:
                                                    e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4"
                                        disabled={modoVista}
                                    />
                                    <Label
                                        htmlFor="medida-pesable"
                                        className="font-medium text-green-800"
                                    >
                                        Producto vendido por peso/volumen
                                        (kilos, litros)
                                    </Label>
                                </div>
                                {formData.medida_pesable && (
                                    <div className="grid gap-2">
                                        <Label>Tipo de Medida</Label>
                                        <Select
                                            value={formData.tipo_medida}
                                            onValueChange={(v) =>
                                                setFormData({
                                                    ...formData,
                                                    tipo_medida: v as
                                                        | 'unidad'
                                                        | 'kilo'
                                                        | 'litro',
                                                })
                                            }
                                            disabled={modoVista}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unidad">
                                                    Por Unidad
                                                </SelectItem>
                                                <SelectItem value="kilo">
                                                    Por Kilo (kg)
                                                </SelectItem>
                                                <SelectItem value="litro">
                                                    Por Litro (L)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {formData.medida_pesable &&
                                    formData.tipo_medida !== 'unidad' && (
                                        <div className="grid gap-2">
                                            <Label>
                                                Cantidad por unidad (
                                                {formData.tipo_medida === 'kilo'
                                                    ? 'kg'
                                                    : 'L'}
                                                )
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    formData.cantidad_medida ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        cantidad_medida:
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                    })
                                                }
                                                disabled={modoVista}
                                                placeholder={
                                                    formData.tipo_medida ===
                                                    'kilo'
                                                        ? 'Ej: 1.5 kg por unidad'
                                                        : 'Ej: 1 L por unidad'
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Ej: Si vende bidones de 5
                                                litros, ingrese 5
                                            </p>
                                        </div>
                                    )}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="activo-producto"
                                        checked={formData.activo}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                activo: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4"
                                        disabled={modoVista}
                                    />
                                    <Label htmlFor="activo-producto">
                                        Producto activo
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
                                        disabled={modoVista}
                                    />
                                    <Label
                                        htmlFor="mostrar-en-perfil"
                                        className="font-medium text-blue-800"
                                    >
                                        Mostrar en perfil público de tienda
                                    </Label>
                                </div>
                                <div className="grid gap-4">
                                    <Label className="text-lg font-medium">
                                        Imágenes del Producto
                                    </Label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {renderImageUpload(0, 'Imagen 1')}
                                        {renderImageUpload(1, 'Imagen 2')}
                                        {renderImageUpload(2, 'Imagen 3')}
                                        {renderImageUpload(3, 'Imagen 4')}
                                        {renderImageUpload(4, 'Imagen 5')}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Video del Producto</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <input
                                                ref={videoInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoChange}
                                                className="hidden"
                                                id="video-upload"
                                            />
                                            <Label
                                                htmlFor="video-upload"
                                                className={`flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground ${modoVista ? 'opacity-50' : 'cursor-pointer hover:bg-muted'}`}
                                            >
                                                {videoPreview ? (
                                                    <video
                                                        src={videoPreview}
                                                        className="h-full w-full rounded-lg object-cover"
                                                        controls
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                        <Video className="h-5 w-5" />
                                                        <span className="text-xs">
                                                            Subir video
                                                        </span>
                                                    </div>
                                                )}
                                            </Label>
                                        </div>
                                        {(videoPreview ||
                                            (editando && editando.video)) &&
                                            !modoVista && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={removeVideo}
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
                                    {modoVista ? 'Cerrar' : 'Cancelar'}
                                </Button>
                                {!modoVista && (
                                    <Button type="submit">
                                        <Check className="mr-2 h-4 w-4" />
                                        Guardar
                                    </Button>
                                )}
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden border-none bg-white p-0 shadow-xl">
                        <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-950 opacity-100" />
                            <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                                <Eye className="h-24 w-24 rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-1 text-white">
                                <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                    Detalle de Producto
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                                    {viewing?.nombre}
                                </DialogTitle>
                                <DialogDescription className="text-lg font-medium text-purple-100/80">
                                    Información y características del producto.
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(90vh-180px)] flex-col gap-6 overflow-y-auto px-8">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {[
                                    {
                                        label: 'Código',
                                        val: viewing?.codigo || '---',
                                        colorScheme: 'blue',
                                    },
                                    {
                                        label: 'Categoría',
                                        val:
                                            categorias.find(
                                                (c) =>
                                                    c.id ===
                                                    viewing?.categoria_id,
                                            )?.nombre || 'General',
                                        colorScheme: 'purple',
                                    },
                                    {
                                        label: 'Estado',
                                        val: viewing?.activo
                                            ? 'ACTIVO'
                                            : 'INACTIVO',
                                        colorScheme: viewing?.activo
                                            ? 'green'
                                            : 'rose',
                                    },
                                ].map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
                                            stat.colorScheme === 'blue'
                                                ? 'border-blue-200 bg-blue-50 text-blue-800'
                                                : stat.colorScheme === 'purple'
                                                  ? 'border-purple-200 bg-purple-50 text-purple-800'
                                                  : stat.colorScheme === 'green'
                                                    ? 'border-green-200 bg-green-50 text-green-800'
                                                    : 'border-rose-200 bg-rose-50 text-rose-800'
                                        }`}
                                    >
                                        <p className="mb-1 text-[10px] font-extrabold tracking-wider uppercase opacity-70">
                                            {stat.label}
                                        </p>
                                        <p className="truncate text-sm font-semibold uppercase">
                                            {stat.val}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Card className="border-none bg-gray-50/50 shadow-sm">
                                <CardHeader className="border-b border-gray-100 pb-3">
                                    <CardTitle className="text-base font-bold text-gray-800">
                                        Información de Precio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 p-5">
                                    <div>
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Precio Compra
                                        </Label>
                                        <p className="font-medium">
                                            {formatCurrencyCLP(
                                                Number(
                                                    viewing?.precio_compra || 0,
                                                ),
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Precio Venta
                                        </Label>
                                        <p className="font-medium text-green-600">
                                            {formatCurrencyCLP(
                                                Number(
                                                    viewing?.precio_venta || 0,
                                                ),
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none bg-gray-50/50 shadow-sm">
                                <CardHeader className="border-b border-gray-100 pb-3">
                                    <CardTitle className="text-base font-bold text-gray-800">
                                        Descripción
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <p className="text-sm text-gray-700">
                                        {viewing?.descripcion ||
                                            'Sin descripción'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <DialogFooter className="border-t bg-gray-50 p-4">
                            <Button onClick={() => setIsViewOpen(false)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
