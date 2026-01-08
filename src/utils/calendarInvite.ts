import { BookingData } from '../../src/config/booking-types';
import { parseTimeSlot } from './timeUtils';
import { formatDuration } from './duration';

// TODO from config
const LOCATION = '63 Eastbank St, Southport, PR8 1EJ';

const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const escapeIcsText = (value: string) =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\n/g, '\\n');

export function buildCalendarInvite(booking: BookingData): { filename: string; content: string } {
    const { bookingDetails, service, customer } = booking;
    const { hours, minutes, display24h } = parseTimeSlot(bookingDetails.timeSlot);

    const startTime = new Date(bookingDetails.date);
    startTime.setHours(hours, minutes, 0, 0);

    const durationMinutes = service.duration || 30;

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + durationMinutes);

    const paymentStatus = bookingDetails.payInStore ? 'Pay in store' : 'Paid online';
    const priceDisplay = typeof service.price === 'number' ? `£${service.price.toFixed(2)}` : service.price;

    const summary = `Barber Appointment - ${service.name}`;
    const descriptionLines = [
        `Customer: ${customer.name}`,
        `Email: ${customer.email}`,
        `Phone: ${customer.phone}`,
        `Service: ${service.name} (${formatDuration(durationMinutes)}) - ${priceDisplay}`,
        `Payment Status: ${paymentStatus}`,
        `Date: ${startTime.toLocaleDateString()}`,
        `Time: ${bookingDetails.timeSlot}`,
    ];

    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ali\'s Barber//Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:ali-barbers-${startTime.getTime()}-${bookingDetails.date}@ali-barbers`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startTime)}`,
        `DTEND:${formatICSDate(endTime)}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(descriptionLines.join('\n'))}`,
        `LOCATION:${escapeIcsText(LOCATION)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    const safeDate = bookingDetails.date.replace(/-/g, '');
    const safeTime = display24h.replace(':', '');
    const filename = `ali-barbers-${safeDate}-${safeTime}.ics`;

    return {
        filename,
        content: icsLines.join('\r\n'),
    };
}
