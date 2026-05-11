import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
    Shield,
    KeyRound,
    Eye,
    MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
import { FormInput } from '@/components/form-input';
import { BulkActions } from '@/components/shared/BulkActions';
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
import { ModalShow } from '@/components/ui/ModalShow';
import Pagination from '@/components/ui/Pagination';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP, formatDateCLP } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Almacen {
    id: number;
    nombre: string;
    codigo: string;
}

interface Rol {
    id: number;
    name: string;
}

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
    rut: string | null;
    email: string;
    telefono: string | null;
    fecha_nacimiento: string | null;
    nacionalidad: string | null;
    estado_civil: string | null;
    direccion: string | null;
    comuna: string | null;
    cargo: string | null;
    departamento: string | null;
    fecha_contratacion: string | null;
    tipo_contrato: string | null;
    salario: number | null;
    sueldo_liquido_pactado: number | null;
    afp: string | null;
    sistema_salud: string | null;
    isapre_nombre: string | null;
    banco_nombre: string | null;
    banco_tipo_cuenta: string | null;
    banco_numero_cuenta: string | null;
    estado: string;
    notas: string | null;
    user_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Empleados', href: '/empleados' },
];

const estados = ['activo', 'inactivo', 'vacaciones', 'licencia'];

const bancosChile = [
    'Banco de Chile',
    'Banco Santander',
    'Banco Estado',
    'Banco BCI',
    'Banco Scotiabank',
    'Banco Itaú',
    'Banco Falabella',
    'Banco Ripley',
    'Banco Consorcio',
    'Banco Security',
    'Banco Bice',
    'Banco Internacional',
    'Tenpo',
    'Mach',
    'Coopeuch',
];

const getWhatsAppUrl = (phone: string | null) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    // Asumir Chile (+56) si no tiene código de país
    const finalPhone =
        cleanPhone.length === 9 ? `56${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}`;
};

export default function Index({
    empleados,
    almacenes,
    roles,
}: {
    empleados: {
        data: Empleado[];
        links: any[];
        from?: number;
        to?: number;
        total?: number;
        meta?: any;
    };
    almacenes: Almacen[];
    roles: Rol[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<Empleado | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewing, setViewing] = useState<Empleado | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        nombre: '',
        apellido: '',
        rut: '',
        fecha_nacimiento: '',
        nacionalidad: 'Chilena',
        estado_civil: 'Soltero(a)',
        email: '',
        telefono: '',
        direccion: '',
        comuna: '',
        cargo: '',
        departamento: '',
        fecha_contratacion: '',
        tipo_contrato: 'Indefinido',
        salario: 0,
        sueldo_liquido_pactado: 0,
        afp: '',
        sistema_salud: 'Fonasa',
        isapre_nombre: '',
        banco_nombre: '',
        banco_tipo_cuenta: '',
        banco_numero_cuenta: '',
        estado: 'activo',
        notas: '',
        crear_usuario: false,
        password: '',
        rol_id: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const empleadosFiltrados = useMemo(() => {
        return empleados.data.filter((emp) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (
                    !emp.nombre.toLowerCase().includes(busca) &&
                    !emp.apellido.toLowerCase().includes(busca) &&
                    !emp.email.toLowerCase().includes(busca) &&
                    !(emp.cargo || '').toLowerCase().includes(busca) &&
                    !(emp.departamento || '').toLowerCase().includes(busca)
                ) {
                    return false;
                }
            }
            if (filtros.estado && emp.estado !== filtros.estado) return false;

            return true;
        });
    }, [empleados.data, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditando(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando) {
            put(`/empleados/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditando(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error al actualizar:', errors);
                },
            });
        } else {
            post('/empleados', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error al crear:', errors);
                },
            });
        }
    };

    const handleEdit = (emp: Empleado) => {
        setEditando(emp);
        setData({
            nombre: emp.nombre,
            apellido: emp.apellido,
            rut: emp.rut || '',
            email: emp.email,
            telefono: emp.telefono || '',
            fecha_nacimiento: emp.fecha_nacimiento || '',
            nacionalidad: emp.nacionalidad || 'Chilena',
            estado_civil: emp.estado_civil || 'Soltero(a)',
            direccion: emp.direccion || '',
            comuna: emp.comuna || '',
            cargo: emp.cargo || '',
            departamento: emp.departamento || '',
            fecha_contratacion: emp.fecha_contratacion || '',
            tipo_contrato: emp.tipo_contrato || 'Indefinido',
            salario: emp.salario || 0,
            sueldo_liquido_pactado: emp.sueldo_liquido_pactado || 0,
            afp: emp.afp || '',
            sistema_salud: emp.sistema_salud || 'Fonasa',
            isapre_nombre: emp.isapre_nombre || '',
            banco_nombre: emp.banco_nombre || '',
            banco_tipo_cuenta: emp.banco_tipo_cuenta || '',
            banco_numero_cuenta: emp.banco_numero_cuenta || '',
            estado: emp.estado,
            notas: emp.notas || '',
            crear_usuario: emp.user_id !== null,
            password: '',
            rol_id: '',
        });
        setIsOpen(true);
    };

    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            apellido: '',
            rut: '',
            email: '',
            telefono: '',
            fecha_nacimiento: '',
            nacionalidad: 'Chilena',
            estado_civil: 'Soltero(a)',
            direccion: '',
            comuna: '',
            cargo: '',
            departamento: '',
            fecha_contratacion: '',
            tipo_contrato: 'Indefinido',
            salario: 0,
            sueldo_liquido_pactado: 0,
            afp: '',
            sistema_salud: 'Fonasa',
            isapre_nombre: '',
            banco_nombre: '',
            banco_tipo_cuenta: '',
            banco_numero_cuenta: '',
            estado: 'activo',
            notas: '',
            crear_usuario: false,
            password: '',
            rol_id: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/empleados/${id}`);
    };

    const handleView = (emp: Empleado) => {
        setViewing(emp);
        setIsViewOpen(true);
    };

    const getEstadoBadge = (e: string) => {
        const colores: Record<string, string> = {
            activo: 'bg-green-500',
            inactivo: 'bg-gray-500',
            vacaciones: 'bg-blue-500',
            licencia: 'bg-yellow-500',
        };
        return <Badge className={colores[e] || 'bg-gray-500'}>{e}</Badge>;
    };

    return (
        <>
            <Head title="Empleados" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Empleados</h1>
                            <p className="text-muted-foreground">
                                Directorio de empleados
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <BulkActions
                                baseUrl="/empleados"
                                modelName="Empleados"
                            />
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Empleados</CardTitle>
                            <CardDescription>
                                {empleadosFiltrados.length} empleados
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre, email, cargo o dep..."
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
                                    value={filtros.estado}
                                    onChange={(e) =>
                                        setFiltros({
                                            ...filtros,
                                            estado: e.target.value,
                                        })
                                    }
                                    className="flex h-9 min-w-[150px] rounded-md border bg-background px-3 py-1"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((est) => (
                                        <option key={est} value={est}>
                                            {est.charAt(0).toUpperCase() +
                                                est.slice(1)}
                                        </option>
                                    ))}
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
                                                Nombre / RUT
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Email / Teléfono
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Cargo / Depto
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
                                        {empleadosFiltrados.map((emp) => (
                                            <tr
                                                key={emp.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-medium text-foreground">
                                                        {emp.nombre}{' '}
                                                        {emp.apellido}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        RUT: {emp.rut || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-muted-foreground">
                                                        {emp.email}
                                                    </div>
                                                    {emp.telefono ? (
                                                        <a
                                                            href={getWhatsAppUrl(
                                                                emp.telefono,
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] font-medium text-green-600 hover:text-green-700"
                                                        >
                                                            <MessageCircle className="h-3 w-3" />
                                                            {emp.telefono}
                                                        </a>
                                                    ) : (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            -
                                                        </div>
                                                    )}
                                                    {emp.user_id && (
                                                        <div className="mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-blue-200 bg-blue-50 text-[9px] text-blue-600"
                                                            >
                                                                Acceso
                                                                Plataforma
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {emp.cargo || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {emp.departamento || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(emp.estado)}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(emp)
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
                                                                    emp.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {empleadosFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron empleados
                                                    con los filtros aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Pagination
                                    links={empleados.links}
                                    meta={empleados.meta || empleados}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => !open && handleClose()}
            >
                <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                    <DialogHeader className="shrink-0 p-6 pb-2">
                        <DialogTitle className="text-xl font-bold">
                            {editando ? 'Editar Ficha de Empleado' : 'Contratación de Nuevo Empleado'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="grid gap-6">
                                {/* SECCIÓN 1: DATOS PERSONALES */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-600 border-b pb-1">
                                        Información Personal (Obligatoria)
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <FormInput
                                            label="Nombre *"
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            error={errors.nombre}
                                            required
                                        />
                                        <FormInput
                                            label="Apellido *"
                                            id="apellido"
                                            value={data.apellido}
                                            onChange={(e) => setData('apellido', e.target.value)}
                                            error={errors.apellido}
                                            required
                                        />
                                        <FormInput
                                            label="RUT *"
                                            placeholder="12.345.678-9"
                                            id="rut"
                                            value={data.rut}
                                            onChange={(e) => setData('rut', e.target.value)}
                                            error={errors.rut}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <FormInput
                                            label="Fecha de Nacimiento"
                                            id="fecha_nacimiento"
                                            type="date"
                                            value={data.fecha_nacimiento}
                                            onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                            error={errors.fecha_nacimiento}
                                        />
                                        <div className="space-y-1.5">
                                            <Label htmlFor="nacionalidad">Nacionalidad</Label>
                                            <select
                                                id="nacionalidad"
                                                value={data.nacionalidad}
                                                onChange={(e) => setData('nacionalidad', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="Chilena">Chilena</option>
                                                <option value="Extranjera">Extranjera</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="estado_civil">Estado Civil</Label>
                                            <select
                                                id="estado_civil"
                                                value={data.estado_civil}
                                                onChange={(e) => setData('estado_civil', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="Soltero(a)">Soltero(a)</option>
                                                <option value="Casado(a)">Casado(a)</option>
                                                <option value="Divorciado(a)">Divorciado(a)</option>
                                                <option value="Viudo(a)">Viudo(a)</option>
                                                <option value="Unión Civil">Unión Civil</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-600 border-b pb-1">
                                        Contacto y Residencia
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormInput
                                            label="Email Laboral *"
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={errors.email}
                                            required
                                        />
                                        <FormInput
                                            label="Teléfono Móvil"
                                            id="telefono"
                                            value={data.telefono}
                                            onChange={(e) => setData('telefono', e.target.value)}
                                            error={errors.telefono}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormInput
                                            label="Dirección Particular"
                                            id="direccion"
                                            value={data.direccion}
                                            onChange={(e) => setData('direccion', e.target.value)}
                                            error={errors.direccion}
                                        />
                                        <FormInput
                                            label="Comuna"
                                            id="comuna"
                                            value={data.comuna}
                                            onChange={(e) => setData('comuna', e.target.value)}
                                            error={errors.comuna}
                                        />
                                    </div>
                                </section>

                                {/* SECCIÓN 3: INFORMACIÓN LABORAL Y PREVISIÓN */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-600 border-b pb-1">
                                        Contrato y Previsión (AFP/Salud)
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <FormInput
                                            label="Cargo"
                                            id="cargo"
                                            value={data.cargo}
                                            onChange={(e) => setData('cargo', e.target.value)}
                                            error={errors.cargo}
                                        />
                                        <FormInput
                                            label="Unidad / Depto"
                                            id="departamento"
                                            value={data.departamento}
                                            onChange={(e) => setData('departamento', e.target.value)}
                                            error={errors.departamento}
                                        />
                                        <div className="space-y-1.5">
                                            <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                                            <select
                                                id="tipo_contrato"
                                                value={data.tipo_contrato}
                                                onChange={(e) => setData('tipo_contrato', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="Indefinido">Indefinido</option>
                                                <option value="Plazo Fijo">Plazo Fijo</option>
                                                <option value="Por Obra o Faena">Por Obra o Faena</option>
                                                <option value="Honorarios">Honorarios</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <FormInput
                                            label="Sueldo Base Bruto"
                                            id="salario"
                                            type="number"
                                            value={data.salario}
                                            onChange={(e) => setData('salario', parseInt(e.target.value))}
                                            error={errors.salario}
                                        />
                                        <FormInput
                                            label="Sueldo Líquido Pactado"
                                            id="sueldo_liquido_pactado"
                                            type="number"
                                            value={data.sueldo_liquido_pactado}
                                            onChange={(e) => setData('sueldo_liquido_pactado', parseInt(e.target.value))}
                                            error={errors.sueldo_liquido_pactado}
                                        />
                                        <FormInput
                                            label="Fecha de Ingreso"
                                            id="fecha_contratacion"
                                            type="date"
                                            value={data.fecha_contratacion}
                                            onChange={(e) => setData('fecha_contratacion', e.target.value)}
                                            error={errors.fecha_contratacion}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="afp">AFP</Label>
                                            <select
                                                id="afp"
                                                value={data.afp}
                                                onChange={(e) => setData('afp', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Capital">Capital</option>
                                                <option value="Cuprum">Cuprum</option>
                                                <option value="Habitat">Habitat</option>
                                                <option value="Modelo">Modelo</option>
                                                <option value="PlanVital">PlanVital</option>
                                                <option value="ProVida">ProVida</option>
                                                <option value="Uno">Uno</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="sistema_salud">Salud</Label>
                                            <select
                                                id="sistema_salud"
                                                value={data.sistema_salud}
                                                onChange={(e) => setData('sistema_salud', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="Fonasa">Fonasa</option>
                                                <option value="Isapre">Isapre</option>
                                            </select>
                                        </div>
                                        {data.sistema_salud === 'Isapre' && (
                                            <FormInput
                                                label="Nombre Isapre"
                                                id="isapre_nombre"
                                                value={data.isapre_nombre}
                                                onChange={(e) => setData('isapre_nombre', e.target.value)}
                                                error={errors.isapre_nombre}
                                            />
                                        )}
                                    </div>
                                </section>

                                {/* SECCIÓN 4: DATOS BANCARIOS */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-600 border-b pb-1">
                                        Datos para Depósito de Sueldo
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="banco_nombre">Banco</Label>
                                            <select
                                                id="banco_nombre"
                                                value={data.banco_nombre}
                                                onChange={(e) => setData('banco_nombre', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Seleccionar banco...</option>
                                                {bancosChile.map((banco) => (
                                                    <option key={banco} value={banco}>
                                                        {banco}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.banco_nombre && <p className="text-xs text-destructive">{errors.banco_nombre}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="banco_tipo_cuenta">Tipo Cuenta</Label>
                                            <select
                                                id="banco_tipo_cuenta"
                                                value={data.banco_tipo_cuenta}
                                                onChange={(e) => setData('banco_tipo_cuenta', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Cuenta Corriente">Cuenta Corriente</option>
                                                <option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option>
                                                <option value="Cuenta Ahorro">Cuenta Ahorro</option>
                                            </select>
                                        </div>
                                        <FormInput
                                            label="Nº de Cuenta"
                                            id="banco_numero_cuenta"
                                            value={data.banco_numero_cuenta}
                                            onChange={(e) => setData('banco_numero_cuenta', e.target.value)}
                                            error={errors.banco_numero_cuenta}
                                        />
                                    </div>
                                </section>

                                {/* SECCIÓN 5: ACCESO Y OTROS */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-600 border-b pb-1">
                                        Acceso a Plataforma y Estado
                                    </h3>
                                    <div className="flex items-center space-x-2 rounded-md border bg-blue-50/50 p-3">
                                        <input
                                            type="checkbox"
                                            id="crear_usuario"
                                            checked={data.crear_usuario}
                                            onChange={(e) => setData('crear_usuario', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label
                                            htmlFor="crear_usuario"
                                            className="cursor-pointer text-sm font-medium text-blue-900"
                                        >
                                            Dar acceso a la plataforma (crear usuario de sistema)
                                        </Label>
                                    </div>
                                    {data.crear_usuario && (
                                        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <FormInput
                                                    label="Contraseña"
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    error={errors.password}
                                                    placeholder="Manual (mín 6 caracteres)"
                                                />
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    {editando && editando?.user_id
                                                        ? 'Vacío para mantener actual'
                                                        : 'Vacío: empleadonuevo'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-1 text-xs font-medium">
                                                    <Shield className="h-3 w-3" /> Rol de Permisos
                                                </Label>
                                                <select
                                                    value={data.rol_id}
                                                    onChange={(e) => setData('rol_id', e.target.value)}
                                                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="">Seleccionar rol...</option>
                                                    {roles.map((rol) => (
                                                        <option key={rol.id} value={rol.id}>
                                                            {rol.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Estado de Relación Laboral</Label>
                                            <select
                                                value={data.estado}
                                                onChange={(e) => setData('estado', e.target.value)}
                                                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            >
                                                {estados.map((e) => (
                                                    <option key={e} value={e}>
                                                        {e.charAt(0).toUpperCase() + e.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="notas">Notas Adicionales / Observaciones</Label>
                                        <textarea
                                            id="notas"
                                            value={data.notas}
                                            onChange={(e) => setData('notas', e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Detalles sobre beneficios, bonos, o antecedentes..."
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        <DialogFooter className="shrink-0 border-t bg-muted/10 p-6 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editando ? 'Actualizar Ficha' : 'Registrar Empleado'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ModalShow
                isOpen={isViewOpen}
                setIsOpen={setIsViewOpen}
                item={viewing}
                title="Empleado"
                badgeLabel="Detalle de Empleado"
                colorScheme="teal"
                quickStats={[
                    {
                        label: 'Email',
                        val: viewing?.email || '---',
                        colorScheme: 'blue',
                    },
                    {
                        label: 'Estado',
                        val: viewing?.estado?.toUpperCase() || 'ACTIVO',
                        colorScheme:
                            viewing?.estado === 'activo' ? 'green' : 'rose',
                    },
                    {
                        label: 'Cargo',
                        val: viewing?.cargo || '---',
                        colorScheme: 'purple',
                    },
                ]}
            >
                <div className="grid gap-4 py-4 overflow-y-auto max-h-[70vh]">
                    {/* Información Personal */}
                    <Card className="border-none bg-gray-50/50 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-3">
                            <CardTitle className="text-base font-bold text-gray-800">
                                Información Personal y Residencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">RUT</Label>
                                <p className="font-medium">{viewing?.rut || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">F. Nacimiento</Label>
                                <p className="font-medium">{viewing?.fecha_nacimiento ? formatDateCLP(viewing.fecha_nacimiento) : '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nacionalidad</Label>
                                <p className="font-medium">{viewing?.nacionalidad || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Estado Civil</Label>
                                <p className="font-medium">{viewing?.estado_civil || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Teléfono / WhatsApp</Label>
                                {viewing?.telefono ? (
                                    <a
                                        href={getWhatsAppUrl(viewing.telefono)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 font-medium text-green-600 hover:underline"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {viewing.telefono}
                                    </a>
                                ) : (
                                    <p className="font-medium text-muted-foreground">---</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Dirección / Comuna</Label>
                                <p className="font-medium">
                                    {viewing?.direccion || '---'}{viewing?.comuna ? `, ${viewing.comuna}` : ''}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Laboral y Previsión */}
                    <Card className="border-none bg-gray-50/50 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-3">
                            <CardTitle className="text-base font-bold text-gray-800">
                                Información Contractual y Previsional
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo Contrato</Label>
                                <p className="font-medium">{viewing?.tipo_contrato || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Ingreso</Label>
                                <p className="font-medium">{viewing?.fecha_contratacion ? formatDateCLP(viewing.fecha_contratacion) : '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Sueldo Base</Label>
                                <p className="font-bold text-blue-600">{viewing?.salario ? formatCurrencyCLP(viewing.salario) : '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Líquido Pactado</Label>
                                <p className="font-bold text-green-600">{viewing?.sueldo_liquido_pactado ? formatCurrencyCLP(viewing.sueldo_liquido_pactado) : '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">AFP</Label>
                                <p className="font-medium">{viewing?.afp || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Salud</Label>
                                <p className="font-medium">
                                    {viewing?.sistema_salud || '---'}
                                    {viewing?.isapre_nombre ? ` (${viewing.isapre_nombre})` : ''}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Datos Bancarios */}
                    <Card className="border-none bg-gray-50/50 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-3">
                            <CardTitle className="text-base font-bold text-gray-800">
                                Datos para Pago de Remuneraciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Banco</Label>
                                <p className="font-medium">{viewing?.banco_nombre || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo Cuenta</Label>
                                <p className="font-medium">{viewing?.banco_tipo_cuenta || '---'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nº Cuenta</Label>
                                <p className="font-medium font-mono">{viewing?.banco_numero_cuenta || '---'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {viewing?.notas && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                             <Label className="text-[10px] font-bold text-yellow-700 uppercase">Observaciones</Label>
                             <p className="text-sm text-yellow-900 mt-1">{viewing.notas}</p>
                        </div>
                    )}
                </div>
            </ModalShow>
        </>
    );
}
