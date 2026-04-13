import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const hasRole = (role: string | string[]) => {
        if (!user || !user.roles) return false;
        if (Array.isArray(role)) {
            return role.some(r => user.roles.includes(r));
        }
        return user.roles.includes(role);
    };

    const hasPermission = (permission: string | string[]) => {
        if (!user || !user.permissions) return false;

        // Super Admin has all permissions
        if (user.roles?.includes('Super Admin')) return true;

        if (Array.isArray(permission)) {
            return permission.some(p => user.permissions.includes(p));
        }
        return user.permissions.includes(permission);
    };

    return { hasRole, hasPermission, user };
}
