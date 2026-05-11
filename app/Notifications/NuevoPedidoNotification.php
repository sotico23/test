<?php

namespace App\Notifications;

use App\Models\Pedido;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NuevoPedidoNotification extends Notification
{
    use Queueable;

    public Pedido $pedido;

    public function __construct(Pedido $pedido)
    {
        $this->pedido = $pedido;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nuevo Pedido #'.$this->pedido->numero_pedido)
            ->greeting('¡Nueva compra!')
            ->line('Has recibido un nuevo pedido.')
            ->line('Pedido #'.$this->pedido->numero_pedido)
            ->line('Cliente: '.$this->pedido->nombre_cliente)
            ->line('Total: $'.number_format($this->pedido->total, 0, ',', '.'))
            ->action('Ver pedido', url('/pedidos/'.$this->pedido->id))
            ->line('Gracias por usar nuestra plataforma!');
    }

    public function toArray($notifiable): array
    {
        return [
            'titulo' => 'Nuevo Pedido #'.$this->pedido->numero_pedido,
            'mensaje' => 'Tienes una nueva compra de '.$this->pedido->nombre_cliente.' por $'.number_format($this->pedido->total, 0, ',', '.'),
            'pedido_id' => $this->pedido->id,
            'tipo' => 'nuevo_pedido',
        ];
    }
}
