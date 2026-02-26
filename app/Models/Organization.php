<?php

namespace App\Models;

use Spatie\Multitenancy\Models\Tenant;

class Organization extends Tenant
{
    protected $table = 'tenants';
    protected $fillable = ['name','domain','database'];

    public function agents(){

        return $this->hasMany(Agents::class);
    }

    public function knowledgeBase(){

        return $this->hasMany(KnowledgeBase::class);
    }

    public function tools(){

        return $this->hasMany(Tools::class);
    }

}
