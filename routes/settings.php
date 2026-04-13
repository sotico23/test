<?php

use App\Http\Controllers\Backend\ComunidadController;
use App\Http\Controllers\Backend\PublicProfileController;
use App\Http\Controllers\Backend\UserProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('mi-informacion', [UserProfileController::class, 'show'])->name('mi-informacion.show');
    Route::patch('mi-informacion', [UserProfileController::class, 'update'])->name('mi-informacion.update');

    Route::get('comunidad', [ComunidadController::class, 'index'])->name('comunidad.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::middleware('auth')->group(function () {
        Route::get('settings/public-profile', [PublicProfileController::class, 'edit'])->name('public-profile.edit');
        Route::patch('settings/public-profile', [PublicProfileController::class, 'update'])->name('public-profile.update');
        Route::post('settings/public-profile/toggle-active', [PublicProfileController::class, 'toggleActive'])->name('public-profile.toggle-active');
    });
});
