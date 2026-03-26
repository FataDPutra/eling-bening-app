<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('booking_type')->default('TICKET')->after('id'); // TICKET, RESORT
            $table->string('booker_name')->nullable()->after('user_id');
            $table->date('check_out_date')->nullable()->after('check_in_date'); // check-in = join date for tickets
            $table->decimal('discount_amount', 15, 2)->default(0)->after('status');
            $table->integer('reschedule_count')->default(0)->after('discount_amount');
            
            // Allow quantity in main table for top-level count
            $table->integer('total_qty')->default(1)->after('booking_type');
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            
            $table->morphs('item'); // item_type, item_id (Ticket or Room)
            $table->integer('quantity')->default(1);
            $table->decimal('price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['booking_type', 'booker_name', 'check_out_date', 'discount_amount', 'reschedule_count', 'total_qty']);
        });
    }
};
