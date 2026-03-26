<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop old columns that are now handled by transaction_items
            if (Schema::hasColumn('transactions', 'item_type')) {
                $table->dropColumn('item_type');
            }
            if (Schema::hasColumn('transactions', 'item_id')) {
                $table->dropColumn('item_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('item_type')->nullable();
            $table->string('item_id')->nullable();
        });
    }
};
