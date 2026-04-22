<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelLog extends Model
{
    protected $fillable = [
        'vehicle_id', 'driver_id', 'fill_date', 'liters', 'cost_per_liter',
        'odometer', 'fuel_type', 'station', 'full_tank', 'notes',
    ];

    protected $casts = [
        'fill_date'  => 'date',
        'liters'     => 'decimal:2',
        'cost_per_liter' => 'decimal:3',
        'total_cost' => 'decimal:2',
        'full_tank'  => 'boolean',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
