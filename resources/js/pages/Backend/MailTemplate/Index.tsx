import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EmailMarketingPage from '../ConfiguracionWeb/EmailMarketing';
import type { BreadcrumbItem } from '@/types';

interface Template {
    id?: number;
    slug: string;
    name: string;
    subject: string;
    content: string;
    type: 'system' | 'marketing';
    is_active: boolean;
    is_default?: boolean;
}

interface Props {
    templates: Template[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marketing', href: '#marketing' },
    { title: 'Email Marketing', href: '/mail-templates' },
];

export default function Index({ templates }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Marketing" />
            <div className="p-6">
                <EmailMarketingPage templates={templates} type="marketing" />
            </div>
        </AppLayout>
    );
}
