<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@erp.com')->first();
        $adminId = $admin ? $admin->id : 1;

        $categorias = [
            // Productos
            ['nombre' => 'Abarrotes', 'tipo' => 'producto', 'descripcion' => 'Arroz, fideos, aceite, conservas, etc.'],
            ['nombre' => 'Bebestibles', 'tipo' => 'producto', 'descripcion' => 'Bebidas, jugos, aguas, etc.'],
            ['nombre' => 'Limpieza', 'tipo' => 'producto', 'descripcion' => 'Detergentes, cloro, desinfectantes, etc.'],
            ['nombre' => 'Panadería', 'tipo' => 'producto', 'descripcion' => 'Pan, pasteles, etc.'],
            ['nombre' => 'Carnicería', 'tipo' => 'producto', 'descripcion' => 'Vacuno, pollo, cerdo, etc.'],
            ['nombre' => 'Frutas y Verduras', 'tipo' => 'producto', 'descripcion' => 'Productos frescos del campo'],
            ['nombre' => 'Lácteos', 'tipo' => 'producto', 'descripcion' => 'Leche, queso, yogurt, etc.'],
            ['nombre' => 'Congelados', 'tipo' => 'producto', 'descripcion' => 'Papas fritas, hamburguesas, vegetales congelados'],

            // Clientes
            ['nombre' => 'Particular', 'tipo' => 'cliente', 'descripcion' => 'Cliente final persona natural'],
            ['nombre' => 'Empresa', 'tipo' => 'cliente', 'descripcion' => 'Cliente corporativo factura'],
            ['nombre' => 'Retail', 'tipo' => 'cliente', 'descripcion' => 'Grandes superficies'],
            ['nombre' => 'Mayorista', 'tipo' => 'cliente', 'descripcion' => 'Compra por volumen'],
            ['nombre' => 'Minorista', 'tipo' => 'cliente', 'descripcion' => 'Pequeños comercios'],

            // Proveedores
            ['nombre' => 'Nacional', 'tipo' => 'proveedor', 'descripcion' => 'Proveedor dentro del país'],
            ['nombre' => 'Internacional', 'tipo' => 'proveedor', 'descripcion' => 'Proveedor extranjero'],
            ['nombre' => 'Local', 'tipo' => 'proveedor', 'descripcion' => 'Proveedor de la zona'],
            ['nombre' => 'Distribuidor', 'tipo' => 'proveedor', 'descripcion' => 'Mayoristas distribuidores'],
        ];

        foreach ($categorias as $cat) {
            Categoria::updateOrCreate(
                ['nombre' => $cat['nombre'], 'tipo' => $cat['tipo']],
                [
                    'descripcion' => $cat['descripcion'],
                    'user_id' => $adminId,
                    'owner_id' => $adminId,
                    'activo' => true,
                    'mostrar_en_perfil' => true,
                ]
            );
        }
    }
}
