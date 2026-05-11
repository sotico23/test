<?php

use App\Http\Controllers\Backend\ConfiguracionController;
use App\Http\Controllers\Backend\EmailConfigController;
use App\Http\Controllers\Backend\MailTemplateController;
use App\Http\Controllers\Backend\ReporteController;
use App\Http\Controllers\Backend\UsuarioRolController;
use App\Http\Controllers\Backend\WebSettingController;
use Illuminate\Support\Facades\Route;

Route::get('reportes', [ReporteController::class, 'index'])->name('reportes.index');
Route::resource('configuracion', ConfiguracionController::class);

Route::middleware('role:Super Admin')->group(function () {
    Route::resource('configuracion-web', WebSettingController::class)->only(['index', 'update']);
    Route::resource('mail-templates', MailTemplateController::class);
    Route::post('mail-templates/test', [MailTemplateController::class, 'test'])->name('mail-templates.test');
    Route::patch('mail-templates/{mailTemplate}/toggle', [MailTemplateController::class, 'toggle'])->name('mail-templates.toggle');

    // Email Config Routes
    Route::prefix('marketing')->group(function () {
        Route::resource('email-config', EmailConfigController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('email-config/{emailConfig}/test', [EmailConfigController::class, 'test'])->name('email-config.test');
        Route::post('email-config/{emailConfig}/set-default', [EmailConfigController::class, 'setDefault'])->name('email-config.set-default');
        Route::post('email-config/{emailConfig}/set-active', [EmailConfigController::class, 'setActive'])->name('email-config.set-active');
        Route::get('email-config/{emailConfig}/logs', [EmailConfigController::class, 'logs'])->name('email-config.logs');
    });
});

Route::post('usuarios-roles/role', [UsuarioRolController::class, 'storeRole'])->name('usuarios-roles.role.store');
Route::put('usuarios-roles/role/{role}', [UsuarioRolController::class, 'updateRole'])->name('usuarios-roles.role.update');
Route::delete('usuarios-roles/role/{role}', [UsuarioRolController::class, 'destroyRole'])->name('usuarios-roles.role.destroy');

Route::post('usuarios-roles/permission', [UsuarioRolController::class, 'storePermission'])->name('usuarios-roles.permission.store');
Route::put('usuarios-roles/permission/{permission}', [UsuarioRolController::class, 'updatePermission'])->name('usuarios-roles.permission.update');
Route::delete('usuarios-roles/permission/{permission}', [UsuarioRolController::class, 'destroyPermission'])->name('usuarios-roles.permission.destroy');

Route::patch('usuarios-roles/public-profile/{publicProfile}/toggle-official', [UsuarioRolController::class, 'toggleOfficial'])->name('usuarios-roles.toggle-official');
Route::resource('usuarios-roles', UsuarioRolController::class);
