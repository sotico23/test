<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ClienteController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::user()->getOwnerId();

        $clientes = Cliente::with('categoria')
            ->where('owner_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($cliente) {
                $cliente->tiene_acceso = $cliente->user_id !== null;

                return $cliente;
            });
        $categorias = Categoria::where('tipo', 'cliente')->where('activo', true)->where('owner_id', $userId)->get();

        return Inertia::render('Backend/Clientes/Index', [
            'clientes' => $clientes,
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => 'nullable|string|max:50',
            'rut' => 'nullable|string|max:20|unique:clientes,rut',
            'telefono' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:clientes,email',
            'direccion' => 'nullable|string|max:500',
            'ciudad' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'comuna' => 'nullable|string|max:100',
            'giro' => 'nullable|string|max:255',
            'contacto' => 'nullable|string|max:255',
            'telefono_contacto' => 'nullable|string|max:20',
            'categoria_id' => 'nullable|exists:categorias,id',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
            'crear_usuario' => 'boolean',
        ]);

        $crearUsuario = $validated['crear_usuario'] ?? false;

        if ($crearUsuario) {
            $request->validate([
                'email' => 'unique:users,email',
            ]);
        }

        DB::transaction(function () use ($validated, $crearUsuario) {
            $validated['owner_id'] = Auth::user()->getOwnerId();
            $validated['user_id'] = null;

            if ($crearUsuario) {
                $user = User::create([
                    'creator_id' => Auth::id(),
                    'name' => $validated['nombre'],
                    'email' => $validated['email'],
                    'password' => Hash::make('clientenuevo'),
                    'rut' => $validated['rut'] ?? null,
                    'telefono' => $validated['telefono'] ?? null,
                    'direccion' => $validated['direccion'] ?? null,
                    'ciudad' => $validated['ciudad'] ?? null,
                    'region' => $validated['region'] ?? null,
                    'comuna' => $validated['comuna'] ?? null,
                ]);

                $role = Role::firstOrCreate(['name' => 'Cliente']);
                $user->assignRole($role);

                $validated['user_id'] = $user->id;
            }

            Cliente::create($validated);
        });

        $mensaje = $crearUsuario
            ? 'Cliente y acceso a plataforma creado correctamente.'
            : 'Cliente creado correctamente.';

        return redirect()->route('clientes.index')->with('success', $mensaje);
    }

    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'nit' => 'nullable|string|max:50',
            'rut' => 'nullable|string|max:20|unique:clientes,rut,'.$cliente->id,
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:clientes,email,'.$cliente->id,
            'direccion' => 'nullable|string|max:500',
            'ciudad' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'comuna' => 'nullable|string|max:100',
            'giro' => 'nullable|string|max:255',
            'contacto' => 'nullable|string|max:255',
            'telefono_contacto' => 'nullable|string|max:20',
            'categoria_id' => 'nullable|exists:categorias,id',
            'activo' => 'nullable|boolean',
            'notas' => 'nullable|string',
            'crear_usuario' => 'nullable|boolean',
        ]);

        $crearUsuario = $validated['crear_usuario'] ?? false;
        unset($validated['crear_usuario']);

        $usuarioExistente = $cliente->user;

        if ($crearUsuario && ! $usuarioExistente) {
            $request->validate([
                'email' => 'unique:users,email',
            ]);

            $user = User::create([
                'creator_id' => Auth::id(),
                'name' => $validated['nombre'],
                'email' => $validated['email'],
                'password' => Hash::make('clientenuevo'),
                'rut' => $validated['rut'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'direccion' => $validated['direccion'] ?? null,
                'ciudad' => $validated['ciudad'] ?? null,
                'region' => $validated['region'] ?? null,
                'comuna' => $validated['comuna'] ?? null,
            ]);

            $role = Role::firstOrCreate(['name' => 'Cliente']);
            $user->assignRole($role);

            $validated['user_id'] = $user->id;
        } elseif (! $crearUsuario && $usuarioExistente) {
            $usuarioExistente->delete();
            $validated['user_id'] = null;
        }

        $cliente->update($validated);

        return redirect()->route('clientes.index');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        return redirect()->route('clientes.index');
    }
}
