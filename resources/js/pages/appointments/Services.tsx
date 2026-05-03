import { Head, useForm, router } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Services({ services, categorias }: { services: any[], categorias: any[] }) {
    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
        duracion: 30,
        precio_venta: 0,
        categoria_id: categorias.length > 0 ? categorias[0].id : '',
        activo: true,
        imagen: null as File | null,
        imagen2: null as File | null,
        imagen3: null as File | null,
        imagen4: null as File | null,
        imagen5: null as File | null,
    });

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [previews, setPreviews] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            router.post(`/services/${isEditing}`, {
                _method: 'PUT',
                forceFormData: true,
                ...(data as any),
                onSuccess: () => {
                    setIsEditing(null);
                    reset();
                    setPreviews({});
                },
            });
        } else {
            post('/services', {
                onSuccess: () => {
                    reset();
                    setPreviews({});
                },
            });
        }
    };

    const handleEdit = (service: any) => {
        setIsEditing(service.id);
        setData({
            nombre: service.nombre,
            descripcion: service.descripcion || '',
            duracion: service.duracion || 30,
            precio_venta: service.precio_venta,
            categoria_id: service.categoria_id || (categorias.length > 0 ? categorias[0].id : ''),
            activo: service.activo,
            imagen: null,
            imagen2: null,
            imagen3: null,
            imagen4: null,
            imagen5: null,
        });

        const initialPreviews: Record<string, string> = {};
        ['imagen', 'imagen2', 'imagen3', 'imagen4', 'imagen5'].forEach(key => {
            if (service[key]) {
                initialPreviews[key] = `/storage/${service[key]}`;
            }
        });
        setPreviews(initialPreviews);
    };

    const handleFileChange = (key: string, file: File | null) => {
        setData(key as any, file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setPreviews(prev => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            destroy(`/services/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Servicios', href: '/services' }]}>
            <Head title="Servicios | Citas y Reservas" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Formulario */}
                    <div className="col-span-1 border rounded-xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Nombre</Label>
                                <Input value={data.nombre} onChange={e => setData('nombre', e.target.value)} required />
                                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                            </div>
                            <div>
                                <Label>Categoría</Label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.categoria_id}
                                    onChange={e => setData('categoria_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Seleccione una categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoria_id && <p className="text-red-500 text-sm">{errors.categoria_id}</p>}
                            </div>
                            
                            {/* Imágenes */}
                            <div className="space-y-2">
                                <Label>Imágenes (Mínimo 1, Máximo 5)</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['imagen', 'imagen2', 'imagen3', 'imagen4', 'imagen5'].map((key, index) => (
                                        <div key={key} className="relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden hover:bg-slate-50 transition-colors">
                                            {previews[key] ? (
                                                <>
                                                    <img src={previews[key]} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleFileChange(key, null)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center">
                                                    <Plus className="h-4 w-4 text-slate-400" />
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={e => handleFileChange(key, e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.imagen && <p className="text-red-500 text-sm">La imagen principal es obligatoria.</p>}
                            </div>

                            <div>
                                <Label>Descripción</Label>
                                <Input value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Duración (min)</Label>
                                    <Input type="number" min="1" value={data.duracion} onChange={e => setData('duracion', parseInt(e.target.value))} required />
                                </div>
                                <div>
                                    <Label>Precio ($)</Label>
                                    <Input type="number" min="0" value={data.precio_venta} onChange={e => setData('precio_venta', parseInt(e.target.value))} required />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={data.activo} 
                                    onChange={e => setData('activo', e.target.checked)} 
                                />
                                <Label>Activo</Label>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing} className="w-full">
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </Button>
                                {isEditing && (
                                    <Button type="button" variant="outline" onClick={() => { setIsEditing(null); reset(); setPreviews({}); }}>
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Lista */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Categoría</th>
                                        <th className="px-4 py-3">Duración</th>
                                        <th className="px-4 py-3">Precio</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center">No hay servicios registrados.</td>
                                        </tr>
                                    ) : (
                                        services.map(service => (
                                            <tr key={service.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                    {service.nombre}
                                                    <div className="text-xs text-slate-500 font-normal">{service.descripcion}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {service.categoria?.nombre}
                                                </td>
                                                <td className="px-4 py-3">{service.duracion} min</td>
                                                <td className="px-4 py-3">${Number(service.precio_venta).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${service.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {service.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(service.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
