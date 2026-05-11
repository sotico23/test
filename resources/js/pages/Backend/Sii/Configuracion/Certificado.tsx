import { Head, useForm } from '@inertiajs/react';
import {
    Shield,
    Key,
    Calendar,
    Lock,
    Upload,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Props {
    config: any;
}

export default function Certificado({ config }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        certificado: null as File | null,
        password: '',
    });

    const breadcrumbs = [
        { title: 'SII', href: '/sii' },
        { title: 'Configuración', href: '#' },
        {
            title: 'Certificado Digital',
            href: '/sii/configuracion/certificado',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/sii/configuracion/certificado');
    };

    const isExpiringSoon =
        config?.certificado_vencimiento &&
        new Date(config.certificado_vencimiento).getTime() -
            new Date().getTime() <
            30 * 24 * 60 * 60 * 1000;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Certificado Digital - SII" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">
                            Certificado Digital
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona tu firma electrónica para la emisión de
                            DTEs.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <Card className="border-none bg-zinc-900/5 shadow-xl backdrop-blur-sm dark:bg-zinc-900/40">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" />
                                    Actualizar Certificado
                                </CardTitle>
                                <CardDescription>
                                    Sube tu archivo .pfx o .p12 proporcionado
                                    por tu entidad certificadora.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="certificado">
                                            Archivo del Certificado (.pfx)
                                        </Label>
                                        <div className="group relative">
                                            <Input
                                                id="certificado"
                                                type="file"
                                                accept=".pfx,.p12"
                                                onChange={(e) =>
                                                    setData(
                                                        'certificado',
                                                        e.target.files?.[0] ||
                                                            null,
                                                    )
                                                }
                                                className="h-20 cursor-pointer border-2 border-dashed bg-muted/20 pt-7 text-center transition-all hover:bg-muted/40"
                                            />
                                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-60">
                                                <Upload className="h-6 w-6" />
                                                <span className="mt-1 text-xs">
                                                    {data.certificado
                                                        ? data.certificado.name
                                                        : 'Haz clic o arrastra el archivo'}
                                                </span>
                                            </div>
                                        </div>
                                        {errors.certificado && (
                                            <p className="text-xs font-bold text-rose-500">
                                                {errors.certificado}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Contraseña del Certificado
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <PasswordInput
                                                id="password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-10"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            La contraseña se almacena de forma
                                            encriptada en nuestros servidores.
                                        </p>
                                        {errors.password && (
                                            <p className="text-xs font-bold text-rose-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-12 w-full text-lg font-bold shadow-lg shadow-primary/20"
                                    >
                                        {processing
                                            ? 'Procesando...'
                                            : 'Guardar y Verificar'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none bg-primary/5 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-black tracking-widest text-primary uppercase">
                                    Estado Actual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {config?.certificado_path ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Certificado Cargado
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Tu firma está lista.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/20 bg-white/40 p-4 dark:bg-zinc-800/40">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                                    Vencimiento
                                                </span>
                                            </div>
                                            <p
                                                className={`text-xl font-black ${isExpiringSoon ? 'text-rose-500' : ''}`}
                                            >
                                                {config.certificado_vencimiento ||
                                                    'No detectado'}
                                            </p>
                                            {isExpiringSoon && (
                                                <Badge
                                                    variant="destructive"
                                                    className="mt-2 animate-pulse text-[10px]"
                                                >
                                                    Próximo a vencer
                                                </Badge>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center py-6 text-center">
                                        <AlertTriangle className="mb-2 h-12 w-12 text-amber-500" />
                                        <p className="text-sm font-bold">
                                            Sin Certificado
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Debes subir un certificado para
                                            emitir documentos.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
