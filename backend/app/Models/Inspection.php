<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inspection extends Model
{
    protected $fillable = [
        'vehicle_id', 'type', 'inspection_date', 'next_inspection_date',
        'result', 'inspector', 'location', 'cost', 'notes',
    ];

    protected $casts = [
        'inspection_date'      => 'date',
        'next_inspection_date' => 'date',
        'cost'                 => 'decimal:2',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
