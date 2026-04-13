<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\PublicProfile;
use App\Scopes\OwnerScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display a listing of conversations for the current user.
     */
    public function index()
    {
        $user = Auth::user();

        // Conversations where the user is the buyer
        $buyerConversations = Conversation::where('buyer_id', $user->id)
            ->with(['store' => function ($q) {
                $q->withoutGlobalScope(OwnerScope::class);
            }, 'latestMessage'])
            ->latest()
            ->get();

        // Conversations where the user is the store owner
        // First get the user's public profiles (without scope to be safe, though they should own them)
        $profileIds = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('user_id', $user->id)
            ->pluck('id');

        $storeConversations = Conversation::whereIn('store_profile_id', $profileIds)
            ->with(['buyer', 'latestMessage'])
            ->latest()
            ->get();

        return Inertia::render('marketplace/ChatInbox', [
            'buyerConversations' => $buyerConversations,
            'storeConversations' => $storeConversations,
        ]);
    }

    /**
     * Start or get a conversation with a store.
     */
    public function start(Request $request, $slug)
    {
        $profile = PublicProfile::withoutGlobalScope(OwnerScope::class)
            ->where('slug', $slug)
            ->firstOrFail();

        $user = Auth::user();

        // Don't chat with yourself
        if ($profile->user_id === $user->id) {
            return back()->with('error', 'No puedes chatear con tu propia tienda.');
        }

        $conversation = Conversation::firstOrCreate([
            'buyer_id' => $user->id,
            'store_profile_id' => $profile->id,
        ]);

        return redirect()->route('chat.show', $conversation->id);
    }

    /**
     * Display a specific conversation.
     */
    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        // Authorization: must be buyer or store owner
        $profile = PublicProfile::withoutGlobalScope(OwnerScope::class)->find($conversation->store_profile_id);

        if ($conversation->buyer_id !== $user->id && $profile->user_id !== $user->id) {
            abort(403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->oldest()
            ->get();

        // Mark messages as read if receiver is viewing
        $conversation->messages()
            ->where(fn ($q) => $q->where('sender_id', '!=', $user->id))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('marketplace/ChatShow', [
            'conversation' => $conversation->load(['buyer', 'store' => function ($q) {
                $q->withoutGlobalScope(OwnerScope::class);
            }]),
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        // Authorization
        $profile = PublicProfile::withoutGlobalScope(OwnerScope::class)->find($conversation->store_profile_id);

        if ($conversation->buyer_id !== $user->id && $profile->user_id !== $user->id) {
            abort(403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->body,
        ]);

        return back();
    }
}
