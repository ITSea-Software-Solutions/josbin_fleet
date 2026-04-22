<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('policy_number')->unique();
            $table->enum('type', ['third_party', 'comprehensive', 'fire_theft']);
            $table->date('start_date');
            $table->date('expiry_date');
            $table->decimal('premium_amount', 10, 2);
            $table->decimal('coverage_amount', 12, 2)->nullable();
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurances');
    }
};
