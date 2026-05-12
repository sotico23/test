<?php

use App\Http\Controllers\Backend\BomController;
use App\Http\Controllers\Backend\ControlCalidadController;
use App\Http\Controllers\Backend\OrdenProduccionController;
use App\Http\Controllers\Backend\PlanificacionController;
use Illuminate\Support\Facades\Route;

Route::resource('boms', BomController::class);
Route::get('ordenes-produccion/export', [OrdenProduccionController::class, 'exportCsv'])->name('ordenes-produccion.export');
Route::get('ordenes-produccion/export-excel', [OrdenProduccionController::class, 'exportExcel'])->name('ordenes-produccion.exportExcel');
Route::post('ordenes-produccion/import', [OrdenProduccionController::class, 'importCsv'])->name('ordenes-produccion.import');
Route::post('ordenes-produccion/import-excel', [OrdenProduccionController::class, 'importExcel'])->name('ordenes-produccion.importExcel');
Route::resource('ordenes-produccion', OrdenProduccionController::class);

Route::get('calidad/export', [ControlCalidadController::class, 'exportCsv'])->name('calidad.export');
Route::get('calidad/export-excel', [ControlCalidadController::class, 'exportExcel'])->name('calidad.exportExcel');
Route::post('calidad/import', [ControlCalidadController::class, 'importCsv'])->name('calidad.import');
Route::post('calidad/import-excel', [ControlCalidadController::class, 'importExcel'])->name('calidad.importExcel');
Route::resource('calidad', ControlCalidadController::class);

Route::get('planificacion/export', [PlanificacionController::class, 'exportCsv'])->name('planificacion.export');
Route::get('planificacion/export-excel', [PlanificacionController::class, 'exportExcel'])->name('planificacion.exportExcel');
Route::post('planificacion/import', [PlanificacionController::class, 'importCsv'])->name('planificacion.import');
Route::post('planificacion/import-excel', [PlanificacionController::class, 'importExcel'])->name('planificacion.importExcel');
Route::resource('planificacion', PlanificacionController::class);
