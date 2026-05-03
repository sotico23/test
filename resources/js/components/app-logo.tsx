import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { web_settings } = usePage().props as {
        web_settings?: { app_name: string; app_logo: string | null };
    };
    const appName = web_settings?.app_name || 'Laravel';
    const appLogo = web_settings?.app_logo || null;

    return (
        <>
            <div className={`flex items-center justify-center overflow-hidden ${!appLogo ? 'aspect-square size-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground' : 'h-8'}`}>
                {appLogo ? (
                    <img
                        src={appLogo}
                        alt={appName}
                        className="h-full w-auto max-w-[120px] object-contain rounded-md"
                        onError={(e) => {
                            // Fallback to icon if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
