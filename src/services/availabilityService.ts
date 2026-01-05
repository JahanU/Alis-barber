/**
 * SERVICE: Availability Lookup (read-only)
 *
 * ROLE: Fetch available time slots for a given date from Supabase.
 */
import { supabase } from '../config/supabaseClient';
import { parseTimeSlot } from '../utils/timeUtils';

/**
 * Get available time slots for a specific date based on staff availability.
 * Merges slots from all time ranges for the day and excludes booked appointments.
 */
export const getAvailableSlotsForDate = async (selectedDate: Date): Promise<string[]> => {
    const jsDay = selectedDate.getDay();
    const dayOfWeek = (jsDay + 6) % 7; // convert JS day to Monday-first index

    const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('availability_type', 'working_hours')
        .eq('is_recurring', true)
        .order('start_time');

    if (error) {
        console.error('Error fetching slots:', error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    const allSlots = new Set<string>();

    for (const range of data) {
        const [startHour] = range.start_time.split(':').map(Number);
        const [endHour] = range.end_time.split(':').map(Number);

        for (let hour = startHour; hour < endHour; hour++) {
            if (isToday && hour <= currentHour) {
                continue;
            }

            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            allSlots.add(`${displayHour}:00 ${period}`);
        }
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateString)
        .eq('status', 'confirmed');

    if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
    }

    if (appointments && appointments.length > 0) {
        const bookedSlots = new Set<string>();

        appointments.forEach(apt => {
            const [hour] = apt.appointment_time.split(':').map(Number);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            bookedSlots.add(`${displayHour}:00 ${period}`);
        });

        bookedSlots.forEach(slot => allSlots.delete(slot));
    }

    return Array.from(allSlots).sort((a, b) => convertTo24Hour(a) - convertTo24Hour(b));
};

function convertTo24Hour(timeSlot: string): number {
    const { hours } = parseTimeSlot(timeSlot);
    return hours;
}
