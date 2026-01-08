/**
 * SERVICE: Availability Lookup (read-only)
 *
 * ROLE: Fetch available time slots for a given date from Supabase.
 */
import { supabase } from '../config/supabaseClient';
import { parseTimeSlot } from '../utils/timeUtils';
import { BUSINESS_ID } from '../config/business';

// Width of each candidate time slot in minutes (must align with UI picker)
export const TIME_SLOT_INTERVAL_MINUTES = 20;

const getDefaultStaffId = async (): Promise<string | null> => {
    const { data, error } = await supabase
        .from('staff')
        .select('id')
        .eq('business_id', BUSINESS_ID)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching default staff:', error);
        return null;
    }

    return data?.id ?? null;
};
/**
 * Get available time slots for a specific date based on staff availability.
 * Merges slots from all time ranges for the day and excludes booked appointments.
 * @param serviceDurationMinutes - length of the requested service, used to block slots that would overlap existing bookings.
 */
export const getAvailableSlotsForDate = async (
    selectedDate: Date,
    serviceDurationMinutes = TIME_SLOT_INTERVAL_MINUTES
): Promise<string[]> => {
    const requiredDuration = Math.max(serviceDurationMinutes, TIME_SLOT_INTERVAL_MINUTES);

    const staffId = await getDefaultStaffId();
    if (!staffId) {
        console.warn('No staff found; cannot compute availability.');
        return [];
    }

    const jsDay = selectedDate.getDay();
    const dayOfWeek = (jsDay + 6) % 7; // convert JS day to Monday-first index
    const dateString = selectedDate.toISOString().split('T')[0];

    // Block out annual leave for this staff member on the selected date (supports ranges)
    const { data: leaveRows, error: leaveError } = await supabase
        .from('staff_availability')
        .select('specific_date,end_date')
        .eq('staff_id', staffId)
        .eq('availability_type', 'annual_leave')
        .or(`specific_date.eq.${dateString},and(specific_date.lte.${dateString},end_date.gte.${dateString})`); // specific date or within range

    if (leaveError) {
        console.error('Error fetching annual leave:', leaveError);
    }

    if (leaveRows && leaveRows.length > 0) {
        return [];
    }

    // Fetch recurring working hours for the staff member
    const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
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
    const nowMinutes = now.getHours() * 60 + now.getMinutes(); // current time in minutes since midnight, filters out old slots for today
    
    const allSlots = new Set<string>();
    // Build candidate slots from working-hour ranges, skipping past times when viewing today
    for (const range of data) {
        const startMinutes = timeStringToMinutes(range.start_time);
        const endMinutes = timeStringToMinutes(range.end_time);

        // Generate slots in this range
        for (let minutes = startMinutes; minutes + requiredDuration <= endMinutes; minutes += TIME_SLOT_INTERVAL_MINUTES) {
            if (isToday && minutes <= nowMinutes) continue; // skip past times for today
            allSlots.add(minutesToDisplay(minutes)); // e.g., "14:20" -> "2:20 PM"
        }
    }

    // Fetch existing confirmed appointments for the date to exclude booked slots
    const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time,duration_minutes')
        .eq('appointment_date', dateString)
        .eq('status', 'confirmed')
        .eq('business_id', BUSINESS_ID);

    if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
    }

    // Exclude slots that overlap with existing appointments
    if (appointments && appointments.length > 0) {
        const slotsToRemove = new Set<string>();
        // Precompute appointment intervals in minutes to make overlap checks cheap
        const appointmentIntervals = appointments.map(apt => {
            const start = timeStringToMinutes(apt.appointment_time);
            const duration = Number(apt.duration_minutes) || TIME_SLOT_INTERVAL_MINUTES;
            return { start, end: start + duration };
        });

        // Check each candidate slot for overlap with any appointment
        allSlots.forEach(slot => {
            const slotStart = slotToMinutes(slot); // minutes from midnight
            const slotEnd = slotStart + requiredDuration;

            const overlapsExisting = appointmentIntervals.some(({ start, end }) =>
                slotStart < end && slotEnd > start
            );

            if (overlapsExisting) {
                slotsToRemove.add(slot);
            }
        });

        slotsToRemove.forEach(slot => allSlots.delete(slot));
    }

    return Array.from(allSlots).sort((a, b) => slotToMinutes(a) - slotToMinutes(b));
};

// Convert "HH:MM AM/PM" to minutes since midnight
function slotToMinutes(timeSlot: string): number {
    const { hours, minutes } = parseTimeSlot(timeSlot);
    return hours * 60 + minutes;
}

// Convert "HH:MM[:SS]" to minutes since midnight
function timeStringToMinutes(time: string): number {
    const [h = 0, m = 0, s = 0] = time.split(':').map(Number);
    return h * 60 + m + Math.floor(s / 60);
}

// Convert minutes since midnight back to a display string (e.g., "2:20 PM")
function minutesToDisplay(totalMinutes: number): string {
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const displayHour = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}
