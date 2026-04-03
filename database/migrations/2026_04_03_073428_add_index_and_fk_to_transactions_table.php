<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Composite index: speeds up the most common addon query
            // WHERE parent_id = ? AND status = 'pending'
            $table->index(['parent_id', 'status'], 'idx_transactions_parent_status');

            // FK constraint: ensures addon can't exist without a parent booking
            // ON DELETE CASCADE: deleting a resort booking also removes its addons
            $table->foreign('parent_id', 'fk_transactions_parent')
                  ->references('id')
                  ->on('transactions')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign('fk_transactions_parent');
            $table->dropIndex('idx_transactions_parent_status');
        });
    }
};
