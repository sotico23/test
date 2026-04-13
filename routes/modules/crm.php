<?php

use App\Http\Controllers\Backend\CampanaController;
use App\Http\Controllers\Backend\CategoriaController;
use App\Http\Controllers\Backend\ClienteController;
use App\Http\Controllers\Backend\OportunidadController;
use App\Http\Controllers\Backend\ProductoController;
use App\Http\Controllers\Backend\ProspectoController;
use App\Http\Controllers\Backend\TicketController;
use Illuminate\Support\Facades\Route;

Route::resource('prospectos', ProspectoController::class);
Route::patch('prospectos/{prospecto}/estado', [ProspectoController::class, 'updateEstado'])->name('prospectos.updateEstado');

Route::resource('oportunidades', OportunidadController::class)->parameters(['oportunidades' => 'oportunidad']);

Route::resource('clientes', ClienteController::class);
Route::resource('productos', ProductoController::class);
Route::resource('categorias', CategoriaController::class);
Route::resource('campanas', CampanaController::class);
Route::resource('tickets', TicketController::class);
