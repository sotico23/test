<?php

use App\Http\Controllers\Backend\GastoProyectoController;
use App\Http\Controllers\Backend\HitoController;
use App\Http\Controllers\Backend\ProyectoController;
use App\Http\Controllers\Backend\TimesheetController;
use Illuminate\Support\Facades\Route;

Route::resource('proyectos', ProyectoController::class);
Route::resource('hitos', HitoController::class);
Route::resource('timesheets', TimesheetController::class);
Route::resource('gastos-proyecto', GastoProyectoController::class);
