<?php

use App\Http\Controllers\Backend\PosController;
use App\Http\Controllers\Backend\VarianteController;
use App\Http\Controllers\Backend\VentaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['permission:ventas.ventas.viewAny'])->group(function () {
    Route::resource('ventas', VentaController::class);
    Route::patch('ventas/{venta}/status', [VentaController::class, 'updateStatus'])->name('ventas.status');
});

Route::middleware(['permission:ventas.pos.viewAny'])->group(function () {
    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [PosController::class, 'index'])->name('index');
        Route::post('/', [PosController::class, 'store'])->name('store');
        Route::get('cierre', [PosController::class, 'cierreCaja'])->name('cierre');
        Route::get('cierre/pdf', [PosController::class, 'exportarArqueoPdf'])->name('cierre.pdf');
        Route::get('cierre/csv', [PosController::class, 'exportarArqueoCsv'])->name('cierre.csv');
        Route::get('facturacion', [PosController::class, 'facturacion'])->name('facturacion');
        Route::get('promociones', [PosController::class, 'promociones'])->name('promociones');
        Route::post('promociones', [PosController::class, 'storePromocion'])->name('promociones.store');
        Route::patch('promociones/{promocion}/toggle', [PosController::class, 'togglePromocion'])->name('promociones.toggle');
        Route::put('promociones/{promocion}', [PosController::class, 'updatePromocion'])->name('promociones.update');
        Route::delete('promociones/{promocion}', [PosController::class, 'destroyPromocion'])->name('promociones.destroy');
        Route::get('reportes', [PosController::class, 'reportes'])->name('reportes');
    });
});

Route::middleware(['permission:ventas.variantes.viewAny'])->group(function () {
    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('variantes', [VarianteController::class, 'index'])->name('variantes');
        Route::post('variantes', [VarianteController::class, 'store'])->name('variantes.store');
        Route::put('variantes/{variante}', [VarianteController::class, 'update'])->name('variantes.update');
        Route::delete('variantes/{variante}', [VarianteController::class, 'destroy'])->name('variantes.destroy');
        Route::get('skus', [VarianteController::class, 'skuIndex'])->name('skus');
        Route::post('skus', [VarianteController::class, 'skuStore'])->name('skus.store');
        Route::delete('skus/{sku}', [VarianteController::class, 'skuDestroy'])->name('skus.destroy');
    });
});
