import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Download,
    FileSpreadsheet,
    FileJson,
    Lock,
    RefreshCw,
    Search,
    Upload,
    AlertTriangle,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table-pos';
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
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleCerrarTurno = () => {
        setIsClosing(true);
        router.post(
            '/pos/cierre/cerrar',
            {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
            },
            {
                onSuccess: () => {
                    setShowCierreModal(false);
                    setIsClosing(false);
                    window.location.reload();
                },
                onError: () => {
                    setIsClosing(false);
                },
            },
        );
    };

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

        router.post('/pos/cierre/importar', formData, {
            forceFormData: true,
            onSuccess: () => {
                e.target.value = '';
            },
        });
    };

    const aplicarFiltros = () => {
        router.get(
            '/pos/cierre',
            {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
            },
            { preserveState: false },
        );
    };

    const hoy = () => {
        const today = new Date().toISOString().split('T')[0];
        setFechaDesde(today);
        setFechaHasta(today);
        router.get(
            '/pos/cierre',
            {
                fecha_desde: today,
                fecha_hasta: today,
            },
            { preserveState: false },
        );
    };

    const ayer = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yesterday = d.toISOString().split('T')[0];
        setFechaDesde(yesterday);
        setFechaHasta(yesterday);
        router.get(
            '/pos/cierre',
            {
                fecha_desde: yesterday,
                fecha_hasta: yesterday,
            },
            { preserveState: false },
        );
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
        router.get(
            '/pos/cierre',
            {
                fecha_desde: startStr,
                fecha_hasta: end,
            },
            { preserveState: false },
        );
    };

    const esteMes = () => {
        const d = new Date();
        const startStr = new Date(d.getFullYear(), d.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const endStr = d.toISOString().split('T')[0];
        setFechaDesde(startStr);
        setFechaHasta(endStr);
        router.get(
            '/pos/cierre',
            {
                fecha_desde: startStr,
                fecha_hasta: endStr,
            },
            { preserveState: false },
        );
    };

    const exportarPdf = () => {
        window.open(
            `/pos/cierre/pdf?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`,
            '_blank',
        );
    };

    const exportarCsv = () => {
        window.open(
            `/pos/cierre/csv?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`,
            '_blank',
        );
    };

    const detalleFiltrado =
        filtroMetodo === 'todos'
            ? arqueo.detalle
            : arqueo.detalle.filter(
                  (d) => d.metodo.toLowerCase() === filtroMetodo,
              );

    const esMismoDia = fechaDesde === fechaHasta;
    const fechaLabel = esMismoDia
        ? new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : `${new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} — ${new Date(fechaHasta + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Caja POS', href: '/pos' },
                { title: 'Cierre de Caja', href: '/pos/cierre' },
            ]}
        >
            <Head title="Cierre de Caja (Arqueo)" />

            <div className="space-y-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase italic">
                            Arqueo de Caja
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {fechaLabel}— {arqueo.cantidad_ventas} transacciones
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
                        </Button>
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
                                <DropdownMenuItem onClick={exportarPdf}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportarCsv}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar Excel/CSV
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleImportCSV}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Importar CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleImportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Importar Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-red-700 px-6 font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-red-800"
                            onClick={() => setShowCierreModal(true)}
                        >
                            <Lock className="mr-2 h-4 w-4" /> CERRAR TURNO
                        </Button>
                    </div>
                </div>

                {/* Filtros de Fecha */}
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={hoy}
                                    className={
                                        esMismoDia &&
                                        fechaDesde ===
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                            ? 'bg-primary text-primary-foreground'
                                            : ''
                                    }
                                >
                                    Hoy
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={ayer}
                                >
                                    Ayer
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={estaSemana}
                                >
                                    Esta Semana
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={esteMes}
                                >
                                    Este Mes
                                </Button>
                            </div>
                            <div className="flex flex-1 items-end gap-3">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Desde
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) =>
                                            setFechaDesde(e.target.value)
                                        }
                                        className="h-9 w-[160px]"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Hasta
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) =>
                                            setFechaHasta(e.target.value)
                                        }
                                        className="h-9 w-[160px]"
                                    />
                                </div>
                                <Button size="sm" onClick={aplicarFiltros}>
                                    <Search className="mr-2 h-4 w-4" />{' '}
                                    Consultar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Totales / Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                                EFECTIVO EN CAJA
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600">
                                {formatCurrencyCLP(arqueo.efectivo)}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Sencillo acumulado en período
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                                TARJETAS (VOUCHERS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-600">
                                {formatCurrencyCLP(arqueo.tarjeta)}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Transbank / Mercado Pago
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                                TRANSFERENCIAS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-purple-600">
                                {formatCurrencyCLP(arqueo.transferencia)}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Bancarias directas
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-slate-900 text-white shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase">
                                TOTAL ARQUEO
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white">
                                {formatCurrencyCLP(arqueo.total)}
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">
                                {arqueo.cantidad_ventas} transacciones
                                realizadas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Detalle */}
                <Card className="border-none bg-background shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    Resumen de Transacciones
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Movimientos registrados en el período
                                    seleccionado.
                                </CardDescription>
                            </div>
                            <Select
                                value={filtroMetodo}
                                onValueChange={setFiltroMetodo}
                            >
                                <SelectTrigger className="h-8 w-[170px] text-xs">
                                    <SelectValue placeholder="Filtrar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">
                                        Todos los métodos
                                    </SelectItem>
                                    <SelectItem value="efectivo">
                                        Efectivo
                                    </SelectItem>
                                    <SelectItem value="tarjeta">
                                        Tarjeta
                                    </SelectItem>
                                    <SelectItem value="transferencia">
                                        Transferencia
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        {!esMismoDia && (
                                            <TableHead className="font-bold">
                                                Fecha
                                            </TableHead>
                                        )}
                                        <TableHead className="font-bold">
                                            Hora
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Concepto
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Método
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Referencia
                                        </TableHead>
                                        <TableHead className="text-right font-bold">
                                            Monto
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detalleFiltrado.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={esMismoDia ? 5 : 6}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No hay ventas registradas en el
                                                período seleccionado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        detalleFiltrado.map((item, i) => (
                                            <TableRow
                                                key={item.id || i}
                                                className="hover:bg-muted/5"
                                            >
                                                {!esMismoDia && (
                                                    <TableCell className="text-xs">
                                                        {item.fecha}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-xs">
                                                    {item.hora}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium">
                                                    {item.tipo}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                            item.metodo ===
                                                            'Efectivo'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : item.metodo ===
                                                                    'Tarjeta'
                                                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}
                                                    >
                                                        {item.metodo}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {item.documento}
                                                </TableCell>
                                                <TableCell className="text-right font-black text-emerald-600">
                                                    {formatCurrencyCLP(
                                                        item.monto,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {detalleFiltrado.length > 0 && (
                            <div className="mt-3 flex justify-end pr-2">
                                <div className="text-sm font-bold text-muted-foreground">
                                    Total filtrado:{' '}
                                    <span className="ml-2 text-lg text-foreground">
                                        {formatCurrencyCLP(
                                            detalleFiltrado.reduce(
                                                (acc, d) => acc + d.monto,
                                                0,
                                            ),
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
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

            <Dialog open={showCierreModal} onOpenChange={setShowCierreModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Cerrar Turno
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cerrar el turno? Esta
                            acción finalizará la sesión actual y no podrá
                            deshacerse.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Período:
                            </span>
                            <span className="text-sm font-medium">
                                {fechaLabel}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Transacciones:
                            </span>
                            <span className="text-sm font-medium">
                                {arqueo.cantidad_ventas}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-sm text-muted-foreground">
                                Total:
                            </span>
                            <span className="text-lg font-bold text-emerald-600">
                                {formatCurrencyCLP(arqueo.total)}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCierreModal(false)}
                            disabled={isClosing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-red-600 to-red-700 font-bold text-white"
                            onClick={handleCerrarTurno}
                            disabled={isClosing}
                        >
                            {isClosing ? 'Cerrando...' : 'Confirmar Cierre'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
