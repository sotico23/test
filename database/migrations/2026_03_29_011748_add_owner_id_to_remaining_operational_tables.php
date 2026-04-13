<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'almacens',
            'asistencias',
            'boms',
            'cobranzas',
            'conductores',
            'control_calidads',
            'empleados',
            'entregas',
            'evaluacions',
            'hitos',
            'lotes',
            'mensajes',
            'nominas',
            'orden_produccions',
            'pagos',
            'proyectos',
            'reclutamiento',
            'tareas',
            'tickets',
            'timesheets',
            'vehiculos',
            'vacios',
            'public_profiles',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && ! Schema::hasColumn($tableName, 'owner_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $afterColumn = Schema::hasColumn($tableName, 'user_id') ? 'user_id' : 'id';
                    $table->foreignId('owner_id')->nullable()->after($afterColumn)->constrained('users')->onDelete('cascade');
                });

                // Backfill owner_id from user_id if it exists
                if (Schema::hasColumn($tableName, 'user_id')) {
                    DB::table($tableName)->whereNull('owner_id')->update([
                        'owner_id' => DB::raw('user_id'),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'almacens',
            'asistencias',
            'boms',
            'cobranzas',
            'conductores',
            'control_calidads',
            'empleados',
            'entregas',
            'evaluacions',
            'hitos',
            'lotes',
            'mensajes',
            'nominas',
            'orden_produccions',
            'pagos',
            'proyectos',
            'reclutamiento',
            'tareas',
            'tickets',
            'timesheets',
            'vehiculos',
            'vacios',
            'public_profiles',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'owner_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropForeign(['owner_id']);
                    $table->dropColumn('owner_id');
                });
            }
        }
    }
};
