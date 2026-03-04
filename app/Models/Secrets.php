<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Secrets extends Model
{
    protected $fillable = [
        
        'organization_id',
        'secret_id',
        'name',        
    ];
}
