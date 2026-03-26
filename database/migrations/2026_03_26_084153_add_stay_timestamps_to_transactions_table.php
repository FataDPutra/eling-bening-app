<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('stay_status')->default('pending')->after('status'); // pending, checked_in, checked_out
            $table->timestamp('checked_in_at')->nullable()->after('stay_status');
            $table->timestamp('checked_out_at')->nullable()->after('checked_in_at');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['stay_status', 'checked_in_at', 'checked_out_at']);
        });
    }
};
