<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('payment_method')->nullable();
            
            $table->string('item_type'); // 'App\Models\Resort' or 'App\Models\Ticket'
            $table->string('item_id');
            
            $table->foreignId('promo_id')->nullable()->constrained('promos')->onDelete('set null');
            
            $table->date('check_in_date'); // Tanggal masuk
            $table->enum('status', ['pending', 'paid', 'success', 'failed', 'cancelled'])->default('pending');
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
