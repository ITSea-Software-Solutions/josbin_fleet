<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    protected $fillable = [
        'vehicle_id', 'type', 'description', 'service_date', 'next_service_date',
        'next_service_mileage', 'cost', 'garage', 'status', 'notes',
    ];

    protected $casts = [
        'service_date'      => 'date',
        'next_service_date' => 'date',
        'cost'              => 'decimal:2',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
