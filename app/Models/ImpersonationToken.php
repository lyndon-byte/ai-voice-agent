<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImpersonationToken extends Model
{
    protected $fillable = [

        'token',
        'user_id',
        'admin_id',
        'expires_at'
    ];

    protected $casts = [

        'expires_at' => 'datetime'           
        
    ];

}