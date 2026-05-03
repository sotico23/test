import { Head, useForm, router, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Send,
    Store,
    User,
    ArrowLeft,
    MoreVertical,
    RefreshCw,
    ImagePlus,
    X,
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import chat from '@/routes/chat';

interface Message {
    id: number;
    body: string;
    image_path: string | null;
    sender_id: number;
    sender: any;
    created_at: string;
}

interface Conversation {
    id: number;
    buyer: any;
    store: any;
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    auth: { user: any };
}

export default function ChatShow({ conversation, messages, auth }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPolling, setIsPolling] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        body: '',
        image: null as File | null,
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setData('image', null);
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
    }, [messages]);

    // Polling effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling) {
            interval = setInterval(() => {
                router.reload({
                    only: ['messages'],
                });
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPolling]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim() && !data.image) return;

        post(chat.send(conversation.id).url, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                clearImage();
                scrollToBottom();
            },
        });
    };

    const isStoreOwner = auth.user.id === conversation.store.user_id;
    const chatTitle = isStoreOwner
        ? conversation.buyer.name
        : conversation.store.title;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Marketplace', href: '/tienda' },
                { title: 'Mensajes', href: '/chat' },
                { title: chatTitle, href: '#' },
            ]}
        >
            <Head title={`Chat con ${chatTitle} | Marketplace`} />

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
                                        href={chat.index().url}
                                        className="h-5 w-5"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                                    {isStoreOwner ? (
                                        <User className="h-6 w-6" />
                                    ) : (
                                        <Store className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="leading-tight font-bold text-slate-900 dark:text-white">
                                        {chatTitle}
                                    </h2>
                                    <p className="flex items-center gap-1 text-xs text-slate-500">
                                        <span
                                            className={`h-2 w-2 rounded-full ${isPolling ? 'bg-green-500' : 'bg-slate-300'} animate-pulse`}
                                        />
                                        {isStoreOwner ? 'Cliente' : 'Tienda'}
                                    </p>
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent
                        className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/20"
                        ref={scrollRef}
                    >
                        {messages.length > 0 ? (
                            messages.map((msg) => {
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
                                            {msg.image_path && (
                                                <img
                                                    src={`/storage/${msg.image_path}`}
                                                    alt="Imagen"
                                                    className="mb-2 max-h-[300px] w-full rounded-lg object-cover"
                                                />
                                            )}
                                            {msg.body && (
                                                <p className="prose dark:prose-invert text-sm break-words">
                                                    {msg.body}
                                                </p>
                                            )}
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
                                    Envía un mensaje para ponerte en contacto
                                    con {chatTitle}.
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
                            {previewImage && (
                                <div className="relative self-start overflow-hidden rounded-lg border border-slate-200">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="h-24 w-auto object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                        onClick={clearImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <ImagePlus className="h-5 w-5" />
                                </Button>
                                <Input
                                    value={data.body}
                                    onChange={(e) =>
                                        setData('body', e.target.value)
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
                                        (!data.body.trim() && !data.image)
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
