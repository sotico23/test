<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\PublicProfile;
use Illuminate\Database\Seeder;

class RepairMarketplaceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profiles = PublicProfile::all();

        foreach ($profiles as $profile) {
            // Update products belonging to the same owner (user_id in PublicProfile refers to the owner user)
            $productCount = Producto::where('owner_id', $profile->user_id)
                ->where(function ($query) use ($profile) {
                    $query->whereNull('public_profile_id')
                        ->orWhere('public_profile_id', '!=', $profile->id);
                })
                ->update(['public_profile_id' => $profile->id]);

            // Update categories belonging to the same owner
            $categoryCount = Categoria::where('owner_id', $profile->user_id)
                ->where(function ($query) use ($profile) {
                    $query->whereNull('public_profile_id')
                        ->orWhere('public_profile_id', '!=', $profile->id);
                })
                ->update(['public_profile_id' => $profile->id]);

            $this->command->info("Updated {$productCount} products and {$categoryCount} categories for profile: {$profile->slug}");
        }
    }
}
