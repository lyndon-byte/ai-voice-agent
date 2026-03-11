<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceivedCalls extends Model
{
    protected $fillable = [
        
        'organization_id',
        'agent_id',
        'agent_name',
        'duration',
        'credits',
        'llm_cost'
        
    ];
}
