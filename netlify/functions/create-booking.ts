/**
 * BACKEND FUNCTION: Create Booking
 * 
 * ROLE: The "Bot" that automatically records appointments for the Barber shop.
 * ACTIONS: Authenticates via a Google Service Account to directly insert events
 * into the BARBER'S calendar (configured via BARBER_CALENDAR_ID).
 */
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { BookingData } from '../../src/services/googleCalendar';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        let serviceAccount: { client_email?: string; private_key?: string } = {};

        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            serviceAccount = {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        }
        else {
            throw new Error('Google Credentials not found. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Netlify.');
        }

        if (!serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid Google Credentials. Missing "private_key" or "client_email".');
        }


        const bookingData: BookingData = JSON.parse(event.body || '{}');
        const { customer, service, bookingDetails } = bookingData;
        const { date, timeSlot } = bookingDetails || {};

        // Validate required fields
        if (!customer?.email || !service?.id || !bookingDetails?.date) {
            console.error('Missing required fields in booking data:', JSON.stringify(bookingData, null, 2));
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields in booking data' })
            };
        }

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
            summary: `Barber Appointment - ${service.name}`,
            description: `Customer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nService: ${service.name}`,
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

        console.log(`Attempting to insert event into calendar: ${calendarId} for customer: ${customer.email}`);

        try {
            const response = await calendar.events.insert({
                calendarId: calendarId,
                requestBody: calendarEvent,
                sendUpdates: 'all',
            });

            // Send confirmation email via Nodemailer
            if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
                try {
                    await transporter.sendMail({
                        from: `"Ali Barbers" <${process.env.GMAIL_USER}>`,
                        to: customer.email,
                        subject: 'Booking Confirmed - Ali Barbers',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h1 style="color: #daa520;">Booking Confirmed!</h1>
                                <p>Hi ${customer.name},</p>
                                <p>Your appointment at Ali Barbers has been successfully scheduled.</p>
                                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <p><strong>Service:</strong> ${service.name}</p>
                                    <p><strong>Date:</strong> ${date}</p>
                                    <p><strong>Time:</strong> ${timeSlot}</p>
                                    <p><strong>Price:</strong> ${service.price}</p>
                                    <p><strong>Payment Status:</strong> ${bookingDetails.stripePaymentPaid ? 'Paid Online' : 'Pay In Store'}</p>
                                </div>
                                <p>We look forward to seeing you!</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #666;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
                            </div>
                        `
                    });
                } catch (emailError) {
                    console.error('Failed to send confirmation email:', emailError);
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Booking created',
                    event: response.data,
                    eventId: response.data.id
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
