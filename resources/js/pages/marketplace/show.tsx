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
    Trash2,
    CreditCard,
    MessageCircle,
    ArrowRight,
    MessageSquare,
    Copy,
    Check,
    Link2,
    Send,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WhatsAppButton } from '@/components/whatsapp-button';
import AppLayout from '@/layouts/app-layout';
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
}

interface UserReaction {
    like: number;
    rating: number | null;
}

interface StoreProfile {
    id: number;
    title: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    slug: string;
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
}: {
    store: StoreProfile;
    userReaction?: UserReaction;
}) {
    const { auth, web_settings } = usePage<{
        auth: { user?: User };
        web_settings: any;
    }>().props;
    const [categoriaExpandida, setCategoriaExpandida] = useState<number | null>(
        null,
    );
    const [carrito, setCarrito] = useState<{ [key: number]: number }>({});
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
        telefono_cliente: '',
        direccion_cliente: '',
        metodo_pago: 'efectivo',
        notas: '',
    });
    const [procesando, setProcesando] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [ratingHover, setRatingHover] = useState(0);
    const [localLike, setLocalLike] = useState(userReaction?.like ?? 0);
    const [localRating, setLocalRating] = useState(userReaction?.rating ?? 0);

    const averageRating =
        store.rating_count > 0
            ? (store.rating_total / store.rating_count).toFixed(1)
            : '0.0';
    const progressTo1000 = Math.min((store.likes_count / 1000) * 100, 100);

    const agregarAlCarrito = (productoId: number) => {
        const cantidadAEnviar = cantidadesAgregar[productoId] || 1;
        setCarrito((prev) => ({
            ...prev,
            [productoId]: (prev[productoId] || 0) + cantidadAEnviar,
        }));
        setCantidadesAgregar((prev) => ({ ...prev, [productoId]: 1 }));
        setProductoAgregado(productoId);
        setTimeout(() => setProductoAgregado(null), 2000);
    };

    const enviarCheckout = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }

        setProcesando(true);

        const items = Object.entries(carrito)
            .filter(([, cantidad]) => cantidad > 0)
            .map(([productoId, cantidad]) => ({
                producto_id: parseInt(productoId),
                cantidad,
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
                    setCarrito({});
                    setCarritoAbierto(false);
                },
                onError: () => {
                    setProcesando(false);
                },
            },
        );
    };

    const eliminarDelCarrito = (productoId: number) => {
        setCarrito((prev) => {
            const nuevoCarrito = { ...prev };
            delete nuevoCarrito[productoId];
            return nuevoCarrito;
        });
    };

    const cambiarCantidad = (productoId: number, delta: number) => {
        setCarrito((prev) => {
            const nuevaCantidad = (prev[productoId] || 0) + delta;
            if (nuevaCantidad <= 0) {
                const nuevoCarrito = { ...prev };
                delete nuevoCarrito[productoId];
                return nuevoCarrito;
            }
            return {
                ...prev,
                [productoId]: nuevaCantidad,
            };
        });
    };

    const setCantidadManual = (productoId: number, cantidad: number) => {
        if (cantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
        setCarrito((prev) => ({
            ...prev,
            [productoId]: cantidad,
        }));
    };

    const cambiarCantidadLocal = (productoId: number, delta: number) => {
        setCantidadesAgregar((prev) => {
            const current = prev[productoId] || 1;
            const next = Math.max(1, current + delta);
            return { ...prev, [productoId]: next };
        });
    };

    const setCantidadManualLocal = (productoId: number, cantidad: number) => {
        if (cantidad < 1) return;
        setCantidadesAgregar((prev) => ({
            ...prev,
            [productoId]: cantidad,
        }));
    };

    const productosEnCarrito = store.productos.filter(
        (p) => carrito[p.id] && carrito[p.id] > 0,
    );

    const totalCarrito = productosEnCarrito.reduce(
        (sum, p) => sum + p.precio_venta * (carrito[p.id] || 0),
        0,
    );

    const productosDeCategoria = (categoriaId: number) =>
        store.productos.filter((p) => p.categoria_id === categoriaId);

    const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0);

    const sugerencias = useMemo(() => {
        return [...store.productos].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [store.productos]);

    const ProductCard = ({ producto }: { producto: Producto }) => (
        <div
            className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                {producto.imagen ? (
                    <img
                        src={`/storage/${producto.imagen}`}
                        alt={producto.nombre}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-12 w-12 text-slate-300" />
                    </div>
                )}
            </div>
            <div className="mt-3 flex flex-1 flex-col">
                <h4 className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">
                    {producto.nombre}
                </h4>
                {producto.descripcion && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {producto.descripcion}
                    </p>
                )}
                <div className="mt-auto pt-2">
                    <p className="text-lg font-bold text-primary">
                        $
                        {Number(producto.precio_venta).toFixed(0)}
                        <span className="text-xs font-normal text-slate-500">
                            /{producto.unidad_medida}
                        </span>
                    </p>
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                <button
                    onClick={() => cambiarCantidadLocal(producto.id, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <input
                    type="number"
                    min="1"
                    value={cantidadesAgregar[producto.id] || 1}
                    onChange={(e) =>
                        setCantidadManualLocal(
                            producto.id,
                            parseInt(e.target.value) || 1,
                        )
                    }
                    className="h-8 w-12 border-none bg-transparent p-0 text-center text-sm font-semibold focus:ring-0 dark:text-white"
                />
                <button
                    onClick={() => cambiarCantidadLocal(producto.id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <button
                onClick={() => agregarAlCarrito(producto.id)}
                disabled={productoAgregado === producto.id}
                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    productoAgregado === producto.id
                        ? 'bg-green-600 text-white'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
            >
                {productoAgregado === producto.id ? (
                    <>
                        <CheckCircle2 className="h-4 w-4" />
                        Añadido
                    </>
                ) : (
                    <>
                        <ShoppingCart className="h-4 w-4" />
                        Añadir al carrito
                    </>
                )}
            </button>
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Marketplace', href: '/tienda' },
                { title: store.title, href: `/tienda/${store.slug}` },
            ]}
        >
            <Head
                title={`${store.title} | ${web_settings?.app_name || 'Tienda'}`}
            >
                <meta
                    name="description"
                    content={store.description || web_settings?.app_description}
                />
                <meta name="keywords" content={web_settings?.app_keywords} />
            </Head>

            <div className="mx-auto max-w-5xl py-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="absolute inset-0 h-48 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90 sm:h-64">
                        {store.user.cover_photo_url ? (
                            <img
                                src={store.user.cover_photo_url}
                                alt="Portada"
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    <div className="relative px-6 pt-32 pb-8 sm:px-10 sm:pt-48">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg sm:h-32 sm:w-32 dark:border-slate-900 dark:bg-slate-800">
                                {store.user.profile_photo_url ? (
                                    <img
                                        src={store.user.profile_photo_url}
                                        alt={store.user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-3xl font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                        {store.title.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-1 flex-col justify-end sm:mt-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                                        {store.title}
                                    </h1>
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    por {store.user.name}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-0 sm:shrink-0">
                                {auth.user && (
                                    <button
                                        onClick={() => {
                                            const newValue = localLike ? 0 : 1;
                                            setLocalLike(newValue);
                                            router.post(
                                                `/tienda/${store.slug}/react`,
                                                { like: newValue },
                                                { replace: true },
                                            );
                                        }}
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${
                                            localLike
                                                ? 'bg-red-50 text-red-500 ring-red-200 dark:bg-red-900/30 dark:ring-red-800'
                                                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${
                                                localLike ? 'fill-current' : ''
                                            }`}
                                        />
                                    </button>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-white">
                                            <Share2 className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuItem
                                            onClick={() => {
                                                const url = `${window.location.origin}/tienda/${store.slug}`;
                                                navigator.clipboard.writeText(
                                                    url,
                                                );
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                            <span>Copiar enlace</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(
                                                    `${store.title} - ${window.location.origin}/tienda/${store.slug}`,
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>WhatsApp</span>
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                                    `${window.location.origin}/tienda/${store.slug}`,
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Link2 className="h-4 w-4" />
                                                <span>Facebook</span>
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={`https://t.me/share/url?url=${encodeURIComponent(
                                                    `${window.location.origin}/tienda/${store.slug}`,
                                                )}&text=${encodeURIComponent(
                                                    store.title,
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>Telegram</span>
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                disabled={!auth.user}
                                                onClick={() => {
                                                    setLocalRating(star);
                                                    router.post(
                                                        `/tienda/${store.slug}/react`,
                                                        { rating: star },
                                                        { replace: true },
                                                    );
                                                }}
                                                onMouseEnter={() =>
                                                    auth.user &&
                                                    setRatingHover(star)
                                                }
                                                onMouseLeave={() =>
                                                    auth.user &&
                                                    setRatingHover(0)
                                                }
                                                className={`p-0.5 transition-transform ${auth.user ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                                            >
                                                <Star
                                                    className={`h-4 w-4 ${
                                                        star <=
                                                        (ratingHover ||
                                                            localRating ||
                                                            Math.round(
                                                                Number(
                                                                    averageRating,
                                                                ),
                                                            ))
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-slate-300 dark:text-slate-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {averageRating}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        ({store.rating_count})
                                    </span>
                                </div>

                                <div className="flex h-10 items-center px-3 text-xs text-slate-500 dark:text-slate-400">
                                    {store.likes_count} / 1000 ventas
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {store.description && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Acerca de nosotros
                                </h2>
                                <p className="mt-4 leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                                    {store.description}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
                                Catálogo de Productos
                            </h2>

                            {categoriaExpandida === null ? (
                                <>
                                    {/* Vista de categorías */}
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {store.categorias.map((categoria) => {
                                            const numProductos =
                                                productosDeCategoria(
                                                    categoria.id,
                                                ).length;
                                            return (
                                                <Link
                                                    key={categoria.id}
                                                    href={`/tienda/${store.slug}/categoria/${categoria.id}`}
                                                    className="group relative flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
                                                >
                                                    <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                        {categoria.imagen ? (
                                                            <img
                                                                src={`/storage/${categoria.imagen}`}
                                                                alt={
                                                                    categoria.nombre
                                                                }
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Store className="h-8 w-8 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="mt-3 line-clamp-1 text-sm font-medium text-slate-900 dark:text-white">
                                                        {categoria.nombre}
                                                    </h3>
                                                    <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        {numProductos} productos
                                                    </span>
                                                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                                                        Ver más
                                                        <ArrowRight className="h-3 w-3" />
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {store.categorias.length === 0 &&
                                        store.productos.length === 0 && (
                                            <div className="py-12 text-center">
                                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50">
                                                    <Store className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                                    Esta tienda aún no tiene
                                                    productos publicados.
                                                </p>
                                            </div>
                                        )}

                                    {/* Sugerencias de productos */}
                                    {sugerencias.length > 0 && (
                                        <div className="mt-12">
                                            <div className="mb-6 flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Sugerencias para ti
                                                </h3>
                                                <span className="text-xs text-slate-500">
                                                    Basado en nuestro catálogo
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
                                                {sugerencias.map(
                                                    (producto: Producto) => (
                                                        <ProductCard
                                                            key={producto.id}
                                                            producto={producto}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Vista de productos de una categoría */}
                                    <button
                                        onClick={() =>
                                            setCategoriaExpandida(null)
                                        }
                                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Volver a categorías
                                    </button>

                                    <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {
                                                store.categorias.find(
                                                    (c) =>
                                                        c.id ===
                                                        categoriaExpandida,
                                                )?.nombre
                                            }
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {
                                                productosDeCategoria(
                                                    categoriaExpandida,
                                                ).length
                                            }{' '}
                                            productos disponibles
                                        </p>
                                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                            {productosDeCategoria(
                                                categoriaExpandida,
                                            ).map((producto: Producto) => (
                                                <ProductCard
                                                    key={producto.id}
                                                    producto={producto}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                                Información de Contacto
                            </h3>
                            <ul className="space-y-4">
                                {(store.user.ciudad || store.user.region) && (
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                                        <span>
                                            {store.user.ciudad}
                                            {store.user.ciudad &&
                                            store.user.region
                                                ? ', '
                                                : ''}
                                            {store.user.region}
                                        </span>
                                    </li>
                                )}
                                {store.phone && (
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <WhatsAppButton
                                            phone={store.phone}
                                            nombre={store.title}
                                            className="h-5 w-5"
                                            appName={web_settings?.app_name}
                                        />
                                        <span>{store.phone}</span>
                                    </li>
                                )}
                                {store.email && (
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                                        <a
                                            href={`mailto:${store.email}`}
                                            className="transition-colors hover:text-primary"
                                        >
                                            {store.email}
                                        </a>
                                    </li>
                                )}
                                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="h-5 w-5 shrink-0 text-slate-400" />
                                    <span>
                                        Miembro desde{' '}
                                        {new Date(
                                            store.created_at,
                                        ).getFullYear()}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Chat Button */}
                        {auth.user?.id !== store.user.id && (
                            <Link
                                href={chat.start(store.slug).url}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white p-4 font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:ring-primary dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
                            >
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Chatear con la tienda
                            </Link>
                        )}

                        {/* Store Stats Mini - Cart Button */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {store.productos.length}
                                </p>
                                <p className="mt-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Productos
                                </p>
                            </div>
                            <Sheet
                                open={carritoAbierto}
                                onOpenChange={setCarritoAbierto}
                            >
                                <SheetTrigger asChild>
                                    <button className="relative w-full rounded-2xl bg-primary p-5 text-center shadow-sm transition-all hover:bg-primary/90">
                                        <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-white">
                                            <ShoppingCart className="h-6 w-6" />
                                            {totalItems}
                                        </div>
                                        <p className="mt-1 text-xs font-medium tracking-wider text-primary-foreground uppercase">
                                            Ver Carrito
                                        </p>
                                        {totalItems > 0 && (
                                            <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">
                                                {totalItems}
                                            </div>
                                        )}
                                    </button>
                                </SheetTrigger>
                                <SheetContent className="flex w-full flex-col sm:max-w-lg">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5" />
                                            Tu Carrito de Compras
                                        </SheetTitle>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto py-4">
                                        {productosEnCarrito.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <ShoppingBag className="h-16 w-16 text-slate-300" />
                                                <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                                                    Tu carrito está vacío
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    Añade productos para
                                                    comenzar a comprar
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {productosEnCarrito.map(
                                                    (producto) => (
                                                        <div
                                                            key={producto.id}
                                                            className="flex gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                                                        >
                                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                                                {producto.imagen ? (
                                                                    <img
                                                                        src={`/storage/${producto.imagen}`}
                                                                        alt={
                                                                            producto.nombre
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <Store className="h-8 w-8 text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-slate-900 dark:text-white">
                                                                    {
                                                                        producto.nombre
                                                                    }
                                                                </h4>
                                                                <p className="text-sm font-semibold text-primary">
                                                                    $
                                                                    {Number(
                                                                        producto.precio_venta,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </p>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            cambiarCantidad(
                                                                                producto.id,
                                                                                -1,
                                                                            )
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={
                                                                            carrito[
                                                                                producto
                                                                                    .id
                                                                            ] ||
                                                                            1
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setCantidadManual(
                                                                                producto.id,
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    1,
                                                                            )
                                                                        }
                                                                        className="w-14 rounded-md border border-slate-200 px-2 py-1 text-center text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            cambiarCantidad(
                                                                                producto.id,
                                                                                1,
                                                                            )
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            eliminarDelCarrito(
                                                                                producto.id,
                                                                            )
                                                                        }
                                                                        className="ml-auto text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {productosEnCarrito.length > 0 && (
                                        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    Total
                                                </span>
                                                <span className="text-2xl font-bold text-primary">
                                                    ${totalCarrito.toFixed(2)}
                                                </span>
                                            </div>
                                            <Dialog
                                                open={checkoutAbierto}
                                                onOpenChange={
                                                    setCheckoutAbierto
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button className="size-lg w-full">
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Proceder al Pago
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Finalizar Pedido
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="nombre">
                                                                Nombre completo
                                                                *
                                                            </Label>
                                                            <Input
                                                                id="nombre"
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
                                                                placeholder="Tu nombre"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="telefono">
                                                                Teléfono
                                                            </Label>
                                                            <Input
                                                                id="telefono"
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
                                                                placeholder="Tu número de teléfono"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="direccion">
                                                                Dirección de
                                                                entrega
                                                            </Label>
                                                            <Input
                                                                id="direccion"
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
                                                                placeholder="Dirección donde recibirás el pedido"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="notas">
                                                                Notas
                                                                adicionales
                                                            </Label>
                                                            <Input
                                                                id="notas"
                                                                value={
                                                                    datosCheckout.notas
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosCheckout(
                                                                        {
                                                                            ...datosCheckout,
                                                                            notas: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Alguna instrucción especial"
                                                            />
                                                        </div>
                                                        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                                            <div className="flex justify-between text-sm">
                                                                <span>
                                                                    Subtotal:
                                                                </span>
                                                                <span>
                                                                    $
                                                                    {totalCarrito.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>
                                                                    Impuesto
                                                                    (19%):
                                                                </span>
                                                                <span>
                                                                    $
                                                                    {(
                                                                        totalCarrito *
                                                                        0.19
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                                                                <span>
                                                                    Total:
                                                                </span>
                                                                <span className="text-primary">
                                                                    $
                                                                    {(
                                                                        totalCarrito *
                                                                        1.19
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={
                                                                enviarCheckout
                                                            }
                                                            disabled={
                                                                procesando ||
                                                                !datosCheckout.nombre_cliente
                                                            }
                                                            className="w-full"
                                                        >
                                                            {procesando
                                                                ? 'Procesando...'
                                                                : 'Confirmar Pedido'}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
