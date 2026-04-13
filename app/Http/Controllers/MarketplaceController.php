<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\PublicProfile;
use App\Scopes\OwnerScope;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    public function index()
    {
        $profiles = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('is_active', true)
            ->with('user')
            ->latest()
            ->paginate(12);

        return Inertia::render('marketplace/index', [
            'profiles' => $profiles,
        ]);
    }

    public function show($slug)
    {
        $publicProfile = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with('user')
            ->with(['categorias' => function ($query) {
                $query->withoutGlobalScope(OwnerScope::class)
                    ->where('activo', true)
                    ->where('mostrar_en_perfil', true)
                    ->orderBy('nombre');
            }])
            ->with(['productos' => function ($query) {
                $query->withoutGlobalScope(OwnerScope::class)
                    ->where('activo', true)
                    ->where('mostrar_en_perfil', true)
                    ->orderBy('nombre');
            }])
            ->firstOrFail();

        return Inertia::render('marketplace/show', [
            'store' => $publicProfile,
        ]);
    }

    public function category($slug, $categoriaId)
    {
        $publicProfile = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with('user')
            ->firstOrFail();

        $categoria = Categoria::withoutGlobalScope(OwnerScope::class)
            ->where('id', $categoriaId)
            ->where('public_profile_id', $publicProfile->id)
            ->where('activo', true)
            ->firstOrFail();

        $productos = Producto::withoutGlobalScope(OwnerScope::class)
            ->where('categoria_id', $categoria->id)
            ->where('public_profile_id', $publicProfile->id)
            ->where('activo', true)
            ->where('mostrar_en_perfil', true)
            ->orderBy('nombre')
            ->paginate(12);

        $randomProductos = Producto::withoutGlobalScope(OwnerScope::class)
            ->where('public_profile_id', $publicProfile->id)
            ->where('categoria_id', '!=', $categoria->id)
            ->where('activo', true)
            ->where('mostrar_en_perfil', true)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return Inertia::render('marketplace/category', [
            'store' => $publicProfile,
            'categoria' => $categoria,
            'productos' => $productos,
            'randomProductos' => $randomProductos,
        ]);
    }
}
