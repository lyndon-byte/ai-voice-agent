<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Str::random(12);

        $org = Organization::firstOrCreate([
            'domain' => 'system.local'
        ],[
            'name' => 'System',
            'database' => 'system'
        ]);

        $admin = User::updateOrCreate(
            ['email' => 'super_admin@app.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($password),
                'organization_id' => $org->id
            ]
        );

        app(PermissionRegistrar::class)->setPermissionsTeamId($org->id);

        $admin->assignRole('system');

        $this->command->info('==============================');
        $this->command->info('SUPER ADMIN CREATED');
        $this->command->info('Email: '.$admin->email);
        $this->command->info('Password: '.$password);
        $this->command->info('==============================');
    }
}
