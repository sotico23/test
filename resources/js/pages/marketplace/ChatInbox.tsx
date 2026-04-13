import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Store, User, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import chat from '@/routes/chat';

interface Conversation {
    id: number;
    buyer: any;
    store: any;
    latest_message: any[];
    updated_at: string;
}

interface Props {
    buyerConversations: Conversation[];
    storeConversations: Conversation[];
}

export default function ChatInbox({ buyerConversations, storeConversations }: Props) {
    const renderConversations = (conversations: Conversation[], title: string, description: string, isStore: boolean) => (
        <Card className="mb-8 overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {isStore ? <Store className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {conversations.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {conversations.map((conv) => {
                            const latest = conv.latest_message?.[0];
                            const target = isStore ? conv.buyer : conv.store;
                            return (
                                <Link
                                    key={conv.id}
                                    href={chat.show(conv.id).url}
                                    className="block group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                                            {isStore ? <User className="h-6 w-6" /> : <Store className="h-6 w-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                                    {isStore ? target.name : target.title}
                                                </h4>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                                {latest ? latest.body : 'Sin mensajes aún.'}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No hay conversaciones activas.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Marketplace', href: '/tienda' }, { title: 'Mensajes', href: '/chat' }]}>
            <Head title="Bandeja de Entrada | Chat Marketplace" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Centro de Mensajes
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Gestiona tus conversaciones con tiendas y clientes del marketplace.
                    </p>
                </div>

                {renderConversations(
                    buyerConversations, 
                    "Mis Compras", 
                    "Conversaciones con las tiendas donde has comprado o consultado.",
                    false
                )}

                {renderConversations(
                    storeConversations, 
                    "Ventas y Consultas", 
                    "Mensajes recibidos de potenciales clientes en tus tiendas.",
                    true
                )}
            </div>
        </AppLayout>
    );
}
