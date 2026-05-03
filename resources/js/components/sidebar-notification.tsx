'use client';

import { X, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const SIDEBAR_NOTIF_KEY = 'sidebar_tip_dismissed';

export function showSidebarTip() {
    if (typeof window === 'undefined') return;

    const dismissed = localStorage.getItem(SIDEBAR_NOTIF_KEY);
    if (dismissed) return;

    toast.custom(
        (id) => (
            <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-amber-200 bg-amber-50 shadow-xl ring-4 ring-amber-500/20 dark:border-amber-800 dark:bg-amber-950/50">
                <div className="flex items-start gap-3 p-4">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <ArrowLeft className="h-5 w-5 animate-pulse text-amber-600 dark:text-amber-400" />
                        <div className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 animate-ping rounded-full bg-amber-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                            Consejo del Sidebar
                        </p>
                        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                            Haz clic en el botón{' '}
                            <span className="inline-flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                                <ChevronLeft className="h-3 w-3" />
                            </span>{' '}
                            ubicado en la{' '}
                            <span className="font-bold text-amber-800 dark:text-amber-200">
                                esquina superior izquierda
                            </span>{' '}
                            para ocultar o mostrar el menú lateral.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.setItem(SIDEBAR_NOTIF_KEY, 'true');
                            toast.dismiss(id);
                        }}
                        className="shrink-0 rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
                    >
                        <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </button>
                </div>
                <div className="flex items-center justify-between border-t border-amber-200/50 px-4 py-2 dark:border-amber-800/50">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                        📍 Botón ubicado arriba del todo
                    </span>
                    <button
                        onClick={() => {
                            localStorage.setItem(SIDEBAR_NOTIF_KEY, 'true');
                            toast.dismiss(id);
                        }}
                        className="text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                    >
                        No mostrar de nuevo
                    </button>
                </div>
            </div>
        ),
        {
            duration: 10000,
            position: 'top-left',
        },
    );
}

export function dismissSidebarTip() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_NOTIF_KEY, 'true');
}

export function useSidebarNotification() {
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(SIDEBAR_NOTIF_KEY);
        if (dismissed) return;

        if (hasShown) return;

        const timer = setTimeout(() => {
            showSidebarTip();
            setHasShown(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [hasShown]);

    useEffect(() => {
        const handleSidebarClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-sidebar="trigger"]')) {
                dismissSidebarTip();
            }
        };

        document.addEventListener('click', handleSidebarClick);

        return () => {
            document.removeEventListener('click', handleSidebarClick);
        };
    }, []);

    return { showTip: showSidebarTip };
}
