<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'plate_number', 'make', 'model', 'year', 'color', 'vin',
        'status', 'fuel_type', 'mileage', 'driver_id',
        'next_service_date', 'next_inspection_date', 'insurance_expiry',
    ];

    protected $casts = [
        'next_service_date'    => 'date',
        'next_inspection_date' => 'date',
        'insurance_expiry'     => 'date',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function insurances(): HasMany
    {
        return $this->hasMany(Insurance::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }
}
