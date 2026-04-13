<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'rut' => $user->rut,
            'telefono' => $user->telefono,
            'direccion' => $user->direccion,
            'ciudad' => $user->ciudad,
            'region' => $user->region,
            'comuna' => $user->comuna,
            'fecha_nacimiento' => $user->fecha_nacimiento,
            'genero' => $user->genero,
            'tipo_entidad' => $user->tipo_entidad,
            'job' => $user->job,
            'location' => $user->location,
            'profile_photo_url' => $user->profile_photo_url,
            'cover_photo_path' => $user->cover_photo_path,
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'two_factor_enabled' => ! empty($user->two_factor_secret),
        ];

        return Inertia::render('settings/MiInformacion', [
            'profile' => $profileData,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:500',
            'ciudad' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'comuna' => 'nullable|string|max:255',
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|string|max:50',
            'job' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Información actualizada correctamente.');
    }
}
