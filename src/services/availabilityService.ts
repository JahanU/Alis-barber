/**
 * SERVICE: Staff Availability Management
 * 
 * ROLE: Manages staff availability data in Supabase
 * ACTIONS: CRUD operations for availability, fetching available slots for booking
 * SUPPORTS: Multiple time ranges per day (for breaks)
 */
import { supabase } from '../config/supabaseClient';
import { parseTimeSlot } from '../utils/timeUtils';


export interface StaffAvailability {
    id?: string;
    user_id?: string;
    day_of_week: number; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    start_time: string;  // HH:MM format (e.g., "09:00")
    end_time: string;    // HH:MM format (e.g., "17:00")
    is_available: boolean;
    label?: string;      // Optional label (e.g., "Morning", "Afternoon")
}

// Day names for display - Monday first
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Get all availability records for the current user
 */
export const getMyAvailability = async (): Promise<StaffAvailability[]> => {
    const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .order('day_of_week')
        .order('start_time');

    if (error) {
        console.error('Error fetching availability:', error);
        throw error;
    }

    return data || [];
};

/**
 * Save all availability ranges (replaces all existing for the user)
 */
export const saveAllAvailability = async (availabilities: StaffAvailability[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Delete all existing availability for this user first
    const { error: deleteError } = await supabase
        .from('staff_availability')
        .delete()
        .eq('user_id', user.id);

    if (deleteError) {
        console.error('Error deleting old availability:', deleteError);
        throw deleteError;
    }

    // Insert new availability records
    if (availabilities.length > 0) {
        const records = availabilities.map(a => {
            // Exclude id field - let Supabase auto-generate it
            const { id, ...rest } = a;
            return {
                ...rest,
                user_id: user.id,
                updated_at: new Date().toISOString(),
            };
        });

        const { error: insertError } = await supabase
            .from('staff_availability')
            .insert(records);

        if (insertError) {
            console.error('Error saving availability:', insertError);
            throw insertError;
        }
    }
};

/**
 * Get available time slots for a specific date based on staff availability
 * Merges slots from all time ranges for the day and excludes booked appointments
 */
export const getAvailableSlotsForDate = async (selectedDate: Date): Promise<string[]> => {
    // Map JS getDay() (0=Sun, 1=Mon...) to our system (0=Mon, 1=Tue... 6=Sun)
    const jsDay = selectedDate.getDay();
    const dayOfWeek = (jsDay + 6) % 7;

    // Fetch all availability ranges for this day of week
    const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .order('start_time');

    if (error) {
        console.error('Error fetching slots:', error);
        return [];
    }

    if (!data || data.length === 0) {
        return []; // No availability set for this day
    }

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    // Collect all slots from all time ranges
    const allSlots = new Set<string>();

    for (const range of data) {
        const [startHour] = range.start_time.split(':').map(Number);
        const [endHour] = range.end_time.split(':').map(Number);

        // Generate hourly slots within this range
        for (let hour = startHour; hour < endHour; hour++) {
            // If it's today, only include future slots
            if (isToday && hour <= currentHour) {
                continue;
            }

            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            allSlots.add(`${displayHour}:00 ${period}`);
        }
    }

    // Fetch booked appointments for this date
    const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateString)
        .eq('status', 'confirmed');

    if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        // Continue without filtering - better to show slots than fail completely
    }

    // Convert booked times to display format and remove from available slots
    if (appointments && appointments.length > 0) {
        const bookedSlots = new Set<string>();

        appointments.forEach(apt => {
            // Convert HH:MM:SS to display format (e.g., "14:00:00" -> "2:00 PM")
            const [hour] = apt.appointment_time.split(':').map(Number);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            bookedSlots.add(`${displayHour}:00 ${period}`);
        });

        // Remove booked slots from available slots
        bookedSlots.forEach(slot => allSlots.delete(slot));
    }

    // Convert Set to sorted array
    return Array.from(allSlots).sort((a, b) => {
        const timeA = convertTo24Hour(a);
        const timeB = convertTo24Hour(b);
        return timeA - timeB;
    });
};

/**
 * Helper: Convert "12:00 PM" format to 24-hour number for sorting
 */
function convertTo24Hour(timeSlot: string): number {
    const { hours } = parseTimeSlot(timeSlot);
    return hours;
}
