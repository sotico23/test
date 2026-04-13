import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
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
import type { BreadcrumbItem } from '@/types';
import Pagination from '@/components/ui/Pagination';

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
    cantidad: number;
    cantidad_minima: number;
    ubicacion: string | null;
    producto?: Producto;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventarios' },
];

export default function Index({
    inventarios,
    productos,
    almacenes,
}: {
    inventarios: {
        data: Inventario[];
        links: any[];
        meta?: any;
        total: number;
    };
    productos: Producto[];
    almacenes: Almacen[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Inventario | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        transform,
    } = useForm({
        producto_id: '' as string,
        cantidad: 0,
        cantidad_minima: 0,
        ubicacion: '',
    });

    transform((d) => ({
        ...d,
        producto_id: d.producto_id ? Number(d.producto_id) : '',
        cantidad: Number(d.cantidad),
        cantidad_minima: Number(d.cantidad_minima),
    }));

    const [filtros, setFiltros] = useState({
        busqueda: '',
        stockBajo: false,
    });

    const inventariosFiltrados = useMemo(() => {
        return inventarios.data.filter((inv) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !inv.producto?.nombre.toLowerCase().includes(busca) &&
                    !inv.producto?.codigo.toLowerCase().includes(busca) &&
                    !(inv.ubicacion || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.stockBajo && inv.cantidad > inv.cantidad_minima) {
                return false;
            }

            return true;
        });
    }, [inventarios.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            stockBajo: false,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleEdit = (inventario: Inventario) => {
        setEditando(inventario);
        setData({
            producto_id: inventario.producto_id.toString(),
            cantidad: inventario.cantidad,
            cantidad_minima: inventario.cantidad_minima,
            ubicacion: inventario.ubicacion || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro de inventario?'))
            destroy(`/inventarios/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Inventario</h1>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Control de Inventario</CardTitle>
                        <CardDescription>
                            {inventarios.total} registros encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por producto, código o ubicación..."
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
                            <Button
                                variant={
                                    filtros.stockBajo
                                        ? 'destructive'
                                        : 'outline'
                                }
                                size="sm"
                                className="h-9"
                                onClick={() =>
                                    setFiltros({
                                        ...filtros,
                                        stockBajo: !filtros.stockBajo,
                                    })
                                }
                            >
                                <AlertTriangle className="mr-1 h-4 w-4" />
                                Stock Bajo
                            </Button>
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
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Producto
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Código
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Cantidad
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Stock Mínimo
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Ubicación
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventariosFiltrados.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 font-medium">
                                                {inv.producto?.nombre}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                                                {inv.producto?.codigo}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span
                                                    className={`font-bold ${
                                                        inv.cantidad <=
                                                        inv.cantidad_minima
                                                            ? 'text-destructive'
                                                            : 'text-green-600'
                                                    }`}
                                                >
                                                    {inv.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                                                {inv.cantidad_minima}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {inv.ubicacion || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleEdit(inv)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(inv.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {inventariosFiltrados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron registros
                                                coincidentes
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            links={inventarios.links} 
                            meta={inventarios.meta || {
                                from: (inventarios as any).from,
                                to: (inventarios as any).to,
                                total: inventarios.total
                            }} 
                        />
                    </CardContent>
                </Card>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editando
                                    ? 'Editar Inventario'
                                    : 'Nuevo Inventario'}
                            </DialogTitle>
                            <DialogDescription>
                                {editando
                                    ? 'Modifique los datos del inventario'
                                    : 'Ingrese los datos del inventario'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            value={data.cantidad}
                                            onChange={(e) =>
                                                setData(
                                                    'cantidad',
                                                    parseInt(e.target.value) ||
                                                        0,
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
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Ubicación</Label>
                                    {almacenes.length > 0 ? (
                                        <>
                                            <select
                                                value={data.ubicacion}
                                                onChange={(e) =>
                                                    setData('ubicacion', e.target.value)
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="">Sin ubicación</option>
                                                {almacenes.map((a) => (
                                                    <option key={a.id} value={a.nombre}>
                                                        {a.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Selecciona un almacén existente o escribe una ubicación personalizada:
                                            </p>
                                            <Input
                                                value={data.ubicacion}
                                                onChange={(e) =>
                                                    setData('ubicacion', e.target.value)
                                                }
                                                placeholder="O escribe una ubicación personalizada"
                                            />
                                        </>
                                    ) : (
                                        <Input
                                            value={data.ubicacion}
                                            onChange={(e) =>
                                                setData('ubicacion', e.target.value)
                                            }
                                            placeholder="Ej: Bodega A"
                                        />
                                    )}
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
            </div>
        </AppLayout>
    );
}
