<?php

namespace App\Http\Controllers;

use App\Mail\AppointmentBooked;
use App\Models\Appointment;
use App\Models\Producto;
use App\Models\PublicProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function show($slug)
    {
        $profile = PublicProfile::withoutGlobalScopes()->where('slug', $slug)->firstOrFail();
        // Here we assume the store owner has the services
        $services = Producto::where('is_service', true)
            ->where('public_profile_id', $profile->id)
            ->where('activo', true)
            ->get();

        return Inertia::render('appointments/Booking', [
            'profile' => $profile,
            'services' => $services,
        ]);
    }

    public function store(Request $request, $slug)
    {
        $profile = PublicProfile::withoutGlobalScopes()->where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'service_id' => 'required|exists:productos,id',
            'start_time' => 'required|date',
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email|max:255',
        ]);

        $service = Producto::findOrFail($validated['service_id']);

        // Find or create user for the booking
        $client = User::firstOrCreate(
            ['email' => $validated['client_email']],
            ['name' => $validated['client_name'], 'password' => bcrypt(str()->random(16))]
        );

        $startTime = Carbon::parse($validated['start_time']);
        $endTime = $startTime->copy()->addMinutes((int) $service->duracion);

        $appointment = Appointment::create([
            'client_id' => $client->id,
            'provider_id' => $profile->user_id,
            'producto_id' => $service->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmada', // Auto-confirm if paid
            'payment_status' => 'pagado',
            'amount_paid' => $service->precio_venta,
        ]);

        // Send confirmation email
        try {
            Mail::to($client->email)->send(new AppointmentBooked($appointment));
        } catch (\Exception $e) {
            // Log error but continue
        }

        return back()->with('success', 'Tu reserva se ha confirmado correctamente.');
    }
}
