<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Reschedule;
use Illuminate\Http\Request;
use Midtrans\Notification;
use App\Models\SystemSetting;
use Midtrans\Config as MidtransConfig;

class PaymentCallbackController extends Controller
{
    public function handle(Request $request)
    {
        MidtransConfig::$serverKey = SystemSetting::where('key', 'midtrans_server_key')->first()?->value ?? '';
        MidtransConfig::$isProduction = SystemSetting::where('key', 'midtrans_is_production')->first()?->value === 'true';

        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $transactionStatus = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraudStatus = $notif->fraud_status;

        // Determine if it's a reschedule or a main transaction
        if (str_starts_with($orderId, 'RSCH-')) {
            $rescheduleId = str_replace('RSCH-', '', $orderId);
            $reschedule = Reschedule::find($rescheduleId);
            if (!$reschedule) {
                // Return 200 OK for Midtrans Test Notification to succeed in Dashboard
                return response()->json(['message' => 'Test notification or order not found ignored'], 200);
            }

            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                if ($fraudStatus == 'accept' || $transactionStatus == 'settlement') {
                    if ($reschedule->status !== 'completed') {
                        $reschedule->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'payment_method' => $type
                        ]);
                        app(RescheduleController::class)->finalizeReschedule($reschedule);
                        
                        try {
                            $reschedule->load('transaction');
                            $txn = $reschedule->transaction;
                            if ($txn) {
                                $email = $txn->booker_email ?? $txn->user->email;
                                if ($email) {
                                    \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\TransactionReceipt($txn));
                                }
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('Failed sending receipt for reschedule ' . $reschedule->id . ': ' . $e->getMessage());
                        }
                }
            } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                $reschedule->update(['status' => 'rejected']);
            }
        } else {
            $parsedOrderId = preg_replace('/-\d{10}$/', '', $orderId);
            $transaction = Transaction::find($parsedOrderId) ?? Transaction::find($orderId);
            
            if (!$transaction) {
                // Return 200 OK for Midtrans Test Notification to succeed in Dashboard
                return response()->json(['message' => 'Test notification or order not found ignored'], 200);
            }

            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                if ($fraudStatus == 'accept' || $transactionStatus == 'settlement') {
                    if ($transaction->status !== 'success' && $transaction->status !== 'paid') {
                        $transaction->update(['status' => 'success', 'payment_method' => $type]);
                        
                        $itemsData = collect($transaction->items)->map(function($item) {
                            return [
                                'item_id' => $item->item_id,
                                'quantity' => $item->quantity,
                                'guest_names' => $item->guest_names ?? []
                            ];
                        })->toArray();
                        
                        app(TransactionController::class)->generateTickets($transaction, $itemsData);

                        try {
                            $email = $transaction->booker_email ?? $transaction->user->email;
                            if ($email) {
                                \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\TransactionReceipt($transaction));
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('Failed sending receipt ' . $transaction->id . ': ' . $e->getMessage());
                        }
                    }
                }
            } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                $transaction->update(['status' => 'failed']);
            }
        }

        return response()->json(['message' => 'Callback handled']);
    }
}
