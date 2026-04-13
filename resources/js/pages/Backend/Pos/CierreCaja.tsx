import { Head, router } from '@inertiajs/react';
import { Calendar, Download, FileSpreadsheet, Lock, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table-pos';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';

interface Arqueo {
    efectivo: number;
    tarjeta: number;
    transferencia: number;
    total: number;
    cantidad_ventas: number;
    fecha_desde: string;
    fecha_hasta: string;
    detalle: {
        id: number;
        fecha: string;
        hora: string;
        tipo: string;
        metodo: string;
        documento: string;
        monto: number;
    }[];
}

export default function CierreCaja({ arqueo }: { arqueo: Arqueo }) {
    const [fechaDesde, setFechaDesde] = useState(arqueo.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(arqueo.fecha_hasta);
    const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');

    const aplicarFiltros = () => {
        router.get('/pos/cierre', {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
        }, { preserveState: false });
    };

    const hoy = () => {
        const today = new Date().toISOString().split('T')[0];
        setFechaDesde(today);
        setFechaHasta(today);
        router.get('/pos/cierre', {
            fecha_desde: today,
            fecha_hasta: today,
        }, { preserveState: false });
    };

    const ayer = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yesterday = d.toISOString().split('T')[0];
        setFechaDesde(yesterday);
        setFechaHasta(yesterday);
        router.get('/pos/cierre', {
            fecha_desde: yesterday,
            fecha_hasta: yesterday,
        }, { preserveState: false });
    };

    const estaSemana = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        const startStr = start.toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];
        setFechaDesde(startStr);
        setFechaHasta(end);
        router.get('/pos/cierre', {
            fecha_desde: startStr,
            fecha_hasta: end,
        }, { preserveState: false });
    };

    const esteMes = () => {
        const d = new Date();
        const startStr = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        const endStr = d.toISOString().split('T')[0];
        setFechaDesde(startStr);
        setFechaHasta(endStr);
        router.get('/pos/cierre', {
            fecha_desde: startStr,
            fecha_hasta: endStr,
        }, { preserveState: false });
    };

    const exportarPdf = () => {
        window.open(`/pos/cierre/pdf?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`, '_blank');
    };

    const exportarCsv = () => {
        window.open(`/pos/cierre/csv?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`, '_blank');
    };

    const detalleFiltrado = filtroMetodo === 'todos'
        ? arqueo.detalle
        : arqueo.detalle.filter(d => d.metodo.toLowerCase() === filtroMetodo);

    const esMismoDia = fechaDesde === fechaHasta;
    const fechaLabel = esMismoDia
        ? new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
        : `${new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} — ${new Date(fechaHasta + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Caja POS', href: '/pos' }, { title: 'Cierre de Caja', href: '/pos/cierre' }]}>
            <Head title="Cierre de Caja (Arqueo)" />

            <div className="p-4 md:p-6 space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tight uppercase">Arqueo de Caja</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {fechaLabel}
                            — {arqueo.cantidad_ventas} transacciones
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportarPdf}>
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportarCsv}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel/CSV
                        </Button>
                        <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold px-6">
                            <Lock className="mr-2 h-4 w-4" /> CERRAR TURNO
                        </Button>
                    </div>
                </div>

                {/* Filtros de Fecha */}
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant="outline" size="sm" onClick={hoy}
                                    className={esMismoDia && fechaDesde === new Date().toISOString().split('T')[0] ? 'bg-primary text-primary-foreground' : ''}>
                                    Hoy
                                </Button>
                                <Button variant="outline" size="sm" onClick={ayer}>
                                    Ayer
                                </Button>
                                <Button variant="outline" size="sm" onClick={estaSemana}>
                                    Esta Semana
                                </Button>
                                <Button variant="outline" size="sm" onClick={esteMes}>
                                    Este Mes
                                </Button>
                            </div>
                            <div className="flex items-end gap-3 flex-1">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs text-muted-foreground font-medium">Desde</Label>
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        className="h-9 w-[160px]"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs text-muted-foreground font-medium">Hasta</Label>
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        className="h-9 w-[160px]"
                                    />
                                </div>
                                <Button size="sm" onClick={aplicarFiltros}>
                                    <Search className="mr-2 h-4 w-4" /> Consultar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Totales / Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">EFECTIVO EN CAJA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600">{formatCurrencyCLP(arqueo.efectivo)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Sencillo acumulado en período</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">TARJETAS (VOUCHERS)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-600">{formatCurrencyCLP(arqueo.tarjeta)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Transbank / Mercado Pago</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">TRANSFERENCIAS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-purple-600">{formatCurrencyCLP(arqueo.transferencia)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Bancarias directas</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 text-white border-none shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-slate-400">TOTAL ARQUEO</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white">{formatCurrencyCLP(arqueo.total)}</div>
                            <p className="text-[10px] text-slate-400 mt-1">{arqueo.cantidad_ventas} transacciones realizadas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Detalle */}
                <Card className="shadow-sm border-none bg-background">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Resumen de Transacciones</CardTitle>
                                <CardDescription className="text-xs">Movimientos registrados en el período seleccionado.</CardDescription>
                            </div>
                            <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
                                <SelectTrigger className="w-[170px] h-8 text-xs">
                                    <SelectValue placeholder="Filtrar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los métodos</SelectItem>
                                    <SelectItem value="efectivo">Efectivo</SelectItem>
                                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                    <SelectItem value="transferencia">Transferencia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        {!esMismoDia && <TableHead className="font-bold">Fecha</TableHead>}
                                        <TableHead className="font-bold">Hora</TableHead>
                                        <TableHead className="font-bold">Concepto</TableHead>
                                        <TableHead className="font-bold">Método</TableHead>
                                        <TableHead className="font-bold">Referencia</TableHead>
                                        <TableHead className="text-right font-bold">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detalleFiltrado.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={esMismoDia ? 5 : 6} className="h-24 text-center text-muted-foreground">
                                                No hay ventas registradas en el período seleccionado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        detalleFiltrado.map((item, i) => (
                                            <TableRow key={item.id || i} className="hover:bg-muted/5">
                                                {!esMismoDia && <TableCell className="text-xs">{item.fecha}</TableCell>}
                                                <TableCell className="text-xs">{item.hora}</TableCell>
                                                <TableCell className="text-xs font-medium">{item.tipo}</TableCell>
                                                <TableCell className="text-xs">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.metodo === 'Efectivo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            item.metodo === 'Tarjeta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}>
                                                        {item.metodo}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono">{item.documento}</TableCell>
                                                <TableCell className="text-right font-black text-emerald-600">{formatCurrencyCLP(item.monto)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {detalleFiltrado.length > 0 && (
                            <div className="flex justify-end mt-3 pr-2">
                                <div className="text-sm font-bold text-muted-foreground">
                                    Total filtrado: <span className="text-foreground text-lg ml-2">{formatCurrencyCLP(detalleFiltrado.reduce((acc, d) => acc + d.monto, 0))}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
