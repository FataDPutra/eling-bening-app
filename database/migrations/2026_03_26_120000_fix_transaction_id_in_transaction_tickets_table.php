<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_tickets', function (Blueprint $table) {
            // Change transaction_id to string to support alphanumeric EB-TICK-* IDs
            $table->string('transaction_id')->change();
        });
    }

    public function down(): void
    {
        Schema::table('transaction_tickets', function (Blueprint $table) {
            $table->unsignedBigInteger('transaction_id')->change();
        });
    }
};
