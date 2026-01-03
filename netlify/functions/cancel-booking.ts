/**
 * BACKEND FUNCTION: Cancel Booking
 * 
 * ROLE: Deletes an appointment from the Google Calendar.
 * ACTIONS: Authenticates via a Google Service Account to delete an event
 * from the BARBER'S calendar.
 */
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

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
        const { eventId, customerEmail, customerName, serviceName, appointmentDate } = JSON.parse(event.body || '{}');

        if (!eventId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing eventId in request body' })
            };
        }

        let serviceAccount: { client_email?: string; private_key?: string } = {};

        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            serviceAccount = {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        } else {
            throw new Error('Google Credentials not found.');
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key,
            },
            scopes: SCOPES,
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.BARBER_CALENDAR_ID || 'primary';

        console.log(`Attempting to delete event: ${eventId} from calendar: ${calendarId}`);

        await calendar.events.delete({
            calendarId: calendarId,
            eventId: eventId,
        });

        // Send cancellation email via Nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && customerEmail) {
            try {
                await transporter.sendMail({
                    from: `"Ali Barbers" <${process.env.GMAIL_USER}>`,
                    to: customerEmail,
                    subject: 'Appointment Cancelled - Ali Barbers',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h1 style="color: #dc2626;">Appointment Cancelled</h1>
                            <p>Hi ${customerName || 'Customer'},</p>
                            <p>We are writing to inform you that your appointment at Ali Barbers has been cancelled.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                <p><strong>Service:</strong> ${serviceName || 'N/A'}</p>
                                <p><strong>Date:</strong> ${appointmentDate || 'N/A'}</p>
                            </div>
                            <p>If you have any questions or would like to reschedule, please visit our website to find our information.</p>
                            <p>Sorry for any inconvenience caused.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">This is an automated notification from your barber.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event deleted successfully' }),
        };
    } catch (error: any) {
        console.error('Cancellation Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Cancellation Failure',
                message: error.message,
            }),
        };
    }
};
