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
import { createClient } from '@supabase/supabase-js';
import { BookingData } from '../../src/services/googleCalendar';

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * HELPER: Parse time slot string (e.g., "2:00 PM") to 24h format HH:MM
 */
function parseTimeSlot(timeSlot: string): { hours: number; minutes: number; display24h: string } {
    const [time, period] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;

    const display24h = `${hours.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}`;
    return { hours, minutes: minutes || 0, display24h };
}

export const handler: Handler = async (event) => {

    // 1. Initial Checks & Validation
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Validate Environment Variables early
        const requiredEnv = [
            'GOOGLE_CLIENT_EMAIL',
            'GOOGLE_PRIVATE_KEY',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];
        const missing = requiredEnv.filter(key => !process.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        const bookingData: BookingData = JSON.parse(event.body || '{}');
        const { customer, service, bookingDetails } = bookingData;
        const { date, timeSlot } = bookingDetails || {};

        if (!customer?.email || !service?.id || !date || !timeSlot) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields in booking data' })
            };
        }

        // 2. Setup Google Calendar
        const serviceAccount = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        };

        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccount,
            scopes: SCOPES,
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const { hours, minutes, display24h } = parseTimeSlot(timeSlot);

        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1);

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
        console.log(`[create-booking] Creating calendar event for ${customer.email}...`);

        const googleResponse = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: calendarEvent,
            sendUpdates: 'all',
        });

        // 3. Send Email Notification (Non-blocking)
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
                                <p><strong>Price:</strong> £${service.price}</p>
                                <p><strong>Payment Status:</strong> ${bookingDetails.stripePaymentPaid ? 'Paid Online' : 'Pay In Store'}</p>
                            </div>
                            <p>We look forward to seeing you!</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('[create-booking] Email failed:', emailError);
            }
        }

        // 4. Record in Supabase
        console.log(`[create-booking] Recording appointment in Supabase...`);
        const { data: savedAppointment, error: supabaseError } = await supabase
            .from('appointments')
            .insert({
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                service_id: service.id,
                service_name: service.name,
                service_price: Number(service.price),
                appointment_date: date,
                appointment_time: display24h,
                payment_status: bookingDetails.stripePaymentPaid ? 'paid' : 'pay_in_store',
                google_event_id: googleResponse.data.id,
                status: 'confirmed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (supabaseError) {
            console.error('[create-booking] Supabase failed:', supabaseError);
            // We already have the calendar event, so we still return 200 but log the error
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Booking created successfully',
                eventId: googleResponse.data.id,
                appointmentId: savedAppointment?.id
            }),
        };

    } catch (error: any) {
        console.error('[create-booking] Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create booking',
                message: error.message
            }),
        };
    }
};

