<?php

use App\Http\Controllers\Backend\AlmacenController;
use App\Http\Controllers\Backend\CompraController;
use App\Http\Controllers\Backend\InventarioController;
use App\Http\Controllers\Backend\LoteController;
use App\Http\Controllers\Backend\MovimientoController;
use App\Http\Controllers\Backend\ProveedorController;
use App\Http\Controllers\Backend\VacioController;
use Illuminate\Support\Facades\Route;

Route::get('proveedors/export', [ProveedorController::class, 'exportCsv'])->name('proveedors.export');
Route::get('proveedors/export-excel', [ProveedorController::class, 'exportExcel'])->name('proveedors.exportExcel');
Route::post('proveedors/import', [ProveedorController::class, 'importCsv'])->name('proveedors.import');
Route::post('proveedors/import-excel', [ProveedorController::class, 'importExcel'])->name('proveedors.importExcel');
Route::resource('proveedors', ProveedorController::class);

Route::get('compras/export', [CompraController::class, 'exportCsv'])->name('compras.export');
Route::get('compras/export-excel', [CompraController::class, 'exportExcel'])->name('compras.exportExcel');
Route::post('compras/import', [CompraController::class, 'importCsv'])->name('compras.import');
Route::post('compras/import-excel', [CompraController::class, 'importExcel'])->name('compras.importExcel');
Route::resource('compras', CompraController::class);
Route::get('inventarios/export', [InventarioController::class, 'exportCsv'])->name('inventarios.export');
Route::get('inventarios/export-excel', [InventarioController::class, 'exportExcel'])->name('inventarios.exportExcel');
Route::post('inventarios/import', [InventarioController::class, 'importCsv'])->name('inventarios.import');
Route::post('inventarios/import-excel', [InventarioController::class, 'importExcel'])->name('inventarios.importExcel');
Route::resource('inventarios', InventarioController::class);
Route::get('almacenes/export', [AlmacenController::class, 'exportCsv'])->name('almacenes.export');
Route::get('almacenes/export-excel', [AlmacenController::class, 'exportExcel'])->name('almacenes.exportExcel');
Route::post('almacenes/import', [AlmacenController::class, 'importCsv'])->name('almacenes.import');
Route::post('almacenes/import-excel', [AlmacenController::class, 'importExcel'])->name('almacenes.importExcel');
Route::resource('almacenes', AlmacenController::class);
Route::get('lotes/export', [LoteController::class, 'exportCsv'])->name('lotes.export');
Route::get('lotes/export-excel', [LoteController::class, 'exportExcel'])->name('lotes.exportExcel');
Route::post('lotes/import', [LoteController::class, 'importCsv'])->name('lotes.import');
Route::post('lotes/import-excel', [LoteController::class, 'importExcel'])->name('lotes.importExcel');
Route::resource('lotes', LoteController::class);

Route::get('movimientos/export', [MovimientoController::class, 'exportCsv'])->name('movimientos.export');
Route::get('movimientos/export-excel', [MovimientoController::class, 'exportExcel'])->name('movimientos.exportExcel');
Route::post('movimientos/import', [MovimientoController::class, 'importCsv'])->name('movimientos.import');
Route::post('movimientos/import-excel', [MovimientoController::class, 'importExcel'])->name('movimientos.importExcel');
Route::resource('movimientos', MovimientoController::class);
Route::get('vacios/export', [VacioController::class, 'exportCsv'])->name('vacios.export');
Route::get('vacios/export-excel', [VacioController::class, 'exportExcel'])->name('vacios.exportExcel');
Route::post('vacios/import', [VacioController::class, 'importCsv'])->name('vacios.import');
Route::post('vacios/import-excel', [VacioController::class, 'importExcel'])->name('vacios.importExcel');
Route::resource('vacios', VacioController::class);
Route::patch('vacios/{vacio}/retornar', [VacioController::class, 'retornar'])->name('vacios.retornar');
