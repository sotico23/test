<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
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
        $usuarios = User::with('roles', 'permissions')->orderBy('name')->get();
        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('name')->get();

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
            'usuariosRoles' => $asignaciones,
        ]);
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

        if (! empty($validated['rol_id'])) {
            $role = Role::findById($validated['rol_id']);
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
            if ($user && $role) {
                $user->removeRole($role);
            }
        }

        return redirect()->route('usuarios-roles.index')->with('success', 'Asignación eliminada.');
    }
}
