<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripLog extends Model
{
    protected $fillable = [
        'vehicle_id', 'driver_id', 'origin', 'destination', 'purpose',
        'start_time', 'end_time', 'start_odometer', 'end_odometer', 'status', 'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function getDurationMinutesAttribute(): ?int
    {
        if (!$this->end_time) return null;
        return (int) $this->start_time->diffInMinutes($this->end_time);
    }
}
