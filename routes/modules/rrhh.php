<?php

use App\Http\Controllers\Backend\AsistenciaController;
use App\Http\Controllers\Backend\EmpleadoController;
use App\Http\Controllers\Backend\EvaluacionController;
use App\Http\Controllers\Backend\NominaController;
use App\Http\Controllers\Backend\ReclutamientoController;
use Illuminate\Support\Facades\Route;

Route::resource('empleados', EmpleadoController::class);
Route::resource('nominas', NominaController::class);
Route::resource('asistencia', AsistenciaController::class);
Route::resource('reclutamiento', ReclutamientoController::class);
Route::resource('evaluaciones', EvaluacionController::class);
