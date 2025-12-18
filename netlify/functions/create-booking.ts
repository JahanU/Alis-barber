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
        let serviceAccount: { client_email?: string; private_key?: string } = {};

        // Priority 1: Check for individual environment variables (Most user-friendly for Netlify)
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            let key = process.env.GOOGLE_PRIVATE_KEY.trim();

            // Fix 1: Strip surrounding double quotes or single quotes
            if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
                key = key.substring(1, key.length - 1);
            }

            // Fix 2: Standardize newlines. Replace literal "\n" strings with real newline characters.
            key = key.replace(/\\n/g, '\n');

            // Fix 3: If it's still all on one line but doesn't have \n, it might be mangled
            if (!key.includes('\n')) {
                console.warn('Warning: Private key has no newlines. This usually causes decoding errors.');
            }

            serviceAccount = {
                client_email: process.env.GOOGLE_CLIENT_EMAIL.trim(),
                private_key: key,
            };

            // Safety check for logs
            console.log(`Key Diagnostics: length=${key.length}, lines=${key.split('\n').length}`);
            console.log(`Key starts with: "${key.substring(0, 30)}..."`);
            console.log(`Key ends with: "...${key.substring(key.length - 30)}"`);
        }
        // Priority 2: Check for GOOGLE_SERVICE_ACCOUNT environment variable (JSON blob)
        else if (process.env.GOOGLE_SERVICE_ACCOUNT) {
            try {
                const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
                serviceAccount = {
                    client_email: parsed.client_email,
                    private_key: parsed.private_key,
                };
            } catch (e) {
                console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT env var:', e);
                throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not valid JSON');
            }
        }
        // Priority 3: Fall back to local service-account.json file (Local Dev)
        else {
            const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                const fileContent = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                serviceAccount = {
                    client_email: fileContent.client_email,
                    private_key: fileContent.private_key,
                };
            } else {
                throw new Error('Google Credentials not found. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Netlify.');
            }
        }

        if (!serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid Google Credentials. Missing "private_key" or "client_email".');
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

        const calendarId = process.env.BARBER_CALENDAR_ID || 'primary';

        console.log(`Attempting to insert event into calendar: ${calendarId}`);

        try {
            const response = await calendar.events.insert({
                calendarId: calendarId,
                requestBody: calendarEvent,
                sendUpdates: 'all',
            });

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Booking created',
                    event: response.data
                }),
            };
        } catch (apiError: any) {
            console.error('Google API Error:', apiError);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Google API Error',
                    message: apiError.message,
                    details: apiError.response?.data?.error || apiError.errors || 'Unknown API error'
                }),
            };
        }
    } catch (error: any) {
        console.error('Setup Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Function Setup Failure',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }),
        };
    }
};
