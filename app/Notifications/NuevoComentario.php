<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NuevoComentario extends Notification
{
    use Queueable;

    public function __construct(
        public $user,
        public $comentario,
        public $isReply = false
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $message = "{$this->user->name} ".($this->isReply ? 'respondió a tu comentario.' : 'comentó tu publicación.');

        return [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_avatar' => $this->user->profile_photo_url,
            'comentario_id' => $this->comentario->id,
            'publicacion_id' => $this->comentario->publicacion_id,
            'message' => $message,
            'link' => "/comunidad#publicacion-{$this->comentario->publicacion_id}",
        ];
    }
}
