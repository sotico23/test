<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\PaymentConfig;
use App\Models\Producto;
use App\Models\PublicProfile;
use App\Models\StoreReaction;
use App\Scopes\OwnerScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $userReaction = null;
        if (Auth::check()) {
            $userReaction = StoreReaction::where('user_id', Auth::id())
                ->where('public_profile_id', $publicProfile->id)
                ->first();
        }

        $paymentConfig = PaymentConfig::withoutGlobalScope(OwnerScope::class)
            ->where('owner_id', $publicProfile->user_id)
            ->first();

        return Inertia::render('marketplace/show', [
            'store' => $publicProfile,
            'userReaction' => $userReaction,
            'paymentConfig' => $paymentConfig ? [
                'is_active' => (bool) $paymentConfig->is_active,
                'paypal_active' => (bool) $paymentConfig->paypal_active,
                'mercadopago_active' => (bool) $paymentConfig->mercadopago_active,
            ] : null,
        ]);
    }

    public function react(Request $request, $slug)
    {
        if (! Auth::check()) {
            return back()->with('error', 'Debes iniciar sesión para interactuar');
        }

        $publicProfile = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $userId = Auth::id();
        $existingReaction = StoreReaction::where('user_id', $userId)
            ->where('public_profile_id', $publicProfile->id)
            ->first();

        $wasLiked = $existingReaction?->like ?? 0;
        $previousRating = $existingReaction?->rating;

        if ($request->has('like')) {
            $newLike = $request->boolean('like', false) ? 1 : 0;
            $likeDiff = $newLike - $wasLiked;
            $publicProfile->increment('likes_count', $likeDiff);

            if ($existingReaction) {
                $existingReaction->update(['like' => $newLike]);
            } else {
                StoreReaction::create([
                    'user_id' => $userId,
                    'public_profile_id' => $publicProfile->id,
                    'like' => $newLike,
                ]);
            }
        }

        if ($request->has('rating')) {
            $rating = $request->integer('rating');
            $rating = max(0, min(5, $rating));

            if ($existingReaction) {
                $oldRating = $existingReaction->rating ?? 0;
                if ($oldRating > 0) {
                    $publicProfile->decrement('rating_total', $oldRating);
                }
                if ($rating > 0) {
                    $publicProfile->increment('rating_total', $rating);
                    $existingReaction->update(['rating' => $rating]);
                } else {
                    $existingReaction->update(['rating' => null]);
                    $publicProfile->decrement('rating_count');
                }
            } elseif ($rating > 0) {
                StoreReaction::create([
                    'user_id' => $userId,
                    'public_profile_id' => $publicProfile->id,
                    'rating' => $rating,
                ]);
                $publicProfile->increment('rating_count');
                $publicProfile->increment('rating_total', $rating);
            }
        }

        return back();
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

        $paymentConfig = PaymentConfig::withoutGlobalScope(OwnerScope::class)
            ->where('owner_id', $publicProfile->user_id)
            ->first();

        return Inertia::render('marketplace/category', [
            'store' => $publicProfile,
            'categoria' => $categoria,
            'productos' => $productos,
            'randomProductos' => $randomProductos,
            'paymentConfig' => $paymentConfig ? [
                'is_active' => (bool) $paymentConfig->is_active,
                'paypal_active' => (bool) $paymentConfig->paypal_active,
                'mercadopago_active' => (bool) $paymentConfig->mercadopago_active,
            ] : null,
        ]);
    }
}
