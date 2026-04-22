<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Insurance extends Model
{
    protected $fillable = [
        'vehicle_id', 'provider', 'policy_number', 'type',
        'start_date', 'expiry_date', 'premium_amount', 'coverage_amount',
        'status', 'notes',
    ];

    protected $casts = [
        'start_date'      => 'date',
        'expiry_date'     => 'date',
        'premium_amount'  => 'decimal:2',
        'coverage_amount' => 'decimal:2',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
