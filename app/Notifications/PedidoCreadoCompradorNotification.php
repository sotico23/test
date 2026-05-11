<?php

namespace App\Notifications;

use App\Models\Pedido;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PedidoCreadoCompradorNotification extends Notification
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
            ->subject('Tu pedido #'.$this->pedido->numero_pedido)
            ->greeting('¡Hola '.$this->pedido->nombre_cliente.'!')
            ->line('Tu pedido ha sido creado con éxito.')
            ->line('Estado actual: '.$this->pedido->estado)
            ->action('Ver detalle del pedido', url('/pedidos/'.$this->pedido->id))
            ->line('Gracias por comprar con nosotros.');
    }

    public function toArray($notifiable): array
    {
        return [
            'titulo' => 'Pedido Creado #'.$this->pedido->numero_pedido,
            'mensaje' => 'Tu pedido ha sido registrado y está '.$this->pedido->estado.'.',
            'pedido_id' => $this->pedido->id,
            'tipo' => 'actualizacion_pedido',
        ];
    }
}
