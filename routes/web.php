<?php

use Illuminate\Support\Facades\Route;

// SPA Fallback
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
