import { Head, Link, usePage } from '@inertiajs/react';
import {
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types';

interface PedidoItem {
    id: number;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Pedido {
    id: number;
    numero_pedido: string;
    estado: string;
    total: number;
    created_at: string;
    public_profile: {
        title: string;
        slug: string;
    };
    items: PedidoItem[];
}

interface Props {
    pedidos: Pedido[];
}

const estadoColores: Record<string, string> = {
    pendiente:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmado:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    preparando:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    enviado:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    entregado:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const estadoIconos: Record<string, any> = {
    pendiente: Clock,
    confirmado: CheckCircle2,
    preparando: Package,
    enviado: Truck,
    entregado: CheckCircle2,
    cancelado: XCircle,
};

export default function MisPedidos({ pedidos }: Props) {
    const { auth } = usePage<{ auth: { user?: User } }>().props;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Mis Pedidos', href: '/mis-pedidos' },
            ]}
        >
            <Head title="Mis Pedidos" />

            <div className="mx-auto max-w-4xl py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Mis Pedidos
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Aquí puedes ver el estado de todos tus pedidos
                </p>

                {pedidos.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <Package className="mx-auto h-16 w-16 text-slate-300" />
                        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No tienes pedidos aún
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Explora las tiendas y realiza tu primer pedido
                        </p>
                        <Link
                            href="/tienda"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Explorar tiendas
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {pedidos.map((pedido) => {
                            const Icon = estadoIconos[pedido.estado] || Clock;
                            const colorClass =
                                estadoColores[pedido.estado] ||
                                'bg-slate-100 text-slate-800';

                            return (
                                <div
                                    key={pedido.id}
                                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    {pedido.numero_pedido}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {pedido.estado
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        pedido.estado.slice(1)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                Tienda:{' '}
                                                {pedido.public_profile.title}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(
                                                    pedido.created_at,
                                                ).toLocaleDateString('es-CL', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">
                                                $
                                                {Number(pedido.total).toFixed(
                                                    2,
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {pedido.items.length}{' '}
                                                producto(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <Link
                                            href={`/tienda/${pedido.public_profile.slug}`}
                                            className="text-sm text-slate-600 hover:text-primary dark:text-slate-400"
                                        >
                                            Ver tienda
                                        </Link>
                                        <span className="text-slate-300">
                                            |
                                        </span>
                                        <Link
                                            href={`/pedidos/${pedido.id}`}
                                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                        >
                                            Ver detalles
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
