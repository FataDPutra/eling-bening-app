<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_addon'    => 'boolean',
        'is_active'   => 'boolean',
        'price'       => 'float',
    ];

    /**
     * The resorts that have this facility.
     */
    public function resorts()
    {
        return $this->belongsToMany(Resort::class, 'facility_resort');
    }
}
