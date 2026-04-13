<?php

use App\Http\Controllers\Backend\ApiKeyController;
use App\Http\Controllers\Backend\ConfiguracionController;
use App\Http\Controllers\Backend\ReporteController;
use App\Http\Controllers\Backend\UsuarioRolController;
use App\Http\Controllers\Backend\WebSettingController;
use Illuminate\Support\Facades\Route;

Route::get('reportes', [ReporteController::class, 'index'])->name('reportes.index');
Route::resource('configuracion', ConfiguracionController::class);
Route::resource('api-keys', ApiKeyController::class);

Route::middleware('role:Super Admin')->group(function () {
    Route::resource('configuracion-web', WebSettingController::class)->only(['index', 'update']);
});

Route::post('usuarios-roles/role', [UsuarioRolController::class, 'storeRole'])->name('usuarios-roles.role.store');
Route::put('usuarios-roles/role/{role}', [UsuarioRolController::class, 'updateRole'])->name('usuarios-roles.role.update');
Route::delete('usuarios-roles/role/{role}', [UsuarioRolController::class, 'destroyRole'])->name('usuarios-roles.role.destroy');

Route::post('usuarios-roles/permission', [UsuarioRolController::class, 'storePermission'])->name('usuarios-roles.permission.store');
Route::put('usuarios-roles/permission/{permission}', [UsuarioRolController::class, 'updatePermission'])->name('usuarios-roles.permission.update');
Route::delete('usuarios-roles/permission/{permission}', [UsuarioRolController::class, 'destroyPermission'])->name('usuarios-roles.permission.destroy');

Route::resource('usuarios-roles', UsuarioRolController::class);
