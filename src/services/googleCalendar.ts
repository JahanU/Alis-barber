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
 * Initialize the Google API client
 */
export const initGoogleClient = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        gapi.load('client:auth2', async () => {
            try {
                await gapi.client.init({
                    clientId: GOOGLE_CONFIG.clientId,
                    scope: GOOGLE_CONFIG.scopes,
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
 * Sign in to Google account
 */
export const signIn = async (): Promise<boolean> => {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signIn();
        return true;
    } catch (error) {
        console.error('Error signing in:', error);
        throw new Error('Failed to sign in to Google account');
    }
};

/**
 * Sign out from Google account
 */
export const signOut = async (): Promise<boolean> => {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signOut();
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        throw new Error('Failed to sign out');
    }
};

/**
 * Check if user is signed in
 */
export const isSignedIn = (): boolean => {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance ? authInstance.isSignedIn.get() : false;
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
