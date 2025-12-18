/**
 * BACKEND FUNCTION: Create Booking
 * 
 * ROLE: The "Bot" that automatically records appointments for the Barber shop.
 * ACTIONS: Authenticates via a Google Service Account to directly insert events
 * into the BARBER'S calendar (configured via BARBER_CALENDAR_ID).
 */
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        let serviceAccount: any;

        // Priority 1: Check for GOOGLE_SERVICE_ACCOUNT environment variable (Production)
        if (process.env.GOOGLE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
                if (!serviceAccount.private_key || !serviceAccount.client_email) {
                    throw new Error('GOOGLE_SERVICE_ACCOUNT env var is missing required fields (private_key or client_email)');
                }
            } catch (e) {
                console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT env var:', e);
                throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not valid JSON');
            }
        }
        // Priority 2: Fall back to local service-account.json file (Local Dev)
        else {
            const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            } else {
                throw new Error('Google Credentials not found. Please set the GOOGLE_SERVICE_ACCOUNT env var or provide a service-account.json file.');
            }
        }

        if (!serviceAccount.private_key) {
            throw new Error('Invalid Service Account credentials. Missing "private_key".');
        }


        const bookingData = JSON.parse(event.body || '{}');
        const { date, timeSlot, customerName, customerEmail, customerPhone, service } = bookingData;

        // Authenticate with Service Account using GoogleAuth
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key,
            },
            scopes: SCOPES,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Parse time slot
        const [time, period] = timeSlot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        else if (period === 'AM' && hours === 12) hours = 0;

        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes || 0, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1); // 1 hour duration

        // Create Event
        const calendarEvent = {
            summary: `Barber Appointment - ${service}`,
            description: `Customer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nService: ${service}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Europe/London',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Europe/London',
            },

        };

        const response = await calendar.events.insert({
            calendarId: process.env.BARBER_CALENDAR_ID || '',
            requestBody: calendarEvent,
            sendUpdates: 'all',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Booking created', event: response.data }),
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create booking',
                details: error instanceof Error ? error.message : String(error)
            }),
        };
    }
};
