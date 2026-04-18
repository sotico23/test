import type { PropsWithChildren } from 'react';
import { Separator } from '@/components/ui/separator';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <div className="flex-1 md:max-w-3xl">
                    <section className="space-y-8">{children}</section>
                </div>

                <Separator className="my-6 lg:hidden" />
            </div>
        </div>
    );
}
