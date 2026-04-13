<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use Inertia\Inertia;
use Inertia\Response;

class ComunidadController extends Controller
{
    public function index(): Response
    {
        $publicaciones = Publicacion::with(['user', 'comentarios'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Backend/Comunidad/Index', [
            'publicaciones' => $publicaciones,
        ]);
    }
}
