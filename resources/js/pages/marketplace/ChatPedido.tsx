import { Head, useForm, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Send,
    Store,
    User,
    ArrowLeft,
    MoreVertical,
    RefreshCw,
    ArrowRight,
    Paperclip,
    FileIcon,
    X,
    Download,
    Package,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface Message {
    id: number;
    sender_id: number;
    contenido: string;
    created_at: string;
    sender: { name: string; profile_photo_path?: string };
    file_url?: string;
    file_name?: string;
    is_image?: boolean;
}

interface Conversacion {
    id: number;
    pedido: {
        id: number;
        numero_pedido: string;
        estado: string;
        total: number;
    };
    comprador: { id: number; name: string };
    publicProfile: { id: number; title: string; slug: string; user_id: number };
    mensajes: Message[];
    otro_usuario?: { id: number; name: string };
}

interface Props {
    conversacion: Conversacion;
    mensajes: Message[];
    auth: { user: any };
}

export default function ChatPedido({
    conversacion,
    mensajes: initialMensajes,
    auth,
}: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPolling, setIsPolling] = useState(true);
    const [mensajes, setMensajes] = useState<Message[]>(initialMensajes);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        contenido: '',
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewImage(URL.createObjectURL(file));
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [initialMensajes]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const resp = await fetch(
                        `/conversaciones-pedidos/${conversacion.id}/mensajes`,
                        {
                            headers: {
                                'X-CSRF-TOKEN':
                                    document.head
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                        },
                    );
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.mensajes.length > mensajes.length) {
                            setMensajes(data.mensajes);
                            setTimeout(scrollToBottom, 100);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPolling, mensajes.length, conversacion.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.contenido.trim() && !selectedFile) return;

        try {
            const formData = new FormData();
            formData.append('contenido', data.contenido);
            if (selectedFile) {
                formData.append('archivo', selectedFile);
            }

            const csrfToken =
                document.head
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';

            const resp = await fetch(
                `/conversaciones-pedidos/${conversacion.id}/mensajes`,
                {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                    body: formData,
                },
            );

            if (resp.ok) {
                const result = await resp.json();
                setMensajes([...mensajes, result.mensaje]);
                reset();
                clearFile();
                scrollToBottom();
            } else {
                const errorText = await resp.text();
                console.error('Error response:', resp.status, errorText);
                alert('Error al enviar mensaje: ' + resp.status);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al enviar mensaje');
        }
    };

    const isVendedor = auth.user.id === conversacion.publicProfile.user_id;
    const chatTitle = isVendedor
        ? conversacion.comprador.name
        : conversacion.publicProfile.title;

    const estadoColor = (estado: string) => {
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Mis Pedidos', href: '/mis-pedidos' },
                {
                    title: `Pedido ${conversacion.pedido.numero_pedido}`,
                    href: `/pedidos/${conversacion.pedido.id}`,
                },
                { title: 'Chat', href: '#' },
            ]}
        >
            <Head
                title={`Chat Pedido ${conversacion.pedido.numero_pedido} | Marketplace`}
            />

            <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-4xl flex-col">
                <Card className="flex flex-1 flex-col overflow-hidden border-slate-200 shadow-lg dark:border-slate-800">
                    <CardHeader className="z-10 shrink-0 border-b border-slate-100 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="rounded-full"
                                >
                                    <Link
                                        href="/mis-pedidos"
                                        className="h-5 w-5"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                                    {isVendedor ? (
                                        <User className="h-6 w-6" />
                                    ) : (
                                        <Store className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="leading-tight font-bold text-slate-900 dark:text-white">
                                        {chatTitle}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Package className="h-3 w-3" />
                                        <span>
                                            {conversacion.pedido.numero_pedido}
                                        </span>
                                        <span
                                            className={`rounded px-1.5 py-0.5 ${estadoColor(conversacion.pedido.estado)}`}
                                        >
                                            {conversacion.pedido.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => setIsPolling(!isPolling)}
                                    title={
                                        isPolling
                                            ? 'Pausar actualización'
                                            : 'Reanudar actualización'
                                    }
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${isPolling ? 'animate-spin-slow text-primary' : 'text-slate-400'}`}
                                    />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent
                        className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/20"
                        ref={scrollRef}
                    >
                        {mensajes.length > 0 ? (
                            mensajes.map((msg) => {
                                const isMe = msg.sender_id === auth.user.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                isMe
                                                    ? 'rounded-tr-none bg-primary text-primary-foreground'
                                                    : 'rounded-tl-none border border-slate-100 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                                            }`}
                                        >
                                            {msg.file_url && (
                                                <div className="mb-2">
                                                    {msg.is_image ? (
                                                        <img
                                                            src={msg.file_url}
                                                            alt={msg.file_name}
                                                            className="max-h-48 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={msg.file_url}
                                                            download={
                                                                msg.file_name
                                                            }
                                                            className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                                                        >
                                                            <FileIcon className="h-4 w-4" />
                                                            {msg.file_name}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <p className="prose dark:prose-invert text-sm break-words">
                                                {msg.contenido}
                                            </p>
                                            <p
                                                className={`mt-1 text-right text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}
                                            >
                                                {format(
                                                    new Date(msg.created_at),
                                                    'HH:mm',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center opacity-50">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <Send className="h-8 w-8 -rotate-45 text-slate-300" />
                                </div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                    Comienza la conversación
                                </h3>
                                <p className="max-w-[200px] text-sm text-slate-500">
                                    Envía un mensaje para coordinate con{' '}
                                    {chatTitle}.
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <div className="shrink-0 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                            className="flex flex-col gap-2"
                        >
                            {selectedFile && (
                                <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                                    <div className="flex items-center gap-2 truncate">
                                        {previewImage && (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )}
                                        {!previewImage && (
                                            <Paperclip className="h-4 w-4 text-indigo-500" />
                                        )}
                                        <span className="truncate text-sm text-indigo-700">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="text-indigo-400 hover:text-indigo-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 rounded-full"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Input
                                    value={data.contenido}
                                    onChange={(e) =>
                                        setData('contenido', e.target.value)
                                    }
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 rounded-full border-slate-200 px-4 py-6 focus-visible:ring-primary dark:border-slate-800"
                                    autoComplete="off"
                                    disabled={processing}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-lg transition-transform active:scale-95"
                                    disabled={
                                        processing ||
                                        (!data.contenido.trim() &&
                                            !selectedFile)
                                    }
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
