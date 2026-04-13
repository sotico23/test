import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    profile_photo_url: string | null;
}

interface Comentario {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
    user?: User;
}

interface Publicacion {
    id: number;
    user_id: number;
    content: string;
    image_path: string | null;
    image_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user?: User;
    comentarios?: Comentario[];
}

interface Props {
    publicaciones: {
        data: Publicacion[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comunidad', href: '/comunidad' },
];

export default function ComunidadIndex({ publicaciones }: Props) {
    const { auth } = usePage().props as { auth: { user: User } };
    const [comentariosAbiertos, setComentariosAbiertos] = useState<number[]>(
        [],
    );

    const toggleComentarios = (publicacionId: number) => {
        setComentariosAbiertos((prev) =>
            prev.includes(publicacionId)
                ? prev.filter((id) => id !== publicacionId)
                : [...prev, publicacionId],
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Publicaciones de la Comunidad" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Publicaciones de la Comunidad
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        {publicaciones.total} publicaciones
                    </span>
                </div>

                {publicaciones.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            No hay publicaciones en la comunidad todavía.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {publicaciones.data.map((publicacion) => (
                            <Card key={publicacion.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={
                                                        publicacion.user
                                                            ?.profile_photo_url ??
                                                        undefined
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        publicacion.user
                                                            ?.name || 'U',
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">
                                                    {publicacion.user?.name ||
                                                        'Usuario'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            publicacion.created_at,
                                                        ),
                                                        "d 'de' MMMM 'de' yyyy",
                                                        { locale: es },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="whitespace-pre-wrap">
                                        {publicacion.content}
                                    </p>

                                    {publicacion.image_url && (
                                        <div className="overflow-hidden rounded-lg border">
                                            <img
                                                src={publicacion.image_url}
                                                alt="Publicación"
                                                className="h-auto max-h-96 w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Heart className="h-4 w-4" />
                                            <span>
                                                {publicacion.likes_count}
                                            </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                            onClick={() =>
                                                toggleComentarios(
                                                    publicacion.id,
                                                )
                                            }
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>
                                                {publicacion.comments_count}
                                            </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span>Compartir</span>
                                        </Button>
                                    </div>

                                    {comentariosAbiertos.includes(
                                        publicacion.id,
                                    ) &&
                                        publicacion.comentarios &&
                                        publicacion.comentarios.length > 0 && (
                                            <div className="space-y-3 border-t pt-4">
                                                {publicacion.comentarios.map(
                                                    (comentario) => (
                                                        <div
                                                            key={comentario.id}
                                                            className="flex gap-2 text-sm"
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage
                                                                    src={
                                                                        comentario
                                                                            .user
                                                                            ?.profile_photo_url ??
                                                                        undefined
                                                                    }
                                                                />
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(
                                                                        comentario
                                                                            .user
                                                                            ?.name ||
                                                                            'U',
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 rounded bg-muted p-2">
                                                                <p className="text-xs font-medium">
                                                                    {comentario
                                                                        .user
                                                                        ?.name ||
                                                                        'Usuario'}
                                                                </p>
                                                                <p>
                                                                    {
                                                                        comentario.content
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
