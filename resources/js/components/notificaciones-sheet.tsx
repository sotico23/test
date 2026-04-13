import { useForm, usePage } from '@inertiajs/react';
import { Bell, MessageSquare, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface User {
    id: number;
    name: string;
    email?: string;
    profile_photo_path: string | null;
}

interface Mensaje {
    id: number;
    contenido: string;
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

type Vista = 'lista' | 'chat' | 'nuevo';

export function NotificacionesSheet() {
    const { auth } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [otroUsuario, setOtroUsuario] = useState<User | null>(null);
    const [totalSinLeer, setTotalSinLeer] = useState(0);

    const { data, setData, post, reset } = useForm({
        receiver_id: '',
        contenido: '',
    });

    useEffect(() => {
        if (open && vista === 'lista') {
            fetchConversaciones();
        }
    }, [open, vista]);

    const fetchConversaciones = async () => {
        try {
            const res = await fetch('/mensajes');
            const data = await res.json();
            setConversaciones(data.conversaciones || []);
            setTotalSinLeer(data.total_sin_leer || 0);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const res = await fetch('/mensajes/usuarios');
            const data = await res.json();
            setUsuarios(data.usuarios || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchConversacion = async (usuarioId: number) => {
        try {
            const res = await fetch(`/mensajes/${usuarioId}`);
            const data = await res.json();
            setMensajes(data.mensajes || []);
            setOtroUsuario(data.otro_usuario);
            setVista('chat');
            fetchConversaciones();
        } catch (e) {
            console.error(e);
        }
    };

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.contenido.trim()) return;

        try {
            await post('/mensajes', {
                onSuccess: () => {
                    reset();
                    if (otroUsuario) {
                        fetchConversacion(otroUsuario.id);
                    }
                },
            });
        } catch (e) {
            console.error(e);
        }
    };

    const iniciarChat = (usuarioId: number) => {
        setData('receiver_id', usuarioId.toString());
        fetchConversacion(usuarioId);
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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {totalSinLeer > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {totalSinLeer > 9 ? '9+' : totalSinLeer}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Mensajes
                    </SheetTitle>
                </SheetHeader>

                {vista === 'lista' ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    fetchUsuarios();
                                    setVista('nuevo');
                                }}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Nuevo Mensaje
                            </Button>
                        </div>

                        {conversaciones.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No tienes conversaciones aún
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conversaciones.map((conv) => (
                                    <div
                                        key={conv.usuario_id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                                        onClick={() =>
                                            iniciarChat(conv.usuario_id)
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
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                                                    {conv.usuario_nombre.charAt(
                                                        0,
                                                    )}
                                                </div>
                                            )}
                                            {conv.sin_leer > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                                    {conv.sin_leer}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate font-medium">
                                                    {conv.usuario_nombre}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatFecha(
                                                        conv.fecha_ultimo,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {conv.ultimo_mensaje}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : vista === 'nuevo' ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVista('lista')}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {usuarios.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                                    onClick={() => iniciarChat(user.id)}
                                >
                                    {getFotoUrl(user.profile_photo_path) ? (
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
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVista('lista')}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                            <span className="font-medium">
                                {otroUsuario?.name}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4">
                            <div className="space-y-4">
                                {mensajes.map((msg) => {
                                    const isSender =
                                        msg.sender.id === auth?.user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${
                                                    isSender
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                <p className="text-sm">
                                                    {msg.contenido}
                                                </p>
                                                <p
                                                    className={`mt-1 text-xs ${
                                                        isSender
                                                            ? 'text-primary-foreground/70'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {formatFecha(
                                                        msg.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form
                            onSubmit={enviarMensaje}
                            className="mt-4 flex gap-2"
                        >
                            <Input
                                placeholder="Escribe un mensaje..."
                                value={data.contenido}
                                onChange={(e) =>
                                    setData('contenido', e.target.value)
                                }
                                className="flex-1"
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
