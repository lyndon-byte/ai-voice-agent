<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ['owner','admin','user','system'];

        foreach ($roles as $role) {
            Role::firstOrCreate([
                'name' => $role,
                'organization_id' => null
            ]);
        }
    }
}
