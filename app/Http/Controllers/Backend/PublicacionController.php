<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicacionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $publicacion = new Publicacion;
        $publicacion->user_id = $request->user()->id;
        $publicacion->content = $validated['content'];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('publicaciones', 'public');
            $publicacion->image_path = $path;
        }

        $publicacion->save();

        return back()->with('success', 'Publicación creada exitosamente');
    }

    public function like(Publicacion $publicacion): RedirectResponse
    {
        $publicacion->increment('likes_count');

        return back();
    }

    public function comment(Request $request, Publicacion $publicacion): RedirectResponse
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $publicacion->comentarios()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        $publicacion->increment('comments_count');

        return back();
    }

    public function share(Publicacion $publicacion): RedirectResponse
    {
        $user = Auth::user();

        Publicacion::create([
            'user_id' => $user->id,
            'content' => '♻️ Compartido de '.$publicacion->user->name.":\n\n".$publicacion->content,
            'image_path' => $publicacion->image_path,
        ]);

        return back();
    }
}
