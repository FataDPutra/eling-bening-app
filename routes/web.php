<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\GoogleAuthController;

Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::get('/preview-receipt', function () {
    $transaction = \App\Models\Transaction::with(['items.item', 'user', 'promo', 'reschedules', 'addons'])->latest()->first();
    if (!$transaction) {
        return "Belum ada transaksi di database untuk dipreview.";
    }
    return new \App\Mail\TransactionReceipt($transaction);
});

// SPA Fallback
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
