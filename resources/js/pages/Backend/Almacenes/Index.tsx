import { Head, router, useForm } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileSpreadsheet, FileJson, Download, Upload } from 'lucide-react';
import { Pencil, Plus, Trash2, Search, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import InputError from '@/components/input-error';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
    cargo: string | null;
}

interface Almacen {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string | null;
    telefono: string | null;
    responsable: string | null;
    capacidad: number | null;
    tipo: string;
    activo: boolean;
    notas: string | null;
    empleados?: Empleado[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Almacenes', href: '/almacenes' },
];

const tipos = ['principal', 'secundario', 'tienda'];

export default function Index({
    almacenes,
    empleados,
}: {
    almacenes: {
        data: Almacen[];
        links: any[];
        meta?: any;
        total: number;
    };
    empleados: Empleado[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editando, setEditando] = useState<Almacen | null>(null);
    const [viendo, setViendo] = useState<Almacen | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        codigo: '',
        direccion: '',
        telefono: '',
        responsable_id: '' as string | number,
        capacidad: 0,
        tipo: 'principal',
        activo: true,
        notas: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        activo: '',
    });

    const almacenesFiltrados = useMemo(() => {
        return almacenes.data.filter((a) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !a.nombre.toLowerCase().includes(busca) &&
                    !a.codigo.toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.tipo && a.tipo !== filtros.tipo) return false;
            if (filtros.activo !== '') {
                const isActivo = filtros.activo === '1';
                if (a.activo !== isActivo) return false;
            }
            return true;
        });
    }, [almacenes, filtros]);

    const limpiarFiltros = () => {
        setFiltros({ busqueda: '', tipo: '', activo: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/almacenes/${editando.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                    alert('Almacén actualizado correctamente');
                },
                onError: (errors) => {
                    if (errors.codigo) {
                        alert('Error: ' + errors.codigo);
                    } else {
                        alert('Error al actualizar');
                    }
                },
            });
        } else {
            post('/almacenes', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    alert('Almacén creado correctamente');
                },
                onError: (errors) => {
                    if (errors.codigo) {
                        alert('Error: ' + errors.codigo);
                    } else {
                        alert('Error al crear');
                    }
                },
            });
        }
    };

    const handleEdit = (almacen: Almacen) => {
        setEditando(almacen);
        let respId: string | number = '';
        if (almacen.empleados && almacen.empleados.length > 0) {
            respId = almacen.empleados[0].id;
        }
        setData({
            nombre: almacen.nombre,
            codigo: almacen.codigo,
            direccion: almacen.direccion || '',
            telefono: almacen.telefono || '',
            responsable_id: respId,
            capacidad: almacen.capacidad || 0,
            tipo: almacen.tipo,
            activo: Boolean(almacen.activo),
            notas: almacen.notas || '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            codigo: '',
            direccion: '',
            telefono: '',
            responsable_id: '',
            capacidad: 0,
            tipo: 'principal',
            activo: true,
            notas: '',
        });
        setEditando(null);
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar almacén?')) {
            destroy(`/almacenes/${id}`);
        }
    };

    const handleExportCsv = () => {
        window.location.href = '/almacenes/export';
    };

    const handleExportExcel = () => {
        window.location.href = '/almacenes/export-excel';
    };

    const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        router.post('/almacenes/import', formData, {
            onSuccess: () => {
                alert('Importación CSV completada');
            },
            onError: (err) => {
                console.error(err);
                alert('Error al importar CSV: ' + Object.values(err)[0]);
            },
        });
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        router.post('/almacenes/import-excel', formData, {
            onSuccess: () => {
                alert('Importación Excel completada');
            },
            onError: (err) => {
                console.error(err);
                alert('Error al importar Excel: ' + Object.values(err)[0]);
            },
        });
    };

    return (
        <>
            <Head title="Almacenes" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Almacenes</h1>
                            <p className="text-muted-foreground">
                                Gestión de almacenes
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-2 rounded-xl border-muted-foreground/10 font-bold"
                                        >
                                            <Download className="h-4 w-4 text-primary" />
                                            <span>Herramientas</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                    >
                                        <DropdownMenuItem>
                                            <label className="flex cursor-pointer items-center">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Importar CSV
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleImportCsv}
                                                    className="absolute inset-0 cursor-pointer opacity-0"
                                                />
                                            </label>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <label className="flex cursor-pointer items-center">
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                Importar Excel
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={handleImportExcel}
                                                    className="absolute inset-0 cursor-pointer opacity-0"
                                                />
                                            </label>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    '/almacenes/export')
                                            }
                                        >
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Exportar CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    '/almacenes/export-excel')
                                            }
                                        >
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Exportar Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={handleNew}>
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Almacenes</CardTitle>
                            <CardDescription>
                                {almacenes.total} registros
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar..."
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
                                    className="flex h-9 min-w-[120px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los tipos</option>
                                    {tipos.map((t) => (
                                        <option key={t} value={t}>
                                            {t.charAt(0).toUpperCase() +
                                                t.slice(1)}
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
                                    <option value="">Todos</option>
                                    <option value="1">Activos</option>
                                    <option value="0">Inactivos</option>
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    onClick={limpiarFiltros}
                                >
                                    <X className="mr-1 h-4 w-4" /> Limpiar
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="pb-3 text-left font-medium">
                                                Nombre
                                            </th>
                                            <th className="pb-3 text-left font-medium">
                                                Código
                                            </th>
                                            <th className="pb-3 text-left font-medium">
                                                Tipo
                                            </th>
                                            <th className="pb-3 text-left font-medium">
                                                Estado
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {almacenesFiltrados.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 font-medium">
                                                    {a.nombre}
                                                </td>
                                                <td className="px-4 py-2 font-mono text-muted-foreground">
                                                    {a.codigo}
                                                </td>
                                                <td className="px-4 py-2 capitalize">
                                                    {a.tipo}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Badge
                                                        variant={
                                                            a.activo
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className="px-1.5 py-0 text-[10px]"
                                                    >
                                                        {a.activo
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setViendo(a);
                                                                setIsViewOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(a)
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
                                                                    a.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {almacenesFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    Sin resultados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                links={almacenes.links}
                                meta={
                                    almacenes.meta || {
                                        from: (almacenes as any).from,
                                        to: (almacenes as any).to,
                                        total: almacenes.total,
                                    }
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar Almacén' : 'Nuevo Almacén'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="col-span-2 grid gap-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Código</Label>
                                <Input
                                    value={data.codigo}
                                    onChange={(e) =>
                                        setData('codigo', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo</Label>
                                <select
                                    value={data.tipo}
                                    onChange={(e) =>
                                        setData('tipo', e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                >
                                    {tipos.map((t) => (
                                        <option key={t} value={t}>
                                            {t.charAt(0).toUpperCase() +
                                                t.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2 grid gap-2">
                                <Label>Dirección</Label>
                                <Input
                                    value={data.direccion}
                                    onChange={(e) =>
                                        setData('direccion', e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Capacidad</Label>
                                <Input
                                    type="number"
                                    value={data.capacidad}
                                    onChange={(e) =>
                                        setData(
                                            'capacidad',
                                            parseInt(e.target.value),
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Responsable</Label>
                                <select
                                    value={data.responsable_id}
                                    onChange={(e) =>
                                        setData(
                                            'responsable_id',
                                            e.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                >
                                    <option value="">Sin asignar</option>
                                    {empleados.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.nombre} {emp.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Notas</Label>
                                <Input
                                    value={data.notas}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
                                    }
                                />
                            </div>
                            <div className="col-span-2 grid gap-2">
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={data.activo}
                                        onChange={(e) =>
                                            setData('activo', e.target.checked)
                                        }
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="activo"
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        Activo
                                    </Label>
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
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden border-none bg-white p-0 shadow-xl">
                    <DialogHeader className="relative overflow-hidden px-8 pt-10 pb-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-orange-800 to-yellow-950 opacity-100" />
                        <div className="absolute top-0 right-0 p-8 text-white opacity-20">
                            <Eye className="h-24 w-24 rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-1 text-white">
                            <Badge className="w-fit border-none bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/30">
                                Detalle de Almacén
                            </Badge>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                                {viendo?.nombre}
                            </DialogTitle>
                            <DialogDescription className="text-lg font-medium text-amber-100/80">
                                Información y configuración de almacenamiento.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    {viendo && (
                        <div className="relative z-20 -mt-10 mb-6 flex max-h-[calc(90vh-180px)] flex-col gap-6 overflow-y-auto px-8">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {[
                                    {
                                        label: 'Código',
                                        val: viendo.codigo,
                                        color: 'border-amber-200 bg-amber-50 text-amber-800',
                                    },
                                    {
                                        label: 'Tipo',
                                        val: viendo.tipo,
                                        color: 'border-orange-200 bg-orange-50 text-orange-800',
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
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${item.color}`}
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
                            <Card className="border-none bg-gray-50/50 shadow-sm">
                                <CardHeader className="border-b border-gray-100 pb-3">
                                    <CardTitle className="text-base font-bold text-gray-800">
                                        Información General
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 p-5">
                                    {viendo.direccion && (
                                        <div className="col-span-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Dirección
                                            </Label>
                                            <p className="font-medium">
                                                {viendo.direccion}
                                            </p>
                                        </div>
                                    )}
                                    {viendo.telefono && (
                                        <div>
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Teléfono
                                            </Label>
                                            <p className="font-medium">
                                                {viendo.telefono}
                                            </p>
                                        </div>
                                    )}
                                    {viendo.capacidad &&
                                        viendo.capacidad > 0 && (
                                            <div>
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Capacidad
                                                </Label>
                                                <p className="font-medium">
                                                    {viendo.capacidad} unidades
                                                </p>
                                            </div>
                                        )}
                                    {viendo.empleados?.length ? (
                                        <div className="col-span-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Responsable(s)
                                            </Label>
                                            <p className="font-medium">
                                                {viendo.empleados
                                                    .map(
                                                        (e) =>
                                                            `${e.nombre} ${e.apellido}`,
                                                    )
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="col-span-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Notas
                                            </Label>
                                            <p className="font-medium">
                                                {viendo.notas || '-'}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <DialogFooter className="border-t bg-gray-50 p-4">
                        <Button onClick={() => setIsViewOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
