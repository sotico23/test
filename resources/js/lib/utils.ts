import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatCurrencyCLP(amount: number | string | null | undefined): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (value === null || value === undefined || isNaN(value)) return '$ 0';

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDateCLP(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function cleanRut(rut: string): string {
    return rut.replace(/[^0-9kK]/g, '');
}

export function formatRut(rut: string): string {
    const clean = cleanRut(rut);
    if (clean.length < 2) return clean;

    let body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    let result = '';
    while (body.length > 3) {
        result = '.' + body.slice(-3) + result;
        body = body.slice(0, -3);
    }
    result = body + result;

    return result + '-' + dv;
}
