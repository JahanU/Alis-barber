import { gapi } from 'gapi-script';
import { GOOGLE_CONFIG, CALENDAR_SETTINGS } from '../config/calendar';

export interface BookingData {
    date: string;
    timeSlot: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    service: string;
}

/**
 * Initialize the Google API client (only the client, not auth2)
 */
export const initGoogleClient = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                console.log('Initializing Google Client...');
                await gapi.client.init({
                    // clientId is not needed for client.init in the new model, 
                    // but we need discovery docs
                    discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
                });
                resolve();
            } catch (error) {
                console.error('Error initializing Google API client:', error);
                reject(error);
            }
        });
    });
};

/**
 * Set the access token for the Google API client
 */
export const setAccessToken = (token: string) => {
    gapi.client.setToken({ access_token: token });
};

/**
 * Create a calendar event
 */
export const createCalendarEvent = async (bookingData: BookingData): Promise<any> => {
    try {
        const { date, timeSlot, customerName, customerEmail, customerPhone, service } = bookingData;

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
            summary: `Barber Appointment - ${service}`,
            description: `
Barber Shop Appointment

Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Service: ${service}

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
                { email: customerEmail },
                { email: CALENDAR_SETTINGS.barberEmail },
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

        // Insert the event
        const response = await gapi.client.calendar.events.insert({
            calendarId: CALENDAR_SETTINGS.calendarId,
            resource: event,
            sendUpdates: 'all', // Send email notifications to attendees
        } as any);

        return response.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event. Please try again.');
    }
};

/**
 * Get available time slots for a given date
 */
export const getAvailableTimeSlots = (_date: Date): string[] => {
    const slots: string[] = [];
    const { start, end } = CALENDAR_SETTINGS.businessHours;

    for (let hour = start; hour < end; hour++) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        slots.push(`${displayHour}:00 ${period}`);
    }

    return slots;
};
