/**
 * BACKEND FUNCTION: Save Appointment
 * 
 * ROLE: Records the appointment in Supabase.
 * ACTIONS: Uses Supabase Service Role Key to bypass RLS.
 */
import { Handler } from '@netlify/functions';
import { BookingData } from '../../src/config/booking-types';
import { parseTimeSlot } from '../../src/utils/timeUtils';
import { createAppointment, Appointment } from '../../src/services/appointmentService';
import { BUSINESS_ID } from '../../src/config/businessServer';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_SERVICE_ROLE_KEY'];
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

        const appointment: Appointment = {
            business_id: BUSINESS_ID!,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            service_id: service.id,
            service_name: service.name,
            service_price: Number(service.price),
            appointment_date: date,
            appointment_time: `${display24h}:00`, // Restore HH:MM:SS format for Supabase time type
            duration_minutes: service.duration || 30,
            payment_status: bookingDetails.stripePaymentPaid ? 'paid_online' : 'pay_in_store',
            google_event_id: googleEventId,
            status: 'confirmed',
        };

        const savedAppointment = await createAppointment(appointment);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Appointment saved successfully',
                appointmentId: savedAppointment?.id
            }),
        };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[save-appointment] Error:', message, error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to save appointment',
                message
            }),
        };
    }
};
