<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhoneNumbers extends Model
{
    
    protected $casts = [

        'assigned_agent' => 'array'

    ];
    
    protected $fillable = [
        
        'organization_id',
        'provider',
        'label',
        'phone_number',
        'phone_number_id',
        'assigned_agent',
        'source'
    ];
}
