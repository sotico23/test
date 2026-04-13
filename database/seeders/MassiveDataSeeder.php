<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class MassiveDataSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Identificar al Super Admin
        $superAdmin = User::where('email', 'admin@erp.com')->first();

        if (! $superAdmin) {
            $this->command->error('Super Admin (admin@erp.com) no encontrado. Por favor corre UsersTestSeeder primero.');

            return;
        }

        $ownerId = $superAdmin->id;
        $modelsPath = app_path('Models');
        $files = File::files($modelsPath);

        $this->command->info('Iniciando generación de datos masivos (500 por modelo)...');

        foreach ($files as $file) {
            $filename = $file->getFilenameWithoutExtension();
            $className = 'App\\Models\\'.$filename;

            if (! class_exists($className)) {
                continue;
            }

            $model = new $className;

            // 2. Verificar si tiene Factory y el campo owner_id
            $hasFactory = in_array(HasFactory::class, class_uses_recursive($className));
            $hasOwnerId = Schema::hasColumn($model->getTable(), 'owner_id');

            if ($hasFactory) {
                $this->command->info("Generando datos para {$filename}...");

                try {
                    // Preparamos los datos base
                    $data = [];
                    if ($hasOwnerId) {
                        $data['owner_id'] = $ownerId;
                    }

                    // También asignamos user_id al superadmin si existe la columna,
                    // para evitar que los factories creen miles de usuarios innecesarios.
                    if (Schema::hasColumn($model->getTable(), 'user_id')) {
                        $data['user_id'] = $ownerId;
                    }

                    // Creamos los registros en bloques para evitar saturar la memoria
                    // Aunque factory()->count()->create() es eficiente, 500 es manejable.
                    $className::factory()->count(500)->create($data);

                    $this->command->info("  [OK] 500 registros creados para {$filename}.");
                } catch (\Throwable $e) {
                    $this->command->warn("  [ERROR] No se pudieron crear registros para {$filename}: ".$e->getMessage());
                    Log::error("Error seeding model {$filename}: ".$e->getMessage());
                }
            } else {
                $this->command->line("  [SKIP] {$filename} no tiene factory.");
            }
        }

        $this->command->info('Proceso de generación de datos masivos finalizado.');
    }
}
