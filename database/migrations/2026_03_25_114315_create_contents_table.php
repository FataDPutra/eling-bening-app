<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('content')->nullable(); // Simple text or HTML
            $table->json('data')->nullable(); // JSON objects (e.g., gallery items, features)
            $table->string('type')->default('text'); // text, image, json, markdown
            $table->string('page')->nullable(); // e.g., 'home', 'about', 'gallery'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
