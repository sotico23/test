import { usePage, router } from '@inertiajs/react';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const STEPS = [
    {
        title: 'Dashboard',
        group: 'DASHBOARD',
        desc: 'Métricas clave y panel de control principal de tu empresa.',
        search: 'Dashboard',
        align: 'left',
    },
    {
        title: 'Gestión Comercial',
        group: 'COMERCIAL',
        desc: 'Manejo del Pipeline, Leads, Oportunidades, Cotizaciones, Ventas y Call Center.',
        search: 'Gestión Comercial',
        align: 'left',
    },
    {
        title: 'Operaciones e Inventario',
        group: 'OPERACIONES',
        desc: 'Almacenes (WMS), Lotes, Proveedores y Órdenes de Compra.',
        search: 'Operaciones e Inventario',
        align: 'left',
    },
    {
        title: 'Producción (MRP)',
        group: 'OPERACIONES',
        desc: 'Lista de Materiales (BOM), Órdenes de Producción, Planificación y Calidad.',
        search: 'Producción (MRP)',
        align: 'left',
    },
    {
        title: 'Facturación',
        group: 'FACTURACIÓN',
        desc: 'Facturación electrónica, Cobranzas, Pagos, Contabilidad e Impuestos.',
        search: 'Facturación',
        align: 'left',
    },
    {
        title: 'Pagos en Línea',
        group: 'FINANZAS',
        desc: 'Integración y movimientos mediante Webpay y otras pasarelas.',
        search: 'Pagos en Línea',
        align: 'left',
    },
    {
        title: 'Gestión Humana',
        group: 'RRHH',
        desc: 'Empleados, Nóminas, Asistencia, Reclutamiento y Evaluaciones.',
        search: 'Gestión Humana',
        align: 'left',
    },
    {
        title: 'Proyectos (PMS)',
        group: 'PROYECTOS',
        desc: 'Hitos, Tareas, Timesheets y control de Gastos por proyecto.',
        search: 'Proyectos (PMS)',
        align: 'left',
    },
    {
        title: 'Logística y Flota',
        group: 'LOGÍSTICA',
        desc: 'Vehículos, Conductores, Rutas, Entregas y Grupos de trabajo.',
        search: 'Logística y Flota',
        align: 'left',
    },
    {
        title: 'Punto de Venta (POS)',
        group: 'TIENDA',
        desc: 'Terminal POS (Caja), Cierres, Facturación Rápida y Reportes de Tienda.',
        search: 'Punto de Venta (POS)',
        align: 'left',
    },
    {
        title: 'Citas y Reservas',
        group: 'SERVICIOS',
        desc: 'Agenda, Calendario y gestión de Servicios o Reservas.',
        search: 'Citas y Reservas',
        align: 'left',
    },
    {
        title: 'Plataforma de Aprendizaje',
        group: 'EDUCACIÓN',
        desc: 'Gestor LMS para Instructores y Alumnos (Catálogos y Progreso).',
        search: 'Plataforma de Aprendizaje',
        align: 'left',
        offset: -20,
    },
    {
        title: 'Rifas y Sorteos',
        group: 'MARKETING',
        desc: 'Herramientas interactivas de fidelización y concursos.',
        search: 'Rifas y Sorteos',
        align: 'left',
        offset: -20,
    },
    {
        title: 'Administración',
        group: 'SISTEMA',
        desc: 'Usuarios, Roles, API Keys y Configuraciones núcleo del sistema web.',
        search: 'Administración',
        align: 'left',
        offset: -25,
    },

    // --- CONTROL DE NAVEGACIÓN ---
    {
        title: 'Ocultar Sidebars',
        group: 'NAVEGACIÓN',
        desc: 'Botón para ocultar las barras laterales y tener pantalla completa.',
        search: 'Toggle Sidebar',
        align: 'left',
    },

    // --- SIDEBAR DERECHO ---
    {
        title: 'Perfil de Usuario',
        group: 'TU ESPACIO',
        desc: 'Accede a tu información personal y cuenta.',
        search: 'Usuario',
        align: 'right',
        offset: 0,
    },
    {
        title: 'Configurar Tienda',
        group: 'TU TIENDA',
        desc: 'Configura la visibilidad pública de tus productos.',
        search: 'Configurar Tienda',
        align: 'right',
        offset: 20,
    },
    {
        title: 'Perfil Social',
        group: 'COMUNIDAD',
        desc: 'Navega por las publicaciones e interactua.',
        search: 'Perfil Social',
        align: 'right',
        offset: 10,
    },
    {
        title: 'Gestión SII (DTE)',
        group: 'CERTIFICADOS',
        desc: 'Panel tributario exclusivo para tus Folios al SII.',
        search: 'Gestión SII (DTE)',
        align: 'right',
        offset: 10,
    },
    {
        title: 'Marketplace',
        group: 'ECOSISTEMA',
        desc: 'Ingresa al Mall virtual para comprar y vender.',
        search: 'Marketplace',
        align: 'right',
        offset: 10,
    },
];

export function GuidedTour() {
    const { auth } = usePage().props as any;
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [calculatedTop, setCalculatedTop] = useState(80);

    // Dynamic Tracking Engine
    useEffect(() => {
        if (currentStep < 0 || currentStep >= STEPS.length) return;

        const step = STEPS[currentStep];
        let targetEl: HTMLElement | undefined;

        const resolveTarget = () => {
            try {
                // ENGINE 1: XPath Direct Text Node Targeted Approach
                const xpath = `//text()[contains(., '${step.search}')]/parent::* | //*[text()='${step.search}']`;
                const xPathResult = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null,
                );

                const found: HTMLElement[] = [];
                for (let i = 0; i < xPathResult.snapshotLength; i++) {
                    const node = xPathResult.snapshotItem(i) as HTMLElement;
                    const rect = node.getBoundingClientRect();
                    // Must be physically visible on the screen
                    if (rect.width > 0 && rect.height > 0 && rect.top >= 0) {
                        found.push(node);
                    }
                }

                // If we found multiple, take the deepest one (usually the smallest rect)
                if (found.length > 0) {
                    targetEl = found.reduce((prev, curr) => {
                        const prevRect = prev.getBoundingClientRect();
                        const currRect = curr.getBoundingClientRect();
                        return currRect.width * currRect.height <
                            prevRect.width * prevRect.height
                            ? curr
                            : prev;
                    });
                }

                // ENGINE 2: Universal Fallback Query Selector
                if (!targetEl) {
                    const all = Array.from(
                        document.querySelectorAll('*'),
                    ) as HTMLElement[];
                    targetEl = all.find((el) => {
                        const rect = el.getBoundingClientRect();
                        return (
                            el.textContent === step.search &&
                            rect.width > 0 &&
                            rect.height > 0 &&
                            rect.top >= 0
                        );
                    });

                    // Final fallback: contains
                    if (!targetEl) {
                        targetEl = all.reverse().find((el) => {
                            const rect = el.getBoundingClientRect();
                            return (
                                el.textContent?.includes(step.search) &&
                                rect.width > 0 &&
                                rect.height > 0 &&
                                rect.top >= 0
                            );
                        });
                    }
                }
            } catch (e) {
                console.error('Tour error:', e);
            }

            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest',
                });

                // Allow time for scroll to finish
                setTimeout(() => {
                    if (!targetEl) return;
                    const rect = targetEl.getBoundingClientRect();
                    const maxTop = window.innerHeight - 380;
                    const desiredTop = rect.top - 15 + (step.offset || 0);
                    setCalculatedTop(
                        Math.min(maxTop, Math.max(10, desiredTop)),
                    );
                }, 500);
            } else {
                setCalculatedTop(
                    (step.align === 'right' ? 80 : 120) + (step.offset || 0),
                );
            }
        };

        // Delay execution slightly to allow Inertia/Sidebar animations to settle
        const timer = setTimeout(resolveTarget, 500);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const showOnboarding = auth?.user?.show_onboarding;
    // Debug: ver valor en consola
    console.log(
        'showOnboarding value:',
        showOnboarding,
        'type:',
        typeof showOnboarding,
    );

    // Mostrar modal solo si show_onboarding es true, 1, '1', o undefined/null (nunca configurado)
    const shouldShow =
        showOnboarding === true ||
        showOnboarding === 1 ||
        showOnboarding === '1' ||
        showOnboarding === 'true' ||
        showOnboarding === undefined ||
        showOnboarding === null;

    if (!shouldShow) {
        console.log('Ocultando modal - shouldShow:', shouldShow);
        return null;
    }

    const step = STEPS[currentStep];
    const isLeft = step?.align === 'left';

    const handleDisableOnboarding = async (checked: boolean) => {
        setDontShowAgain(checked);
        if (checked) {
            router.patch(
                '/settings/profile/onboarding',
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setCurrentStep(-1);
                        setTimeout(() => window.location.reload(), 500);
                    },
                    onError: (errors) => {
                        console.error('Error disabling onboarding:', errors);
                        setDontShowAgain(false);
                    },
                }
            );
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleDisableOnboarding(true);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    if (currentStep < 0 || !step) return null;

    return (
        <div
            className={`pointer-events-none fixed inset-0 z-[100] flex transition-all duration-700 ease-in-out ${
                isLeft
                    ? 'justify-start pl-4 md:pl-[280px]'
                    : 'justify-end pr-4 md:pr-[280px]'
            }`}
            style={{ paddingTop: `${calculatedTop}px` }}
        >
            <div
                className="pointer-events-auto flex h-fit w-full max-w-[320px] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-5 dark:bg-zinc-900/95"
                style={{ height: 'fit-content' }}
            >
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-primary">
                        {isLeft && (
                            <ArrowLeft className="h-4 w-4 shrink-0 animate-pulse md:h-5 md:w-5" />
                        )}
                        <h3 className="truncate text-xs font-extrabold tracking-wide text-foreground uppercase md:text-[13px]">
                            {step.title}
                        </h3>
                        {!isLeft && (
                            <ArrowRight className="h-4 w-4 shrink-0 animate-pulse md:h-5 md:w-5" />
                        )}
                    </div>
                </div>

                <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {step.group}
                </p>
                <p className="mb-4 text-sm leading-relaxed font-medium text-foreground/80">
                    {step.desc}
                </p>

                <div className="mb-4 flex flex-wrap items-center justify-center gap-[2px]">
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentStep
                                    ? 'w-4 bg-primary'
                                    : 'w-1.5 bg-muted'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <div className="mb-1 flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="noShow"
                            checked={dontShowAgain}
                            onChange={(e) => {
                                e.preventDefault();
                                handleDisableOnboarding(e.target.checked);
                            }}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-muted-foreground/30 text-primary focus:ring-primary"
                        />
                        <label
                            htmlFor="noShow"
                            className="cursor-pointer text-xs leading-tight font-bold text-muted-foreground select-none"
                        >
                            Terminar este Tour para siempre
                        </label>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="text-[11px] font-bold whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                        >
                            ANTERIOR
                        </button>
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 md:px-4"
                        >
                            {currentStep === STEPS.length - 1 ? (
                                <>
                                    <span className="hidden md:inline">
                                        FINALIZAR
                                    </span>
                                    <span className="md:hidden">FIN</span>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                </>
                            ) : (
                                <>
                                    <span className="hidden md:inline">
                                        SIGUIENTE
                                    </span>
                                    <span className="md:hidden">SIGUIENTE</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
