import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, PlayCircle, FileText, HelpCircle, Edit as EditIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Lesson {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
    order: number;
}

interface Module {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
    order: number;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    is_published: boolean;
    cover_image?: string;
    promo_video_url?: string;
    features: string[] | null;
    modules: Module[];
    category_id?: number | string;
}

export default function Edit({ course, categories }: { course: Course, categories: any[] }) {
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: course.title,
        description: course.description || '',
        price: course.price,
        is_published: course.is_published,
        cover_image: null as File | null | string,
        promo_video_url: course.promo_video_url || '',
        features: course.features || ['', '', '', ''],
        category_id: course.category_id?.toString() || '',
    });

    const moduleForm = useForm({
        title: '',
        description: '',
        video_url: '',
    });

    const lessonForm = useForm({
        title: '',
        description: '',
        video_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/instructor/cursos/${course.id}`);
    };

    const handlePublish = () => {
        router.post(`/instructor/cursos/${course.id}/publish`);
    };

    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingModuleId) {
            moduleForm.put(`/instructor/modules/${editingModuleId}`, {
                onSuccess: () => {
                    setIsModuleModalOpen(false);
                    moduleForm.reset();
                    setEditingModuleId(null);
                }
            });
        } else {
            moduleForm.post(`/instructor/cursos/${course.id}/modules`, {
                onSuccess: () => {
                    setIsModuleModalOpen(false);
                    moduleForm.reset();
                }
            });
        }
    };

    const handleAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLessonId) {
            lessonForm.put(`/instructor/lessons/${editingLessonId}`, {
                onSuccess: () => {
                    setIsLessonModalOpen(false);
                    lessonForm.reset();
                    setEditingLessonId(null);
                }
            });
        } else {
            if (!activeModuleId) return;
            lessonForm.post(`/instructor/modules/${activeModuleId}/lessons`, {
                onSuccess: () => {
                    setIsLessonModalOpen(false);
                    lessonForm.reset();
                    setActiveModuleId(null);
                }
            });
        }
    };

    const handleDeleteModule = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este módulo y todas sus lecciones?')) {
            router.delete(`/instructor/modules/${id}`);
        }
    };

    const handleDeleteLesson = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta lección?')) {
            router.delete(`/instructor/lessons/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Mis Cursos', href: '/instructor/cursos' },
            { title: 'Editar Curso', href: `/instructor/cursos/${course.id}/edit` }
        ]}>
            <Head title={`Editar: ${course.title}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Button variant="ghost" asChild className="pl-0 mb-2">
                            <Link href="/instructor/cursos">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a la lista
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant={course.is_published ? "outline" : "default"} onClick={handlePublish}>
                            {course.is_published ? 'Retirar de publicación' : 'Publicar curso'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar cambios
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Detalles Básicos */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Detalles del Curso</h2>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input 
                                        id="title"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select 
                                        value={data.category_id as string} 
                                        onValueChange={value => setData('category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea 
                                        id="description"
                                        className="min-h-[150px]"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio ($)</Label>
                                        <Input 
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={e => setData('price', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="cover_image">Imagen de Portada</Label>
                                        <div className="flex items-start gap-4">
                                            {course.cover_image && (
                                                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                                                    <img 
                                                        src={`/storage/${course.cover_image}`} 
                                                        alt="Cover" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <Input 
                                                    id="cover_image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setData('cover_image', e.target.files ? e.target.files[0] : null)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1">Sube una nueva imagen para reemplazar la actual.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <Label htmlFor="promo_video_url">URL del Video Promocional</Label>
                                        <Input 
                                            id="promo_video_url"
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={data.promo_video_url}
                                            onChange={e => setData('promo_video_url', e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-500">Enlace a YouTube o Vimeo para el tráiler del curso.</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <Label>Lo que los alumnos aprenderán (Puntos clave)</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.features.map((feature, index) => (
                                                <Input 
                                                    key={index}
                                                    placeholder={`Punto clave #${index + 1}`}
                                                    value={feature}
                                                    onChange={e => {
                                                        const newFeatures = [...data.features];
                                                        newFeatures[index] = e.target.value;
                                                        setData('features', newFeatures);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </section>

                        {/* Temario (Módulos y Lecciones) */}
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Temario del Curso</h2>
                                <Button variant="outline" size="sm" onClick={() => setIsModuleModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Módulo
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {course.modules.map((module) => (
                                    <div key={module.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                                <span className="font-bold text-sm">{module.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => {
                                                    setEditingModuleId(module.id);
                                                    moduleForm.setData({ 
                                                        title: module.title, 
                                                        description: module.description || '',
                                                        video_url: module.video_url || ''
                                                    });
                                                    setIsModuleModalOpen(true);
                                                }}>
                                                    <EditIcon className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteModule(module.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {module.lessons.map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <PlayCircle className="h-4 w-4 text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                            setEditingLessonId(lesson.id);
                                                            lessonForm.setData({ 
                                                                title: lesson.title, 
                                                                description: lesson.description || '', 
                                                                video_url: lesson.video_url || '' 
                                                            });
                                                            setIsLessonModalOpen(true);
                                                        }}>
                                                            <EditIcon className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteLesson(lesson.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full text-xs text-blue-600 dark:text-blue-400 border-dashed border border-blue-200 dark:border-blue-900/50 mt-2 py-4"
                                                onClick={() => {
                                                    setActiveModuleId(module.id);
                                                    setIsLessonModalOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Añadir Lección
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {course.modules.length === 0 && (
                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                        <p className="text-sm text-slate-500">Aún no hay módulos. Haz clic en el botón superior para empezar.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar de Configuración */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold mb-4">Estado del Curso</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Visibilidad</span>
                                    <span className={`font-medium ${course.is_published ? 'text-green-600' : 'text-amber-600'}`}>
                                        {course.is_published ? 'Público' : 'Borrador'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Módulos</span>
                                    <span className="font-medium">{course.modules.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Lecciones totales</span>
                                    <span className="font-medium">
                                        {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Consejo:</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                        Organiza tus lecciones de forma lógica. Los cursos con módulos claros tienen un 40% más de tasa de finalización.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Nuevo Módulo */}
            <Dialog open={isModuleModalOpen} onOpenChange={(open) => {
                setIsModuleModalOpen(open);
                if (!open) {
                    moduleForm.reset();
                    setEditingModuleId(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModuleId ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
                        <DialogDescription>
                            {editingModuleId ? 'Modifica los detalles de este bloque.' : 'Añade un nuevo bloque temático a tu curso.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddModule}>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="module-title">Título del Módulo</Label>
                                <Input 
                                    id="module-title" 
                                    placeholder="Ej: Fundamentos de React"
                                    value={moduleForm.data.title}
                                    onChange={e => moduleForm.setData('title', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="module-description">Descripción (Opcional)</Label>
                                <Textarea 
                                    id="module-description" 
                                    placeholder="Una breve descripción de lo que se cubrirá..."
                                    value={moduleForm.data.description}
                                    onChange={e => moduleForm.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="module-url">URL del Video del Módulo (Opcional)</Label>
                                <Input 
                                    id="module-url" 
                                    placeholder="https://youtube.com/..."
                                    value={moduleForm.data.video_url}
                                    onChange={e => moduleForm.setData('video_url', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModuleModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={moduleForm.processing}>
                                {editingModuleId ? 'Actualizar Módulo' : 'Crear Módulo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para Nueva Lección */}
            <Dialog open={isLessonModalOpen} onOpenChange={(open) => {
                setIsLessonModalOpen(open);
                if (!open) {
                    lessonForm.reset();
                    setEditingLessonId(null);
                    setActiveModuleId(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLessonId ? 'Editar Lección' : 'Nueva Lección'}</DialogTitle>
                        <DialogDescription>
                            {editingLessonId ? 'Modifica el contenido de esta lección.' : 'Agrega contenido a este módulo.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddLesson}>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lesson-title">Título de la Lección</Label>
                                <Input 
                                    id="lesson-title" 
                                    placeholder="Ej: Instalación de Node.js"
                                    value={lessonForm.data.title}
                                    onChange={e => lessonForm.setData('title', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lesson-description">Resumen/Descripción</Label>
                                <Textarea 
                                    id="lesson-description" 
                                    placeholder="¿Qué aprenderá el alumno en esta lección?"
                                    value={lessonForm.data.description}
                                    onChange={e => lessonForm.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lesson-url">URL del Video / Plataforma Externa</Label>
                                <Input 
                                    id="lesson-url" 
                                    placeholder="https://youtube.com/... o https://vimeo.com/..."
                                    value={lessonForm.data.video_url}
                                    onChange={e => lessonForm.setData('video_url', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setIsLessonModalOpen(false);
                                setActiveModuleId(null);
                            }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={lessonForm.processing}>
                                {editingLessonId ? 'Actualizar Lección' : 'Crear Lección'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
