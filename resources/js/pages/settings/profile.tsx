import { Head, usePage, router } from '@inertiajs/react';
import {
    ThumbsUp,
    MessageCircle,
    Share2,
    MapPin,
    Briefcase,
    Calendar,
    Camera,
    Loader2,
    Edit2,
    Save,
    X,
    TrendingUp,
    Users,
    Eye,
    Clock,
    Plus,
    Image,
    UserPlus,
    DollarSign,
    Zap,
} from 'lucide-react';
import { useState, useRef } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editProfile, update as updateProfile } from '@/routes/profile/index';
import { store as storePublicacion, like as likePublicacion, comment as commentPublicacion, share as sharePublicacion } from '@/routes/publicaciones/index';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    auth: {
        user: any;
    };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi Perfil',
        href: editProfile().url,
    },
];

interface Comentario {
    id: number;
    user: {
        name: string;
        profile_photo_url: string;
    };
    content: string;
    created_at: string;
}

interface Publicacion {
    id: number;
    user: {
        name: string;
        profile_photo_url: string;
    };
    content: string;
    image_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    comentarios: Comentario[];
}

export default function Profile() {
    const { auth, stats, publicaciones = [], fotos = [] } = usePage<PageProps & { 
        stats: {
            ventasEstaSemana: number;
            nuevosClientes: number;
            cotizacionesPendientes: number;
            facturasPendientes: number;
            publicaciones: number;
            seguidores: number;
            siguiendo: number;
            ventasDiarias: { dia: string; total: number }[];
            proyeccionVentas: number;
        };
        publicaciones: Publicacion[];
        fotos: string[];
    }>().props;
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [previewCover, setPreviewCover] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    const postInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: auth.user.name || '',
        email: auth.user.email || '',
        job: auth.user.job || '',
        location: auth.user.location || '',
        rut: auth.user.rut || '',
        telefono: auth.user.telefono || '',
        direccion: auth.user.direccion || '',
        ciudad: auth.user.ciudad || '',
        region: auth.user.region || '',
        comuna: auth.user.comuna || '',
        razon_social: auth.user.razon_social || '',
        giro: auth.user.giro || '',
    });
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const getPhotoUrl = () => {
        return auth.user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&color=7F9CF5&background=EBF4FF`;
    };

    const TrendChart = ({ data }: { data: { dia: string; total: number }[] }) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data.map(d => d.total), 1);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.total / max) * 100;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="h-24 w-full px-1">
                <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M 0 100 L ${points} L 100 100 Z`}
                        fill="url(#chartGradient)"
                    />
                    <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    };

    const getCoverUrl = (): string => {
        if (previewCover !== null) {
            return previewCover;
        }
        const url = auth.user.cover_photo_url;
        return typeof url === 'string' ? url : '';
    };

    const handleSaveProfile = () => {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('job', formData.job);
        data.append('location', formData.location);
        data.append('rut', formData.rut);
        data.append('telefono', formData.telefono);
        data.append('direccion', formData.direccion);
        data.append('ciudad', formData.ciudad);
        data.append('region', formData.region);
        data.append('comuna', formData.comuna);
        data.append('razon_social', formData.razon_social);
        data.append('giro', formData.giro);
        data.append('_method', 'PATCH');

        router.post(updateProfile().url, data, {
            forceFormData: true,
            onSuccess: () => {
                setEditing(false);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setPreviewPhoto(result);
                    setUploading(true);

                    const formData = new FormData();
                    formData.append('profile_photo', file);
                    formData.append('_method', 'PATCH');

                    router.post(updateProfile().url, formData, {
                        forceFormData: true,
                        onSuccess: () => {
                            setPreviewPhoto(null);
                            setUploading(false);
                            router.visit(editProfile().url, { method: 'get' });
                        },
                        onError: () => {
                            setUploading(false);
                        },
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setPreviewCover(result);
                    setUploading(true);

                    const formData = new FormData();
                    formData.append('cover_photo', file);
                    formData.append('_method', 'PATCH');

                    router.post(updateProfile().url, formData, {
                        forceFormData: true,
                        onSuccess: () => {
                            setPreviewCover(null);
                            setUploading(false);
                            router.visit(editProfile().url, { method: 'get' });
                        },
                        onError: () => {
                            setUploading(false);
                        },
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = () => {
        if (!newPostContent.trim()) return;

        setPublishing(true);
        const data = new FormData();
        data.append('content', newPostContent);
        if (newPostImage) {
            data.append('image', newPostImage);
        }

        router.post(storePublicacion().url, data, {
            onSuccess: () => {
                setNewPostContent('');
                setNewPostImage(null);
                setPublishing(false);
            },
            onError: () => setPublishing(false),
        });
    };

    const handleLike = (id: number) => {
        router.post(likePublicacion({ publicacion: id }).url, {}, {
            preserveScroll: true,
        });
    };

    const handleComment = (id: number) => {
        if (!newComment.trim()) return;
        setCommenting(true);
        router.post(commentPublicacion({ publicacion: id }).url, { content: newComment }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewComment('');
                setCommenting(false);
            },
            onError: () => setCommenting(false),
        });
    };

    const handleShare = (id: number) => {
        if (confirm('¿Quieres compartir esta publicación en tu perfil?')) {
            router.post(sharePublicacion({ publicacion: id }).url, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Perfil" />
            <SettingsLayout>
                <input
                    ref={profileInputRef}
                    type="file"
                    name="profile_photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                />
                <input
                    ref={coverInputRef}
                    type="file"
                    name="cover_photo"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                />

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div
                        className="relative flex h-48 cursor-pointer items-center justify-center bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 md:h-56"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {getCoverUrl() && (
                            <img
                                src={getCoverUrl()}
                                alt="Portada"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                            <div className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-slate-900">
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                                Cambiar portada
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="relative -mt-20 mb-4 flex items-end justify-between md:-mt-24">
                            <div
                                className="relative cursor-pointer"
                                onClick={() => profileInputRef.current?.click()}
                            >
                                <img
                                    src={getPhotoUrl()}
                                    alt={auth.user.name}
                                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg md:h-36 md:w-36 dark:border-slate-900"
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                                    {uploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    ) : (
                                        <Camera className="h-6 w-6 text-white" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start justify-between">
                            {editing ? (
                                <div className="flex-1 space-y-3">
                                    <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Nombre completo"
                                        className="text-xl font-bold"
                                    />
                                    <Input
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="Email"
                                        className="text-sm"
                                    />
                                    <Input
                                        value={formData.rut}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                rut: e.target.value,
                                            })
                                        }
                                        placeholder="RUT (ej: 12345678-9)"
                                        className="text-sm"
                                    />
                                    <Input
                                        value={formData.telefono}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                telefono: e.target.value,
                                            })
                                        }
                                        placeholder="Teléfono (ej: +56 9 1234 5678)"
                                        className="text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={formData.razon_social}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    razon_social: e.target.value,
                                                })
                                            }
                                            placeholder="Razón Social (Nombre Legal)"
                                            className="text-sm"
                                        />
                                        <Input
                                            value={formData.giro}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    giro: e.target.value,
                                                })
                                            }
                                            placeholder="Giro Comercial"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={formData.job}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    job: e.target.value,
                                                })
                                            }
                                            placeholder="Cargo"
                                            className="text-sm"
                                        />
                                        <Input
                                            value={formData.direccion}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    direccion: e.target.value,
                                                })
                                            }
                                            placeholder="Dirección"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            value={formData.comuna}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    comuna: e.target.value,
                                                })
                                            }
                                            placeholder="Comuna"
                                            className="text-sm"
                                        />
                                        <Input
                                            value={formData.ciudad}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ciudad: e.target.value,
                                                })
                                            }
                                            placeholder="Ciudad"
                                            className="text-sm"
                                        />
                                        <Input
                                            value={formData.region}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    region: e.target.value,
                                                })
                                            }
                                            placeholder="Región"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveProfile}
                                        >
                                            <Save className="mr-1 h-4 w-4" />
                                            Guardar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditing(false)}
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {auth.user.name}
                                        </h2>
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {auth.user.email}
                                    </p>
                                    {auth.user.rut && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            RUT: {auth.user.rut}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        {!editing && (
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                                {auth.user.telefono && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {auth.user.telefono}
                                    </span>
                                )}
                                {auth.user.job && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {auth.user.job}
                                    </span>
                                )}
                                {(auth.user.direccion ||
                                    auth.user.comuna ||
                                    auth.user.ciudad ||
                                    auth.user.region) && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {[
                                            auth.user.direccion,
                                            auth.user.comuna,
                                            auth.user.ciudad,
                                            auth.user.region,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Se unió en{' '}
                                    {new Date(
                                        auth.user.created_at,
                                    ).getFullYear()}
                                </span>
                            </div>
                        )}
                        <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {stats.publicaciones}
                                </p>
                                <p className="text-xs text-slate-500">Publicaciones</p>
                            </div>
                            <div className="text-center border-x border-slate-100 dark:border-slate-800 px-4">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {stats.seguidores}
                                </p>
                                <p className="text-xs text-slate-500">Seguidores</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {stats.siguiendo}
                                </p>
                                <p className="text-xs text-slate-500">Siguiendo</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                <Briefcase className="h-4 w-4" />
                                Fotos
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-1 p-3">
                            {fotos.map((photo, index) => (
                                <div
                                    key={index}
                                    className="aspect-square overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800"
                                >
                                    <img
                                        src={photo}
                                        alt={`Foto ${index + 1}`}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                            ))}
                            {fotos.length === 0 && (
                                <div className="col-span-3 text-center py-8">
                                    <p className="text-xs text-slate-500 italic">No hay fotos publicadas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    Centro de Control
                                </h3>
                                <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none px-2 py-0.5 text-[10px] font-bold">
                                    REAL-TIME
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <DollarSign className="h-3 w-3 text-emerald-500" />
                                        Ventas
                                    </div>
                                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                        ${new Intl.NumberFormat('es-CL').format(stats.ventasEstaSemana)}
                                    </p>
                                    <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">+12.5% vs rec.</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <Users className="h-3 w-3 text-blue-500" />
                                        Clientes
                                    </div>
                                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                        {stats.nuevosClientes}
                                    </p>
                                    <p className="text-[10px] text-blue-500 mt-0.5 font-medium">Nuevos</p>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Flujo de Rendimiento</p>
                                    <div className="flex gap-1.5">
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                                            <span key={i} className="text-[8px] font-bold text-slate-400 w-4 text-center">{d}</span>
                                        ))}
                                    </div>
                                </div>
                                <TrendChart data={stats.ventasDiarias} />
                            </div>

                            {/* Prediction Section */}
                            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-500/20">
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="h-3 w-3 text-amber-300 animate-pulse" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Proyección AI</p>
                                        </div>
                                        <h4 className="text-xl font-black">
                                            ${new Intl.NumberFormat('es-CL').format(stats.proyeccionVentas)}
                                        </h4>
                                        <p className="text-[10px] text-blue-100/80 leading-tight">Estimado basado en tu rendimiento actual del 5.1%.</p>
                                    </div>
                                    <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Cotiz.</div>
                                    <div className="mt-1 flex items-end justify-between">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.cotizacionesPendientes}</span>
                                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-none text-[8px] h-4">Pend.</Badge>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Facturas</div>
                                    <div className="mt-1 flex items-end justify-between">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.facturasPendientes}</span>
                                        <Badge variant="outline" className="bg-rose-100 text-rose-700 border-none text-[8px] h-4">Atraso</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                            <p className="mb-3 text-xs font-semibold text-slate-500 uppercase">
                                Centro de Gestión
                            </p>
                            <div className="space-y-3">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="¿Qué estás pensando?"
                                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                                    rows={3}
                                />
                                <input
                                    type="file"
                                    ref={postInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        disabled={publishing || !newPostContent.trim()}
                                        onClick={handleCreatePost}
                                    >
                                        {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Publicar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => postInputRef.current?.click()}
                                        className={newPostImage ? "border-green-500 text-green-500" : ""}
                                    >
                                        <Image className="h-4 w-4" />
                                        {newPostImage ? "Listo" : ""}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Publicaciones Recientes
                    </h3>
                    {publicaciones.map((post: Publicacion) => (
                        <div
                            key={post.id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex items-center gap-3 p-4">
                                <img
                                    src={post.user.profile_photo_url || getPhotoUrl()}
                                    alt={post.user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {post.user.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(post.created_at).toLocaleString('es-CL', { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 pb-3">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {post.content}
                                </p>
                            </div>
                            {post.image_url && (
                                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <img
                                        src={post.image_url}
                                        alt="Publicación"
                                        className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-sm text-slate-500 dark:border-slate-800">
                                <span className="flex items-center gap-1 font-medium text-blue-600">
                                    <ThumbsUp className="h-4 w-4" fill={post.likes_count > 0 ? "currentColor" : "none"} />
                                    {post.likes_count} likes
                                </span>
                                <span className="text-xs">{post.comments_count} comentarios</span>
                            </div>
                            <div className="flex border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Me gusta
                                </button>
                                <button 
                                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                    className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${activeCommentPost === post.id ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Comentar
                                </button>
                                <button 
                                    onClick={() => handleShare(post.id)}
                                    className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Compartir
                                </button>
                            </div>

                            {activeCommentPost === post.id && (
                                <div className="border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="mb-4 space-y-3">
                                        {post.comentarios?.map((comment) => (
                                            <div key={comment.id} className="flex gap-2">
                                                <img
                                                    src={comment.user.profile_photo_url || getPhotoUrl()}
                                                    alt={comment.user.name}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                                <div className="flex-1 rounded-2xl bg-white p-3 text-xs shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                                                        {comment.user.name}
                                                    </p>
                                                    <p className="text-slate-700 dark:text-slate-300">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Escribe un comentario..."
                                            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 shadow-inner"
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                        />
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            disabled={commenting || !newComment.trim()}
                                            onClick={() => handleComment(post.id)}
                                        >
                                            {commenting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {publicaciones.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700">
                            <p className="text-slate-500">No hay publicaciones recientes. ¡Sé el primero en compartir algo!</p>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
