<?php

namespace App\Http\Controllers\Backend;

use App\Exports\EmpleadosExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Imports\EmpleadosImport;
use App\Models\Almacen;
use App\Models\Empleado;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class EmpleadoController extends Controller
{
    use HasBulkOperations;

    protected function getExportClass(array $filters): object
    {
        return new EmpleadosExport($filters);
    }

    protected function getImportClass(): object
    {
        return new EmpleadosImport;
    }

    public function index(): Response
    {
        $userId = Auth::user()->getOwnerId();
        $empleados = Empleado::with('almacen')->where('creator_id', $userId)->orderBy('nombre')->paginate(15);

        // Los almacenes siempre son del empleador (owner)
        $almacenes = Almacen::where('user_id', $userId)->where('activo', true)->orderBy('nombre')->get();

        // Get roles except Super Admin and Cliente
        $roles = Role::whereNotIn('name', ['Super Admin', 'Cliente'])->orderBy('name')->get();

        return Inertia::render('Backend/Empleados/Index', [
            'empleados' => $empleados,
            'almacenes' => $almacenes,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'rut' => 'nullable|string|max:20|unique:empleados,rut',
            'email' => 'required|email|unique:empleados,email|unique:users,email',
            'telefono' => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date',
            'nacionalidad' => 'nullable|string|max:100',
            'estado_civil' => 'nullable|string|max:50',
            'direccion' => 'nullable|string',
            'comuna' => 'nullable|string|max:100',
            'cargo' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'fecha_contratacion' => 'nullable|date',
            'tipo_contrato' => 'nullable|string|max:50',
            'salario' => 'nullable|numeric|min:0',
            'sueldo_liquido_pactado' => 'nullable|numeric|min:0',
            'afp' => 'nullable|string|max:100',
            'sistema_salud' => 'nullable|string|max:100',
            'isapre_nombre' => 'nullable|string|max:100',
            'banco_nombre' => 'nullable|string|max:100',
            'banco_tipo_cuenta' => 'nullable|string|max:100',
            'banco_numero_cuenta' => 'nullable|string|max:100',
            'estado' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'crear_usuario' => 'boolean',
            'password' => 'nullable|string|min:6',
            'rol_id' => 'nullable|exists:roles,id',
        ]);

        if (empty($validated['almacen_id'])) {
            $validated['almacen_id'] = null;
        }

        $crearUsuario = $validated['crear_usuario'] ?? false;
        $password = $validated['password'] ?? null;
        $rolId = $validated['rol_id'] ?? null;

        unset($validated['crear_usuario'], $validated['password'], $validated['rol_id']);

        DB::transaction(function () use ($validated, $crearUsuario, $password, $rolId) {
            $validated['user_id'] = null;
            $validated['creator_id'] = Auth::id();

            if ($crearUsuario) {
                // Use provided password or default
                $passwordHash = $password
                    ? Hash::make($password)
                    : Hash::make('empleadonuevo');

                $user = User::create([
                    'creator_id' => Auth::id(),
                    'name' => $validated['nombre'].' '.$validated['apellido'],
                    'email' => $validated['email'],
                    'password' => $passwordHash,
                    'job' => $validated['cargo'] ?? null,
                    'telefono' => $validated['telefono'] ?? null,
                    'direccion' => $validated['direccion'] ?? null,
                ]);

                // Assign role if specified, otherwise Empleado
                if ($rolId) {
                    $role = Role::findById($rolId, 'web');
                } else {
                    $role = Role::firstOrCreate(['name' => 'Empleado'], ['guard_name' => 'web']);
                }
                $user->assignRole($role);

                $validated['user_id'] = $user->id;
            }

            // Create employee record
            Empleado::create($validated);
        });

        $mensaje = $crearUsuario
            ? 'Empleado y acceso a plataforma creado correctamente.'
            : 'Empleado creado correctamente.';

        return redirect()->route('empleados.index')->with('success', $mensaje);
    }

    public function update(Request $request, Empleado $empleado): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'apellido' => 'nullable|string|max:255',
            'rut' => 'nullable|string|max:20|unique:empleados,rut,'.$empleado->id,
            'email' => 'nullable|email|unique:empleados,email,'.$empleado->id,
            'telefono' => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date',
            'nacionalidad' => 'nullable|string|max:100',
            'estado_civil' => 'nullable|string|max:50',
            'direccion' => 'nullable|string',
            'comuna' => 'nullable|string|max:100',
            'cargo' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'fecha_contratacion' => 'nullable|date',
            'tipo_contrato' => 'nullable|string|max:50',
            'salario' => 'nullable|numeric|min:0',
            'sueldo_liquido_pactado' => 'nullable|numeric|min:0',
            'afp' => 'nullable|string|max:100',
            'sistema_salud' => 'nullable|string|max:100',
            'isapre_nombre' => 'nullable|string|max:100',
            'banco_nombre' => 'nullable|string|max:100',
            'banco_tipo_cuenta' => 'nullable|string|max:100',
            'banco_numero_cuenta' => 'nullable|string|max:100',
            'estado' => 'nullable|string|max:50',
            'notas' => 'nullable|string',
            'crear_usuario' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
        ]);

        $crearUsuario = $request->filled('crear_usuario') ? ($validated['crear_usuario'] ?? false) : false;
        $actualizarUsuario = $request->filled('crear_usuario');

        unset($validated['crear_usuario']);

        $updateData = [];
        foreach ($validated as $key => $value) {
            if ($value !== null && $request->filled($key)) {
                $updateData[$key] = $value;
            }
        }

        if (empty($updateData['almacen_id']) && $request->filled('almacen_id')) {
            $updateData['almacen_id'] = null;
        }

        $usuarioExistente = $empleado->user;

        DB::transaction(function () use ($updateData, $empleado, $crearUsuario, $actualizarUsuario, $usuarioExistente, $request) {
            if ($actualizarUsuario) {
                if ($crearUsuario && ! $usuarioExistente && $request->filled('email') && $request->filled('nombre') && $request->filled('apellido')) {
                    $user = User::create([
                        'creator_id' => Auth::id(),
                        'name' => ($updateData['nombre'] ?? $empleado->nombre).' '.($updateData['apellido'] ?? $empleado->apellido),
                        'email' => $updateData['email'] ?? $empleado->email,
                        'password' => Hash::make($request->input('password') ?? 'empleadonuevo'),
                        'job' => $updateData['cargo'] ?? $empleado->cargo,
                        'telefono' => $updateData['telefono'] ?? $empleado->telefono,
                        'direccion' => $updateData['direccion'] ?? $empleado->direccion,
                    ]);

                    $role = Role::firstOrCreate(['name' => 'Empleado']);
                    $user->assignRole($role);

                    $updateData['user_id'] = $user->id;
                } elseif ($crearUsuario && $usuarioExistente) {
                    if ($request->filled('password')) {
                        $usuarioExistente->update([
                            'password' => Hash::make($request->input('password')),
                        ]);
                    }
                } elseif (! $crearUsuario && $usuarioExistente) {
                    $usuarioExistente->delete();
                    $updateData['user_id'] = null;
                }
            }

            if (! empty($updateData)) {
                $empleado->update($updateData);
            }
        });

        return redirect()->route('empleados.index')->with('success', 'Empleado actualizado correctamente.');
    }

    public function destroy(Empleado $empleado): RedirectResponse
    {
        $empleado->delete();

        return redirect()->route('empleados.index');
    }
}
