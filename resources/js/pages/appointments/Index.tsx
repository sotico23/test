import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, User, Clock, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

export default function AppointmentsIndex({ appointments }: { appointments: any[] }) {

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'confirmada': return 'bg-blue-100 text-blue-800';
            case 'completada': return 'bg-green-100 text-green-800';
            case 'cancelada': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleDelete = (id: number) => {
        if(confirm('¿Eliminar esta cita?')) {
            router.delete(`/appointments/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mis Citas', href: '/appointments' }]}>
            <Head title="Mis Citas | Citas y Reservas" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestión de Citas</h1>
                    <Link href="/appointments/calendar">
                        <Button>Ver Calendario</Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Fecha y Hora</th>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Servicio</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Pago</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No hay citas agendadas.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                {format(new Date(app.start_time), 'dd MMM yyyy', { locale: es })}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(app.start_time), 'HH:mm')} - {format(new Date(app.end_time), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400" />
                                                {app.client?.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {app.producto?.nombre}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={app.payment_status === 'pagado' ? 'default' : 'outline'}>
                                                {app.payment_status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex justify-end gap-2">
                                            {/* We can add Edit functionality later */}
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(app.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
