<?php

use App\Http\Controllers\Backend\RaffleController;
use App\Http\Controllers\RafflePublicController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:rifas.rifas.viewAny'])->group(function () {
    Route::get('raffles/draws', [RaffleController::class, 'drawsIndex'])->name('raffles.draws.index');
    Route::get('raffles/export', [RaffleController::class, 'exportCsv'])->name('raffles.bulk.export');
    Route::get('raffles/export-excel', [RaffleController::class, 'exportExcel'])->name('raffles.bulk.exportExcel');
    Route::post('raffles/import', [RaffleController::class, 'importCsv'])->name('raffles.bulk.import');
    Route::post('raffles/import-excel', [RaffleController::class, 'importExcel'])->name('raffles.bulk.importExcel');
    Route::resource('raffles', RaffleController::class);

    Route::post('raffles/{raffle}/prizes', [RaffleController::class, 'storePrize'])->name('raffles.prizes.store');
    Route::put('prizes/{prize}', [RaffleController::class, 'updatePrize'])->name('raffles.prizes.update');
    Route::delete('prizes/{prize}', [RaffleController::class, 'destroyPrize'])->name('raffles.prizes.destroy');

    Route::post('raffles/{raffle}/draw', [RaffleController::class, 'draw'])->name('raffles.draw');
    Route::get('raffles/{raffle}/export', [RaffleController::class, 'exportParticipants'])->name('raffles.export');
    Route::get('raffles/{raffle}/draw-room', [RaffleController::class, 'drawRoom'])->name('raffles.draw-room');
});

// Public routes — no permission needed
Route::get('rifa/{slug}', [RafflePublicController::class, 'show'])->name('raffles.public.show');
Route::post('rifa/{slug}/participate', [RafflePublicController::class, 'participate'])->name('raffles.public.participate');
Route::post('rifa/{slug}/buy-numbers', [RafflePublicController::class, 'buyNumbers'])->name('raffles.public.buy-numbers');
Route::get('rifa/{slug}/ganadores', [RafflePublicController::class, 'winners'])->name('raffles.public.winners');
