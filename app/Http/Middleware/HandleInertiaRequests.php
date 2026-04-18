<?php

namespace App\Http\Middleware;

use App\Models\Mensaje;
use App\Models\MensajeConversacion;
use App\Models\Pedido;
use App\Models\WebSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $webSettings = $this->getCachedWebSettings();
        $user = $request->user();
        $authData = null;

        if ($user) {
            $unreadMessages = $this->getCachedUnreadMessages($user->id);
            $pendingOrders = $this->getCachedPendingOrders($user->id);

            $authData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo_url' => $user->profilePhotoUrl(),
                'cover_photo_url' => $user->coverPhotoUrl(),
                'public_profile' => $user->publicProfile,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'unread_messages' => $unreadMessages,
                'pending_orders' => $pendingOrders,
                'unread_notifications' => $user->unreadNotifications->count(),
                'recent_notifications' => $user->notifications()->latest()->limit(10)->get(),
            ];
        }

        return [
            ...parent::share($request),
            'name' => $webSettings['app_name'],
            'web_settings' => $webSettings,
            'auth' => ['user' => $authData],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'sidebarOpen' => $this->getSidebarState($request),
        ];
    }

    protected function getCachedWebSettings(): array
    {
        $cacheKey = 'web_settings:shared';

        return cache()->remember($cacheKey, 300, function () {
            $settings = WebSetting::getSettings();

            return [
                'app_name' => $settings->app_name,
                'app_logo' => $settings->app_logo,
                'app_favicon' => $settings->app_favicon,
                'app_title' => $settings->app_title,
                'app_description' => $settings->app_description,
                'app_keywords' => $settings->app_keywords,
                'app_author' => $settings->app_author,
            ];
        });
    }

    protected function getCachedUnreadMessages(int $userId): int
    {
        $cacheKey = "user:{$userId}:unread_messages";

        return cache()->remember($cacheKey, 60, function () use ($userId) {
            $directMessages = Mensaje::where('receiver_id', $userId)
                ->where('leido', false)
                ->count();

            $conversationMessages = MensajeConversacion::where('sender_id', '!=', $userId)
                ->where('receiver_id', $userId)
                ->where('leido', false)
                ->whereHas('conversacion', function ($q) use ($userId) {
                    $q->where('comprador_id', $userId)
                        ->orWhere('vendedor_id', $userId);
                })->count();

            return $directMessages + $conversationMessages;
        });
    }

    protected function getCachedPendingOrders(int $userId): int
    {
        $cacheKey = "user:{$userId}:pending_orders";

        return cache()->remember($cacheKey, 60, function () use ($userId) {
            return Pedido::where('user_id', $userId)
                ->where('estado', 'pendiente')
                ->count();
        });
    }

    protected function getSidebarState(Request $request): bool
    {
        return ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true';
    }
}
