<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NuevaReaccion extends Notification
{
    use Queueable;

    public function __construct(
        public $user,
        public $reactable,
        public $type // 'like' or 'heart'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $modelName = class_basename($this->reactable);

        $publicacionId = $modelName === 'Publicacion' ? $this->reactable->id : $this->reactable->publicacion_id;

        return [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_avatar' => $this->user->profile_photo_url,
            'type' => $this->type,
            'reactable_id' => $this->reactable->id,
            'reactable_type' => $modelName,
            'message' => "{$this->user->name} le dio ".($this->type === 'like' ? 'me gusta' : 'un corazón').' a tu '.($modelName === 'Publicacion' ? 'publicación' : 'comentario').'.',
            'link' => "/comunidad#publicacion-{$publicacionId}",
        ];
    }
}
