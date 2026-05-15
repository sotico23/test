<?php

namespace App\Http\Controllers\Backend;

use App\Helpers\PermissionHelper;
use App\Http\Controllers\Controller;
use App\Models\PublicProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UsuarioRolController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();

        $userLevel = $user->highestRoleLevel();

        // Obtenemos todos los usuarios visibles según el scope
        $usuarios = User::visibles()->with('roles', 'permissions')->orderBy('name')->get();
        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('name')->get();

        // Si no es Master, filtramos para que no vea roles de nivel igual o superior al suyo (menor número)
        if ($userLevel > 0) {
            $roles = $roles->filter(function ($role) use ($userLevel) {
                return $role->level > $userLevel;
            })->values();
        }

        // Map assignments for the frontend table
        $asignaciones = $usuarios->flatMap(function ($user) {
            return $user->roles->map(function ($role) use ($user) {
                return [
                    'id' => $user->id.'-'.$role->id,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_avatar' => $user->profile_photo_path
                        ? asset('storage/'.$user->profile_photo_path)
                        : null,
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'type' => 'role',
                    'permissions' => $role->permissions->map(function ($p) {
                        return ['id' => $p->id, 'name' => $p->name];
                    }),
                ];
            }
            );
        });

        return Inertia::render('Backend/UsuarioRol/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'permisos' => $permissions,
            'grouped_permissions' => PermissionHelper::getGroupedPermissions(),
            'usuariosRoles' => $asignaciones,
            'publicProfiles' => PublicProfile::with('user')->orderBy('title')->get(),
        ]);
    }

    public function toggleOfficial(PublicProfile $publicProfile): RedirectResponse
    {
        $publicProfile->update([
            'is_official' => ! $publicProfile->is_official,
        ]);

        return back()->with('success', 'Estado de insignia actualizado.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'rol_id' => 'nullable|exists:roles,id',
            'permiso_id' => 'nullable|exists:permissions,id',
        ], [
            'usuario_id.required' => 'Debe seleccionar un usuario.',
            'rol_id.required' => 'Debe seleccionar un rol.',
        ]);

        $user = User::findOrFail($validated['usuario_id']);
        $currentUserLevel = auth()->user()->highestRoleLevel();

        // Prevenir edición a usuarios de mayor o igual nivel
        if ($currentUserLevel > 0 && $user->highestRoleLevel() <= $currentUserLevel) {
            abort(403, 'No tienes permiso para modificar a un usuario de este nivel.');
        }

        if (! empty($validated['rol_id'])) {
            $role = Role::findById($validated['rol_id']);
            if ($currentUserLevel > 0 && $role->level <= $currentUserLevel) {
                abort(403, 'No tienes permiso para asignar este rol.');
            }
            $user->assignRole($role);
        }

        if (! empty($validated['permiso_id'])) {
            $permission = Permission::findById($validated['permiso_id']);
            $user->givePermissionTo($permission);
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Privilegios actualizados.']);
        }

        return to_route('usuarios-roles.index')->with('success', 'Privilegios actualizados.');
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        if (! empty($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        return redirect()->route('usuarios-roles.index')->with('success', 'Rol creado correctamente.');
    }

    public function updateRole(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|unique:roles,name,'.$role->id,
            'permissions' => 'nullable|array',
        ]);

        if ($request->filled('name')) {
            $role->update(['name' => $validated['name']]);
        }
        if ($request->filled('permissions')) {
            $role->syncPermissions($validated['permissions'] ?? []);
        }

        return redirect()->route('usuarios-roles.index')->with('success', 'Rol actualizado.');
    }

    public function destroyRole(Role $role): RedirectResponse
    {
        $role->delete();

        return redirect()->route('usuarios-roles.index')->with('success', 'Rol eliminado.');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        Permission::create(['name' => $validated['name']]);

        return redirect()->route('usuarios-roles.index')->with('success', 'Permiso creado correctamente.');
    }

    public function updatePermission(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name,'.$permission->id,
        ]);

        $permission->update(['name' => $validated['name']]);

        return redirect()->route('usuarios-roles.index')->with('success', 'Permiso actualizado.');
    }

    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('usuarios-roles.index')->with('success', 'Permiso eliminado.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $parts = explode('-', $id);
        if (count($parts) === 2) {
            $user = User::find($parts[0]);
            $role = Role::findById($parts[1]);
            $currentUserLevel = auth()->user()->highestRoleLevel();

            if ($user && $role) {
                if ($currentUserLevel > 0 && ($user->highestRoleLevel() <= $currentUserLevel || $role->level <= $currentUserLevel)) {
                    abort(403, 'No tienes permiso para quitar este rol o modificar a este usuario.');
                }
                $user->removeRole($role);
            }
        }

        return redirect()->route('usuarios-roles.index')->with('success', 'Asignación eliminada.');
    }
}
