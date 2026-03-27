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
        if (!Schema::hasColumn('reschedules', 'reason')) {
            Schema::table('reschedules', function (Blueprint $table) {
                $table->text('reason')->nullable()->after('new_date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('reschedules', 'reason')) {
            Schema::table('reschedules', function (Blueprint $table) {
                $table->dropColumn('reason');
            });
        }
    }
};
