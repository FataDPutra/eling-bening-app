<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionTicket extends Model
{
    protected $guarded = [];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id', 'id');
    }

    public function transactionItem()
    {
        return $this->belongsTo(TransactionItem::class);
    }
}
