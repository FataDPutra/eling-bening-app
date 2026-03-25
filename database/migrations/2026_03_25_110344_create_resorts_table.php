<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resorts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('facilities')->nullable();
            $table->decimal('price', 15, 2);
            $table->decimal('price_weekend', 15, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('capacity')->default(2);
            $table->string('bed_type')->nullable();
            $table->string('room_size')->nullable();
            $table->json('gallery')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resorts');
    }
};
