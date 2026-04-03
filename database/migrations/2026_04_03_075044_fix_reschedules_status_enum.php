<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            // Using DB::statement for direct ENUM modification
            DB::statement("ALTER TABLE reschedules MODIFY COLUMN status ENUM('pending', 'approved_awaiting_payment', 'completed', 'rejected') NOT NULL DEFAULT 'pending'");
        });
    }

    public function down(): void
    {
        Schema::table('reschedules', function (Blueprint $table) {
            DB::statement("ALTER TABLE reschedules MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        });
    }
};
