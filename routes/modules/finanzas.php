<?php

use App\Http\Controllers\Backend\CobranzaController;
use App\Http\Controllers\Backend\ContabilidadController;
use App\Http\Controllers\Backend\FacturacionController;
use App\Http\Controllers\Backend\ImpuestoController;
use App\Http\Controllers\Backend\PagoController;
use App\Http\Controllers\Backend\TesoreriaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['role:Administrador'])->group(function () {
    Route::resource('cobranzas', CobranzaController::class);
    Route::resource('pagos', PagoController::class);
    Route::resource('tesoreria', TesoreriaController::class);
    Route::resource('contabilidad', ContabilidadController::class);
    Route::resource('impuestos', ImpuestoController::class);
});

Route::resource('facturacion', FacturacionController::class);
Route::get('facturacion/{factura}/pdf', [FacturacionController::class, 'downloadPdf'])->name('facturacion.pdf');
