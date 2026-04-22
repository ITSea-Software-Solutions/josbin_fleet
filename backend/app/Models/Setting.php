<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'label', 'group', 'type'];

    /** Get a setting value by key with an optional default */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) return $default;
        if ($setting->type === 'boolean') return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
        return $setting->value;
    }

    /** Set (upsert) a setting value */
    public static function set(string $key, mixed $value): void
    {
        static::where('key', $key)->update(['value' => $value]);
    }
}
