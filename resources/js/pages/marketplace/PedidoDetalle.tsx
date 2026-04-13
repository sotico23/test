import { Head, useForm, Link } from '@inertiajs/react';
import { Package, MessageSquare, Send, ShoppingBag, ArrowLeft, Clock, Paperclip, FileIcon, X, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

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
    subtotal: number;
    impuesto: number;
    total: number;
    created_at: string;
    items: PedidoItem[];
    public_profile: { id: number; nombre_empresa: string; slug: string };
    conversacion?: { id: number; mensajes: Mensaje[] };
}

export default function PedidoDetalle({ pedido, auth }: { pedido: Pedido; auth: any }) {
    const [mensajes, setMensajes] = useState<Mensaje[]>(pedido.conversacion?.mensajes || []);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const mEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmado': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'preparando': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'enviado': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
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
        const interval = setInterval(fetchMensajes, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={[{ title: `Pedido #${pedido.numero_pedido}`, href: `/pedidos/${pedido.id}` }]}>
            <Head title={`Pedido #${pedido.numero_pedido}`} />
            
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                            <Link href="/mis-pedidos"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                                <span>Pedido #{pedido.numero_pedido}</span>
                            </h1>
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                <span className="flex items-center"><Clock className="mr-1 h-3.5 w-3.5" /> {new Date(pedido.created_at).toLocaleString('es-CL')}</span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center">
                                    <ShoppingBag className="mr-1 h-3.5 w-3.5 text-indigo-500" /> 
                                    Vendedor: <Link href={`/tienda/${pedido.public_profile.slug}`} className="ml-1 text-indigo-600 font-medium hover:underline">{pedido.public_profile.nombre_empresa}</Link>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <Badge className={`text-sm px-3 py-1 shadow-sm border ${getEstadoColor(pedido.estado)}`}>
                            {pedido.estado.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Productos */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm overflow-hidden border-indigo-100">
                            <CardHeader className="bg-white border-b border-indigo-50/50 pb-4">
                                <CardTitle className="flex items-center text-lg text-indigo-900">
                                    <Package className="mr-2 h-5 w-5 text-indigo-500" /> Productos Comprados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-slate-700">Producto</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-700">Precio</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-700">Cant.</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-700">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pedido.items.map(item => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-medium text-gray-900">{item.nombre_producto}</TableCell>
                                                <TableCell className="text-right text-gray-600">{formatCurrency(item.precio_unitario)}</TableCell>
                                                <TableCell className="text-center text-gray-600">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                <div className="bg-slate-50 p-6 flex flex-col items-end space-y-3 border-t">
                                    <div className="flex justify-between w-64 text-sm text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(pedido.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between w-64 text-sm text-gray-600">
                                        <span>IVA (19%):</span>
                                        <span className="font-medium">{formatCurrency(pedido.impuesto)}</span>
                                    </div>
                                    <div className="flex justify-between w-64 text-xl font-bold text-gray-900 pt-3 border-t border-slate-200">
                                        <span>Total pagado:</span>
                                        <span className="text-indigo-700">{formatCurrency(pedido.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat */}
                    <div className="lg:col-span-1 h-full flex flex-col max-h-[600px]">
                        <Card className="flex flex-col flex-1 shadow-md border-indigo-200 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 pb-4 text-white">
                                <CardTitle className="flex items-center text-lg">
                                    <MessageSquare className="mr-2 h-5 w-5" /> Chat con Vendedor
                                </CardTitle>
                                <CardDescription className="text-indigo-100">Contacta a {pedido.public_profile.nombre_empresa}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex flex-col bg-slate-50 overflow-hidden">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {mensajes.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-6 text-center">
                                            <MessageSquare className="h-10 w-10 text-indigo-200 mb-3" />
                                            <p>Ningún mensaje enviado aún. Escríbele al vendedor ante dudas con tu pedido.</p>
                                        </div>
                                    ) : (
                                        mensajes.map((msg, idx) => {
                                            const isMe = msg.sender_id === auth.user.id;
                                            return (
                                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-[10px] uppercase font-semibold text-gray-400 mb-1 px-1">
                                                        {isMe ? 'Tú' : msg.sender.name}
                                                    </span>
                                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[90%] shadow-sm text-sm leading-relaxed ${
                                                        isMe 
                                                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
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
                                                                        <span className="truncate text-xs underline">{msg.file_name}</span>
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
                            <CardFooter className="p-3 bg-white border-t">
                                <form onSubmit={handleEnviarMensaje} className="flex flex-col w-full space-y-2">
                                    {selectedFile && (
                                        <div className="flex items-center justify-between bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-xs text-indigo-700">
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="truncate">{selectedFile.name}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setSelectedFile(null)}
                                                className="text-indigo-400 hover:text-indigo-600 ml-2"
                                            >
                                                <X className="h-3.5 w-3.5" />
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
                                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 shrink-0"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoadingChat}
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <Input 
                                            placeholder="Escribe tu mensaje..." 
                                            className="flex-1 h-10 focus-visible:ring-indigo-500 rounded-full bg-slate-50 border-slate-200" 
                                            value={nuevoMensaje}
                                            onChange={e => setNuevoMensaje(e.target.value)}
                                            disabled={isLoadingChat}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="icon" 
                                            disabled={(!nuevoMensaje.trim() && !selectedFile) || isLoadingChat} 
                                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full w-10 h-10 shrink-0 shadow-sm transition-all active:scale-95"
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
