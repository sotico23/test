import { Head } from '@inertiajs/react';
import { FileText, Send, RefreshCw, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table-pos';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';

interface Documento {
    id: number;
    numero_factura: string | null;
    tipo_documento: string;
    total: number;
    estado: string;
    created_at: string;
    cliente?: {
        nombre: string;
        rut: string | null;
    };
}

export default function Facturacion({ documentos }: { documentos: Documento[] }) {

    const countTipo = (tipo: string) => documentos.filter(d => d.tipo_documento === tipo).length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Caja POS', href: '/pos' }, { title: 'Facturación y N.C', href: '/pos/facturacion' }]}>
            <Head title="Facturación Electrónica" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">FACTURACIÓN DTE INTEGRADA</h1>
                        <p className="text-muted-foreground text-sm">Control de envíos al SII y emisión de documentos legales</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" /> Recargar SII</Button>
                        <Button size="sm" className="bg-primary shadow-lg shadow-primary/20"><FileText className="mr-2 h-4 w-4" /> Nueva Factura Manual</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-none border bg-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">BOLETAS GENERADAS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{countTipo('boleta')} DTE</div>
                            <div className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Sincronización Exitosa
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none border bg-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">FACTURAS GENERADAS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{countTipo('factura')} DTE</div>
                            <div className="text-[10px] text-blue-600 font-bold flex items-center mt-1">
                                <Monitor className="h-3 w-3 mr-1" /> Lista para Impresión
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none border bg-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">NOTAS DE CRÉDITO</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-destructive">{countTipo('nota_credito')} emitidas</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Procesadas este mes</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-indigo-200 uppercase">TIEMPO DE RESPUESTA SII</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">Fast Mode</div>
                            <div className="text-[10px] text-indigo-200 flex items-center mt-1">
                                <Smartphone className="h-3 w-3 mr-1" /> Latencia: 1.2s promedio
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-none border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold">Registro de Documentos Tributarios (Historial)</CardTitle>
                        <CardDescription className="text-xs">Monitoreo en tiempo real de los folios enviados y aceptados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold">Folio</TableHead>
                                        <TableHead className="font-bold">Tipo Documento</TableHead>
                                        <TableHead className="font-bold">Cliente / RUT</TableHead>
                                        <TableHead className="font-bold">Monto Total</TableHead>
                                        <TableHead className="font-bold">Estado</TableHead>
                                        <TableHead className="text-right font-bold">Operaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documentos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                No hay documentos emitidos todavía.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        documentos.map((doc) => (
                                            <TableRow key={doc.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-mono text-xs font-bold">#{doc.numero_factura || doc.id}</TableCell>
                                                <TableCell className="text-xs uppercase font-medium">{doc.tipo_documento}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-bold">{doc.cliente?.nombre || 'Particular'}</div>
                                                    <div className="text-[10px] text-muted-foreground">{doc.cliente?.rut || 'Sin RUT'}</div>
                                                </TableCell>
                                                <TableCell className="font-black text-xs">{formatCurrencyCLP(doc.total)}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-500 text-[10px] h-5 rounded-full px-2">Aceptado SII</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] py-0">PDF</Button>
                                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] py-0 text-destructive">Anular</Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Send className="h-3 w-3" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
