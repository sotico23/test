import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, X } from 'lucide-react';
import { useState } from 'react';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import type { BreadcrumbItem } from '@/types';

interface Bom {
    id: number;
    nombre: string;
    producto_final: string | null;
    cantidad: number;
    materiales: any;
    activo: boolean;
    notas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Listas de Materiales (BOM)', href: '/boms' },
];

export default function Index({ boms }: { boms: { data: Bom[]; links: any[]; from?: number; to?: number; total?: number; meta?: any } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Bom | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        producto_final: '',
        cantidad: 1,
        activo: true,
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        activo: '',
    });

    const bomsFiltrados = useMemo(() => {
        return boms.data.filter((b) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !b.nombre.toLowerCase().includes(busca) &&
                    !(b.producto_final || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.activo !== '') {
                const isActivo = filtros.activo === '1';
                if (b.activo !== isActivo) return false;
            }

            return true;
        });
    }, [boms.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            activo: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando)
            put(`/boms/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        else
            post('/boms', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
    };

    const handleEdit = (b: Bom) => {
        setEditando(b);
        setData({
            nombre: b.nombre,
            producto_final: b.producto_final || '',
            cantidad: b.cantidad,
            activo: b.activo,
            notas: b.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            producto_final: '',
            cantidad: 1,
            activo: true,
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/boms/${id}`);
    };

    return (
        <>
            <Head title="BOM" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Listas de Materiales (BOM)
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de materiales
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo BOM
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>BOMs</CardTitle>
                            <CardDescription>
                                {bomsFiltrados.length} listas encontradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o producto final..."
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
                                            <th className="py-2 text-left font-medium">
                                                Nombre
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Producto Final
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Cantidad
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Estado
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bomsFiltrados.map((b) => (
                                            <tr
                                                key={b.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    {b.nombre}
                                                </td>
                                                <td className="py-2 text-muted-foreground">
                                                    {b.producto_final ||
                                                        '-'}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {b.cantidad}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <Badge
                                                        variant={
                                                            b.activo
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className="text-[10px] px-1.5 py-0"
                                                    >
                                                        {b.activo
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(b)
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
                                                                    b.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {bomsFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron listas con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination links={boms.links} meta={boms.meta || boms} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} BOM
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Producto Final</Label>
                                <Input
                                    value={data.producto_final}
                                    onChange={(e) =>
                                        setData(
                                            'producto_final',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cantidad</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.cantidad}
                                    onChange={(e) =>
                                        setData(
                                            'cantidad',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.activo}
                                    onChange={(e) =>
                                        setData('activo', e.target.checked)
                                    }
                                />
                                <Label>Activo</Label>
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
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
