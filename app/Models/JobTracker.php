<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobTracker extends Model
{
    
    protected $casts = [

        'data' => 'array'
    ];
    
    protected $fillable = [
        
        'organization_id',
        'jobId',
        'status',
        'category',
        'data',
        
    ];
}
