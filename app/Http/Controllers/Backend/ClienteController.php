<?php

namespace App\Http\Controllers\Backend;

use App\Exports\ClientesExport;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasBulkOperations;
use App\Http\Requests\Backend\StoreClienteRequest;
use App\Http\Requests\Backend\UpdateClienteRequest;
use App\Imports\ClientesImport;
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
    use HasBulkOperations;

    public function getExportClass(array $filters): object
    {
        return new ClientesExport($filters);
    }

    public function getImportClass(): object
    {
        return new ClientesImport;
    }

    public function index(Request $request): Response
    {
        $userId = Auth::user()->getOwnerId();

        $query = Cliente::with('categoria')
            ->where('owner_id', '=', $userId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('rut', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%")
                    ->orWhere('ciudad', 'like', "%{$search}%");
            });
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->input('categoria_id'));
        }

        $clientes = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($cliente) {
                $cliente->tiene_acceso = $cliente->user_id !== null;

                return $cliente;
            });

        $categorias = Categoria::where('tipo', 'cliente')
            ->where('activo', true)
            ->where('owner_id', $userId)
            ->get();

        return Inertia::render('Backend/Clientes/Index', [
            'clientes' => $clientes,
            'categorias' => $categorias,
            'filters' => $request->only(['search', 'categoria_id']),
        ]);
    }

    public function store(StoreClienteRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $crearUsuario = $request->boolean('crear_usuario');

        if ($crearUsuario) {
            $request->validate([
                'email' => 'unique:users,email',
            ]);
        }

        DB::transaction(function () use (&$validated, $crearUsuario, $request) {
            $validated['owner_id'] = Auth::user()->getOwnerId();
            $validated['user_id'] = null;

            if ($crearUsuario) {
                $user = User::create([
                    'creator_id' => Auth::id(),
                    'name' => $validated['nombre'],
                    'email' => $validated['email'],
                    'password' => Hash::make($request->input('password') ?: 'clientenuevo'),
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

    public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
    {
        $validated = $request->validated();
        $crearUsuario = $request->boolean('crear_usuario');
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
                'password' => Hash::make($request->input('password') ?: 'clientenuevo'),
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
        } elseif ($crearUsuario && $usuarioExistente) {
            if ($request->filled('password')) {
                $usuarioExistente->update([
                    'password' => Hash::make($request->input('password')),
                ]);
            }
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

    public function show(Cliente $cliente): Response
    {
        $cliente->load('categoria');

        return Inertia::render('Backend/Clientes/Show', [
            'cliente' => $cliente,
        ]);
    }
}
