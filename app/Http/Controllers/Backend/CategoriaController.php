<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\PublicProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaController extends Controller
{
    public function index(): Response
    {
        $categorias = Categoria::where('owner_id', Auth::user()->getOwnerId())->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Categorias/Index', [
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|in:producto,cliente,proveedor',
            'activo' => 'boolean',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'mostrar_en_perfil' => 'boolean',
        ]);

        if ($request->hasFile('imagen')) {
            $validated['imagen'] = $request->file('imagen')->store('categorias', 'public');
        }

        $data = array_merge($validated, [
            'owner_id' => Auth::user()->getOwnerId(),
            'user_id' => Auth::id(),
        ]);

        $publicProfile = PublicProfile::where('user_id', Auth::user()->getOwnerId())->first();
        if ($publicProfile) {
            $data['public_profile_id'] = $publicProfile->id;
        }

        Categoria::create($data);

        return redirect()->route('categorias.index');
    }

    public function update(Request $request, Categoria $categoria): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|in:producto,cliente,proveedor',
            'activo' => 'boolean',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'mostrar_en_perfil' => 'boolean',
        ]);

        if ($request->hasFile('imagen')) {
            if ($categoria->imagen) {
                Storage::disk('public')->delete($categoria->imagen);
            }
            $validated['imagen'] = $request->file('imagen')->store('categorias', 'public');
        }

        $publicProfile = PublicProfile::where('user_id', Auth::user()->getOwnerId())->first();
        if ($publicProfile) {
            $validated['public_profile_id'] = $publicProfile->id;
        }

        $categoria->update($validated);

        return redirect()->route('categorias.index');
    }

    public function destroy(Categoria $categoria): RedirectResponse
    {
        if ($categoria->imagen) {
            Storage::disk('public')->delete($categoria->imagen);
        }
        $categoria->delete();

        return redirect()->route('categorias.index');
    }
}
