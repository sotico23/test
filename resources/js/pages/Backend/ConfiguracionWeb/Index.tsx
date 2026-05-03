import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Upload,
    Link as LinkIcon,
    X,
    Image as ImageIcon,
    Plus,
    Trash2,
    GripVertical,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Caracteristica {
    icono: string;
    titulo: string;
    descripcion: string;
}

interface Plan {
    nombre: string;
    precio: string;
    periodo: string;
    descripcion: string;
    popular: boolean;
    caracteristicas: string[];
}

interface WebSetting {
    id: number;
    app_name: string;
    app_logo: string | null;
    app_favicon: string | null;
    app_title: string;
    app_description: string | null;
    app_keywords: string | null;
    app_author: string | null;
    timezone: string;
    locale: string;
    currency: string;
    currency_symbol: string;
    maintenance_mode: boolean;
    hero_titulo?: string;
    hero_subtitulo?: string;
    hero_boton_principal?: string;
    hero_boton_secundario?: string;
    hero_badge?: string;
    caracteristicas?: Caracteristica[];
    planes?: Plan[];
    cta_titulo?: string;
    cta_descripcion?: string;
    cta_boton?: string;
}

const defaultHero = {
    titulo: 'Gestiona tu negocio como un experto',
    subtitulo:
        'La plataforma todo-en-uno que necesitas para hacer crecer tu empresa. Desde inventario hasta facturación, todo en un solo lugar.',
    boton_principal: 'Comenzar gratis',
    boton_secundario: 'Ver demo',
    badge: '¡Nuevo! IA integrada para predicción de inventario',
};

const defaultCaracteristicas: Caracteristica[] = [
    {
        icono: '📊',
        titulo: 'Dashboard Inteligente',
        descripcion:
            'Visualiza tus métricas en tiempo real con gráficos interactivos',
    },
    {
        icono: '👥',
        titulo: 'Gestión de Clientes',
        descripcion:
            'CRM completo para gestionar prospectos, oportunidades y clientes',
    },
    {
        icono: '📦',
        titulo: 'Control de Inventario',
        descripcion:
            'Gestiona tu stock con alertas automáticas y múltiples almacenes',
    },
    {
        icono: '💰',
        titulo: 'Facturación Electrónica',
        descripcion: 'Emite facturas, cotizaciones y gestiona tu tesorería',
    },
    {
        icono: '📈',
        titulo: 'Reportes Avanzados',
        descripcion: 'Toma decisiones basadas en datos con análisis detallados',
    },
    {
        icono: '🔗',
        titulo: 'Integraciones',
        descripcion: 'Conecta con pasarelas de pago, envíos y más',
    },
];

const defaultPlanes: Plan[] = [
    {
        nombre: 'Gratuito',
        precio: '$0',
        periodo: '/mes',
        descripcion: 'Perfecto para comenzar',
        popular: false,
        caracteristicas: [
            'Hasta 10 clientes',
            'Gestión básica de inventario',
            '1 usuario administrador',
            'Reportes simples',
            'Soporte por email',
        ],
    },
    {
        nombre: 'Vendedor Independiente',
        precio: '$29',
        periodo: '/mes',
        descripcion: 'Para vendedores individuales',
        popular: false,
        caracteristicas: [
            'Hasta 100 clientes',
            'Gestión completa de inventario',
            '3 usuarios',
            'Facturación electrónica',
            'Reportes avanzados',
            'Soporte prioritario',
        ],
    },
    {
        nombre: 'Premium',
        precio: '$99',
        periodo: '/mes',
        descripcion: 'Para pequeñas empresas',
        popular: true,
        caracteristicas: [
            'Clientes ilimitados',
            'Gestión de proveedores',
            '10 usuarios',
            'Facturación electrónica completa',
            'Reportes detallados',
            'Múltiples almacenes',
            'Integraciones',
            'Soporte por chat',
        ],
    },
    {
        nombre: 'Enterprise',
        precio: '$299',
        periodo: '/mes',
        descripcion: 'Para empresas en crecimiento',
        popular: false,
        caracteristicas: [
            'Todo del plan Premium',
            'Usuarios ilimitados',
            'Múltiples sucursales',
            'Gestión de empleados',
            'Control de acceso avanzado',
            'Auditoría completa',
            'Personalización completa',
            'Soporte telefónico',
        ],
    },
    {
        nombre: 'Corporativo',
        precio: 'Custom',
        periodo: '',
        descripcion: 'Para grandes organizaciones',
        popular: false,
        caracteristicas: [
            'Todo del plan Enterprise',
            'Servidor dedicado',
            '部署 local',
            'Personalización de marca',
            'Capacitación dedicada',
            'Gerente de cuenta',
            'SLA garantizado',
            'Soporte 24/7',
        ],
    },
];

const defaultCta = {
    titulo: '¿Listo para transformar tu negocio?',
    descripcion: 'Únete a miles de empresas que ya están creciendo con GrowERP',
    boton: 'Crear cuenta gratis',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración Web', href: '/configuracion-web' },
];

const iconos = [
    '📊',
    '👥',
    '📦',
    '💰',
    '📈',
    '🔗',
    '🏭',
    '🚚',
    '🛒',
    '⚙️',
    '📋',
    '💼',
    '🎯',
    '✅',
    '⭐',
    '🚀',
];

function ImageUploadField({
    label,
    currentUrl,
    urlValue,
    onUrlChange,
    onFileChange,
    accept = 'image/*',
    hint,
}: {
    label: string;
    currentUrl: string | null;
    urlValue: string;
    onUrlChange: (v: string) => void;
    onFileChange: (file: File | null) => void;
    accept?: string;
    hint?: string;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const displaySrc = preview || urlValue || currentUrl || null;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileChange(file);
        }
    };

    const clearFile = () => {
        setPreview(null);
        onFileChange(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            {displaySrc && (
                <div className="relative w-fit rounded-xl border bg-muted/30 p-2">
                    <img
                        src={displaySrc}
                        alt={label}
                        className="h-16 max-w-[200px] rounded-lg object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                                'none';
                        }}
                    />
                    {preview && (
                        <button
                            type="button"
                            onClick={clearFile}
                            className="absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white shadow-md hover:bg-destructive/80"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}
            <div className="flex w-fit overflow-hidden rounded-xl border bg-muted/30">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${mode === 'url' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <LinkIcon className="h-3 w-3" /> URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${mode === 'file' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Upload className="h-3 w-3" /> Archivo
                </button>
            </div>
            {mode === 'url' ? (
                <div className="space-y-1">
                    <Input
                        value={urlValue}
                        onChange={(e) => onUrlChange(e.target.value)}
                        placeholder="https://ejemplo.com/logo.png o /storage/..."
                    />
                    {hint && (
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    )}
                </div>
            ) : (
                <div>
                    <label
                        htmlFor={`file-${label}`}
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                {preview
                                    ? 'Cambiar archivo'
                                    : 'Haz clic para subir'}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {accept.includes('ico')
                                    ? 'PNG, ICO, SVG · máx 512 KB'
                                    : 'PNG, JPG, SVG, WebP · máx 2 MB'}
                            </p>
                        </div>
                        <input
                            id={`file-${label}`}
                            ref={fileRef}
                            type="file"
                            accept={accept}
                            className="hidden"
                            onChange={handleFile}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}

export default function Index({ settings }: { settings: WebSetting }) {
    const { data, setData, post, processing } = useForm({
        _method: 'PUT',
        app_name: settings.app_name || '',
        app_logo: settings.app_logo || '',
        app_logo_file: null as File | null,
        app_favicon: settings.app_favicon || '',
        app_favicon_file: null as File | null,
        app_title: settings.app_title || '',
        app_description: settings.app_description || '',
        app_keywords: settings.app_keywords || '',
        app_author: settings.app_author || '',
        timezone: settings.timezone || 'America/Lima',
        locale: settings.locale || 'es',
        currency: settings.currency || 'PEN',
        currency_symbol: settings.currency_symbol || 'S/',
        maintenance_mode: settings.maintenance_mode || false,
        hero: settings.hero_titulo
            ? {
                  titulo: settings.hero_titulo,
                  subtitulo: settings.hero_subtitulo || '',
                  boton_principal: settings.hero_boton_principal || '',
                  boton_secundario: settings.hero_boton_secundario || '',
                  badge: settings.hero_boton_principal
                      ? settings.hero_badge || ''
                      : '',
              }
            : defaultHero,
        caracteristicas: settings.caracteristicas || defaultCaracteristicas,
        planes: settings.planes || defaultPlanes,
        cta: settings.cta_titulo
            ? {
                  titulo: settings.cta_titulo,
                  descripcion: settings.cta_descripcion || '',
                  boton: settings.cta_boton || '',
              }
            : defaultCta,
    });

    const [activeSection, setActiveSection] = useState('general');

    const addCaracteristica = () => {
        setData('caracteristicas', [
            ...data.caracteristicas!,
            {
                icono: '📊',
                titulo: 'Nueva característica',
                descripcion: 'Descripción',
            },
        ]);
    };

    const removeCaracteristica = (index: number) => {
        const newCaract = [...data.caracteristicas!];
        newCaract.splice(index, 1);
        setData('caracteristicas', newCaract);
    };

    const updateCaracteristica = (
        index: number,
        field: keyof Caracteristica,
        value: string,
    ) => {
        const newCaract = [...data.caracteristicas!];
        newCaract[index] = { ...newCaract[index], [field]: value };
        setData('caracteristicas', newCaract);
    };

    const addPlanCaracteristica = (planIndex: number) => {
        const newPlanes = [...data.planes!];
        newPlanes[planIndex].caracteristicas.push('Nueva característica');
        setData('planes', newPlanes);
    };

    const removePlanCaracteristica = (
        planIndex: number,
        caractIndex: number,
    ) => {
        const newPlanes = [...data.planes!];
        newPlanes[planIndex].caracteristicas.splice(caractIndex, 1);
        setData('planes', newPlanes);
    };

    const updatePlanCaracteristica = (
        planIndex: number,
        caractIndex: number,
        value: string,
    ) => {
        const newPlanes = [...data.planes!];
        newPlanes[planIndex].caracteristicas[caractIndex] = value;
        setData('planes', newPlanes);
    };

    const addPlan = () => {
        setData('planes', [
            ...data.planes!,
            {
                nombre: 'Nuevo Plan',
                precio: '$0',
                periodo: '/mes',
                descripcion: 'Descripción del plan',
                popular: false,
                caracteristicas: ['Característica 1'],
            },
        ]);
    };

    const removePlan = (index: number) => {
        const newPlanes = [...data.planes!];
        newPlanes.splice(index, 1);
        setData('planes', newPlanes);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/configuracion-web/${settings.id}`, { forceFormData: true });
    };

    const sections = [
        { id: 'general', label: 'Configuración', icon: '⚙️' },
        { id: 'hero', label: 'Hero', icon: '🎯' },
        { id: 'caracteristicas', label: 'Características', icon: '✨' },
        { id: 'planes', label: 'Planes', icon: '💰' },
        { id: 'cta', label: 'CTA Final', icon: '📢' },
    ];

    return (
        <>
            <Head title="Configuración Web" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Configuración de Página de Inicio
                            </h1>
                            <p className="text-muted-foreground">
                                Personaliza el contenido de la página de inicio
                            </p>
                        </div>
                        <Button
                            type="submit"
                            form="config-form"
                            disabled={processing}
                            className="px-8"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sections.map((s) => (
                            <Button
                                key={s.id}
                                variant={
                                    activeSection === s.id
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setActiveSection(s.id)}
                            >
                                <span className="mr-1">{s.icon}</span> {s.label}
                            </Button>
                        ))}
                    </div>

                    <form id="config-form" onSubmit={handleSubmit}>
                        {activeSection === 'general' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Configuración SEO</CardTitle>
                                        <CardDescription>
                                            Datos para SEO y基本信息
                                        </CardDescription>
                                        <CardDescription>
                                            Nombre y descripción
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nombre del Sitio *</Label>
                                            <Input
                                                value={data.app_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'app_name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Título (Meta) *</Label>
                                            <Input
                                                value={data.app_title}
                                                onChange={(e) =>
                                                    setData(
                                                        'app_title',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descripción (Meta)</Label>
                                            <Input
                                                value={data.app_description}
                                                onChange={(e) =>
                                                    setData(
                                                        'app_description',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Palabras Clave</Label>
                                            <Input
                                                value={data.app_keywords}
                                                onChange={(e) =>
                                                    setData(
                                                        'app_keywords',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="erp, gestión, empresa"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recursos</CardTitle>
                                        <CardDescription>
                                            Logo y favicon
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <ImageUploadField
                                            label="Logo"
                                            currentUrl={settings.app_logo}
                                            urlValue={data.app_logo}
                                            onUrlChange={(v) =>
                                                setData('app_logo', v)
                                            }
                                            onFileChange={(f) =>
                                                setData('app_logo_file', f)
                                            }
                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        />
                                        <ImageUploadField
                                            label="Favicon"
                                            currentUrl={settings.app_favicon}
                                            urlValue={data.app_favicon}
                                            onUrlChange={(v) =>
                                                setData('app_favicon', v)
                                            }
                                            onFileChange={(f) =>
                                                setData('app_favicon_file', f)
                                            }
                                            accept="image/x-icon,image/png"
                                            hint="Se muestra en la pestaña del navegador"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeSection === 'hero' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sección Hero</CardTitle>
                                    <CardDescription>
                                        La sección principal de la página de
                                        inicio
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>
                                            Badge (texto pequeño arriba del
                                            título)
                                        </Label>
                                        <Input
                                            value={data.hero?.badge}
                                            onChange={(e) =>
                                                setData('hero', {
                                                    ...data.hero!,
                                                    badge: e.target.value,
                                                })
                                            }
                                            placeholder="¡Nuevo! IA integrada..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Título Principal *</Label>
                                        <Input
                                            value={data.hero?.titulo}
                                            onChange={(e) =>
                                                setData('hero', {
                                                    ...data.hero!,
                                                    titulo: e.target.value,
                                                })
                                            }
                                            placeholder="Gestiona tu negocio..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subtítulo</Label>
                                        <Input
                                            value={data.hero?.subtitulo}
                                            onChange={(e) =>
                                                setData('hero', {
                                                    ...data.hero!,
                                                    subtitulo: e.target.value,
                                                })
                                            }
                                            placeholder="La plataforma todo-en-uno..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Botón Principal</Label>
                                            <Input
                                                value={
                                                    data.hero?.boton_principal
                                                }
                                                onChange={(e) =>
                                                    setData('hero', {
                                                        ...data.hero!,
                                                        boton_principal:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Comenzar gratis"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Botón Secundario</Label>
                                            <Input
                                                value={
                                                    data.hero?.boton_secundario
                                                }
                                                onChange={(e) =>
                                                    setData('hero', {
                                                        ...data.hero!,
                                                        boton_secundario:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Ver demo"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'caracteristicas' && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Características</CardTitle>
                                        <CardDescription>
                                            Las características que se muestran
                                            en la página
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addCaracteristica}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                        Agregar
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.caracteristicas?.map(
                                        (caract, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-xs">
                                                        Icono
                                                    </Label>
                                                    <select
                                                        value={caract.icono}
                                                        onChange={(e) =>
                                                            updateCaracteristica(
                                                                index,
                                                                'icono',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 rounded-md border bg-background px-2 text-lg"
                                                    >
                                                        {iconos.map((icon) => (
                                                            <option
                                                                key={icon}
                                                                value={icon}
                                                            >
                                                                {icon}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">
                                                        Título
                                                    </Label>
                                                    <Input
                                                        value={caract.titulo}
                                                        onChange={(e) =>
                                                            updateCaracteristica(
                                                                index,
                                                                'titulo',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">
                                                        Descripción
                                                    </Label>
                                                    <Input
                                                        value={
                                                            caract.descripcion
                                                        }
                                                        onChange={(e) =>
                                                            updateCaracteristica(
                                                                index,
                                                                'descripcion',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        removeCaracteristica(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'planes' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addPlan}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                        Agregar Plan
                                    </Button>
                                </div>
                                {data.planes?.map((plan, planIndex) => (
                                    <Card key={planIndex}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        value={plan.nombre}
                                                        onChange={(e) => {
                                                            const newPlanes =
                                                                data.planes!.map(
                                                                    (p, i) =>
                                                                        i ===
                                                                        planIndex
                                                                            ? {
                                                                                  ...p,
                                                                                  nombre: e
                                                                                      .target
                                                                                      .value,
                                                                              }
                                                                            : p,
                                                                );
                                                            setData(
                                                                'planes',
                                                                newPlanes,
                                                            );
                                                        }}
                                                        className="w-48 font-bold"
                                                        placeholder="Nombre del plan"
                                                    />
                                                    <Checkbox
                                                        checked={plan.popular}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            const newPlanes =
                                                                data.planes!.map(
                                                                    (p, i) =>
                                                                        i ===
                                                                        planIndex
                                                                            ? {
                                                                                  ...p,
                                                                                  popular:
                                                                                      Boolean(
                                                                                          checked,
                                                                                      ),
                                                                              }
                                                                            : p,
                                                                );
                                                            setData(
                                                                'planes',
                                                                newPlanes,
                                                            );
                                                        }}
                                                        id={`popular-${planIndex}`}
                                                    />
                                                    <Label
                                                        htmlFor={`popular-${planIndex}`}
                                                        className="text-sm"
                                                    >
                                                        Popular
                                                    </Label>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        removePlan(planIndex)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">
                                                        Precio
                                                    </Label>
                                                    <Input
                                                        value={plan.precio}
                                                        onChange={(e) => {
                                                            const newPlanes =
                                                                data.planes!.map(
                                                                    (p, i) =>
                                                                        i ===
                                                                        planIndex
                                                                            ? {
                                                                                  ...p,
                                                                                  precio: e
                                                                                      .target
                                                                                      .value,
                                                                              }
                                                                            : p,
                                                                );
                                                            setData(
                                                                'planes',
                                                                newPlanes,
                                                            );
                                                        }}
                                                        placeholder="$99"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">
                                                        Período
                                                    </Label>
                                                    <Input
                                                        value={plan.periodo}
                                                        onChange={(e) => {
                                                            const newPlanes =
                                                                data.planes!.map(
                                                                    (p, i) =>
                                                                        i ===
                                                                        planIndex
                                                                            ? {
                                                                                  ...p,
                                                                                  periodo:
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                              }
                                                                            : p,
                                                                );
                                                            setData(
                                                                'planes',
                                                                newPlanes,
                                                            );
                                                        }}
                                                        placeholder="/mes"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">
                                                        Descripción
                                                    </Label>
                                                    <Input
                                                        value={plan.descripcion}
                                                        onChange={(e) => {
                                                            const newPlanes =
                                                                data.planes!.map(
                                                                    (p, i) =>
                                                                        i ===
                                                                        planIndex
                                                                            ? {
                                                                                  ...p,
                                                                                  descripcion:
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                              }
                                                                            : p,
                                                                );
                                                            setData(
                                                                'planes',
                                                                newPlanes,
                                                            );
                                                        }}
                                                        placeholder="Para pequeñas empresas"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Label className="text-xs">
                                                        Características
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            addPlanCaracteristica(
                                                                planIndex,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="mr-1 h-3 w-3" />{' '}
                                                        Agregar
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {plan.caracteristicas.map(
                                                        (
                                                            caract,
                                                            caractIndex,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    caractIndex
                                                                }
                                                                className="flex gap-2"
                                                            >
                                                                <Input
                                                                    value={
                                                                        caract
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updatePlanCaracteristica(
                                                                            planIndex,
                                                                            caractIndex,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Característica"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive"
                                                                    onClick={() =>
                                                                        removePlanCaracteristica(
                                                                            planIndex,
                                                                            caractIndex,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeSection === 'cta' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sección CTA Final</CardTitle>
                                    <CardDescription>
                                        El llamado a la acción antes del footer
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <Input
                                            value={data.cta?.titulo}
                                            onChange={(e) =>
                                                setData('cta', {
                                                    ...data.cta!,
                                                    titulo: e.target.value,
                                                })
                                            }
                                            placeholder="¿Listo para transformar tu negocio?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descripción</Label>
                                        <Input
                                            value={data.cta?.descripcion}
                                            onChange={(e) =>
                                                setData('cta', {
                                                    ...data.cta!,
                                                    descripcion: e.target.value,
                                                })
                                            }
                                            placeholder="Únete a miles de empresas..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto del Botón</Label>
                                        <Input
                                            value={data.cta?.boton}
                                            onChange={(e) =>
                                                setData('cta', {
                                                    ...data.cta!,
                                                    boton: e.target.value,
                                                })
                                            }
                                            placeholder="Crear cuenta gratis"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </form>
                </div>
            </AppLayout>
        </>
    );
}
