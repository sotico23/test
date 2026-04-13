<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Conversacion;
use App\Models\MensajeConversacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversacionPedidoController extends Controller
{
    public function getMensajes(Conversacion $conversacion): JsonResponse
    {
        // Verificar permisos (debe ser el cliente o el vendedor del pedido)
        if ($conversacion->comprador_id !== Auth::id() && $conversacion->vendedor_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $mensajes = $conversacion->mensajes()
            ->with('sender:id,name,profile_photo_path')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                if ($msg->file_path) {
                    $msg->file_url = asset('storage/'.$msg->file_path);
                    $msg->file_name = basename($msg->file_path);
                    $msg->is_image = in_array(pathinfo($msg->file_path, PATHINFO_EXTENSION), ['jpg', 'jpeg', 'png', 'gif', 'webp']);
                }

                return $msg;
            });

        // Marcar mensajes como leídos
        $conversacion->mensajes()
            ->where(function ($query) {
                $query->where('receiver_id', Auth::id());
            })
            ->where(function ($query) {
                $query->where('leido', false);
            })
            ->update(['leido' => true]);

        return response()->json(['mensajes' => $mensajes]);
    }

    public function enviarMensaje(Request $request, Conversacion $conversacion): JsonResponse
    {
        // Verificar permisos
        if ($conversacion->comprador_id !== Auth::id() && $conversacion->vendedor_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'contenido' => 'nullable|string|max:5000',
            'archivo' => 'nullable|file|max:10240', // Max 10MB
        ]);

        if (! $request->contenido && ! $request->hasFile('archivo')) {
            return response()->json(['error' => 'Debe enviar un mensaje o un archivo'], 422);
        }

        $senderId = Auth::id();
        $receiverId = $senderId === $conversacion->comprador_id ? $conversacion->vendedor_id : $conversacion->comprador_id;

        $filePath = null;
        if ($request->hasFile('archivo')) {
            $filePath = $request->file('archivo')->store('chat/conversacion_'.$conversacion->id, 'public');
        }

        $mensaje = MensajeConversacion::create([
            'conversacion_id' => $conversacion->id,
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'contenido' => $request->contenido ?? '',
            'file_path' => $filePath,
        ]);

        $mensaje->load('sender:id,name,profile_photo_path');

        if ($mensaje->file_path) {
            $mensaje->file_url = asset('storage/'.$mensaje->file_path);
            $mensaje->file_name = basename($mensaje->file_path);
            $mensaje->is_image = in_array(pathinfo($mensaje->file_path, PATHINFO_EXTENSION), ['jpg', 'jpeg', 'png', 'gif', 'webp']);
        }

        return response()->json(['mensaje' => $mensaje], 201);
    }
}
