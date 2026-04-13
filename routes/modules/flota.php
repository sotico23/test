<?php

use App\Http\Controllers\Backend\ConductorController;
use App\Http\Controllers\Backend\EntregaController;
use App\Http\Controllers\Backend\GrupoTrabajoController;
use App\Http\Controllers\Backend\ListaPendientesController;
use App\Http\Controllers\Backend\VehiculoController;
use Illuminate\Support\Facades\Route;

Route::resource('vehiculos', VehiculoController::class);
Route::patch('vehiculos/{vehiculo}/tracking', [VehiculoController::class, 'actualizarTracking'])->name('vehiculos.tracking');
Route::post('vehiculos/{vehiculo}/simular', [VehiculoController::class, 'simularTracking'])->name('vehiculos.simular');
Route::post('vehiculos/{vehiculo}/limpiar', [VehiculoController::class, 'limpiarTracking'])->name('vehiculos.limpiar');
Route::resource('conductores', ConductorController::class);
Route::post('conductores/{conductor}/simular', [ConductorController::class, 'simularTracking'])->name('conductores.simular');
Route::post('conductores/{conductor}/limpiar', [ConductorController::class, 'limpiarTracking'])->name('conductores.limpiar');
Route::resource('entregas', EntregaController::class);
Route::resource('grupos-trabajo', GrupoTrabajoController::class)->parameters(['grupos-trabajo' => 'grupoTrabajo']);
Route::get('lista-pendientes', [ListaPendientesController::class, 'index'])->name('lista-pendientes.index');
