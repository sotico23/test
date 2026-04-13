<?php

namespace Database\Seeders;

use App\Models\Almacen;
use App\Models\ApiKey;
use App\Models\Asiento;
use App\Models\Asistencia;
use App\Models\Bom;
use App\Models\Campana;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Cobranza;
use App\Models\Compra;
use App\Models\Conductor;
use App\Models\ControlCalidad;
use App\Models\Conversacion;
use App\Models\Cotizacion;
use App\Models\Empleado;
use App\Models\Entrega;
use App\Models\Evaluacion;
use App\Models\Factura;
use App\Models\GastoProyecto;
use App\Models\GrupoTrabajo;
use App\Models\Hito;
use App\Models\Impuesto;
use App\Models\Incident;
use App\Models\Inventario;
use App\Models\Lote;
use App\Models\Mensaje;
use App\Models\MonitoredSite;
use App\Models\Movimiento;
use App\Models\Nomina;
use App\Models\Oportunidad;
use App\Models\OrdenProduccion;
use App\Models\Pago;
use App\Models\Producto;
use App\Models\Promocion;
use App\Models\Prospecto;
use App\Models\Proveedor;
use App\Models\Proyecto;
use App\Models\PublicProfile;
use App\Models\Reclutamiento;
use App\Models\Tarea;
use App\Models\Tesoreria;
use App\Models\Ticket;
use App\Models\Timesheet;
use App\Models\UptimeAlert;
use App\Models\UptimeCheck;
use App\Models\User;
use App\Models\Vehiculo;
use App\Models\Venta;
use Illuminate\Database\Seeder;

class DataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating 5000+ records for the primary ERP dataset...');

        $this->createUsers();
        $this->createCategorias();
        $this->createAlmacenes();
        $this->createProveedores();
        $this->createClientes();
        $this->createProductos();
        $this->createInventarios();
        $this->createProspectos();
        $this->createOportunidades();
        $this->createVentas();
        $this->createFacturas();
        $this->createCompras();
        $this->createCotizaciones();
        $this->createLotes();
        $this->createOrdenesProduccion();
        $this->createControlCalidad();
        $this->createEmpleados();
        $this->createAsistencias();
        $this->createNominas();
        $this->createTareas();
        $this->createProyectos();
        $this->createHitos();
        $this->createGastosProyectos();
        $this->createTimesheets();
        $this->createReclutamientos();
        $this->createEvaluaciones();
        $this->createMonitoredSites();
        $this->createUptimeChecks();
        $this->createUptimeAlerts();
        $this->createPublicProfiles();
        $this->createCobranzas();
        $this->createTickets();
        $this->createCampanas();
        $this->createImpuestos();
        $this->createTesoreria();
        $this->createVehiculos();
        $this->createConductores();
        $this->createEntregas();
        $this->createPromociones();
        $this->createApiKeys();
        $this->createIncidents();
        $this->createMovimientos();
        $this->createBoms();
        $this->createPagos();
        $this->createAsientos();
        $this->createGrupoTrabajos();
        $this->createMensajesCentro();

        $this->command->info('All seed data created successfully!');
    }

    private function createUsers(): void
    {
        $this->command->info('Creating 5000 Users with LATAM locales...');

        $locales = ['es_MX', 'es_CL', 'es_AR', 'es_CO', 'es_PE', 'es_VE'];
        $countPerLocale = (int) ceil(5000 / count($locales));

        foreach ($locales as $locale) {
            $this->command->comment("Generating for locale: {$locale}");
            User::factory()->count($countPerLocale)->create();
        }
    }

    private function createCategorias(): void
    {
        $this->command->info('Creating Categorias...');
        Categoria::factory()->count(100)->create();
    }

    private function createAlmacenes(): void
    {
        $this->command->info('Creating Almacenes...');
        Almacen::factory()->count(20)->create();
    }

    private function createProveedores(): void
    {
        $this->command->info('Creating Proveedores...');
        Proveedor::factory()->count(200)->create();
    }

    private function createClientes(): void
    {
        $this->command->info('Creating 1000 Clientes...');
        Cliente::factory()->count(1000)->create();
    }

    private function createProductos(): void
    {
        $this->command->info('Creating 500 Productos...');
        Producto::factory()->count(500)->create();
    }

    private function createInventarios(): void
    {
        $this->command->info('Creating 1000 Inventarios...');
        Inventario::factory()->count(1000)->create();
    }

    private function createProspectos(): void
    {
        $this->command->info('Creating Prospectos...');
        Prospecto::factory()->count(50)->create();
    }

    private function createOportunidades(): void
    {
        $this->command->info('Creating Oportunidades...');
        Oportunidad::factory()->count(50)->create();
    }

    private function createVentas(): void
    {
        $this->command->info('Creating 2000 Ventas...');
        $clienteIds = Cliente::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        Venta::factory()->count(2000)->create([
            'cliente_id' => fn () => fake()->randomElement($clienteIds),
            'user_id' => fn () => fake()->randomElement($userIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createFacturas(): void
    {
        $this->command->info('Creating 2000 Facturas...');
        $clienteIds = Cliente::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        Factura::factory()->count(2000)->create([
            'cliente_id' => fn () => fake()->randomElement($clienteIds),
            'user_id' => fn () => fake()->randomElement($userIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createCompras(): void
    {
        $this->command->info('Creating 1000 Compras...');
        $proveedorIds = Proveedor::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        Compra::factory()->count(1000)->create([
            'proveedor_id' => fn () => fake()->randomElement($proveedorIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createCotizaciones(): void
    {
        $this->command->info('Creating 1000 Cotizaciones...');
        $clienteIds = Cliente::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        Cotizacion::factory()->count(1000)->create([
            'cliente_id' => fn () => fake()->randomElement($clienteIds),
            'user_id' => fn () => fake()->randomElement($userIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createLotes(): void
    {
        $this->command->info('Creating Lotes...');
        Lote::factory()->count(50)->create();
    }

    private function createOrdenesProduccion(): void
    {
        $this->command->info('Creating OrdenesProduccion...');
        OrdenProduccion::factory()->count(50)->create();
    }

    private function createControlCalidad(): void
    {
        $this->command->info('Creating ControlCalidad...');
        ControlCalidad::factory()->count(50)->create();
    }

    private function createEmpleados(): void
    {
        $this->command->info('Creating Empleados...');
        Empleado::factory()->count(50)->create();
    }

    private function createAsistencias(): void
    {
        $this->command->info('Creating Asistencias...');
        Asistencia::factory()->count(50)->create();
    }

    private function createNominas(): void
    {
        $this->command->info('Creating Nominas...');
        Nomina::factory()->count(50)->create();
    }

    private function createTareas(): void
    {
        $this->command->info('Creating Tareas...');
        Tarea::factory()->count(50)->create();
    }

    private function createProyectos(): void
    {
        $this->command->info('Creating Proyectos...');
        Proyecto::factory()->count(50)->create();
    }

    private function createHitos(): void
    {
        $this->command->info('Creating Hitos...');
        Hito::factory()->count(50)->create();
    }

    private function createGastosProyectos(): void
    {
        $this->command->info('Creating GastosProyectos...');
        GastoProyecto::factory()->count(50)->create();
    }

    private function createTimesheets(): void
    {
        $this->command->info('Creating Timesheets...');
        Timesheet::factory()->count(50)->create();
    }

    private function createReclutamientos(): void
    {
        $this->command->info('Creating Reclutamientos...');
        Reclutamiento::factory()->count(50)->create();
    }

    private function createEvaluaciones(): void
    {
        $this->command->info('Creating Evaluaciones...');
        Evaluacion::factory()->count(50)->create();
    }

    private function createMonitoredSites(): void
    {
        $this->command->info('Creating MonitoredSites...');
        MonitoredSite::factory()->count(50)->create();
    }

    private function createUptimeChecks(): void
    {
        $this->command->info('Creating UptimeChecks...');
        UptimeCheck::factory()->count(50)->create();
    }

    private function createUptimeAlerts(): void
    {
        $this->command->info('Creating UptimeAlerts...');
        UptimeAlert::factory()->count(50)->create();
    }

    private function createConversaciones(): void
    {
        $this->command->info('Creating Conversaciones...');
        Conversacion::factory()->count(50)->create();
    }

    private function createMensajes(): void
    {
        $this->command->info('Creating Mensajes...');
        Mensaje::factory()->count(50)->create();
    }

    private function createCobranzas(): void
    {
        $this->command->info('Creating Cobranzas...');
        Cobranza::factory()->count(50)->create();
    }

    private function createTickets(): void
    {
        $this->command->info('Creating Tickets...');
        Ticket::factory()->count(50)->create();
    }

    private function createCampanas(): void
    {
        $this->command->info('Creating Campanas...');
        Campana::factory()->count(50)->create();
    }

    private function createImpuestos(): void
    {
        $this->command->info('Creating Impuestos...');
        Impuesto::factory()->count(50)->create();
    }

    private function createTesoreria(): void
    {
        $this->command->info('Creating 1500 Tesoreria Records...');
        $userIds = User::pluck('id')->toArray();

        Tesoreria::factory()->count(1500)->create([
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createVehiculos(): void
    {
        $this->command->info('Creating Vehiculos...');
        Vehiculo::factory()->count(50)->create();
    }

    private function createConductores(): void
    {
        $this->command->info('Creating Conductores...');
        Conductor::factory()->count(50)->create();
    }

    private function createEntregas(): void
    {
        $this->command->info('Creating Entregas...');
        Entrega::factory()->count(50)->create();
    }

    private function createPromociones(): void
    {
        $this->command->info('Creating Promociones...');
        Promocion::factory()->count(50)->create();
    }

    private function createApiKeys(): void
    {
        $this->command->info('Creating ApiKeys...');
        ApiKey::factory()->count(50)->create();
    }

    private function createPublicProfiles(): void
    {
        $this->command->info('Creating PublicProfiles...');
        PublicProfile::factory()->count(50)->create();
    }

    private function createIncidents(): void
    {
        $this->command->info('Creating Incidents...');
        Incident::factory()->count(50)->create();
    }

    private function createMovimientos(): void
    {
        $this->command->info('Creating Movimientos...');
        $productoIds = Producto::pluck('id')->toArray();

        Movimiento::factory()->count(200)->create([
            'producto' => fn () => fake()->randomElement($productoIds),
        ]);
    }

    private function createBoms(): void
    {
        $this->command->info('Creating Bills of Materials (BOM)...');
        Bom::factory()->count(50)->create();
    }

    private function createPagos(): void
    {
        $this->command->info('Creating Pagos...');
        $proveedorIds = Proveedor::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        Pago::factory()->count(100)->create([
            'proveedor' => fn () => fake()->randomElement($proveedorIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createAsientos(): void
    {
        $this->command->info('Creating Asientos Contables...');
        $userIds = User::pluck('id')->toArray();

        Asiento::factory()->count(100)->create([
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createGrupoTrabajos(): void
    {
        $this->command->info('Creating Grupos de Trabajo...');
        $userIds = User::pluck('id')->toArray();

        GrupoTrabajo::factory()->count(50)->create([
            'user_id' => fn () => fake()->randomElement($userIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }

    private function createMensajesCentro(): void
    {
        $this->command->info('Creating Centro de Mensajes...');
        $userIds = User::pluck('id')->toArray();

        Mensaje::factory()->count(200)->create([
            'sender_id' => fn () => fake()->randomElement($userIds),
            'receiver_id' => fn () => fake()->randomElement($userIds),
            'owner_id' => fn () => fake()->randomElement($userIds),
        ]);
    }
}
