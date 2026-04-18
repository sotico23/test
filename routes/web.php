<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Backend\ConversacionPedidoController;
use App\Http\Controllers\Backend\CotizacionController;
use App\Http\Controllers\Backend\DashboardController;
use App\Http\Controllers\Backend\FollowerController;
use App\Http\Controllers\Backend\MensajeController;
use App\Http\Controllers\Backend\OnboardingController;
use App\Http\Controllers\Backend\PedidoRecibidoController;
use App\Http\Controllers\Backend\PosController;
use App\Http\Controllers\Backend\ProductoController;
use App\Http\Controllers\Backend\PublicacionController;
use App\Http\Controllers\Backend\TareaController;
use App\Http\Controllers\Backend\VentaController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\StatusPageController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/status', [StatusPageController::class, 'index'])->name('status');
Route::get('/status/embed', [StatusPageController::class, 'embed'])->name('status.embed');

Route::middleware(['auth'])->group(function () {
    Route::post('publicaciones', [PublicacionController::class, 'store'])->name('publicaciones.store');
    Route::post('/publicaciones/{publicacion}/react', [PublicacionController::class, 'react'])->name('publicaciones.react');
    Route::post('/comentarios/{comentario}/react', [PublicacionController::class, 'reactComment'])->name('comentarios.react');
    Route::post('/publicaciones/{publicacion}/comment', [PublicacionController::class, 'comment'])->name('publicaciones.comment');
    Route::put('/publicaciones/{publicacion}', [PublicacionController::class, 'update'])->name('publicaciones.update');
    Route::delete('/publicaciones/{publicacion}', [PublicacionController::class, 'destroy'])->name('publicaciones.destroy');
    Route::post('/notifications/mark-as-read', function () {
        auth()->user()->unreadNotifications->markAsRead();

        return back();
    })->name('notifications.mark-as-read');

    // Seguidores
    Route::post('/usuarios/{user}/follow', [FollowerController::class, 'follow'])->name('usuarios.follow');
    Route::delete('/usuarios/{user}/unfollow', [FollowerController::class, 'unfollow'])->name('usuarios.unfollow');
});

Route::get('/perfil/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::post('/publicaciones/{publicacion}/share', [PublicacionController::class, 'share'])->name('publicaciones.share');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/config', [DashboardController::class, 'saveConfig'])->name('dashboard.config');

    Route::get('cotizaciones/export', [CotizacionController::class, 'exportCsv'])->name('cotizaciones.export');
    Route::get('cotizaciones/export-excel', [CotizacionController::class, 'exportExcel'])->name('cotizaciones.export_excel');
    Route::post('cotizaciones/import', [CotizacionController::class, 'importCsv'])->name('cotizaciones.import');

    // Ventas
    Route::get('ventas/export', [VentaController::class, 'exportCsv'])->name('ventas.export');
    Route::get('ventas/export-excel', [VentaController::class, 'exportExcel'])->name('ventas.export_excel');
    Route::post('ventas/import', [VentaController::class, 'importCsv'])->name('ventas.import');
    Route::get('ventas/{venta}/download', [VentaController::class, 'downloadPdf'])->name('ventas.download');

    // Productos
    Route::get('productos/export', [ProductoController::class, 'exportCsv'])->name('productos.export');
    Route::get('productos/export-excel', [ProductoController::class, 'exportExcel'])->name('productos.export_excel');
    Route::post('productos/import', [ProductoController::class, 'importCsv'])->name('productos.import');
    Route::get('cotizaciones/{cotizacion}/pdf', [CotizacionController::class, 'downloadPdf'])->name('cotizaciones.pdf');
    Route::get('cotizaciones/{cotizacion}/preview', [CotizacionController::class, 'previewPdf'])->name('cotizaciones.preview');
    Route::resource('cotizaciones', CotizacionController::class)->parameters(['cotizaciones' => 'cotizacion']);

    require __DIR__.'/modules/crm.php';
    require __DIR__.'/modules/ventas.php';
    require __DIR__.'/modules/inventario.php';
    require __DIR__.'/modules/mrp.php';
    require __DIR__.'/modules/finanzas.php';
    require __DIR__.'/modules/rrhh.php';
    require __DIR__.'/modules/proyectos.php';
    require __DIR__.'/modules/uptime.php';
    require __DIR__.'/modules/flota.php';
    require __DIR__.'/modules/admin.php';

    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('pos/cierre', [PosController::class, 'cierreCaja'])->name('pos.cierre');
    Route::get('pos/facturacion', [PosController::class, 'facturacion'])->name('pos.facturacion');
    Route::get('pos/promociones', [PosController::class, 'promociones'])->name('pos.promociones');
    Route::post('pos/promociones', [PosController::class, 'storePromocion'])->name('pos.promociones.store');
    Route::put('pos/promociones/{promocion}', [PosController::class, 'updatePromocion'])->name('pos.promociones.update');
    Route::patch('pos/promociones/{promocion}/toggle', [PosController::class, 'togglePromocion'])->name('pos.promociones.toggle');
    Route::delete('pos/promociones/{promocion}', [PosController::class, 'destroyPromocion'])->name('pos.promociones.destroy');
    Route::get('pos/reportes', [PosController::class, 'reportes'])->name('pos.reportes');

    Route::get('onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('mensajes', [MensajeController::class, 'index'])->name('mensajes.index');
    Route::get('mensajes/usuarios', [MensajeController::class, 'usuarios'])->name('mensajes.usuarios');
    Route::get('mensajes/{usuarioId}', [MensajeController::class, 'conversacion'])->name('mensajes.conversacion');
    Route::post('mensajes', [MensajeController::class, 'enviar'])->name('mensajes.enviar');

    Route::get('tareas', [TareaController::class, 'index'])->name('tareas.index');
    Route::post('tareas', [TareaController::class, 'store'])->name('tareas.store');
    Route::put('tareas/{tarea}', [TareaController::class, 'update'])->name('tareas.update');
    Route::delete('tareas/{tarea}', [TareaController::class, 'destroy'])->name('tareas.destroy');

    Route::get('pedidos-recibidos', [PedidoRecibidoController::class, 'index'])->name('pedidos-recibidos.index');
    Route::get('pedidos-recibidos/{pedido}', [PedidoRecibidoController::class, 'show'])->name('pedidos-recibidos.show');
    Route::put('pedidos-recibidos/{pedido}/estado', [PedidoRecibidoController::class, 'actualizarEstado'])->name('pedidos-recibidos.estado');
    Route::post('pedidos-recibidos/{pedido}/venta', [PedidoRecibidoController::class, 'generarVenta'])->name('pedidos-recibidos.generar-venta');

    Route::get('conversaciones-pedidos/{conversacion}/mensajes', [ConversacionPedidoController::class, 'getMensajes'])->name('conversaciones-pedidos.mensajes');
    Route::post('conversaciones-pedidos/{conversacion}/mensajes', [ConversacionPedidoController::class, 'enviarMensaje'])->name('conversaciones-pedidos.enviar');

    // Marketplace Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('chat.send');
});

Route::group(['prefix' => 'auth/{provider}'], function () {
    Route::get('/redirect', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
    Route::get('/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');
});

Route::get('/tienda', [MarketplaceController::class, 'index'])->name('marketplace.index');
Route::get('/tienda/{slug}', [MarketplaceController::class, 'show'])->name('marketplace.show');
Route::post('/tienda/{slug}/react', [MarketplaceController::class, 'react'])->name('marketplace.react');
Route::get('/tienda/{slug}/categoria/{categoria}', [MarketplaceController::class, 'category'])->name('marketplace.category');
Route::post('/tienda/{slug}/checkout', [PedidoController::class, 'crear'])->name('tienda.checkout');
Route::get('/tienda/{slug}/confirmacion/{pedido}', [PedidoController::class, 'confirmacion'])->name('tienda.confirmacion');
Route::get('/tienda/{slug}/chat', [ChatController::class, 'start'])->name('chat.start')->middleware('auth');
Route::get('/mis-pedidos', [PedidoController::class, 'misPedidos'])->name('pedidos.mios')->middleware('auth');
Route::get('/pedidos/{pedido}', [PedidoController::class, 'verPedido'])->name('pedidos.ver')->middleware('auth');
Route::get('/pedidos/{pedido}/estado', [PedidoController::class, 'estado'])->name('pedidos.estado')->middleware('auth');

require __DIR__.'/settings.php';
