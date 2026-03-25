<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'content',
        'data',
        'type',
        'page',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Get the dynamic content by key.
     */
    public static function getByKey($key, $default = null)
    {
        $item = self::where('key', $key)->first();
        return $item ? ($item->type === 'json' ? $item->data : $item->content) : $default;
    }
}
