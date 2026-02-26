<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tools extends Model
{
    protected $fillable = [
        
        'organization_id',
        'tool_id',
        'tool_name',
        'tool_description',
        'created_by'
        
    ];
}
