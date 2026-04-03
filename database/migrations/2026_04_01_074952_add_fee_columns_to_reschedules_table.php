<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            $table->decimal('price_diff', 15, 2)->default(0)->after('reason')
                  ->comment('max(0, new_total - old_total)');
            $table->decimal('admin_fee', 15, 2)->default(0)->after('price_diff');
            $table->decimal('penalty_fee', 15, 2)->default(0)->after('admin_fee');
            $table->decimal('final_charge', 15, 2)->default(0)->after('penalty_fee')
                  ->comment('price_diff + admin_fee + penalty_fee');
            $table->string('new_check_out_date')->nullable()->after('new_date');
        });
    }

    public function down(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            $table->dropColumn(['price_diff', 'admin_fee', 'penalty_fee', 'final_charge', 'new_check_out_date']);
        });
    }
};

