<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'date_info',
        'event_date',
        'price',
        'images',
        'is_active',
        'is_ticketed',
        'ticket_quota',
    ];

    protected $casts = [
        'images' => 'array',
        'is_active' => 'boolean',
        'is_ticketed' => 'boolean',
        'ticket_quota' => 'integer',
        'event_date' => 'date',
        'price' => 'float',
    ];
}
