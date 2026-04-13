import { Head, router } from '@inertiajs/react';
import {
    Barcode,
    Search,
    Trash2,
    ShoppingCart,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    User as UserIcon,
    FileText,
    Receipt,
    Package,
    X,
    Wallet,
    Ticket,
    Building2,
    MessageCircle,
} from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyCLP } from '@/lib/utils';

interface Sku {
    id: number;
    sku: string;
    precio_venta: number;
    stock: number;
    variantes: { variante: string; valor: string }[];
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    codigo: string | null;
    precio_venta: number;
    precio_con_variantes: number;
    stock: number;
    stock_minimo: number;
    unidad_medida?: 'unidad' | 'kg' | 'lt';
    imagen: string | null;
    tiene_variantes: boolean;
    skus: Sku[];
}

interface Cliente {
    id: number;
    nombre: string;
    rut: string | null;
}

interface Almacen {
    id: number;
    nombre: string;
}

interface Promocion {
    id: number;
    nombre: string;
    tipo: 'porcentaje' | 'precio_fijo' | 'combo_2x1';
    valor: number;
    skus: string[] | null;
    categoria_id: number | null;
    compra_minima: number;
}

interface CartItem {
    cartId: string;
    productoId: number;
    skuId: number | null;
    nombre: string;
    sku: string | null;
    variantes: string | null;
    precio_venta: number;
    cantidad: number;
    stock: number;
    unidad_medida?: string;
}

export default function PosIndex({
    productos,
    clientes,
    almacenes = [],
    promociones = [],
}: {
    productos: Producto[];
    clientes: Cliente[];
    almacenes?: Almacen[];
    promociones?: Promocion[];
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [scannedCode, setScannedCode] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [procesando, setProcesando] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] =
        useState<Producto | null>(null);
    const [skuSeleccionado, setSkuSeleccionado] = useState<Sku | null>(null);
    const [ultimaVenta, setUltimaVenta] = useState<{
        numero: string;
        items: CartItem[];
        subtotal: number;
        descuento: number;
        iva: number;
        total: number;
        metodoPago: string;
        tipoDocumento: string;
    } | null>(null);

    const [clienteId, setClienteId] = useState<string>('0');
    const [metodoPago, setMetodoPago] = useState<
        | 'efectivo'
        | 'tarjeta'
        | 'transferencia'
        | 'vale'
        | 'visa_transbank'
        | 'binance'
        | 'contactar'
    >('efectivo');
    const [tipoDocumento, setTipoDocumento] = useState<'boleta' | 'factura'>(
        'boleta',
    );
    const [almacenId, setAlmacenId] = useState<string>(
        almacenes.length > 0 ? String(almacenes[0].id) : '',
    );
    const [mostrarModalPagos, setMostrarModalPagos] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                if (
                    e.key === 'Enter' &&
                    e.target === inputRef.current &&
                    scannedCode.trim() !== ''
                ) {
                    procesarCodigoBarra(scannedCode);
                }
                return;
            }

            if (e.key === 'Enter') {
                if (scannedCode.trim() !== '') {
                    procesarCodigoBarra(scannedCode);
                }
            } else if (e.key.length === 1) {
                setScannedCode((prev) => prev + e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scannedCode, productos]);

    useEffect(() => {
        if (scannedCode) {
            const timeout = setTimeout(() => setScannedCode(''), 500);
            return () => clearTimeout(timeout);
        }
    }, [scannedCode]);

    const buscarProductoSku = (codigo: string) => {
        const codigoLimpio = codigo.trim();
        const producto = productos.find(
            (p) => p.codigo === codigoLimpio || String(p.id) === codigoLimpio,
        );
        if (producto) {
            if (producto.tiene_variantes && producto.skus.length > 0) {
                const sku =
                    producto.skus.find((s) => s.sku === codigoLimpio) ||
                    producto.skus[0];
                return { producto, sku };
            }
            return { producto, sku: null };
        }
        return null;
    };

    const procesarCodigoBarra = (codigo: string) => {
        const resultado = buscarProductoSku(codigo);
        if (resultado) {
            const { producto, sku } = resultado;
            agregarAlCarrito(producto, sku);
            toast.success(
                `Agregado: ${producto.nombre}${sku ? ` (${sku.variantes.map((v) => v.valor).join(' - ')})` : ''}`,
            );
        } else {
            toast.error(`Producto no encontrado: ${codigo}`);
        }
        setScannedCode('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const agregarAlCarrito = (producto: Producto, sku: Sku | null = null) => {
        const precio = sku?.precio_venta ?? producto.precio_venta;
        const stock = sku?.stock ?? producto.stock;

        setCart((prev) => {
            const existingIndex = prev.findIndex(
                (item) =>
                    item.productoId === producto.id &&
                    item.skuId === (sku?.id ?? null),
            );
            if (existingIndex >= 0) {
                return prev.map((item, idx) =>
                    idx === existingIndex
                        ? {
                              ...item,
                              cantidad: parseFloat(
                                  (item.cantidad + 1).toFixed(3),
                              ),
                          }
                        : item,
                );
            }
            const step =
                producto.unidad_medida === 'kg' ||
                producto.unidad_medida === 'lt'
                    ? 0.1
                    : 1;
            const skuDesc = sku
                ? sku.variantes
                      .map((v) => `${v.variante}: ${v.valor}`)
                      .join(', ')
                : null;
            return [
                ...prev,
                {
                    cartId: Math.random().toString(36).substr(2, 9),
                    productoId: producto.id,
                    skuId: sku?.id ?? null,
                    nombre: producto.nombre,
                    sku: sku?.sku ?? null,
                    variantes: skuDesc,
                    precio_venta: precio,
                    cantidad: step,
                    stock: stock,
                    unidad_medida: producto.unidad_medida,
                },
            ];
        });
    };

    const handleProductoClick = (producto: Producto) => {
        if (producto.tiene_variantes) {
            setProductoSeleccionado(producto);
            setSkuSeleccionado(null);
        } else {
            agregarAlCarrito(producto, null);
            toast.success(`Agregado: ${producto.nombre}`);
        }
    };

    const confirmarVariante = () => {
        if (productoSeleccionado && skuSeleccionado) {
            agregarAlCarrito(productoSeleccionado, skuSeleccionado);
            toast.success(
                `Agregado: ${productoSeleccionado.nombre} (${skuSeleccionado.variantes.map((v) => v.valor).join(' - ')})`,
            );
            setProductoSeleccionado(null);
            setSkuSeleccionado(null);
        }
    };

    const actualizarCantidad = (cartId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.cartId === cartId) {
                    const step =
                        item.unidad_medida === 'kg' ||
                        item.unidad_medida === 'lt'
                            ? 0.1
                            : 1;
                    const finalDelta = delta > 0 ? step : -step;
                    const nuevaCantidad = Math.max(
                        step,
                        item.cantidad + finalDelta,
                    );
                    return {
                        ...item,
                        cantidad: parseFloat(nuevaCantidad.toFixed(3)),
                    };
                }
                return item;
            }),
        );
    };

    const eliminarItem = (cartId: string) => {
        setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const vaciarCarrito = () => setCart([]);

    const calcularDescuento = () => {
        if (promociones.length === 0) return 0;

        const totalCarrito = cart.reduce(
            (acc, item) => acc + item.precio_venta * item.cantidad,
            0,
        );

        let descuentoTotal = 0;

        for (const promo of promociones) {
            if (promo.compra_minima && totalCarrito < promo.compra_minima) {
                continue;
            }

            if (promo.tipo === 'porcentaje') {
                descuentoTotal += totalCarrito * (promo.valor / 100);
            } else if (promo.tipo === 'precio_fijo') {
                descuentoTotal += promo.valor;
            }
        }

        return descuentoTotal;
    };

    const descuento = useMemo(() => calcularDescuento(), [cart, promociones]);

    const subtotal = useMemo(() => {
        return cart.reduce(
            (acc, item) => acc + item.precio_venta * item.cantidad,
            0,
        );
    }, [cart]);

    const iva = useMemo(
        () => (subtotal - descuento) * 0.19,
        [subtotal, descuento],
    );
    const total = useMemo(() => subtotal - descuento, [subtotal, descuento]);

    const productosFiltrados = useMemo(() => {
        if (!busqueda) return productos.slice(0, 12);
        const lowerB = busqueda.toLowerCase();
        return productos.filter(
            (p) =>
                p.nombre.toLowerCase().includes(lowerB) ||
                (p.codigo && p.codigo.toLowerCase().includes(lowerB)),
        );
    }, [busqueda, productos]);

    const procesarPago = (
        metodo:
            | 'efectivo'
            | 'tarjeta'
            | 'transferencia'
            | 'vale'
            | 'visa_transbank'
            | 'binance'
            | 'contactar',
    ) => {
        if (cart.length === 0) return;
        setProcesando(true);

        router.post(
            '/pos',
            {
                cliente_id: clienteId === '0' ? null : clienteId,
                metodo_pago: metodo,
                tipo_documento: tipoDocumento,
                items: cart.map((item) => ({
                    id: item.productoId,
                    sku_id: item.skuId,
                    cantidad: item.cantidad,
                    precio: item.precio_venta,
                })),
                subtotal: subtotal - iva,
                iva: iva,
                total: total,
                descuento: descuento,
                almacen_id: almacenId,
            },
            {
                onSuccess: () => {
                    const numeroVenta = 'POS-' + Date.now();
                    setUltimaVenta({
                        numero: numeroVenta,
                        items: [...cart],
                        subtotal: subtotal,
                        descuento: descuento,
                        iva: iva,
                        total: total,
                        metodoPago: metodoPago,
                        tipoDocumento: tipoDocumento,
                    });
                    vaciarCarrito();
                    setProcesando(false);
                    toast.success('Venta registrada exitosamente');
                },
                onError: () => {
                    setProcesando(false);
                    toast.error('Error al procesar la venta');
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Caja POS', href: '/pos' },
            ]}
        >
            <Head title="Caja POS" />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
                <div className="flex flex-1 flex-col gap-4 overflow-hidden border-r p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar producto o escanear..."
                                className="h-12 pl-10 text-lg"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 shrink-0"
                        >
                            <Barcode className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {productosFiltrados.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                <ShoppingCart className="mb-4 h-16 w-16 opacity-20" />
                                <p>No se encontraron productos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {productosFiltrados.map((prod) => (
                                    <Card
                                        key={prod.id}
                                        className="h-fit cursor-pointer transition-all hover:border-primary hover:shadow-md"
                                        onClick={() =>
                                            handleProductoClick(prod)
                                        }
                                    >
                                        <div className="group relative flex aspect-square items-center justify-center overflow-hidden bg-muted/30 p-2 text-muted-foreground">
                                            {prod.imagen ? (
                                                <img
                                                    src={
                                                        '/storage/' +
                                                        prod.imagen
                                                    }
                                                    className="h-full w-full rounded object-cover"
                                                    alt={prod.nombre}
                                                />
                                            ) : (
                                                <span className="text-2xl font-black opacity-10">
                                                    {prod.nombre
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                                                {prod.tiene_variantes ? (
                                                    <Package className="h-10 w-10 text-primary" />
                                                ) : (
                                                    <Plus className="h-10 w-10 text-primary" />
                                                )}
                                            </div>
                                            {prod.stock > 0 &&
                                                prod.stock <=
                                                    prod.stock_minimo && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 text-[10px]"
                                                    >
                                                        Bajo stock
                                                    </Badge>
                                                )}
                                            {prod.stock === 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute top-2 right-2 text-[10px]"
                                                >
                                                    Sin stock
                                                </Badge>
                                            )}
                                        </div>
                                        <CardContent className="p-3">
                                            <div className="mb-1 truncate text-xs font-bold text-muted-foreground uppercase">
                                                {prod.codigo || 'S/C'}
                                            </div>
                                            <div className="mb-2 line-clamp-2 h-10 text-sm leading-tight font-semibold">
                                                {prod.nombre}
                                            </div>
                                            {prod.tiene_variantes && (
                                                <div className="mb-1 text-xs text-muted-foreground">
                                                    {prod.skus.length} variantes
                                                </div>
                                            )}
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="text-lg leading-none font-black text-emerald-600">
                                                    {formatCurrencyCLP(
                                                        prod.tiene_variantes
                                                            ? prod.precio_con_variantes
                                                            : prod.precio_venta,
                                                    )}
                                                </div>
                                                {prod.tiene_variantes ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 py-0 text-[10px] uppercase"
                                                    >
                                                        SKUs
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 py-0 text-[10px] uppercase"
                                                    >
                                                        {prod.unidad_medida ||
                                                            'u'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Stock:{' '}
                                                {prod.stock > 0
                                                    ? prod.stock
                                                    : 'Sin stock'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex w-[400px] flex-col bg-muted/10">
                    <div className="space-y-4 border-b bg-background p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={clienteId}
                                onValueChange={setClienteId}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Cliente Genérico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">
                                        Cliente Genérico
                                    </SelectItem>
                                    {clientes.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.nombre} ({c.rut})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={
                                    tipoDocumento === 'boleta'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="flex-1"
                                onClick={() => setTipoDocumento('boleta')}
                            >
                                <Receipt className="mr-2 h-4 w-4" /> Boleta
                            </Button>
                            <Button
                                variant={
                                    tipoDocumento === 'factura'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="flex-1"
                                onClick={() => setTipoDocumento('factura')}
                            >
                                <FileText className="mr-2 h-4 w-4" /> Factura
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/70 uppercase">
                                Almacén de Origen
                            </Label>
                            <Select
                                value={almacenId}
                                onValueChange={setAlmacenId}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Seleccionar Almacén" />
                                </SelectTrigger>
                                <SelectContent>
                                    {almacenes.map((a) => (
                                        <SelectItem
                                            key={a.id}
                                            value={String(a.id)}
                                        >
                                            {a.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center py-20 text-muted-foreground/40">
                                <Barcode className="mb-4 h-20 w-20" />
                                <p className="font-bold">CAJA LISTA</p>
                                <p className="text-xs">
                                    Escanee o busque productos
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <Card
                                    key={item.cartId}
                                    className="shrink-0 overflow-hidden border-none shadow-sm"
                                >
                                    <div className="flex gap-3 p-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-bold">
                                                {item.nombre}
                                            </div>
                                            {item.variantes && (
                                                <div className="text-xs text-muted-foreground">
                                                    {item.variantes}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {formatCurrencyCLP(
                                                    item.precio_venta,
                                                )}{' '}
                                                x {item.cantidad}
                                                {item.stock > 0 &&
                                                    item.stock <= 5 && (
                                                        <span className="ml-1 text-orange-500">
                                                            (Stock: {item.stock}
                                                            )
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between text-right">
                                            <div className="font-black text-emerald-600">
                                                {formatCurrencyCLP(
                                                    item.precio_venta *
                                                        item.cantidad,
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full bg-muted"
                                                    onClick={() =>
                                                        actualizarCantidad(
                                                            item.cartId,
                                                            -1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center text-xs font-bold">
                                                    {item.cantidad}{' '}
                                                    <span className="text-[8px] uppercase">
                                                        {item.unidad_medida ||
                                                            'u'}
                                                    </span>
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full bg-muted"
                                                    onClick={() =>
                                                        actualizarCantidad(
                                                            item.cartId,
                                                            1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        eliminarItem(
                                                            item.cartId,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="space-y-4 border-t bg-background p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrencyCLP(subtotal)}</span>
                            </div>
                            {descuento > 0 && (
                                <div className="flex justify-between text-sm font-medium text-orange-600">
                                    <span>Descuento</span>
                                    <span>-{formatCurrencyCLP(descuento)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>IVA (19%)</span>
                                <span>{formatCurrencyCLP(iva)}</span>
                            </div>
                            <div className="mt-2 flex justify-between border-t pt-2 text-xl font-black">
                                <span>TOTAL</span>
                                <span className="text-emerald-600">
                                    {formatCurrencyCLP(total)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                className="h-16 flex-col gap-1 bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                                disabled={cart.length === 0 || procesando}
                                onClick={() => procesarPago('tarjeta')}
                            >
                                <CreditCard className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase">
                                    Tarjeta
                                </span>
                            </Button>
                            <Button
                                className="h-16 flex-col gap-1 bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                                disabled={cart.length === 0 || procesando}
                                onClick={() => procesarPago('efectivo')}
                            >
                                <Banknote className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase">
                                    Efectivo
                                </span>
                            </Button>
                        </div>

                        <Button
                            className="mt-3 h-12 w-full bg-slate-600 hover:bg-slate-700"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => setMostrarModalPagos(true)}
                        >
                            <Wallet className="mr-2 h-5 w-5" />
                            <span className="font-bold uppercase">
                                Otros Métodos
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog
                open={mostrarModalPagos}
                onOpenChange={setMostrarModalPagos}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Seleccionar Método de Pago
                        </DialogTitle>
                        <DialogDescription>
                            Elige el método de pago para esta venta
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => {
                                procesarPago('vale');
                                setMostrarModalPagos(false);
                            }}
                        >
                            <Ticket className="h-8 w-8" />
                            <span className="text-xs font-bold">Vales</span>
                        </Button>

                        <Button
                            className="h-20 flex-col gap-2 bg-indigo-600 hover:bg-indigo-700"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => {
                                procesarPago('transferencia');
                                setMostrarModalPagos(false);
                            }}
                        >
                            <Building2 className="h-8 w-8" />
                            <span className="text-xs font-bold">
                                Transferencia
                            </span>
                        </Button>

                        <Button
                            className="h-20 flex-col gap-2 bg-orange-600 hover:bg-orange-700"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => {
                                procesarPago('visa_transbank');
                                setMostrarModalPagos(false);
                            }}
                        >
                            <CreditCard className="h-8 w-8" />
                            <span className="text-xs font-bold">
                                Visa Transbank
                            </span>
                        </Button>

                        <Button
                            className="h-20 flex-col gap-2 bg-yellow-500 hover:bg-yellow-600"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => {
                                procesarPago('binance');
                                setMostrarModalPagos(false);
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-8 w-8 fill-current"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.53l-1.41-1.41-3.64 3.64-1.41-1.41-1.41 1.41 2.82 2.82 4.24-4.24-1.41-1.41z" />
                            </svg>
                            <span className="text-xs font-bold">Binance</span>
                        </Button>

                        <Button
                            className="col-span-2 h-16 flex-col gap-2 bg-slate-700 hover:bg-slate-800"
                            disabled={cart.length === 0 || procesando}
                            onClick={() => {
                                procesarPago('contactar');
                                setMostrarModalPagos(false);
                            }}
                        >
                            <MessageCircle className="h-8 w-8" />
                            <span className="text-xs font-bold">
                                Contactar con Administración
                            </span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!productoSeleccionado}
                onOpenChange={(open) => !open && setProductoSeleccionado(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Seleccionar Variante
                        </DialogTitle>
                    </DialogHeader>
                    {productoSeleccionado && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Producto
                                </Label>
                                <p className="text-lg font-semibold">
                                    {productoSeleccionado.nombre}
                                </p>
                            </div>
                            <div>
                                <Label className="mb-2 block text-muted-foreground">
                                    SKU / Variante
                                </Label>
                                <div className="grid max-h-[300px] grid-cols-1 gap-2 overflow-y-auto">
                                    {productoSeleccionado.skus.map((sku) => (
                                        <div
                                            key={sku.id}
                                            className={`cursor-pointer rounded-lg border p-3 transition-all ${
                                                skuSeleccionado?.id === sku.id
                                                    ? 'border-primary bg-primary/10'
                                                    : sku.stock === 0
                                                      ? 'cursor-not-allowed opacity-50'
                                                      : 'hover:border-muted-foreground'
                                            }`}
                                            onClick={() =>
                                                sku.stock > 0 &&
                                                setSkuSeleccionado(sku)
                                            }
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {sku.sku}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {sku.variantes
                                                            .map(
                                                                (v) =>
                                                                    `${v.variante}: ${v.valor}`,
                                                            )
                                                            .join(' | ')}
                                                    </p>
                                                    <p
                                                        className={`text-sm ${sku.stock > 0 ? 'text-emerald-600' : 'text-destructive'}`}
                                                    >
                                                        Stock: {sku.stock}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600">
                                                        {formatCurrencyCLP(
                                                            sku.precio_venta,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() =>
                                        setProductoSeleccionado(null)
                                    }
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!skuSeleccionado}
                                    onClick={confirmarVariante}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {ultimaVenta && (
                <Dialog open={true} onOpenChange={() => setUltimaVenta(null)}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Venta Completada
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="border-b pb-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Número de Ticket
                                </p>
                                <p className="text-2xl font-bold">
                                    {ultimaVenta.numero}
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                {ultimaVenta.items.map((item) => (
                                    <div
                                        key={item.cartId}
                                        className="flex justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.nombre}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.cantidad} x{' '}
                                                {formatCurrencyCLP(
                                                    item.precio_venta,
                                                )}
                                            </p>
                                        </div>
                                        <p className="font-bold">
                                            {formatCurrencyCLP(
                                                item.precio_venta *
                                                    item.cantidad,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1 border-t pt-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatCurrencyCLP(
                                            ultimaVenta.subtotal,
                                        )}
                                    </span>
                                </div>
                                {ultimaVenta.descuento > 0 && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>Descuento</span>
                                        <span>
                                            -
                                            {formatCurrencyCLP(
                                                ultimaVenta.descuento,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>IVA (19%)</span>
                                    <span>
                                        {formatCurrencyCLP(ultimaVenta.iva)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>TOTAL</span>
                                    <span className="text-emerald-600">
                                        {formatCurrencyCLP(ultimaVenta.total)}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                <p>Método de pago: {ultimaVenta.metodoPago}</p>
                                <p>
                                    Documento:{' '}
                                    {ultimaVenta.tipoDocumento
                                        .charAt(0)
                                        .toUpperCase() +
                                        ultimaVenta.tipoDocumento.slice(1)}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setUltimaVenta(null)}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => window.print()}
                                >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Imprimir Ticket
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .ticket-print, .ticket-print * {
                        visibility: visible;
                    }
                    .ticket-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        padding: 10px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
