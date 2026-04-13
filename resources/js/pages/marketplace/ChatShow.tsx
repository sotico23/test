import { Head, useForm, router, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Store, User, ArrowLeft, MoreVertical, RefreshCw } from 'lucide-react';
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

    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

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
        if (!data.body.trim()) return;

        post(chat.send(conversation.id).url, {
            onSuccess: () => {
                reset();
                scrollToBottom();
            },
        });
    };

    const isStoreOwner = auth.user.id === conversation.store.user_id;
    const chatTitle = isStoreOwner ? conversation.buyer.name : conversation.store.title;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketplace', href: '/tienda' }, 
            { title: 'Mensajes', href: '/chat' },
            { title: chatTitle, href: '#' }
        ]}>
            <Head title={`Chat con ${chatTitle} | Marketplace`} />

            <div className="mx-auto max-w-4xl h-[calc(100vh-14rem)] flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-lg dark:border-slate-800">
                    <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" asChild className="rounded-full">
                                    <Link href={chat.index().url} className="h-5 w-5">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 dark:bg-slate-800">
                                    {isStoreOwner ? <User className="h-6 w-6" /> : <Store className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white leading-tight">
                                        {chatTitle}
                                    </h2>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span className={`h-2 w-2 rounded-full ${isPolling ? 'bg-green-500' : 'bg-slate-300'} animate-pulse`} />
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
                                    title={isPolling ? "Pausar actualización" : "Reanudar actualización"}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isPolling ? 'text-primary animate-spin-slow' : 'text-slate-400'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20" ref={scrollRef}>
                        {messages.length > 0 ? (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === auth.user.id;
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                            isMe 
                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'
                                        }`}>
                                            <p className="text-sm prose dark:prose-invert break-words">
                                                {msg.body}
                                            </p>
                                            <p className={`mt-1 text-[10px] text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center opacity-50">
                                <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                                    <Send className="h-8 w-8 text-slate-300 -rotate-45" />
                                </div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Comienza la conversación</h3>
                                <p className="text-sm text-slate-500 max-w-[200px]">Envía un mensaje para ponerte en contacto con {chatTitle}.</p>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <Input
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 rounded-full px-4 py-6 border-slate-200 focus-visible:ring-primary dark:border-slate-800"
                                autoComplete="off"
                                disabled={processing}
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                className="h-12 w-12 rounded-full shadow-lg transition-transform active:scale-95"
                                disabled={processing || !data.body.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
