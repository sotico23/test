import { Head, usePage } from '@inertiajs/react';
import { Send, X, Paperclip, FileText as FileIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email?: string;
    profile_photo_path: string | null;
}

interface Mensaje {
    id: number;
    contenido: string;
    archivo_path: string | null;
    archivo_nombre: string | null;
    archivo_tipo: string | null;
    created_at: string;
    sender: User;
    receiver: User;
    leido: boolean;
}

interface Conversacion {
    usuario_id: number;
    usuario_nombre: string;
    usuario_foto: string | null;
    ultimo_mensaje: string;
    fecha_ultimo: string;
    sin_leer: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mensajes', href: '/mensajes' },
];

export default function MensajesIndex() {
    const { auth } = usePage().props as any;
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [vista, setVista] = useState<'lista' | 'chat' | 'nuevo'>('lista');
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [pollInterval, setPollInterval] = useState<number | null>(null);

    useEffect(() => {
        fetchConversaciones();
        if (vista === 'nuevo') {
            fetchUsuarios();
        }
    }, [vista]);

    // Polling effect
    useEffect(() => {
        const interval = window.setInterval(() => {
            fetchConversaciones();
            if (vista === 'chat' && selectedUser) {
                fetchConversacion(selectedUser.id, true);
            }
        }, 10000); // 10 seconds

        return () => window.clearInterval(interval);
    }, [vista, selectedUser]);

    // Auto-scroll effect
    useEffect(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [mensajes]);

    const fetchConversaciones = async () => {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const res = await fetch('/mensajes', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            const data = await res.json();
            setConversaciones(data.conversaciones || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const res = await fetch('/mensajes/usuarios', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            const data = await res.json();
            setUsuarios(data.usuarios || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchConversacion = async (usuarioId: number, isPolling = false) => {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const res = await fetch(`/mensajes/${usuarioId}`, {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            const data = await res.json();
            
            // Only update messages if they changed or it's NOT a poll
            if (!isPolling || JSON.stringify(data.mensajes) !== JSON.stringify(mensajes)) {
                setMensajes(data.mensajes || []);
            }
            
            if (!isPolling) {
                setSelectedUser(data.otro_usuario);
                setVista('chat');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() && !archivo || !selectedUser) return;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            
            const formData = new FormData();
            formData.append('receiver_id', selectedUser.id.toString());
            formData.append('contenido', nuevoMensaje);
            if (archivo) {
                formData.append('archivo', archivo);
            }

            const res = await fetch('/mensajes', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            if (res.ok) {
                setNuevoMensaje('');
                setArchivo(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchConversacion(selectedUser.id);
            } else {
                const data = await res.json();
                console.error('Error:', data);
                alert('No se pudo enviar el mensaje: ' + (data.error || 'Error desconocido'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Ahora';
        if (min < 60) return `${min} min`;
        const hours = Math.floor(min / 60);
        if (hours < 24) return `${hours}h`;
        return d.toLocaleDateString('es-CL');
    };

    const getFotoUrl = (foto: string | null) => {
        if (!foto) return null;
        if (foto.startsWith('http')) return foto;
        return `/storage/${foto}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensajes" />
            <div className="flex h-[calc(100vh-8rem)] gap-4">
                {/* Lista de conversaciones */}
                <div
                    className={`flex w-full flex-col rounded-lg border bg-card md:w-1/3 ${vista !== 'lista' ? 'hidden md:flex' : ''}`}
                >
                    <div className="border-b p-4">
                        <h1 className="text-xl font-bold">Mensajes</h1>
                    </div>
                    <div className="p-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setVista('nuevo')}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Nuevo Mensaje
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversaciones.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No tienes conversaciones
                            </div>
                        ) : (
                            conversaciones.map((conv) => (
                                <div
                                    key={conv.usuario_id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                                    onClick={() =>
                                        fetchConversacion(conv.usuario_id)
                                    }
                                >
                                    <div className="relative">
                                        {getFotoUrl(conv.usuario_foto) ? (
                                            <img
                                                src={
                                                    getFotoUrl(
                                                        conv.usuario_foto,
                                                    )!
                                                }
                                                alt={conv.usuario_nombre}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg text-white">
                                                {conv.usuario_nombre.charAt(0)}
                                            </div>
                                        )}
                                        {conv.sin_leer > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                {conv.sin_leer}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between">
                                            <span className="truncate font-medium">
                                                {conv.usuario_nombre}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatFecha(conv.fecha_ultimo)}
                                            </span>
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {conv.ultimo_mensaje}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Vista de nuevo mensaje */}
                {vista === 'nuevo' && (
                    <div className="flex w-full flex-col rounded-lg border bg-card md:w-2/3">
                        <div className="flex items-center gap-2 border-b p-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVista('lista')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <h2 className="font-semibold">Nuevo Mensaje</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {usuarios.length === 0 ? (
                                <div className="text-center text-muted-foreground">
                                    No hay usuarios disponibles
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {usuarios.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                                            onClick={() =>
                                                fetchConversacion(user.id)
                                            }
                                        >
                                            {getFotoUrl(
                                                user.profile_photo_path,
                                            ) ? (
                                                <img
                                                    src={
                                                        getFotoUrl(
                                                            user.profile_photo_path,
                                                        )!
                                                    }
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat */}
                {vista === 'chat' && selectedUser && (
                    <div className="flex w-full flex-col rounded-lg border bg-card md:w-2/3">
                        <div className="flex items-center gap-3 border-b p-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVista('lista')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            {getFotoUrl(selectedUser.profile_photo_path) ? (
                                <img
                                    src={
                                        getFotoUrl(
                                            selectedUser.profile_photo_path,
                                        )!
                                    }
                                    alt={selectedUser.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                                    {selectedUser.name.charAt(0)}
                                </div>
                            )}
                            <h2 className="font-semibold">
                                {selectedUser.name}
                            </h2>
                        </div>
                        <div 
                            id="chat-messages"
                            className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth"
                        >
                            {mensajes.map((msg) => {
                                const isSender =
                                    msg.sender.id === auth?.user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                isSender
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            {msg.archivo_path && (
                                                <div className="mb-2">
                                                    {msg.archivo_tipo?.startsWith('image/') ? (
                                                        <a href={`/storage/${msg.archivo_path}`} target="_blank" rel="noopener noreferrer">
                                                            <img 
                                                                src={`/storage/${msg.archivo_path}`} 
                                                                alt={msg.archivo_nombre || 'Imagen'} 
                                                                className="max-h-60 w-full rounded-md object-cover hover:opacity-90"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a 
                                                            href={`/storage/${msg.archivo_path}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 rounded border p-2 text-xs transition-colors ${
                                                                isSender ? 'border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20' : 'border-border bg-background hover:bg-muted'
                                                            }`}
                                                        >
                                                            <FileIcon className="h-4 w-4" />
                                                            <span className="truncate max-w-[150px]">{msg.archivo_nombre}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.contenido && (
                                                <p className="text-sm">
                                                    {msg.contenido}
                                                </p>
                                            )}
                                            <p
                                                className={`mt-1 text-xs ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                            >
                                                {formatFecha(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {archivo && (
                            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <FileIcon className="h-3 w-3" />
                                    <span className="truncate">{archivo.name}</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                        setArchivo(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <form
                            onSubmit={enviarMensaje}
                            className="flex items-center gap-2 border-t p-4"
                        >
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input
                                placeholder="Escribe un mensaje..."
                                value={nuevoMensaje}
                                onChange={(e) =>
                                    setNuevoMensaje(e.target.value)
                                }
                                className="flex-1"
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
