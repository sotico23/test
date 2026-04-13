import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Eye, Calendar, User, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos Recibidos',
        href: '/pedidos-recibidos',
    },
];

interface PedidoItem {
    id: number;
    nombre_producto: string;
    cantidad: number;
    subtotal: number;
}

interface Pedido {
    id: number;
    numero_pedido: string;
    cliente: { name: string } | null;
    nombre_cliente: string;
    estado: string;
    total: number;
    created_at: string;
    items: PedidoItem[];
}

export default function Index({ pedidos }: { pedidos: Pedido[] }) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos Recibidos" />
            <div className="flex h-full flex-col p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 border-b-2 border-indigo-500 pb-2 inline-block">Pedidos Recibidos</h1>
                        <p className="mt-2 text-sm justify-between text-gray-500">Administra las compras realizadas por clientes desde tu tienda pública.</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    {pedidos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-indigo-50 p-4 mb-4">
                                <ShoppingBag className="h-8 w-8 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay pedidos entrantes</h3>
                            <p className="text-gray-500 max-w-sm">No has recibido pedidos a través de tu perfil público aún. Cuando los clientes compren, aparecerán aquí.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">Pedido</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-right">Total</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 font-medium">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <TableRow key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                                                <span className="text-indigo-700 font-semibold truncate max-w-[120px]">#{pedido.numero_pedido}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 ml-6">{pedido.items.length} producto(s)</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(pedido.created_at)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                                                <User className="h-4 w-4" />
                                                <span>{pedido.cliente?.name || pedido.nombre_cliente}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-gray-900">
                                             <div className="flex items-center justify-end space-x-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span>{formatCurrency(pedido.total)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize shrink-0 border-0 ${getEstadoColor(pedido.estado)}`}>
                                                {pedido.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="hover:bg-indigo-50 hover:text-indigo-600">
                                                <Link href={`/pedidos-recibidos/${pedido.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Detalle
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
