<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Webhooks extends Model
{
    protected $fillable = [
        
        'organization_id',
        'webhook_id',
        'name',
        'webhook_url',
        'auth_hmac'        
    ];
}
