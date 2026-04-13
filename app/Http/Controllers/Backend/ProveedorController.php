<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Proveedor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProveedorController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::user()->getOwnerId();
        $proveedors = Proveedor::with('categoria')->where('owner_id', $userId)->orderBy('created_at', 'desc')->paginate(15);
        $categorias = Categoria::where('tipo', 'proveedor')->where('activo', true)->where('owner_id', $userId)->get();

        return Inertia::render('Backend/Proveedores/Index', [
            'proveedors' => $proveedors,
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => 'nullable|string|max:50|unique:proveedors,nit',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string',
            'categoria_id' => 'nullable|exists:categorias,id',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ]);

        Proveedor::create(array_merge($validated, [
            'owner_id' => Auth::user()->getOwnerId(),
            'user_id' => Auth::id(),
        ]));

        return redirect()->route('proveedors.index');
    }

    public function update(Request $request, Proveedor $proveedor): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('proveedors')->ignore($proveedor->id),
            ],
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string',
            'categoria_id' => 'nullable|exists:categorias,id',
            'activo' => 'boolean',
            'notas' => 'nullable|string',
        ]);

        $proveedor->update($validated);

        return redirect()->route('proveedors.index');
    }

    public function destroy(Proveedor $proveedor): RedirectResponse
    {
        $proveedor->delete();

        return redirect()->route('proveedors.index');
    }
}
