<?php

namespace App\Models;

use Spatie\Multitenancy\Models\Tenant;

class Organization extends Tenant
{
    protected $table = 'tenants';
    protected $fillable = ['name','domain','database','active','super_admin_note'];

    public function users(){

        return $this->hasMany(User::class);
    }

    public function agents(){

        return $this->hasMany(Agents::class);
    }

    public function knowledgeBase(){

        return $this->hasMany(KnowledgeBase::class);
    }

    public function tools(){

        return $this->hasMany(Tools::class);
    }

    // post call webhook only
    public function webhook(){

        return $this->hasOne(Webhooks::class);
    }

    public function secrets(){

        return $this->hasMany(Secrets::class);
    }

    public function numbers(){

        return $this->hasMany(PhoneNumbers::class);
    }

    public function receivedCalls(){

        return $this->hasMany(ReceivedCalls::class);
    }

    public function postCallNotificationReceivers(){

        return $this->hasMany(PostCallEmailNotificationReceivers::class);
    }


}
