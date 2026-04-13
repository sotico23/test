<?php

use App\Http\Controllers\Backend\AlmacenController;
use App\Http\Controllers\Backend\CompraController;
use App\Http\Controllers\Backend\InventarioController;
use App\Http\Controllers\Backend\LoteController;
use App\Http\Controllers\Backend\MovimientoController;
use App\Http\Controllers\Backend\ProveedorController;
use App\Http\Controllers\Backend\VacioController;
use Illuminate\Support\Facades\Route;

Route::resource('proveedors', ProveedorController::class);
Route::resource('compras', CompraController::class);
Route::resource('inventarios', InventarioController::class);
Route::resource('almacenes', AlmacenController::class);
Route::resource('movimientos', MovimientoController::class);
Route::resource('lotes', LoteController::class);
Route::resource('vacios', VacioController::class);
Route::patch('vacios/{vacio}/retornar', [VacioController::class, 'retornar'])->name('vacios.retornar');
