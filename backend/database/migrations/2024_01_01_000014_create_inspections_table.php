<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['routine', 'annual', 'safety', 'emissions']);
            $table->date('inspection_date');
            $table->date('next_inspection_date')->nullable();
            $table->enum('result', ['pass', 'fail', 'pending'])->default('pending');
            $table->string('inspector')->nullable();
            $table->string('location')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
