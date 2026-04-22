<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number')->unique();
            $table->string('make');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('color')->nullable();
            $table->string('vin')->nullable()->unique();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->default('diesel');
            $table->unsignedInteger('mileage')->default(0);
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->date('next_service_date')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
