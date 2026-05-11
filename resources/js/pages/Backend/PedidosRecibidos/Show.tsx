import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Phone,
    User,
    Package,
    MessageSquare,
    Send,
    CheckCircle,
    Paperclip,
    FileIcon,
    X,
    Download,
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PedidoItem {
    id: number;
    nombre_producto: string;
    cantidad: number;
    subtotal: number;
    precio_unitario: number;
}

interface Mensaje {
    id: number;
    sender_id: number;
    contenido: string;
    created_at: string;
    sender: { name: string; profile_photo_path?: string };
    file_url?: string;
    file_name?: string;
    is_image?: boolean;
}

interface Pedido {
    id: number;
    numero_pedido: string;
    estado: string;
    nombre_cliente: string;
    telefono_cliente?: string;
    direccion_cliente?: string;
    metodo_pago?: string;
    notas?: string;
    subtotal: number;
    impuesto: number;
    total: number;
    created_at: string;
    items: PedidoItem[];
    cliente: { id: number; name: string } | null;
    user_id: number; // Vendedor
    conversacion?: { id: number; mensajes: Mensaje[] };
}

export default function Show({ pedido, auth }: { pedido: Pedido; auth: any }) {
    const [mensajes, setMensajes] = useState<Mensaje[]>(
        pedido.conversacion?.mensajes || [],
    );
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const mEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const estadoForm = useForm({
        estado: pedido.estado,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pedidos Recibidos', href: '/pedidos-recibidos' },
        {
            title: `Pedido #${pedido.numero_pedido}`,
            href: `/pedidos-recibidos/${pedido.id}`,
        },
    ];

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmado':
                return 'bg-blue-100 text-blue-800';
            case 'preparando':
                return 'bg-orange-100 text-orange-800';
            case 'enviado':
                return 'bg-purple-100 text-purple-800';
            case 'entregado':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    const handleActualizarEstado = (e: React.FormEvent) => {
        e.preventDefault();
        estadoForm.put(`/pedidos-recibidos/${pedido.id}/estado`);
    };

    const handleGenerarVenta = () => {
        if (
            confirm(
                '¿Estás seguro de que quieres convertir este pedido en una Venta Oficial?',
            )
        ) {
            router.post(`/pedidos-recibidos/${pedido.id}/venta`);
        }
    };

    const handleEnviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!nuevoMensaje.trim() && !selectedFile) || !pedido.conversacion?.id)
            return;

        setIsLoadingChat(true);
        try {
            const formData = new FormData();
            formData.append('contenido', nuevoMensaje);
            if (selectedFile) {
                formData.append('archivo', selectedFile);
            }

            const resp = await fetch(
                `/conversaciones-pedidos/${pedido.conversacion.id}/mensajes`,
                {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN':
                            document.head
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: formData,
                },
            );

            if (resp.ok) {
                const data = await resp.json();
                setMensajes([...mensajes, data.mensaje]);
                setNuevoMensaje('');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => scrollToBottom(), 100);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const fetchMensajes = async () => {
        if (!pedido.conversacion?.id) return;
        try {
            const resp = await fetch(
                `/conversaciones-pedidos/${pedido.conversacion.id}/mensajes`,
            );
            if (resp.ok) {
                const data = await resp.json();
                setMensajes(data.mensajes);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const scrollToBottom = () => {
        mEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Opcional: Polling cada 10s si se requiere tiempo real rudimentario
        const interval = setInterval(fetchMensajes, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido #${pedido.numero_pedido}`} />

            <div className="flex h-full flex-col space-y-6 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/pedidos-recibidos">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="flex items-center space-x-3 text-2xl font-bold text-gray-900">
                                <span>Pedido #{pedido.numero_pedido}</span>
                                <Badge
                                    className={getEstadoColor(pedido.estado)}
                                >
                                    {pedido.estado.toUpperCase()}
                                </Badge>
                            </h1>
                            <p className="mt-1 flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-3 w-3" />{' '}
                                {new Date(pedido.created_at).toLocaleString(
                                    'es-CL',
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <form
                            onSubmit={handleActualizarEstado}
                            className="flex items-center space-x-2 rounded-md border bg-white p-1 shadow-sm"
                        >
                            <Select
                                value={estadoForm.data.estado}
                                onValueChange={(val) =>
                                    estadoForm.setData('estado', val)
                                }
                                disabled={estadoForm.processing}
                            >
                                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
                                    <SelectValue placeholder="Estado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">
                                        Pendiente
                                    </SelectItem>
                                    <SelectItem value="confirmado">
                                        Confirmado
                                    </SelectItem>
                                    <SelectItem value="preparando">
                                        En Preparación
                                    </SelectItem>
                                    <SelectItem value="enviado">
                                        Enviado
                                    </SelectItem>
                                    <SelectItem value="entregado">
                                        Entregado
                                    </SelectItem>
                                    <SelectItem value="cancelado">
                                        Cancelado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={
                                    estadoForm.processing ||
                                    estadoForm.data.estado === pedido.estado
                                }
                            >
                                Actualizar
                            </Button>
                        </form>

                        <Button
                            onClick={handleGenerarVenta}
                            disabled={pedido.estado === 'cancelado'}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Convertir a
                            Venta
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Información y Productos */}
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Package className="mr-2 h-5 w-5 text-indigo-500" />{' '}
                                    Productos Solicitados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">
                                                Precio
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Cant.
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Subtotal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pedido.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium text-gray-900">
                                                    {item.nombre_producto}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600">
                                                    {formatCurrency(
                                                        item.precio_unitario,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">
                                                    {item.cantidad}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-gray-900">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-6 flex flex-col items-end space-y-2 border-t pt-4">
                                    <div className="flex w-48 justify-between text-sm text-gray-600">
                                        <span>Subtotal:</span>
                                        <span>
                                            {formatCurrency(pedido.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex w-48 justify-between text-sm text-gray-600">
                                        <span>IVA:</span>
                                        <span>
                                            {formatCurrency(pedido.impuesto)}
                                        </span>
                                    </div>
                                    <div className="flex w-48 justify-between border-t pt-2 text-lg font-bold text-gray-900">
                                        <span>Total:</span>
                                        <span>
                                            {formatCurrency(pedido.total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {pedido.notas && (
                            <Card className="border-amber-200 bg-amber-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm tracking-wide text-amber-800 uppercase">
                                        Notas del Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-amber-900 italic">
                                        {pedido.notas}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Cliente y Chat */}
                    <div className="flex h-full flex-col space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <User className="mr-2 h-5 w-5 text-indigo-500" />{' '}
                                    Datos del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                        Nombre
                                    </span>
                                    <div className="mt-1 font-medium text-gray-900">
                                        {pedido.nombre_cliente}{' '}
                                        {pedido.cliente
                                            ? `(@${pedido.cliente.name})`
                                            : ''}
                                    </div>
                                </div>
                                {pedido.telefono_cliente && (
                                    <div>
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Teléfono
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">
                                                {pedido.telefono_cliente}
                                            </span>
                                            {pedido.telefono_cliente && (
                                                <a
                                                    href={`https://wa.me/${pedido.telefono_cliente.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(pedido.nombre_cliente)},%20te%20contacto%20desde%20tu%20pedido%20%23${pedido.numero_pedido}%20-%20Estado:%20${pedido.estado}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600"
                                                >
                                                    <MessageCircle className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {pedido.direccion_cliente && (
                                    <div>
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Dirección de Entrega
                                        </span>
                                        <div className="mt-1 flex items-start text-gray-900">
                                            <MapPin className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-gray-400" />
                                            <span className="leading-tight">
                                                {pedido.direccion_cliente}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chat Module */}
                        <Card className="flex min-h-[400px] flex-1 flex-col">
                            <CardHeader className="rounded-t-xl border-b bg-indigo-50 pb-4">
                                <CardTitle className="flex items-center text-lg text-indigo-900">
                                    <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />{' '}
                                    Comunicación
                                </CardTitle>
                                <CardDescription className="text-indigo-700">
                                    Chatea directamente con el comprador
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex max-h-[400px] flex-1 flex-col overflow-hidden bg-slate-50 p-0">
                                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                                    {mensajes.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                            No hay mensajes en esta
                                            conversación.
                                        </div>
                                    ) : (
                                        mensajes.map((msg, idx) => {
                                            const isMe =
                                                msg.sender_id === auth.user.id;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                                >
                                                    <span className="mb-1 px-1 text-xs text-gray-400">
                                                        {msg.sender.name}
                                                    </span>
                                                    <div
                                                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                                            isMe
                                                                ? 'rounded-br-none bg-indigo-600 text-white'
                                                                : 'rounded-bl-none border border-gray-100 bg-white text-gray-800'
                                                        }`}
                                                    >
                                                        {msg.contenido && (
                                                            <p className="whitespace-pre-wrap">
                                                                {msg.contenido}
                                                            </p>
                                                        )}

                                                        {msg.file_url && (
                                                            <div
                                                                className={`mt-2 ${msg.contenido ? 'border-t border-white/20 pt-2' : ''}`}
                                                            >
                                                                {msg.is_image ? (
                                                                    <a
                                                                        href={
                                                                            msg.file_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="block overflow-hidden rounded-lg"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                msg.file_url
                                                                            }
                                                                            alt="Adjunto"
                                                                            className="h-auto max-w-full object-cover transition-opacity hover:opacity-90"
                                                                        />
                                                                    </a>
                                                                ) : (
                                                                    <a
                                                                        href={
                                                                            msg.file_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className={`flex items-center gap-2 rounded bg-black/5 p-2 transition-colors hover:bg-black/10 ${isMe ? 'text-white' : 'text-indigo-600'}`}
                                                                    >
                                                                        <FileIcon className="h-4 w-4 shrink-0" />
                                                                        <span className="truncate text-[10px] underline">
                                                                            {
                                                                                msg.file_name
                                                                            }
                                                                        </span>
                                                                        <Download className="ml-auto h-3 w-3 shrink-0" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={mEndRef} />
                                </div>
                            </CardContent>
                            <CardFooter className="rounded-b-xl border-t bg-white p-3">
                                <form
                                    onSubmit={handleEnviarMensaje}
                                    className="flex w-full flex-col space-y-2"
                                >
                                    {selectedFile && (
                                        <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] text-indigo-700">
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="truncate">
                                                    {selectedFile.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedFile(null)
                                                }
                                                className="ml-2 text-indigo-400 hover:text-indigo-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex w-full items-center space-x-2">
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={isLoadingChat}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            placeholder="Escribe un mensaje..."
                                            className="h-9 flex-1 text-sm focus-visible:ring-indigo-500"
                                            value={nuevoMensaje}
                                            onChange={(e) =>
                                                setNuevoMensaje(e.target.value)
                                            }
                                            disabled={isLoadingChat}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                                            disabled={
                                                (!nuevoMensaje.trim() &&
                                                    !selectedFile) ||
                                                isLoadingChat
                                            }
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
