<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TempPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $tempPassword,
        public string $provider
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tu cuenta ha sido creada - '.config('app.name'))
            ->greeting('¡Bienvenido a '.config('app.name').'!')
            ->line('Te has registrado exitosamente usando '.$this->provider.'.')
            ->line('Tu cuenta ha sido creada con la siguiente contraseña temporal:')
            ->line('')
            ->line('**Contraseña: '.$this->tempPassword.'**')
            ->line('')
            ->line('⚠️ Por seguridad, te recomendamos cambiar esta contraseña lo antes posible.')
            ->action('Cambiar mi contraseña', url('/profile'))
            ->line('¡Gracias por usar nuestra aplicación!');
    }
}
