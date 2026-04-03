<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            if (!Schema::hasColumn('reschedules', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('final_charge');
            }
            if (!Schema::hasColumn('reschedules', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('reschedules', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'paid_at', 'admin_notes']);
        });
    }
};
