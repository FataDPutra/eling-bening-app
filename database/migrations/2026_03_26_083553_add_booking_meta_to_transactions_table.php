<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('booker_email')->nullable()->after('booker_name');
            $table->string('booker_phone')->nullable()->after('booker_email');
            $table->string('arrival_time')->nullable()->after('check_in_date');
            $table->text('additional_facilities')->nullable()->after('special_requests'); 
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['booker_email', 'booker_phone', 'arrival_time', 'additional_facilities']);
        });
    }
};
