<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\ResortController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\PromoController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RescheduleController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FacilityController;

// Breeze Auth Routes
require __DIR__.'/auth.php';

// Social Auth
Route::get('/auth/google', [SocialiteController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback']);

// Midtrans Webhook
Route::post('/midtrans/callback', [\App\Http\Controllers\PaymentCallbackController::class, 'handle']);

    // Public Endpoints
    Route::get('/resorts', [ResortController::class, 'index']);
    Route::get('/resorts/{id}', [ResortController::class, 'show']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/promos/validate', [PromoController::class, 'validatePromo']);
    Route::get('/settings/public', [SystemSettingController::class, 'publicSettings']);
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::get('/facilities/{id}', [FacilityController::class, 'show']);

// Dynamic CMS Content & Events
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/contents', [ContentController::class, 'index']);

Route::middleware(['auth:sanctum'])->group(function() {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Customer / Auth User actions
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions/{id}/reschedule', [TransactionController::class, 'reschedule']);
    
    // Profile Management
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/photo', [ProfileController::class, 'updatePhoto']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);
    
    Route::get('/reschedules', [RescheduleController::class, 'index']); // Guest see their own
    Route::post('/reschedules/{id}/pay', [RescheduleController::class, 'pay']);
    Route::post('/reschedules/{id}/cancel', [RescheduleController::class, 'cancel']);
    Route::post('/transactions/{id}/success', [TransactionController::class, 'success']);
    Route::post('/transactions/{id}/pay-token', [TransactionController::class, 'payToken']);
    Route::get('/addon-facilities', [TransactionController::class, 'getAddonFacilities']);
    Route::post('/transactions/{id}/addons', [TransactionController::class, 'storeAddon']);
    Route::get('/transactions/check-booking/{id}', [TransactionController::class, 'checkBooking']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function() {
    Route::get('/admin/stats', [StatController::class, 'getStats']);
    Route::get('/settings', [SystemSettingController::class, 'index']);
    Route::post('/settings', [SystemSettingController::class, 'update']);

    // Admin Management Routes for existing public models
    Route::post('/resorts', [ResortController::class, 'store']);
    Route::put('/resorts/{id}', [ResortController::class, 'update']);
    Route::delete('/resorts/{id}', [ResortController::class, 'destroy']);

    Route::post('/tickets', [TicketController::class, 'store']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);

    // Full API Resources
    Route::apiResource('promos', PromoController::class);
    Route::apiResource('expenses', ExpenseController::class);
    
    // Manage Transactions
    Route::put('/transactions/{id}', [TransactionController::class, 'update']); 
    Route::post('/transactions/{id}/check-in', [TransactionController::class, 'checkIn']);
    Route::post('/transactions/{id}/check-out', [TransactionController::class, 'checkOut']);
    Route::patch('/tickets/{ticket_uid}/check-in', [TransactionController::class, 'checkInTicket']);

    // Manage Reschedules
    Route::put('/reschedules/{id}', [RescheduleController::class, 'update']);

    // CMS & Event Management
    Route::apiResource('events', EventController::class)->except(['index']);
    Route::post('/contents/upsert', [ContentController::class, 'upsert']);
    Route::post('/contents/bulk', [ContentController::class, 'bulkUpdate']);

    // Facilities CRUD
    Route::apiResource('facilities', FacilityController::class)->except(['index', 'show']);
});
