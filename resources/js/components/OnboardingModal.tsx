import {
    Store,
    Users,
    Settings,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ONBOARDING_STEPS = [
    {
        title: 'Tu Panel Personal',
        description: 'En la esquina superior derecha (o en el menú lateral derecho) encontrarás "Usuario". Desde ahí podrás editar tu perfil, contraseña y apariencia visual.',
        icon: Settings,
        color: 'text-blue-500 bg-blue-500/10',
    },
    {
        title: 'Tu Ecosistema Marketplace',
        description: 'También a la derecha tienes "Marketplace". Úsalo para ver la tienda pública rápida, rastrear tus pedidos realizados o gestionar tus ventas entrantes si eres proveedor.',
        icon: Store,
        color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
        title: 'Comunidad y Red Social',
        description: 'Dentro de "Perfil Social", tienes acceso directo a la Comunidad para ver publicaciones y hacer networking con otros comercios registrados.',
        icon: Users,
        color: 'text-purple-500 bg-purple-500/10',
    },
    {
        title: 'Centro de Comunicaciones',
        description: 'Notificaciones y Chat: Mantente al tanto de los likes a tus productos y responde mensajes a tus clientes en tiempo real desde los accesos rápidos.',
        icon: MessageSquare,
        color: 'text-emerald-500 bg-emerald-500/10',
    },
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenRightSidebarTour');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('hasSeenRightSidebarTour', 'true');
        }
        setIsOpen(false);
    };

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const step = ONBOARDING_STEPS[currentStep];
    const Icon = step.icon;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="mb-4">
                    <div className="flex items-center justify-center mb-6">
                        <div className={`p-4 rounded-3xl ${step.color} transition-colors duration-500`}>
                            <Icon className="w-12 h-12" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-black text-center tracking-tight">
                        {step.title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base mt-2">
                        {step.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center gap-2 py-4">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentStep
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-muted'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-muted/50 pt-4 mt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="dont-show"
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                        />
                        <Label htmlFor="dont-show" className="text-xs font-medium cursor-pointer">
                            No mostrar de nuevo
                        </Label>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            size="icon"
                            className="w-10 h-10 rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="rounded-full px-6 font-bold"
                        >
                            {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Entendido
                                </>
                            ) : (
                                <>
                                    Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
