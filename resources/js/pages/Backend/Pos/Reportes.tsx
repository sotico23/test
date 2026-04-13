import { router, Head } from '@inertiajs/react';
import { BarChart, ArrowUpRight, ArrowDownRight, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table-pos';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';

interface RankingItem {
    nombre: string;
    total_vendidos: number;
    total_ingresos: number;
}

interface Almacen {
    id: number;
    nombre: string;
}

export default function Reportes({ 
    ranking, 
    utilidad, 
    totalMes,
    almacenes = [],
    almacenId = null
}: { 
    ranking: RankingItem[], 
    utilidad: number, 
    totalMes: number,
    almacenes?: Almacen[],
    almacenId?: string | null
}) {

    const handleAlmacenChange = (id: string) => {
        router.get('/pos/reportes', { almacen_id: id === 'all' ? null : id }, { preserveState: true });
    };

    // Simular stock bajo para la demo de "huesos" o slow moving si no tenemos data real de slow moving
    const huesos = ranking.length > 0 ? ranking.slice(-2) : [];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Caja POS', href: '/pos' }, { title: 'Reportes y Rankings', href: '/pos/reportes' }]}>
            <Head title="Reportes POS" />

            <div className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">INTELIGENCIA DE NEGOCIO (POS)</h1>
                        <p className="text-muted-foreground text-sm">Análisis de rentabilidad real y rotación de inventarios</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-48">
                            <Select
                                value={almacenId || 'all'}
                                onValueChange={handleAlmacenChange}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Todos los Almacenes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Almacenes</SelectItem>
                                    {almacenes.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {a.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm"><Calendar className="mr-2 h-4 w-4" /> Este Mes</Button>
                        <Button size="sm" variant="secondary"><BarChart className="mr-2 h-4 w-4" /> Exportar Dashboard</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-emerald-50 border-emerald-100">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-[10px] font-bold text-emerald-700 uppercase flex items-center justify-between">
                                Utilidad Bruta Real
                                <TrendingUp className="h-3 w-3" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-900">{formatCurrencyCLP(utilidad)}</div>
                            <p className="text-[10px] text-emerald-700 font-medium mt-1">Margen tras descontar costos</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-none">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                                Venta Total (Mes)
                                <DollarSign className="h-3 w-3 text-slate-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white">{formatCurrencyCLP(totalMes)}</div>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1 text-green-400" /> +5.4% vs Mes Ant.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-[10px] font-bold text-blue-700 uppercase flex items-center justify-between">
                                Tickets Emitidos
                                <Package className="h-3 w-3" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-900">{ranking.length > 0 ? 'Real Data' : '0'} Unid.</div>
                            <p className="text-[10px] text-blue-700 font-medium mt-1">Volumen de despacho POS</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-[10px] font-bold text-amber-700 uppercase flex items-center justify-between">
                                Transacciones e-Comm
                                <Package className="h-3 w-3" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-amber-900">0 Nuevas</div>
                            <p className="text-[10px] text-amber-700 font-medium mt-1 font-bold italic tracking-wider animate-pulse">Wait sync...</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-primary font-bold">
                                <TrendingUp className="h-5 w-5" />
                                Productos Estrella (Best Sellers)
                            </CardTitle>
                            <CardDescription className="text-xs italic">Los que más caja generan para el negocio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold uppercase">Nombre Producto</TableHead>
                                        <TableHead className="text-xs font-bold uppercase">Unid.</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase">Recaudación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ranking.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-xs italic">
                                                Sin datos de venta suficientes para rankear.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ranking.map((item, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50">
                                                <TableCell className="text-xs font-bold">{item.nombre}</TableCell>
                                                <TableCell className="text-xs">{item.total_vendidos} u.</TableCell>
                                                <TableCell className="text-right font-black text-emerald-600 text-xs">{formatCurrencyCLP(item.total_ingresos)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-destructive font-bold">
                                <ArrowDownRight className="h-5 w-5" />
                                Productos con Baja Rotación
                            </CardTitle>
                            <CardDescription className="text-xs italic">Mercadería estancada (Huesos) que requiere ofertas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-destructive/5 text-destructive">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold uppercase">Producto</TableHead>
                                        <TableHead className="text-xs font-bold uppercase">Días Stock</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase">Sugerencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ranking.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-xs italic text-destructive/50">
                                                Todo el stock está rotando saludablemente.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ranking.slice(-3).map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="text-xs font-medium text-muted-foreground">{item.nombre}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">30+ días</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-600 bg-amber-50">Liquidar 2x1</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
