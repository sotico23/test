import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, X, CreditCard, AlertTriangle, KeyRound, Globe, Save, CheckCircle2, Copy } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

interface ApiKey {
    id: number;
    nombre: string;
    key: string;
    usuario_id: number | null;
    fecha_expiracion: string | null;
    ultimo_uso: string | null;
    estado: string;
    permisos: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'API Keys', href: '/api-keys' },
];

const estados = ['activa', 'inactiva', 'expirada', 'revocada'];

export default function Index({ apiKeys }: { apiKeys: ApiKey[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editando, setEditando] = useState<ApiKey | null>(null);
    const [tbApiKey, setTbApiKey] = useState('***********************************');
    const [tbCommerceCode, setTbCommerceCode] = useState('597055555532');
    const [tbEnvironment, setTbEnvironment] = useState('integracion');
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        nombre: '',
        key: '',
        usuario_id: '' as string,
        fecha_expiracion: '',
        ultimo_uso: '',
        estado: 'activa',
        permisos: '',
    });

    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
    });

    const apiKeysFiltrados = useMemo(() => {
        return apiKeys.filter((ak) => {
            if (filtros.busqueda) {
                const busca = filtros.busqueda.toLowerCase();
                if (!ak.nombre.toLowerCase().includes(busca)) {
                    return false;
                }
            }
            if (filtros.estado && ak.estado !== filtros.estado) return false;

            return true;
        });
    }, [apiKeys, filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            usuario_id: data.usuario_id ? Number(data.usuario_id) : null,
        };
        if (editando) {
            put(`/api-keys/${editando.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/api-keys', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (ak: ApiKey) => {
        setEditando(ak);
        setData({
            nombre: ak.nombre,
            key: ak.key,
            usuario_id: String(ak.usuario_id || ''),
            fecha_expiracion: ak.fecha_expiracion || '',
            ultimo_uso: ak.ultimo_uso || '',
            estado: ak.estado,
            permisos: ak.permisos || '',
        });
        setIsOpen(true);
    };
    const handleNew = () => {
        reset();
        setData({
            nombre: '',
            key: `sk_${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
            usuario_id: '',
            fecha_expiracion: '',
            ultimo_uso: '',
            estado: 'activa',
            permisos: '',
        });
        setEditando(null);
        setIsOpen(true);
    };
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar?')) destroy(`/api-keys/${id}`);
    };
    const getEstadoBadge = (estado: string) => {
        const colores: Record<string, string> = {
            activa: 'bg-green-500',
            inactiva: 'bg-gray-500',
            expirada: 'bg-red-500',
            revocada: 'bg-orange-500',
        };
        return (
            <Badge className={colores[estado] || 'bg-gray-500'}>{estado}</Badge>
        );
    };

    return (
        <>
            <Head title="API Keys" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">API Keys</h1>
                            <p className="text-muted-foreground">
                                Gestión de claves API
                            </p>
                        </div>
                        <Button onClick={handleNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                {apiKeysFiltrados.length} registros
                                encontrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-muted/30 p-3 text-xs sm:text-sm">
                                <div className="min-w-[200px] flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre..."
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
                                    className="flex h-9 rounded-md border bg-background px-3 py-1 min-w-[150px]"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((e) => (
                                        <option key={e} value={e}>
                                            {e.toUpperCase()}
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
                                                Nombre / Permisos
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Key
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Expiración
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
                                        {apiKeysFiltrados.map((ak) => (
                                            <tr
                                                key={ak.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {ak.nombre}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        P:{' '}
                                                        {ak.permisos || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 font-mono text-[10px] text-muted-foreground">
                                                    {ak.key.substring(
                                                        0,
                                                        15,
                                                    )}
                                                    ...
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-[10px]">
                                                        {ak.fecha_expiracion
                                                            ? new Date(
                                                                ak.fecha_expiracion,
                                                            ).toLocaleDateString()
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {getEstadoBadge(
                                                        ak.estado,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                handleEdit(ak)
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
                                                                    ak.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {apiKeysFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron API
                                                    keys con los filtros
                                                    aplicados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transbank Config Here */}
                    <div className="mt-12 mb-4 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
                            <CreditCard className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                Transbank Webpay Plus
                            </h2>
                            <p className="font-medium text-slate-500 text-sm">
                                Configura tus credenciales y entorno de pagos online.
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/10 flex items-start gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-lg font-black text-amber-800 dark:text-amber-500">
                                Validación Técnica para Producción
                            </h4>
                            <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                                Para pasar a <strong>Producción</strong>, debes completar el proceso de validación técnica de Transbank. 
                                Una vez superadas las pruebas en el ambiente de Integración, Transbank te entregará el Código de Comercio 
                                y la Llave Secreta definitivos. Asegúrate de no compartir estos datos con nadie.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-6 flex items-center gap-3">
                                    <KeyRound className="h-5 w-5 text-indigo-500" />
                                    <h3 className="text-xl font-black tracking-tight uppercase">Credenciales de API</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Entorno
                                        </label>
                                        <div className="flex bg-slate-50 p-1 rounded-2xl dark:bg-slate-800">
                                            <button 
                                                onClick={() => setTbEnvironment('integracion')}
                                                className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${tbEnvironment === 'integracion' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Integración
                                            </button>
                                            <button 
                                                onClick={() => setTbEnvironment('produccion')}
                                                className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${tbEnvironment === 'produccion' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Producción
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Código de Comercio</label>
                                        <input 
                                            type="text" 
                                            value={tbCommerceCode}
                                            onChange={(e) => setTbCommerceCode(e.target.value)}
                                            className="h-14 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 font-mono text-sm tracking-widest text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                            placeholder="5970..." 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            ApiKey Secret (Llave Secreta)
                                        </label>
                                        <input 
                                            type="password" 
                                            value={tbApiKey}
                                            onChange={(e) => setTbApiKey(e.target.value)}
                                            className="h-14 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 font-mono text-sm tracking-widest text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                            placeholder="Ingresa tu ApiKey Secret" 
                                        />
                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-2">
                                            Los caracteres se ocultan por seguridad. Si ya tienes una llave guardada y funciona, no necesitas cambiarla.
                                        </p>
                                    </div>

                                    <Button className="h-14 w-full rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:shadow-lg transition-all">
                                        <Save className="mr-2 h-4 w-4" /> Guardar Credenciales
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="rounded-[2.5rem] border border-blue-100 bg-blue-50/50 p-8 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-blue-500" />
                                        <h3 className="text-xl font-black tracking-tight uppercase">Webhooks</h3>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest">
                                        Activo
                                    </Badge>
                                </div>

                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                    URL para informar los resultados de pago asíncronos. Fundamental para evitar pagos perdidos en caso de que el cliente cierre antes de regresar a la tienda.
                                </p>

                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-white p-4 border border-blue-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Endpoint de Confirmación</label>
                                        <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl dark:bg-slate-900">
                                            <span className="text-xs font-mono text-slate-600 truncate flex-1">
                                                https://tudominio.cl/api/webpay/webhook
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-blue-600 hover:bg-blue-100">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 text-sm text-emerald-600 dark:text-emerald-500 font-bold">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Último webhook recibido: Hoy, 15:42
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar' : 'Nueva'} API Key
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
                                <Label>Key</Label>
                                <Input
                                    value={data.key}
                                    onChange={(e) =>
                                        setData('key', e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Expiración</Label>
                                    <Input
                                        type="date"
                                        value={data.fecha_expiracion}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_expiracion',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <select
                                        value={data.estado}
                                        onChange={(e) =>
                                            setData('estado', e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {estados.map((e) => (
                                            <option key={e} value={e}>
                                                {e}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Permisos</Label>
                                <Input
                                    value={data.permisos}
                                    onChange={(e) =>
                                        setData('permisos', e.target.value)
                                    }
                                    placeholder="read,write"
                                />
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
