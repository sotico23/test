<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Timesheet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimesheetController extends Controller
{
    public function index(): Response
    {
        $timesheets = Timesheet::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Backend/Timesheets/Index', ['timesheets' => $timesheets]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'empleado_id' => 'nullable|integer',
            'proyecto_id' => 'nullable|integer',
            'fecha' => 'nullable|date',
            'horas' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'required|string|max:50',
        ]);
        Timesheet::create($validated);

        return redirect()->route('timesheets.index');
    }

    public function update(Request $request, Timesheet $timesheet): RedirectResponse
    {
        $validated = $request->validate([
            'empleado_id' => 'nullable|integer',
            'proyecto_id' => 'nullable|integer',
            'fecha' => 'nullable|date',
            'horas' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'required|string|max:50',
        ]);
        $timesheet->update($validated);

        return redirect()->route('timesheets.index');
    }

    public function destroy(Timesheet $timesheet): RedirectResponse
    {
        $timesheet->delete();

        return redirect()->route('timesheets.index');
    }
}
