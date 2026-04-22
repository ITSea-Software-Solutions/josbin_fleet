<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->date('fill_date');
            $table->decimal('liters', 8, 2);
            $table->decimal('cost_per_liter', 8, 3);
            $table->decimal('total_cost', 10, 2)->storedAs('liters * cost_per_liter');
            $table->unsignedInteger('odometer');
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->default('diesel');
            $table->string('station')->nullable();
            $table->boolean('full_tank')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};
