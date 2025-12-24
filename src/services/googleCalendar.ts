/**
 * SERVICE: Frontend Google Calendar Integration
 * 
 * ROLE: Handles the "Add to Google Calendar" button on the frontend.
 * ACTIONS: Uses standard Fetch API to create events on the CUSTOMER'S primary calendar
 * after they have authenticated via Google OAuth.
 */
import { CALENDAR_SETTINGS } from '../config/calendar';
import { Service, Customer, BookingDetails } from '../config/booking';

export interface BookingData {
    customer: Customer;
    service: Service;
    bookingDetails: BookingDetails;
}

let googleAccessToken: string | null = null;

/**
 * Set the access token for Google API calls
 */
export const setAccessToken = (token: string) => {
    googleAccessToken = token;
};

/**
 * Create a calendar event using Fetch API
 */
export const createCalendarEvent = async (bookingData: BookingData): Promise<any> => {
    if (!googleAccessToken) {
        throw new Error('No access token found. Please sign in again.');
    }

    try {
        const { customer, service, bookingDetails } = bookingData;
        const { date, timeSlot } = bookingDetails;

        // Parse the time slot to get hours and minutes
        const [time, period] = timeSlot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Create start and end date/time
        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes || 0, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + CALENDAR_SETTINGS.eventDuration);

        // Create the event object
        const event = {
            summary: `Barber Appointment - ${service.name}`,
            description: `
Barber Shop Appointment

Customer: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}
Service: ${service.name}

Thank you for booking with us!
      `.trim(),
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: CALENDAR_SETTINGS.timeZone,
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: CALENDAR_SETTINGS.timeZone,
            },
            attendees: [
                { email: customer.email },
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 }, // 1 hour before
                ],
            },
            colorId: '5', // Yellow/Gold color for barber appointments
        };

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_SETTINGS.calendarId}/events?sendUpdates=all`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${googleAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google API Error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to create calendar event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event. Please try again.');
    }
};

/**
 * Get available time slots for a given date
 */
export const getAvailableTimeSlots = (selectedDate: Date): string[] => {
    const slots: string[] = [];
    const { start, end } = CALENDAR_SETTINGS.businessHours;

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    for (let hour = start; hour < end; hour++) {
        // If it's today, only include slots that haven't passed yet
        if (isToday && hour <= currentHour) {
            continue;
        }

        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        slots.push(`${displayHour}:00 ${period}`);
    }

    return slots;
};
