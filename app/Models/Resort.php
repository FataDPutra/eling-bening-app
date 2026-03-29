<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Facility;

class Resort extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'gallery' => 'array',
        'facilities' => 'array',
    ];

    /**
     * The facilities attached to this resort room.
     */
    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'facility_resort');
    }
}
