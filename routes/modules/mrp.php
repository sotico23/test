<?php

use App\Http\Controllers\Backend\BomController;
use App\Http\Controllers\Backend\ControlCalidadController;
use App\Http\Controllers\Backend\OrdenProduccionController;
use App\Http\Controllers\Backend\PlanificacionController;
use Illuminate\Support\Facades\Route;

Route::resource('boms', BomController::class);
Route::resource('ordenes-produccion', OrdenProduccionController::class);
Route::resource('calidad', ControlCalidadController::class);
Route::resource('planificacion', PlanificacionController::class);
