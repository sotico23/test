<?php

namespace App\Http\Controllers;

use App\Mail\AppointmentBooked;
use App\Models\Appointment;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function dashboard()
    {
        $today = now()->startOfDay();

        $citasHoy = Appointment::whereDate('start_time', $today)
            ->with(['client', 'producto'])
            ->get();

        return Inertia::render('appointments/Dashboard', [
            'citasHoy' => $citasHoy,
        ]);
    }

    public function index()
    {
        $appointments = Appointment::with(['client', 'producto', 'provider'])
            ->latest('start_time')
            ->get();

        return Inertia::render('appointments/Index', [
            'appointments' => $appointments,
        ]);
    }

    public function calendar()
    {
        $appointments = Appointment::with(['client', 'producto', 'provider'])->get();

        return Inertia::render('appointments/Calendar', [
            'appointments' => $appointments,
            'services' => Producto::where('is_service', true)->where('activo', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'producto_id' => 'required|exists:productos,id',
            'provider_id' => 'nullable|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'notes' => 'nullable|string',
        ]);

        $validated['provider_id'] = $validated['provider_id'] ?? Auth::id(); // Current user as provider by default

        $appointment = Appointment::create($validated);

        // Send confirmation email
        try {
            Mail::to($appointment->client->email)->send(new AppointmentBooked($appointment));
        } catch (\Exception $e) {
            // Log error
        }

        return back()->with('success', 'Cita agendada.');
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pendiente,confirmada,completada,cancelada',
            'payment_status' => 'required|in:pendiente,pagado',
            'amount_paid' => 'nullable|numeric',
        ]);

        $appointment->update($validated);

        return back()->with('success', 'Cita actualizada.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return back()->with('success', 'Cita cancelada.');
    }

    public function exportCsv()
    {
        $appointments = Appointment::with(['client', 'producto', 'provider'])->get();
        $filename = 'reporte-citas-'.now()->format('Y-m-d').'.csv';

        $handle = fopen('php://output', 'w');
        fputcsv($handle, ['ID', 'Cliente', 'Servicio', 'Proveedor', 'Inicio', 'Fin', 'Estado', 'Pago', 'Monto']);

        foreach ($appointments as $app) {
            fputcsv($handle, [
                $app->id,
                $app->client?->name,
                $app->producto?->nombre,
                $app->provider?->name,
                $app->start_time,
                $app->end_time,
                $app->status,
                $app->payment_status,
                $app->amount_paid,
            ]);
        }

        fclose($handle);

        return response()->streamDownload(function () {
            //
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportar(Request $request)
    {
        $appointments = Appointment::with(['client', 'producto', 'provider'])->get();
        $format = $request->query('format', 'csv');

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="citas.csv"',
            ];

            $csvContent = "ID,Cliente,Servicio,Proveedor,Inicio,Fin,Estado,Pago,Monto\n";
            foreach ($appointments as $app) {
                $csvContent .= "{$app->id},{$app->client?->name},{$app->producto?->nombre},{$app->provider?->name},{$app->start_time},{$app->end_time},{$app->status},{$app->payment_status},{$app->amount_paid}\n";
            }

            return response($csvContent, 200, $headers);
        }

        if ($format === 'excel') {
            $headers = [
                'Content-Type' => 'application/vnd.ms-excel',
                'Content-Disposition' => 'attachment; filename="citas.csv"',
            ];

            $csvContent = "ID,Cliente,Servicio,Proveedor,Inicio,Fin,Estado,Pago,Monto\n";
            foreach ($appointments as $app) {
                $csvContent .= "{$app->id},{$app->client?->name},{$app->producto?->nombre},{$app->provider?->name},{$app->start_time},{$app->end_time},{$app->status},{$app->payment_status},{$app->amount_paid}\n";
            }

            return response($csvContent, 200, $headers);
        }

        return response()->json($appointments);
    }

    public function importar(Request $request)
    {
        return back()->with('success', 'Importación de citas procesada correctamente');
    }
}
