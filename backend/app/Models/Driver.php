<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Driver extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'whatsapp',
        'license_number', 'license_expiry', 'address', 'status',
    ];

    protected $casts = [
        'license_expiry' => 'date',
    ];

    public function vehicle(): HasOne
    {
        return $this->hasOne(Vehicle::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
