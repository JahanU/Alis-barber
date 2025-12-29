/**
 * BACKEND FUNCTION: Save Appointment
 * 
 * ROLE: Records the appointment in Supabase.
 * ACTIONS: Uses Supabase Service Role Key to bypass RLS.
 */
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { BookingData } from '../../src/services/googleCalendar';
import { parseTimeSlot } from '../../src/utils/timeUtils';


const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);


export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
        const missing = requiredEnv.filter(key => !process.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        const body = JSON.parse(event.body || '{}');
        const { bookingData, googleEventId } = body;
        const { customer, service, bookingDetails } = bookingData as BookingData;
        const { date, timeSlot } = bookingDetails || {};

        if (!customer?.email || !service?.id || !date || !timeSlot) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields in booking data' })
            };
        }

        const { display24h } = parseTimeSlot(timeSlot);

        console.log(`[save-appointment] Recording appointment in Supabase for ${customer.email}...`);

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
                google_event_id: googleEventId,
                status: 'confirmed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (supabaseError) {
            console.error('[save-appointment] Supabase error:', supabaseError.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Supabase failed', message: supabaseError.message })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Appointment saved successfully',
                appointmentId: savedAppointment?.id
            }),
        };

    } catch (error: any) {
        console.error('[save-appointment] Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to save appointment',
                message: error.message
            }),
        };
    }
};
