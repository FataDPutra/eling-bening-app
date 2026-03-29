<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master table for all facilities
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable();       // Lucide icon name, e.g. "Wifi", "Pool"
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->default(0); // Price per night if is_addon = true
            // is_addon: true = guest can ADD this to their booking (e.g. BBQ set)
            // is_addon: false = it's a fixed room amenity (e.g. AC, En-suite bathroom)
            $table->boolean('is_addon')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot table: which facilities belong to which resort room
        Schema::create('facility_resort', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->foreignId('resort_id')->constrained()->onDelete('cascade');
            $table->unique(['facility_id', 'resort_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_resort');
        Schema::dropIfExists('facilities');
    }
};
