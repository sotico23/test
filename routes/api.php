<?php

use App\Http\Controllers\Api\TrackingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group(['prefix' => 'v1'], function () {
    Route::post('tracking/update', [TrackingController::class, 'updateLocation'])
        ->middleware(['auth:sanctum', 'throttle:60,1']);
});
