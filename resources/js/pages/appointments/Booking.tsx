import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Store, CreditCard, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Booking({ profile, services }: { profile: any, services: any[] }) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, reset } = useForm({
        service_id: new URLSearchParams(window.location.search).get('service_id') || '',
        start_time: '',
        client_name: '',
        client_email: '',
        payment_method: 'card',
        card_number: '',
        card_expiry: '',
        card_cvc: '',
    });

    const selectedService = services.find(s => s.id.toString() === data.service_id);

    const handleNext = () => {
        if (!data.service_id || !data.start_time || !data.client_name || !data.client_email) {
            alert('Por favor completa todos los campos.');
            return;
        }
        setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/booking/${profile.slug}`, {
            onSuccess: () => {
                reset();
                setStep(3); // Success step
            }
        });
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-slate-200 dark:border-slate-800">
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">¡Reserva Confirmada!</h2>
                    <p className="text-slate-500 mb-8">Hemos enviado los detalles a tu correo electrónico. Te esperamos en {profile.title}.</p>
                    <Button onClick={() => window.location.href = `/tienda/${profile.slug}`} className="w-full">
                        Volver a la Tienda
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <Head title={`Reservar en ${profile.title}`} />
            
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50">
                <div className="mx-auto max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        {profile.logo ? (
                            <img src={profile.logo} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                                <Store className="h-5 w-5" />
                            </div>
                        )}
                        <h1 className="text-xl font-bold">{profile.title}</h1>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold text-slate-400">
                        <span className={step >= 1 ? 'text-primary' : ''}>1. Detalles</span>
                        <span>/</span>
                        <span className={step >= 2 ? 'text-primary' : ''}>2. Pago</span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {step === 1 ? (
                        <div className="p-8 space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Escoge tu Servicio</h2>
                                <p className="mt-2 text-slate-500">Selecciona el servicio y la hora que más te acomode.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-bold">1. Selección de Servicio</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                        {services.map(service => (
                                            <label key={service.id} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${data.service_id === service.id.toString() ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="service_id" 
                                                    value={service.id} 
                                                    className="sr-only" 
                                                    onChange={e => setData('service_id', e.target.value)} 
                                                />
                                                <span className="font-bold text-slate-900 dark:text-white">{service.nombre}</span>
                                                <span className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3"/> {service.duracion} min</span>
                                                <span className="mt-2 text-primary text-lg font-bold">${Number(service.precio_venta).toLocaleString()}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>}
                                </div>

                                <div>
                                    <Label className="text-base font-bold">2. Fecha y Hora</Label>
                                    <Input 
                                        type="datetime-local" 
                                        className="mt-3 block w-full h-12" 
                                        value={data.start_time} 
                                        onChange={e => setData('start_time', e.target.value)} 
                                        required
                                    />
                                    {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Label className="text-base font-bold">3. Tus Datos para el Recordatorio</Label>
                                    <div className="grid gap-4 mt-3">
                                        <div>
                                            <Label>Nombre Completo</Label>
                                            <Input className="h-12" value={data.client_name} onChange={e => setData('client_name', e.target.value)} required />
                                            {errors.client_name && <p className="text-red-500 text-sm">{errors.client_name}</p>}
                                        </div>
                                        <div>
                                            <Label>Correo Electrónico</Label>
                                            <Input type="email" className="h-12" value={data.client_email} onChange={e => setData('client_email', e.target.value)} required />
                                            {errors.client_email && <p className="text-red-500 text-sm">{errors.client_email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleNext} className="w-full h-14 text-lg font-bold mt-4 shadow-lg shadow-primary/20">
                                Continuar al Pago
                                <CreditCard className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="p-8">
                            <button onClick={() => setStep(1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                                Volver a detalles
                            </button>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold">Finalizar y Pagar</h2>
                                <p className="text-slate-500">Pago seguro procesado por la plataforma.</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-8 space-y-2">
                                <div className="flex justify-between font-medium">
                                    <span>{selectedService?.nombre}</span>
                                    <span>${Number(selectedService?.precio_venta).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Fecha</span>
                                    <span>{format(new Date(data.start_time), "PPPp", { locale: es })}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-lg text-primary">
                                    <span>Total a Pagar</span>
                                    <span>${Number(selectedService?.precio_venta).toLocaleString()}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Número de Tarjeta</Label>
                                        <Input 
                                            placeholder="0000 0000 0000 0000" 
                                            className="h-12"
                                            value={data.card_number}
                                            onChange={e => setData('card_number', e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Vencimiento</Label>
                                            <Input 
                                                placeholder="MM/YY" 
                                                className="h-12"
                                                value={data.card_expiry}
                                                onChange={e => setData('card_expiry', e.target.value)}
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <Label>CVC</Label>
                                            <Input 
                                                placeholder="123" 
                                                className="h-12"
                                                value={data.card_cvc}
                                                onChange={e => setData('card_cvc', e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm mb-6">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Tus datos de pago están protegidos.</span>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
                                    {processing ? 'Procesando Pago...' : `Pagar $${Number(selectedService?.precio_venta).toLocaleString()}`}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
                <p className="mt-8 text-center text-slate-400 text-sm italic">
                    Términos y condiciones: Reembolsos disponibles hasta 24 horas antes de la cita.
                </p>
            </div>
        </div>
    );
}
