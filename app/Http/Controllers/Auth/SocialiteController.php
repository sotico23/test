<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TempPasswordNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $socialiteUser = Socialite::driver($provider)->stateless()->user();

        $email = $socialiteUser->getEmail();
        $name = $socialiteUser->getName() ?? $socialiteUser->getNickName();
        $avatar = $socialiteUser->getAvatar();

        if (! $email) {
            return redirect()
                ->route('login')
                ->with('error', 'No se pudo obtener el correo electrónico de tu cuenta '.ucfirst($provider).'.');
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            if (! $user->password) {
                $tempPassword = Str::random(16);
                $user->update([
                    'password' => Hash::make($tempPassword),
                ]);
                $user->notify(new TempPasswordNotification($tempPassword, ucfirst($provider)));
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard'));
        }

        $tempPassword = Str::random(16);

        $user = User::create([
            'name' => $name ?? 'Usuario',
            'email' => $email,
            'password' => Hash::make($tempPassword),
            'profile_photo_path' => $avatar,
            'creator_id' => null,
            'email_verified_at' => now(),
        ]);

        $role = Role::firstOrCreate(['name' => 'Usuario']);
        $user->assignRole($role);

        try {
            $user->notify(new TempPasswordNotification($tempPassword, ucfirst($provider)));
        } catch (\Exception $e) {
            Log::error('Socialite Registration Mail Error: '.$e->getMessage());
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard'));
    }
}
