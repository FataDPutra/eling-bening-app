<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'check_in_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }

    public function item()
    {
        return $this->morphTo();
    }

    public function reschedules()
    {
        return $this->hasMany(Reschedule::class, 'transaction_id', 'id');
    }
}
