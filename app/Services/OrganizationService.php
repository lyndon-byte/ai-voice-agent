<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class OrganizationService
{
    public function createWithOwner(array $data): User
    {
        return DB::transaction(function () use ($data) {

            $organization = Organization::create([
                'name' => $data['organization_name'],
                'domain' => uniqid() . '.local', // placeholder only
                'database' => uniqid() . '.local', // placeholder only
            ]);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'organization_id' => $organization->id,
            ]);

            app(PermissionRegistrar::class)->setPermissionsTeamId($organization->id);

            $user->assignRole('owner');

            return $user;
        });
    }
}