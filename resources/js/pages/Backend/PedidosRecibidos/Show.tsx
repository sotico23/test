import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Clock, MapPin, Phone, User, Package, MessageSquare, Send, CheckCircle, Paperclip, FileIcon, X, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    const [mensajes, setMensajes] = useState<Mensaje[]>(pedido.conversacion?.mensajes || []);
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
        { title: `Pedido #${pedido.numero_pedido}`, href: `/pedidos-recibidos/${pedido.id}` },
    ];

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'confirmado': return 'bg-blue-100 text-blue-800';
            case 'preparando': return 'bg-orange-100 text-orange-800';
            case 'enviado': return 'bg-purple-100 text-purple-800';
            case 'entregado': return 'bg-green-100 text-green-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const handleActualizarEstado = (e: React.FormEvent) => {
        e.preventDefault();
        estadoForm.put(`/pedidos-recibidos/${pedido.id}/estado`);
    };

    const handleGenerarVenta = () => {
        if (confirm('¿Estás seguro de que quieres convertir este pedido en una Venta Oficial?')) {
            router.post(`/pedidos-recibidos/${pedido.id}/venta`);
        }
    };

    const handleEnviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!nuevoMensaje.trim() && !selectedFile) || !pedido.conversacion?.id) return;

        setIsLoadingChat(true);
        try {
            const formData = new FormData();
            formData.append('contenido', nuevoMensaje);
            if (selectedFile) {
                formData.append('archivo', selectedFile);
            }

            const resp = await fetch(`/conversaciones-pedidos/${pedido.conversacion.id}/mensajes`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });
            
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
            const resp = await fetch(`/conversaciones-pedidos/${pedido.conversacion.id}/mensajes`);
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
            
            <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/pedidos-recibidos"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                                <span>Pedido #{pedido.numero_pedido}</span>
                                <Badge className={getEstadoColor(pedido.estado)}>{pedido.estado.toUpperCase()}</Badge>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                                <Clock className="mr-1 h-3 w-3" /> {new Date(pedido.created_at).toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <form onSubmit={handleActualizarEstado} className="flex items-center space-x-2 bg-white p-1 rounded-md border shadow-sm">
                            <Select 
                                value={estadoForm.data.estado} 
                                onValueChange={(val) => estadoForm.setData('estado', val)}
                                disabled={estadoForm.processing}
                            >
                                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
                                    <SelectValue placeholder="Estado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="preparando">En Preparación</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" size="sm" disabled={estadoForm.processing || estadoForm.data.estado === pedido.estado}>
                                Actualizar
                            </Button>
                        </form>

                        <Button 
                            onClick={handleGenerarVenta}
                            disabled={pedido.estado === 'cancelado'}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Convertir a Venta
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Información y Productos */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg"><Package className="mr-2 h-5 w-5 text-indigo-500" /> Productos Solicitados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                            <TableHead className="text-center">Cant.</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pedido.items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium text-gray-900">{item.nombre_producto}</TableCell>
                                                <TableCell className="text-right text-gray-600">{formatCurrency(item.precio_unitario)}</TableCell>
                                                <TableCell className="text-center text-gray-600">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                <div className="mt-6 flex flex-col items-end space-y-2 border-t pt-4">
                                    <div className="flex justify-between w-48 text-sm text-gray-600">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(pedido.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between w-48 text-sm text-gray-600">
                                        <span>IVA:</span>
                                        <span>{formatCurrency(pedido.impuesto)}</span>
                                    </div>
                                    <div className="flex justify-between w-48 text-lg font-bold text-gray-900 pt-2 border-t">
                                        <span>Total:</span>
                                        <span>{formatCurrency(pedido.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {pedido.notas && (
                            <Card className="bg-amber-50 border-amber-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-amber-800 text-sm uppercase tracking-wide">Notas del Cliente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-amber-900 italic">{pedido.notas}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Cliente y Chat */}
                    <div className="space-y-6 flex flex-col h-full">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg"><User className="mr-2 h-5 w-5 text-indigo-500" /> Datos del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nombre</span>
                                    <div className="font-medium text-gray-900 mt-1">{pedido.nombre_cliente} {pedido.cliente ? `(@${pedido.cliente.name})` : ''}</div>
                                </div>
                                {pedido.telefono_cliente && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Teléfono</span>
                                        <div className="flex items-center text-gray-900 mt-1">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" /> {pedido.telefono_cliente}
                                        </div>
                                    </div>
                                )}
                                {pedido.direccion_cliente && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dirección de Entrega</span>
                                        <div className="flex items-start text-gray-900 mt-1">
                                            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 shrink-0" /> 
                                            <span className="leading-tight">{pedido.direccion_cliente}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chat Module */}
                        <Card className="flex flex-col flex-1 min-h-[400px]">
                            <CardHeader className="bg-indigo-50 rounded-t-xl border-b pb-4">
                                <CardTitle className="flex items-center text-indigo-900 text-lg">
                                    <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" /> Comunicación
                                </CardTitle>
                                <CardDescription className="text-indigo-700">Chatea directamente con el comprador</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex flex-col bg-slate-50 max-h-[400px] overflow-hidden">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {mensajes.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            No hay mensajes en esta conversación.
                                        </div>
                                    ) : (
                                        mensajes.map((msg, idx) => {
                                            const isMe = msg.sender_id === auth.user.id;
                                            return (
                                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender.name}</span>
                                                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm ${
                                                        isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                    }`}>
                                                        {msg.contenido && <p className="whitespace-pre-wrap">{msg.contenido}</p>}
                                                        
                                                        {msg.file_url && (
                                                            <div className={`mt-2 ${msg.contenido ? 'pt-2 border-t border-white/20' : ''}`}>
                                                                {msg.is_image ? (
                                                                    <a href={msg.file_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                                                                        <img src={msg.file_url} alt="Adjunto" className="max-w-full h-auto object-cover hover:opacity-90 transition-opacity" />
                                                                    </a>
                                                                ) : (
                                                                    <a 
                                                                        href={msg.file_url} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className={`flex items-center gap-2 p-2 rounded bg-black/5 hover:bg-black/10 transition-colors ${isMe ? 'text-white' : 'text-indigo-600'}`}
                                                                    >
                                                                        <FileIcon className="h-4 w-4 shrink-0" />
                                                                        <span className="truncate text-[10px] underline">{msg.file_name}</span>
                                                                        <Download className="h-3 w-3 shrink-0 ml-auto" />
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
                            <CardFooter className="p-3 bg-white border-t rounded-b-xl">
                                <form onSubmit={handleEnviarMensaje} className="flex flex-col w-full space-y-2">
                                    {selectedFile && (
                                        <div className="flex items-center justify-between bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 text-[10px] text-indigo-700">
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="truncate">{selectedFile.name}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setSelectedFile(null)}
                                                className="text-indigo-400 hover:text-indigo-600 ml-2"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex w-full space-x-2 items-center">
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
                                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 shrink-0"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoadingChat}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <Input 
                                            placeholder="Escribe un mensaje..." 
                                            className="flex-1 h-9 text-sm focus-visible:ring-indigo-500" 
                                            value={nuevoMensaje}
                                            onChange={e => setNuevoMensaje(e.target.value)}
                                            disabled={isLoadingChat}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="icon" 
                                            className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0"
                                            disabled={(!nuevoMensaje.trim() && !selectedFile) || isLoadingChat} 
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
