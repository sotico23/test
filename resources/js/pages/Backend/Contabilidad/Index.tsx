import { Head, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, Calculator, Search, X } from 'lucide-react';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface DetalleAsiento {
    id?: number;
    cuenta: string;
    cuenta_codigo: string;
    descripcion: string;
    debe: number;
    haber: number;
}

interface Asiento {
    id: number;
    fecha: string;
    numero: string;
    descripcion: string;
    tipo: string;
    total_debe: number;
    total_haber: number;
    estado: boolean;
    detalles: DetalleAsiento[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Contabilidad', href: '/contabilidad' },
];

export default function Index({ asientos }: { asientos: { data: Asiento[]; links: any[]; from?: number; to?: number; total?: number; meta?: any } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Asiento | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        fecha: '',
        numero: '',
        descripcion: '',
        tipo: 'diario',
        detalles: [] as DetalleAsiento[],
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
    });

    const asientosFiltrados = useMemo(() => {
        return asientos.data.filter((a) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !a.numero.toLowerCase().includes(busca) &&
                    !a.descripcion.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.tipo && a.tipo !== filtros.tipo) return false;

            return true;
        });
    }, [asientos.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: '',
        });
    };

    const handleAddDetalle = () => {
        setData('detalles', [
            ...data.detalles,
            {
                cuenta: '',
                cuenta_codigo: '',
                descripcion: '',
                debe: 0,
                haber: 0,
            },
        ]);
    };

    const handleRemoveDetalle = (index: number) => {
        const newDetalles = data.detalles.filter((_, i) => i !== index);
        setData('detalles', newDetalles);
    };

    const handleDetalleChange = (
        index: number,
        field: keyof DetalleAsiento,
        value: string | number,
    ) => {
        const newDetalles = [...data.detalles];
        newDetalles[index] = { ...newDetalles[index], [field]: value };
        setData('detalles', newDetalles);
    };

    const totalDebe = data.detalles.reduce(
        (sum, d) => sum + (Number(d.debe) || 0),
        0,
    );
    const totalHaber = data.detalles.reduce(
        (sum, d) => sum + (Number(d.haber) || 0),
        0,
    );
    const isBalanced = totalDebe === totalHaber && totalDebe > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contabilidad', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este asiento?')) {
            destroy(`/contabilidad/${id}`);
        }
    };

    return (
        <>
            <Head title="Contabilidad" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Contabilidad</h1>
                            <p className="text-muted-foreground">
                                Gestione los asientos contables
                            </p>
                        </div>
                        <Button onClick={() => setIsOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Asiento
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Asientos Contables</CardTitle>
                            <CardDescription>
                                {asientosFiltrados.length} registros
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por número o descripción..."
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
                                    value={filtros.tipo}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            tipo: e.target.value,
                                        })
                                    }
                                    className="flex h-9 rounded-md border bg-background px-3 py-1 min-w-[150px]"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="diario">Diario</option>
                                    <option value="apertura">Apertura</option>
                                    <option value="cierre">Cierre</option>
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
                            {asientosFiltrados.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No se encontraron asientos con los filtros
                                    aplicados
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {asientosFiltrados.map((asiento) => (
                                        <div
                                            key={asiento.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <span className="font-mono text-sm">
                                                            #{asiento.numero}
                                                        </span>
                                                        <p className="font-medium">
                                                            {
                                                                asiento.descripcion
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDateCLP(asiento.fecha)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm">
                                                            Debe
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatCurrencyCLP(asiento.total_debe)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm">
                                                            Haber
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatCurrencyCLP(asiento.total_haber)}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            asiento.estado
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {asiento.estado
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                asiento.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {asiento.detalles &&
                                                asiento.detalles.length > 0 && (
                                                    <div className="mt-4 border-t pt-4">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-muted-foreground">
                                                                    <th className="py-1 text-left">
                                                                        Código
                                                                    </th>
                                                                    <th className="py-1 text-left">
                                                                        Cuenta
                                                                    </th>
                                                                    <th className="py-1 text-right">
                                                                        Debe
                                                                    </th>
                                                                    <th className="py-1 text-right">
                                                                        Haber
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {asiento.detalles.map(
                                                                    (
                                                                        detalle,
                                                                        idx,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="border-t"
                                                                        >
                                                                            <td className="py-1 font-mono">
                                                                                {
                                                                                    detalle.cuenta_codigo
                                                                                }
                                                                            </td>
                                                                            <td className="py-1">
                                                                                {
                                                                                    detalle.cuenta
                                                                                }
                                                                            </td>
                                                                            <td className="py-1 text-right">
                                                                                {formatCurrencyCLP(detalle.debe)}
                                                                            </td>
                                                                            <td className="py-1 text-right">
                                                                                {formatCurrencyCLP(detalle.haber)}
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4">
                                <Pagination links={asientos.links} meta={asientos.meta || asientos} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nuevo Asiento Contable</DialogTitle>
                            <DialogDescription>
                                Ingrese los datos del asiento
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Número</Label>
                                        <Input
                                            id="numero"
                                            value={data.numero}
                                            onChange={(e) =>
                                                setData(
                                                    'numero',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0001"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha">Fecha</Label>
                                        <Input
                                            id="fecha"
                                            type="date"
                                            value={data.fecha}
                                            onChange={(e) =>
                                                setData('fecha', e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">
                                        Descripción
                                    </Label>
                                    <Input
                                        id="descripcion"
                                        value={data.descripcion}
                                        onChange={(e) =>
                                            setData(
                                                'descripcion',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Descripción del asiento"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <select
                                        id="tipo"
                                        value={data.tipo}
                                        onChange={(e) =>
                                            setData('tipo', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        <option value="diario">Diario</option>
                                        <option value="apertura">
                                            Apertura
                                        </option>
                                        <option value="cierre">Cierre</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Detalles</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddDetalle}
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Agregar
                                        </Button>
                                    </div>
                                    <div className="max-h-60 space-y-2 overflow-y-auto">
                                        {data.detalles.map((detalle, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <Input
                                                    placeholder="Código"
                                                    value={
                                                        detalle.cuenta_codigo
                                                    }
                                                    onChange={(e) =>
                                                        handleDetalleChange(
                                                            index,
                                                            'cuenta_codigo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-24"
                                                    required
                                                />
                                                <Input
                                                    placeholder="Cuenta"
                                                    value={detalle.cuenta}
                                                    onChange={(e) =>
                                                        handleDetalleChange(
                                                            index,
                                                            'cuenta',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1"
                                                    required
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Debe"
                                                    value={detalle.debe || ''}
                                                    onChange={(e) =>
                                                        handleDetalleChange(
                                                            index,
                                                            'debe',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="w-28"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Haber"
                                                    value={detalle.haber || ''}
                                                    onChange={(e) =>
                                                        handleDetalleChange(
                                                            index,
                                                            'haber',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="w-28"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleRemoveDetalle(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-2">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="h-4 w-4" />
                                            <span className="text-sm">
                                                Totales:
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span
                                                className={
                                                    isBalanced
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                Debe: {formatCurrencyCLP(totalDebe)}
                                            </span>
                                            <span
                                                className={
                                                    isBalanced
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                Haber: {formatCurrencyCLP(totalHaber)}
                                            </span>
                                            {isBalanced && (
                                                <Badge variant="default">
                                                    <Check className="mr-1 h-3 w-3" />
                                                    Balanceado
                                                </Badge>
                                            )}
                                        </div>
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
                                <Button type="submit" disabled={!isBalanced}>
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
