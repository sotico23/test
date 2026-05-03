import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

export default function CalendarView({ appointments, services }: { appointments: any[], services: any[] }) {
    const events = appointments.map(app => ({
        id: app.id.toString(),
        title: `${app.producto?.nombre} - ${app.client?.name}`,
        start: app.start_time,
        end: app.end_time,
        backgroundColor: app.status === 'confirmada' ? '#3b82f6' : (app.status === 'completada' ? '#22c55e' : '#eab308'),
        borderColor: 'transparent',
    }));

    const handleDateClick = (arg: any) => {
        // Here you could open a modal to create a new appointment at arg.dateStr
        alert(`Abrir modal para crear cita en: ${arg.dateStr}`);
    };

    const handleEventClick = (arg: any) => {
        const id = arg.event.id;
        // Navigate or open modal to edit the appointment
        router.visit(`/appointments`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Calendario de Citas', href: '/appointments/calendar' }]}>
            <Head title="Calendario | Citas y Reservas" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-[80vh]">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        locale="es"
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="100%"
                        selectable={true}
                        selectMirror={true}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
