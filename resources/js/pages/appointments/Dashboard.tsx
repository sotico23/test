import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar as CalendarIcon,
    Users,
    DollarSign,
    TrendingUp,
    Download,
    Upload,
    FileSpreadsheet,
} from 'lucide-react';
import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
export default function Dashboard({ citasHoy }: { citasHoy: any[] }) {
    const csvInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleImportCSV = () => {
        csvInputRef.current?.click();
    };

    const handleImportExcel = () => {
        excelInputRef.current?.click();
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'csv' | 'excel',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post('/appointments/importar', formData, {
            forceFormData: true,
            onSuccess: () => {
                e.target.value = '';
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Dashboard de Citas',
                    href: '/appointments/dashboard',
                },
            ]}
        >
            <Head title="Dashboard | Citas y Reservas" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            Panel Principal
                        </h1>
                        <p className="text-slate-500">
                            Resumen de tu agenda para hoy,{' '}
                            {format(new Date(), "EEEE d 'de' MMMM", {
                                locale: es,
                            })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/appointments/calendar"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Ver Calendario
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 rounded-xl border-muted-foreground/10 font-bold"
                                >
                                    <Download className="h-4 w-4 text-primary" />
                                    <span>Herramientas</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleImportCSV}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Importar CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleImportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Importar Excel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        window.open(
                                            '/appointments/exportar?format=csv',
                                            '_blank',
                                        )
                                    }
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        window.open(
                                            '/appointments/exportar?format=excel',
                                            '_blank',
                                        )
                                    }
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Citas Hoy
                            </CardTitle>
                            <CalendarIcon className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {citasHoy.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ingresos Estimados (Hoy)
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                $
                                {citasHoy
                                    .reduce(
                                        (acc, c) =>
                                            acc +
                                            (c.producto?.precio_venta || 0),
                                        0,
                                    )
                                    .toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Nuevos Clientes
                            </CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ocupación
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-lg font-bold">Agenda del Día</h2>
                    {citasHoy.length === 0 ? (
                        <div className="py-10 text-center text-slate-500">
                            No tienes citas programadas para hoy.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {citasHoy.map((cita) => (
                                <div
                                    key={cita.id}
                                    className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                                >
                                    <div className="border-r border-slate-200 px-4 text-center dark:border-slate-700">
                                        <div className="text-lg font-bold">
                                            {format(
                                                new Date(cita.start_time),
                                                'HH:mm',
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {cita.producto?.duracion} min
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white">
                                            {cita.client?.name}
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            {cita.producto?.nombre}
                                        </p>
                                    </div>
                                    <div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${cita.status === 'confirmada' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            {cita.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'csv')}
            />
            <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'excel')}
            />
        </AppLayout>
    );
}
