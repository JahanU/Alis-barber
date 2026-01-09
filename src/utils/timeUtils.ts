/**
 * UTILITY: Time & Date Formatting
 * 
 * ROLE: Centralized logic for parsing and formatting time slots.
 */

/**
 * Parses a time slot string (e.g., "2:00 PM") and returns its components.
 * 
 * @param timeSlot - The time slot string to parse.
 * @returns An object containing the hours (24h), minutes, and a 24h display string (HH:MM).
 */
export function parseTimeSlot(timeSlot: string): { hours: number; minutes: number; display24h: string } {
    const [time, period] = timeSlot.split(' ');
    const [hoursRaw, minutesRaw] = time.split(':').map(Number);
    let hours = hoursRaw;
    const minutes = minutesRaw ?? 0;

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    const mins = minutes || 0;
    const display24h = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    return { hours, minutes: mins, display24h };
}
