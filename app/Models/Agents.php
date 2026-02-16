<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agents extends Model
{
    protected $fillable = [
        
        'organization_id',
        'agent_id',
        'agent_name',
        'created_by'
        
    ];
}
