<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'user_id',
        'rating',
        'comment',
        'media',
        'is_visible'
    ];

    protected $casts = [
        'media' => 'array',
        'is_visible' => 'boolean'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
