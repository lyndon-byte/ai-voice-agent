<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostCallEmailNotificationReceivers extends Model
{
    protected $fillable = [
        
        'organization_id',
        'email',
    ];
}
