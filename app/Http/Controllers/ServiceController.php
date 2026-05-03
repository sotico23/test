<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\PublicProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $ownerId = auth()->user()->getOwnerId();
        $publicProfile = PublicProfile::where('user_id', $ownerId)->first();

        // Auto-sync missing public_profile_id for current owner's services
        if ($publicProfile) {
            Producto::where('owner_id', $ownerId)
                ->where('is_service', true)
                ->whereNull('public_profile_id')
                ->update(['public_profile_id' => $publicProfile->id]);
        }

        return Inertia::render('appointments/Services', [
            'services' => Producto::where('is_service', true)
                ->with('categoria')
                ->latest()
                ->get(),
            'categorias' => Categoria::where('owner_id', $ownerId)
                ->where('mostrar_en_perfil', true)
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'duracion' => 'required|integer|min:1',
            'precio_venta' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
            'activo' => 'boolean',
            'imagen' => 'required|image|max:2048',
            'imagen2' => 'nullable|image|max:2048',
            'imagen3' => 'nullable|image|max:2048',
            'imagen4' => 'nullable|image|max:2048',
            'imagen5' => 'nullable|image|max:2048',
        ]);

        $validated['is_service'] = true;
        // Require fields that Producto needs
        $validated['codigo'] = 'SRV-'.strtoupper(Str::random(6));
        $validated['precio_compra'] = 0;
        $validated['stock_minimo'] = 0;
        $validated['mostrar_en_perfil'] = true;
        $validated['owner_id'] = auth()->user()->getOwnerId();
        $validated['user_id'] = auth()->id();

        // Inherit public_profile_id from category if it has one
        $categoria = Categoria::find($validated['categoria_id']);
        if ($categoria && $categoria->public_profile_id) {
            $validated['public_profile_id'] = $categoria->public_profile_id;
        } else {
            // Fallback to the owner's first public profile
            $publicProfile = PublicProfile::where('owner_id', auth()->user()->getOwnerId())->first();
            if ($publicProfile) {
                $validated['public_profile_id'] = $publicProfile->id;
            }
        }

        // Handle Image Uploads
        for ($i = 1; $i <= 5; $i++) {
            $key = 'imagen'.($i === 1 ? '' : $i);
            if ($request->hasFile($key)) {
                $validated[$key] = $request->file($key)->store('productos', 'public');
            }
        }

        Producto::create($validated);

        return back()->with('success', 'Servicio creado correctamente.');
    }

    public function update(Request $request, Producto $service)
    {
        $validated = collect($request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'duracion' => 'required|integer|min:1',
            'precio_venta' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
            'activo' => 'boolean',
            'imagen' => 'nullable|image|max:2048',
            'imagen2' => 'nullable|image|max:2048',
            'imagen3' => 'nullable|image|max:2048',
            'imagen4' => 'nullable|image|max:2048',
            'imagen5' => 'nullable|image|max:2048',
        ]))->except(['imagen', 'imagen2', 'imagen3', 'imagen4', 'imagen5'])->toArray();

        // Sync public_profile_id if category changes
        $categoria = Categoria::find($validated['categoria_id']);
        if ($categoria && $categoria->public_profile_id) {
            $validated['public_profile_id'] = $categoria->public_profile_id;
        }

        // Handle Image Uploads
        for ($i = 1; $i <= 5; $i++) {
            $key = 'imagen'.($i === 1 ? '' : $i);
            if ($request->hasFile($key)) {
                // Delete old image if exists
                if ($service->{$key}) {
                    Storage::disk('public')->delete($service->{$key});
                }
                $validated[$key] = $request->file($key)->store('productos', 'public');
            }
        }

        $service->update($validated);

        return back()->with('success', 'Servicio actualizado.');
    }

    public function destroy(Producto $service)
    {
        $service->delete();

        return back()->with('success', 'Servicio eliminado.');
    }
}
