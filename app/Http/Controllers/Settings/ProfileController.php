<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Factura;
use App\Models\Follower;
use App\Models\Publicacion;
use App\Models\Venta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $esSuperAdmin = $user->hasRole('Super Admin');

        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        $startOfMonth = now()->startOfMonth();

        // Stats filtradas por usuario o globales para Super Admin
        $ventasEstaSemana = Venta::where('fecha', '>=', $startOfWeek)
            ->where('fecha', '<=', $endOfWeek)
            ->where('estado', 'pagada')
            ->when(! $esSuperAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $nuevosClientes = Cliente::where('activo', true)
            ->whereBetween('created_at', [$startOfMonth, now()])
            ->when(! $esSuperAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $cotizacionesPendientes = Cotizacion::where('estado', 'pendiente')
            ->when(! $esSuperAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $facturasPendientes = Factura::where('estado', 'pendiente')
            ->when(! $esSuperAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->count();

        // Datos para el gráfico de rendimiento (Últimos 7 días)
        $ventasDiarias = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $total = Venta::whereDate('created_at', $date)
                ->where(fn ($q) => $esSuperAdmin ? $q : $q->where('user_id', $user->id))
                ->sum('total');

            $ventasDiarias[] = [
                'dia' => $date->format('D'),
                'total' => (float) $total,
            ];
        }

        // Proyección simple basada en el promedio de los últimos 7 días
        $promedioDiario = count($ventasDiarias) > 0 ? array_sum(array_column($ventasDiarias, 'total')) / 7 : 0;
        $proyeccionProximaSemana = $promedioDiario * 7 * 1.05; // 5% de crecimiento estimado

        $publicacionesRealCount = Publicacion::where('user_id', $user->id)->count();
        $seguidoresCount = Follower::where('followed_id', $user->id)->count();
        $siguiendoCount = Follower::where('user_id', $user->id)->count();

        // Buscar publicaciones reales para el feed
        $publicaciones = Publicacion::with(['user', 'comentarios.user'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(15)
            ->get();

        // Galería de fotos reales de las publicaciones
        $fotosReales = Publicacion::where('user_id', $user->id)
            ->whereNotNull('image_path')
            ->latest()
            ->take(9)
            ->get()
            ->map(fn ($p) => $p->image_url);

        return Inertia::render('settings/profile', [
            'auth' => [
                'user' => $user,
            ],
            'stats' => [
                'ventasEstaSemana' => $ventasEstaSemana,
                'nuevosClientes' => $nuevosClientes,
                'cotizacionesPendientes' => $cotizacionesPendientes,
                'facturasPendientes' => $facturasPendientes,
                'publicaciones' => $publicacionesRealCount,
                'seguidores' => $seguidoresCount,
                'siguiendo' => $siguiendoCount,
                'ventasDiarias' => $ventasDiarias,
                'proyeccionVentas' => $proyeccionProximaSemana,
            ],
            'publicaciones' => $publicaciones,
            'fotos' => $fotosReales,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();

            $validated = $request->validated();

            if (! empty($validated['name'])) {
                $user->name = $validated['name'];
            }

            if (! empty($validated['email'])) {
                $user->email = $validated['email'];

                if ($user->isDirty('email')) {
                    $user->email_verified_at = null;
                }
            }

            if (isset($validated['job'])) {
                $user->job = $validated['job'];
            }

            if (isset($validated['location'])) {
                $user->location = $validated['location'];
            }

            if (isset($validated['razon_social'])) {
                $user->razon_social = $validated['razon_social'];
            }

            if (isset($validated['giro'])) {
                $user->giro = $validated['giro'];
            }

            if (isset($validated['rut'])) {
                $user->rut = $validated['rut'];
            }

            if (isset($validated['telefono'])) {
                $user->telefono = $validated['telefono'];
            }

            if (isset($validated['direccion'])) {
                $user->direccion = $validated['direccion'];
            }

            if (isset($validated['ciudad'])) {
                $user->ciudad = $validated['ciudad'];
            }

            if (isset($validated['region'])) {
                $user->region = $validated['region'];
            }

            if (isset($validated['comuna'])) {
                $user->comuna = $validated['comuna'];
            }

            if (isset($validated['fecha_nacimiento'])) {
                $user->fecha_nacimiento = $validated['fecha_nacimiento'];
            }

            if (isset($validated['genero'])) {
                $user->genero = $validated['genero'];
            }

            if ($request->hasFile('profile_photo')) {
                $path = $request->file('profile_photo')->store('profile-photos', 'public');
                $user->profile_photo_path = $path;
            }

            if ($request->hasFile('cover_photo')) {
                $path = $request->file('cover_photo')->store('cover-photos', 'public');
                $user->cover_photo_path = $path;
            }

            $user->save();

            return to_route('profile.edit');
        } catch (\Exception $e) {
            Log::error('Profile update error: '.$e->getMessage());

            return to_route('profile.edit')->with('error', 'Error al actualizar el perfil');
        }
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
