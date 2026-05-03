import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { BulkActions } from '@/components/shared/BulkActions';

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
    cargo: string | null;
}

interface Asistencia {
    id: number;
    empleado_id: number | null;
    fecha: string | null;
    hora_entrada: string | null;
    hora_salida: string | null;
    horas_trabajadas: number | null;
    estado: string;
    notas: string | null;
    empleado?: Empleado;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Asistencia', href: '/asistencia' },
];

const estados = [
    'presente',
    'ausente',
    'vacaciones',
    'licencia',
    'permiso',
    'teletrabajo',
];

export default function Index({
    asistencias,
    empleados = [],
}: {
    asistencias: {
        data: Asistencia[];
        links: any[];
        meta?: any;
        total: number;
    };
    empleados?: Empleado[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Asistencia | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        empleado_id: '' as string,
        fecha: '',
        hora_entrada: '',
        hora_salida: '',
        horas_trabajadas: 0,
        estado: 'presente',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/asistencia/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                    window.location.reload();
                },
            });
        } else {
            post('/asistencia', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    window.location.reload();
                },
            });
        }
    };

    const handleEdit = (a: Asistencia) => {
        setEditando(a);
        setData({
            empleado_id: String(a.empleado_id || ''),
            fecha: a.fecha ? a.fecha.split('T')[0] : '',
            hora_entrada: a.hora_entrada || '',
            hora_salida: a.hora_salida || '',
            horas_trabajadas: a.horas_trabajadas || 0,
            estado: a.estado,
            notas: a.notas || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/asistencia/${id}`);
    };

    const openNew = () => {
        setEditando(null);
        reset();
        setIsOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asistencia" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Asistencia</h1>
                        <p className="text-muted-foreground">
                            Control de asistencia de empleados
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <BulkActions
                            baseUrl="/asistencia"
                            modelName="Asistencia"
                        />
                        <Button onClick={openNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Registro
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registros de Asistencia</CardTitle>
                        <CardDescription>
                            {asistencias.total} registros encontrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {asistencias.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No hay registros de asistencia
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-2 py-2 text-left font-medium">
                                                Fecha
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Empleado
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Entrada
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Salida
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Horas
                                            </th>
                                            <th className="px-2 py-2 text-left font-medium">
                                                Estado
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asistencias.data.map((a) => (
                                            <tr key={a.id} className="border-b">
                                                <td className="px-2 py-2">
                                                    {a.fecha
                                                        ? a.fecha.split('T')[0]
                                                        : '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {a.empleado
                                                        ? `${a.empleado.nombre} ${a.empleado.apellido}`
                                                        : '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {a.hora_entrada || '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {a.hora_salida || '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {a.horas_trabajadas || '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className="capitalize">
                                                        {a.estado}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleEdit(a)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500"
                                                        onClick={() =>
                                                            handleDelete(a.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Pagination
                            links={asistencias.links}
                            meta={
                                asistencias.meta || {
                                    from: (asistencias as any).from,
                                    to: (asistencias as any).to,
                                    total: asistencias.total,
                                }
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nuevo'} Registro
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Empleado</Label>
                                <Select
                                    value={data.empleado_id}
                                    onValueChange={(v) =>
                                        setData('empleado_id', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {empleados.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={emp.id.toString()}
                                            >
                                                {emp.nombre} {emp.apellido}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.empleado_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.empleado_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={data.fecha}
                                    onChange={(e) =>
                                        setData('fecha', e.target.value)
                                    }
                                />
                                {errors.fecha && (
                                    <p className="text-sm text-red-500">
                                        {errors.fecha}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hora Entrada</Label>
                                    <Input
                                        placeholder="08:00"
                                        value={data.hora_entrada}
                                        onChange={(e) =>
                                            setData(
                                                'hora_entrada',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.hora_entrada && (
                                        <p className="text-sm text-red-500">
                                            {errors.hora_entrada}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Hora Salida</Label>
                                    <Input
                                        placeholder="17:00"
                                        value={data.hora_salida}
                                        onChange={(e) =>
                                            setData(
                                                'hora_salida',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.hora_salida && (
                                        <p className="text-sm text-red-500">
                                            {errors.hora_salida}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Horas Trabajadas</Label>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={data.horas_trabajadas}
                                        onChange={(e) =>
                                            setData(
                                                'horas_trabajadas',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.horas_trabajadas && (
                                        <p className="text-sm text-red-500">
                                            {errors.horas_trabajadas}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(v) =>
                                            setData('estado', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estados.map((e) => (
                                                <SelectItem key={e} value={e}>
                                                    {e}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.estado && (
                                        <p className="text-sm text-red-500">
                                            {errors.estado}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notas</Label>
                                <Input
                                    value={data.notas}
                                    onChange={(e) =>
                                        setData('notas', e.target.value)
                                    }
                                />
                                {errors.notas && (
                                    <p className="text-sm text-red-500">
                                        {errors.notas}
                                    </p>
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
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
