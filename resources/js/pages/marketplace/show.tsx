import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Store,
    MapPin,
    Mail,
    ShoppingBag,
    Star,
    Clock,
    CheckCircle2,
    Share2,
    Heart,
    ChevronLeft,
    Plus,
    Minus,
    ShoppingCart,
    MessageSquare,
    Copy,
    Check,
    Link2,
    Send,
    ArrowRight,
    Search,
    Wallet,
    CreditCard,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { FormInput } from '@/components/form-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import chat from '@/routes/chat';
import type { User } from '@/types';

interface LocalUserType extends User {
    ciudad?: string | null;
    region?: string | null;
    cover_photo_url?: string;
}

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    imagen: string | null;
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_venta: number;
    imagen: string | null;
    unidad_medida: string;
    categoria_id: number;
    is_service: boolean;
    duracion: number | null;
}

interface UserReaction {
    like: number;
    rating: number | null;
}

interface StoreProfile {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    is_official: boolean;
    user: LocalUserType;
    categorias: Categoria[];
    productos: Producto[];
    created_at: string;
    likes_count: number;
    rating_total: number;
    rating_count: number;
}

export default function MarketplaceShow({
    store,
    userReaction,
    paymentConfig,
}: {
    store: StoreProfile;
    userReaction?: UserReaction;
    paymentConfig?: {
        is_active: boolean;
        paypal_active: boolean;
        mercadopago_active: boolean;
    };
}) {
    const { auth } = usePage<{ auth: { user?: User } }>().props;

    // States - Carrito persistente en localStorage
    const carritoKey = `carrito_${store.slug}`;
    const [carrito, setCarritoState] = useState<{ [key: number]: number }>(
        () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(carritoKey);
                return saved ? JSON.parse(saved) : {};
            }
            return {};
        },
    );
    const setCarrito = (
        val:
            | { [key: number]: number }
            | ((prev: { [key: number]: number }) => { [key: number]: number }),
    ) => {
        setCarritoState((prev) => {
            const next = typeof val === 'function' ? val(prev) : val;
            localStorage.setItem(carritoKey, JSON.stringify(next));
            return next;
        });
    };
    const [cantidadesAgregar, setCantidadesAgregar] = useState<{
        [key: number]: number;
    }>({});
    const [productoAgregado, setProductoAgregado] = useState<number | null>(
        null,
    );
    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [checkoutAbierto, setCheckoutAbierto] = useState(false);
    const [datosCheckout, setDatosCheckout] = useState({
        nombre_cliente: '',
        rut_cliente: '',
        email_cliente: '',
        telefono_cliente: '',
        region: '',
        comuna: '',
        direccion_cliente: '',
        numero_direccion: '',
        depto_casa: '',
        metodo_pago: 'efectivo',
    });

    // Autocompletar con datos del usuario autenticado
    useEffect(() => {
        if (auth?.user) {
            const user = auth.user;
            setDatosCheckout((prev) => ({
                ...prev,
                nombre_cliente: prev.nombre_cliente || user.name || '',
                email_cliente: prev.email_cliente || user.email || '',
                telefono_cliente:
                    prev.telefono_cliente || (user.telefono as string) || '',
                direccion_cliente:
                    prev.direccion_cliente || (user.direccion as string) || '',
                region: prev.region || (user.region as string) || '',
                comuna: prev.comuna || (user.comuna as string) || '',
                rut_cliente: prev.rut_cliente || (user.rut as string) || '',
            }));
        }
    }, [auth]);

    const [procesando, setProcesando] = useState(false);
    const [localLike, setLocalLike] = useState(userReaction?.like ?? 0);
    const [localRating, setLocalRating] = useState(userReaction?.rating ?? 0);

    // Derived
    const averageRating =
        store.rating_count > 0
            ? (store.rating_total / store.rating_count).toFixed(1)
            : '5.0';
    const totalItems = useMemo(
        () => Object.values(carrito).reduce((a, b) => a + b, 0),
        [carrito],
    );
    const productosEnCarrito = useMemo(
        () => store.productos.filter((p) => carrito[p.id] && carrito[p.id] > 0),
        [store.productos, carrito],
    );
    const totalCarrito = useMemo(
        () =>
            productosEnCarrito.reduce(
                (sum, p) => sum + p.precio_venta * (carrito[p.id] || 0),
                0,
            ),
        [productosEnCarrito, carrito],
    );

    const agregarAlCarrito = (productoId: number) => {
        const cantidad = cantidadesAgregar[productoId] || 1;
        setCarrito((prev) => ({
            ...prev,
            [productoId]: (prev[productoId] || 0) + cantidad,
        }));
        setCantidadesAgregar((prev) => ({ ...prev, [productoId]: 1 }));
        setProductoAgregado(productoId);
        setTimeout(() => setProductoAgregado(null), 2000);
        toast.success('Añadido al pedido');
    };

    const enviarCheckout = () => {
        if (!datosCheckout.nombre_cliente) {
            toast.error('El nombre es obligatorio');
            return;
        }
        setProcesando(true);
        const items = Object.entries(carrito).map(([id, qty]) => ({
            producto_id: parseInt(id),
            cantidad: qty,
        }));
        router.post(
            `/tienda/${store.slug}/checkout`,
            {
                public_profile_id: store.id,
                items,
                ...datosCheckout,
            },
            {
                onSuccess: () => {
                    setProcesando(false);
                    setCheckoutAbierto(false);
                    setCarritoState({});
                    localStorage.removeItem(carritoKey);
                    setCarritoAbierto(false);
                    setDatosCheckout({
                        nombre_cliente: '',
                        rut_cliente: '',
                        email_cliente: '',
                        telefono_cliente: '',
                        region: '',
                        comuna: '',
                        direccion_cliente: '',
                        numero_direccion: '',
                        depto_casa: '',
                        metodo_pago: 'efectivo',
                    });
                    toast.success('¡Pedido enviado con éxito!');
                },
                onError: () => setProcesando(false),
            },
        );
    };

    const ProductCard = ({ producto }: { producto: Producto }) => (
        <div className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900">
                {producto.imagen ? (
                    <img
                        src={`/storage/${producto.imagen}`}
                        alt={producto.nombre}
                        className="h-full w-full object-contain p-4 transition-transform group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-10 w-10 text-slate-200" />
                    </div>
                )}
            </div>
            <div className="mt-4 flex-1">
                <h4 className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-white">
                    {producto.nombre}
                </h4>
                <p className="mt-2 text-xl font-black text-primary">
                    ${Number(producto.precio_venta).toLocaleString()}
                </p>
            </div>
            <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-800">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        onClick={() =>
                            setCantidadesAgregar((prev) => ({
                                ...prev,
                                [producto.id]: Math.max(
                                    1,
                                    (prev[producto.id] || 1) - 1,
                                ),
                            }))
                        }
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-black">
                        {cantidadesAgregar[producto.id] || 1}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        onClick={() =>
                            setCantidadesAgregar((prev) => ({
                                ...prev,
                                [producto.id]: (prev[producto.id] || 1) + 1,
                            }))
                        }
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button
                    className="h-11 w-full rounded-2xl text-xs font-black uppercase"
                    onClick={() => agregarAlCarrito(producto.id)}
                    disabled={productoAgregado === producto.id}
                >
                    {productoAgregado === producto.id ? (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Listo
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Pedir
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Marketplace', href: '/tienda' },
                { title: store.title, href: `/tienda/${store.slug}` },
            ]}
        >
            <Head title={store.title} />

            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Fixed Hero */}
                {/* Facebook Style Hero */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    {/* Portada */}
                    <div className="relative h-48 w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 sm:h-80">
                        {store.user.cover_photo_url && (
                            <img
                                src={store.user.cover_photo_url}
                                className="h-full w-full object-cover opacity-80"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Info Bar */}
                    <div className="px-6 pb-8 sm:px-12 sm:pb-12">
                        <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                            {/* Avatar - Overlapping More */}
                            <div className="relative -mt-28 h-40 w-40 shrink-0 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-2xl sm:-mt-36 sm:h-48 sm:w-48 dark:border-slate-900">
                                {store.user.profile_photo_url ? (
                                    <img
                                        src={store.user.profile_photo_url}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-6xl font-black text-slate-300 dark:bg-slate-800">
                                        {store.title.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="mt-6 flex-1 text-center sm:mt-0 sm:text-left">
                                <h1 className="text-3xl font-[900] tracking-tighter text-slate-900 uppercase sm:text-5xl dark:text-white">
                                    {store.title}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                    {store.is_official && (
                                        <Badge className="rounded-full border-blue-200/50 bg-blue-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-blue-600 uppercase hover:bg-blue-500/20">
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{' '}
                                            Oficial
                                        </Badge>
                                    )}
                                    <span className="text-xs font-black tracking-tight text-slate-400 uppercase">
                                        {store.is_official
                                            ? 'Vendedor verificado'
                                            : 'Vendedor'}
                                    </span>
                                    <div className="ml-2 flex items-center gap-1 text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-sm font-black text-slate-900 dark:text-white">
                                            {averageRating}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex gap-3 sm:mt-0">
                                <Button
                                    variant="outline"
                                    className="h-12 gap-2 rounded-2xl px-6 font-black shadow-sm"
                                    onClick={() =>
                                        setLocalLike(localLike ? 0 : 1)
                                    }
                                >
                                    <Heart
                                        className={cn(
                                            'h-5 w-5 text-slate-400 transition-all',
                                            localLike &&
                                                'fill-red-500 text-red-500',
                                        )}
                                    />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {store.likes_count +
                                            (localLike ? 1 : 0)}
                                    </span>
                                </Button>
                                <Button className="h-12 rounded-2xl px-6 text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20">
                                    <Share2 className="mr-2 h-4 w-4" />{' '}
                                    Compartir
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
                    <div className="space-y-10 lg:col-span-2">
                        {/* Categories Horizontal */}
                        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
                            {store.categorias.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/tienda/${store.slug}/categoria/${cat.id}`}
                                    className="flex shrink-0 flex-col items-center gap-3 rounded-[2rem] border border-slate-100 bg-white p-4 transition-all hover:border-primary dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-50 p-2 dark:bg-slate-800">
                                        <img
                                            src={
                                                cat.imagen
                                                    ? `/storage/${cat.imagen}`
                                                    : '/placeholder.png'
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                        {cat.nombre}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="rounded-[2.5rem] bg-white p-10 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                            <h2 className="mb-10 text-2xl font-black tracking-tight uppercase">
                                Catálogo de Productos
                            </h2>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                {store.productos.map((p) => (
                                    <ProductCard key={p.id} producto={p} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Cart Sidebar Card */}
                        <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-500/30">
                            <h3 className="mb-6 text-xs font-black tracking-[0.2em] uppercase opacity-70">
                                Tu Pedido
                            </h3>
                            <div className="mb-8 space-y-4 overflow-hidden">
                                {productosEnCarrito.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-white/20 p-2">
                                            <img
                                                src={`/storage/${p.imagen}`}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="w-32 truncate text-xs font-black uppercase">
                                                {p.nombre}
                                            </p>
                                            <p className="text-xs font-bold opacity-70">
                                                {carrito[p.id]} x $
                                                {p.precio_venta.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {totalItems === 0 && (
                                    <p className="py-4 text-center font-bold opacity-60">
                                        CARRITO VACÍO
                                    </p>
                                )}
                            </div>
                            <div className="border-t border-white/20 pt-6">
                                <div className="mb-8 flex items-end justify-between">
                                    <span className="text-xs font-black uppercase opacity-70">
                                        Total
                                    </span>
                                    <span className="text-4xl font-black">
                                        ${totalCarrito.toLocaleString()}
                                    </span>
                                </div>
                                <Sheet
                                    open={carritoAbierto}
                                    onOpenChange={setCarritoAbierto}
                                >
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className="h-14 w-full rounded-2xl font-black tracking-widest text-indigo-600 uppercase"
                                        >
                                            Revisar Pedido
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="rounded-l-[3rem] border-l-0 bg-white sm:max-w-md">
                                        <SheetHeader className="border-b pb-8">
                                            <SheetTitle className="text-3xl font-black tracking-tighter uppercase">
                                                Mi Compra
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="flex-1 overflow-y-auto py-8">
                                            {productosEnCarrito.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="mb-6 flex gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:bg-slate-900"
                                                >
                                                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-white p-3">
                                                        <img
                                                            src={`/storage/${p.imagen}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-center">
                                                        <p className="mb-2 text-xs font-black uppercase">
                                                            {p.nombre}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-xl"
                                                                onClick={() =>
                                                                    setCarrito(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [p.id]: Math.max(
                                                                                0,
                                                                                (prev[
                                                                                    p
                                                                                        .id
                                                                                ] ||
                                                                                    0) -
                                                                                    1,
                                                                            ),
                                                                        }),
                                                                    )
                                                                }
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="font-black">
                                                                {carrito[p.id]}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-xl"
                                                                onClick={() =>
                                                                    setCarrito(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [p.id]:
                                                                                (prev[
                                                                                    p
                                                                                        .id
                                                                                ] ||
                                                                                    0) +
                                                                                1,
                                                                        }),
                                                                    )
                                                                }
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-6 border-t p-8">
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-slate-400 uppercase">
                                                    Total a pagar
                                                </span>
                                                <span className="text-3xl font-black">
                                                    $
                                                    {totalCarrito.toLocaleString()}
                                                </span>
                                            </div>
                                            <Dialog
                                                open={checkoutAbierto}
                                                onOpenChange={
                                                    setCheckoutAbierto
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button className="h-16 w-full rounded-[2rem] text-lg font-black tracking-widest uppercase shadow-2xl shadow-primary/30">
                                                        Pedir Ahora
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[3rem] p-6">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                                                            Datos de Envío
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="mt-4 space-y-5">
                                                        {/* DatosPersonales */}
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                                Datos Personales
                                                            </Label>
                                                            <FormInput
                                                                id="nombre_checkout"
                                                                label="NOMBRE COMPLETO"
                                                                value={
                                                                    datosCheckout.nombre_cliente
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosCheckout(
                                                                        {
                                                                            ...datosCheckout,
                                                                            nombre_cliente:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Ej: Juan Perez"
                                                            />
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <FormInput
                                                                    id="rut_checkout"
                                                                    label="RUT (Opcional)"
                                                                    value={
                                                                        datosCheckout.rut_cliente
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDatosCheckout(
                                                                            {
                                                                                ...datosCheckout,
                                                                                rut_cliente:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Ej: 12345678-9"
                                                                />
                                                                <FormInput
                                                                    id="email_checkout"
                                                                    label="CORREO ELECTRÓNICO"
                                                                    value={
                                                                        datosCheckout.email_cliente
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDatosCheckout(
                                                                            {
                                                                                ...datosCheckout,
                                                                                email_cliente:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="correo@ejemplo.cl"
                                                                />
                                                            </div>
                                                            <FormInput
                                                                id="telefono_checkout"
                                                                label="TELÉFONO DE CONTACTO"
                                                                value={
                                                                    datosCheckout.telefono_cliente
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosCheckout(
                                                                        {
                                                                            ...datosCheckout,
                                                                            telefono_cliente:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Ej: +56 9 1234 5678"
                                                            />
                                                        </div>

                                                        {/* Dirección Chile */}
                                                        <div className="space-y-3 pt-2">
                                                            <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                                Dirección de
                                                                Entrega
                                                            </Label>
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs font-bold text-slate-600">
                                                                        REGIÓN *
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            datosCheckout.region
                                                                        }
                                                                        onValueChange={(
                                                                            v,
                                                                        ) =>
                                                                            setDatosCheckout(
                                                                                {
                                                                                    ...datosCheckout,
                                                                                    region: v,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-11 rounded-xl">
                                                                            <SelectValue placeholder="Seleccionar región" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="arica">
                                                                                Arica
                                                                                y
                                                                                Parinacota
                                                                            </SelectItem>
                                                                            <SelectItem value="tarapaca">
                                                                                Tarapacá
                                                                            </SelectItem>
                                                                            <SelectItem value="antofagasta">
                                                                                Antofagasta
                                                                            </SelectItem>
                                                                            <SelectItem value="atacama">
                                                                                Atacama
                                                                            </SelectItem>
                                                                            <SelectItem value="coquimbo">
                                                                                Coquimbo
                                                                            </SelectItem>
                                                                            <SelectItem value="valparaiso">
                                                                                Valparaíso
                                                                            </SelectItem>
                                                                            <SelectItem value="metropolitana">
                                                                                Metropolitana
                                                                            </SelectItem>
                                                                            <SelectItem value="ohiggins">
                                                                                O'Higgins
                                                                            </SelectItem>
                                                                            <SelectItem value="maule">
                                                                                Maule
                                                                            </SelectItem>
                                                                            <SelectItem value="biobio">
                                                                                Biobío
                                                                            </SelectItem>
                                                                            <SelectItem value="araucania">
                                                                                La
                                                                                Araucanía
                                                                            </SelectItem>
                                                                            <SelectItem value="losrios">
                                                                                Los
                                                                                Ríos
                                                                            </SelectItem>
                                                                            <SelectItem value="loslagos">
                                                                                Los
                                                                                Lagos
                                                                            </SelectItem>
                                                                            <SelectItem value="aysen">
                                                                                Aysén
                                                                            </SelectItem>
                                                                            <SelectItem value="magallanes">
                                                                                Magallanes
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs font-bold text-slate-600">
                                                                        COMUNA *
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            datosCheckout.comuna
                                                                        }
                                                                        onValueChange={(
                                                                            v,
                                                                        ) =>
                                                                            setDatosCheckout(
                                                                                {
                                                                                    ...datosCheckout,
                                                                                    comuna: v,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-11 rounded-xl">
                                                                            <SelectValue placeholder="Seleccionar comuna" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="santiago">
                                                                                Santiago
                                                                            </SelectItem>
                                                                            <SelectItem value="providencia">
                                                                                Providencia
                                                                            </SelectItem>
                                                                            <SelectItem value="las_condes">
                                                                                Las
                                                                                Condes
                                                                            </SelectItem>
                                                                            <SelectItem value="nuñoa">
                                                                                Ñuñoa
                                                                            </SelectItem>
                                                                            <SelectItem value="vitacura">
                                                                                Vitacura
                                                                            </SelectItem>
                                                                            <SelectItem value="maipu">
                                                                                Maipú
                                                                            </SelectItem>
                                                                            <SelectItem value="la_florida">
                                                                                La
                                                                                Florida
                                                                            </SelectItem>
                                                                            <SelectItem value="san_bernardo">
                                                                                San
                                                                                Bernardo
                                                                            </SelectItem>
                                                                            <SelectItem value="puente_alto">
                                                                                Puente
                                                                                Alto
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <FormInput
                                                                id="direccion_checkout"
                                                                label="DIRECCIÓN (Calle)"
                                                                value={
                                                                    datosCheckout.direccion_cliente
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosCheckout(
                                                                        {
                                                                            ...datosCheckout,
                                                                            direccion_cliente:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Ej: Av. Libertador Bernardo O'Higgins"
                                                            />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <FormInput
                                                                    id="numero_checkout"
                                                                    label="NÚMERO"
                                                                    value={
                                                                        datosCheckout.numero_direccion
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDatosCheckout(
                                                                            {
                                                                                ...datosCheckout,
                                                                                numero_direccion:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Ej: 1234"
                                                                />
                                                                <FormInput
                                                                    id="depto_checkout"
                                                                    label="Depto/Casa (Opcional)"
                                                                    value={
                                                                        datosCheckout.depto_casa
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDatosCheckout(
                                                                            {
                                                                                ...datosCheckout,
                                                                                depto_casa:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Ej: Depto 501"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 pt-2">
                                                            <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                                Método de Pago
                                                            </Label>
                                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDatosCheckout(
                                                                            {
                                                                                ...datosCheckout,
                                                                                metodo_pago:
                                                                                    'efectivo',
                                                                            },
                                                                        )
                                                                    }
                                                                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${datosCheckout.metodo_pago === 'efectivo' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                                                >
                                                                    <Wallet className="mb-2 h-5 w-5" />
                                                                    <span className="text-[10px] font-black tracking-tight uppercase">
                                                                        Local
                                                                    </span>
                                                                </button>

                                                                {paymentConfig?.is_active && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setDatosCheckout(
                                                                                {
                                                                                    ...datosCheckout,
                                                                                    metodo_pago:
                                                                                        'webpay',
                                                                                },
                                                                            )
                                                                        }
                                                                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${datosCheckout.metodo_pago === 'webpay' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                                                    >
                                                                        <CreditCard className="mb-2 h-5 w-5" />
                                                                        <span className="text-[10px] font-black tracking-tight uppercase">
                                                                            Webpay
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                {paymentConfig?.paypal_active && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setDatosCheckout(
                                                                                {
                                                                                    ...datosCheckout,
                                                                                    metodo_pago:
                                                                                        'paypal',
                                                                                },
                                                                            )
                                                                        }
                                                                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${datosCheckout.metodo_pago === 'paypal' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                                                    >
                                                                        <CreditCard className="mb-2 h-5 w-5" />
                                                                        <span className="text-[10px] font-black tracking-tight uppercase">
                                                                            PayPal
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                {paymentConfig?.mercadopago_active && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setDatosCheckout(
                                                                                {
                                                                                    ...datosCheckout,
                                                                                    metodo_pago:
                                                                                        'mercadopago',
                                                                                },
                                                                            )
                                                                        }
                                                                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${datosCheckout.metodo_pago === 'mercadopago' ? 'border-sky-500 bg-sky-50 text-sky-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                                                    >
                                                                        <CreditCard className="mb-2 h-5 w-5" />
                                                                        <span className="text-[10px] font-black tracking-tight uppercase">
                                                                            M.
                                                                            Pago
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={
                                                                enviarCheckout
                                                            }
                                                            disabled={
                                                                procesando
                                                            }
                                                            className={cn(
                                                                'h-16 w-full rounded-2xl font-black tracking-[0.2em] uppercase transition-all hover:scale-[1.02]',
                                                                datosCheckout.metodo_pago ===
                                                                    'webpay' &&
                                                                    'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700',
                                                                datosCheckout.metodo_pago ===
                                                                    'paypal' &&
                                                                    'bg-blue-600 shadow-blue-500/25 hover:bg-blue-700',
                                                                datosCheckout.metodo_pago ===
                                                                    'mercadopago' &&
                                                                    'bg-sky-600 shadow-sky-500/25 hover:bg-sky-700',
                                                            )}
                                                        >
                                                            {procesando
                                                                ? 'Enviando...'
                                                                : datosCheckout.metodo_pago ===
                                                                    'efectivo'
                                                                  ? 'Confirmar Pedido'
                                                                  : `Pagar con ${datosCheckout.metodo_pago.charAt(0).toUpperCase() + datosCheckout.metodo_pago.slice(1)}`}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                            <h3 className="mb-8 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                Información
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            Ubicación
                                        </span>
                                        <span className="text-sm font-black uppercase">
                                            {store.user.ciudad || 'Chile'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            Email
                                        </span>
                                        <span className="text-sm font-black break-all lowercase">
                                            {store.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={chat.start(store.slug).url}
                                className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 p-4 text-[10px] font-black tracking-[0.2em] text-white uppercase transition-all hover:bg-slate-800"
                            >
                                <MessageSquare className="h-4 w-4" /> Enviar
                                Mensaje
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
