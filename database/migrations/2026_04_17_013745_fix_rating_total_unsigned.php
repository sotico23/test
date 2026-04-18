<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE public_profiles MODIFY rating_total BIGINT SIGNED DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE public_profiles MODIFY rating_total BIGINT UNSIGNED DEFAULT 0');
    }
};
