<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $guarded = [];
    
    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'parent_id' => 'string',
        'additional_facilities' => 'array',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function tickets()
    {
        return $this->hasMany(TransactionTicket::class, 'transaction_id', 'id');
    }

    public function reschedules()
    {
        return $this->hasMany(Reschedule::class, 'transaction_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(Transaction::class, 'parent_id', 'id');
    }

    public function addons()
    {
        return $this->hasMany(Transaction::class, 'parent_id', 'id');
    }
}
