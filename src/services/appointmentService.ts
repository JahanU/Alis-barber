/**
 * SERVICE: Appointment Management (server + client shared)
 *
 * ROLE: Create appointment records in Supabase.
 */
import { supabase } from '../config/supabaseClient';
import { BUSINESS_ID } from '../config/business';

export interface Appointment {
    id?: string;
    business_id: string;
    staff_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service_id: string;
    service_name: string;
    service_price: number;
    appointment_date: string; // YYYY-MM-DD format
    appointment_time: string; // HH:MM:SS format
    duration_minutes?: number;
    status?: 'confirmed' | 'cancelled' | 'completed';
    payment_status: 'paid_online' | 'pay_in_store';
    notes?: string | null;
    google_event_id?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Create an appointment record.
 * Business ID is required and provided via configuration; staff_id is resolved for the business when not provided.
 */
export const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
    const businessId = appointment.business_id || BUSINESS_ID;

    let staffId = appointment.staff_id;
    if (!staffId) {
        const { data: staffRows, error: staffError } = await supabase
            .from('staff')
            .select('id')
            .eq('business_id', businessId)
            .limit(1);

        if (staffError) {
            throw staffError;
        }

        if (!staffRows || staffRows.length === 0) {
            throw new Error('No staff available for the configured business.');
        }

        staffId = staffRows[0].id;
    }

    const record = {
        ...appointment,
        business_id: businessId,
        staff_id: staffId,
        duration_minutes: appointment.duration_minutes,
        status: appointment.status || 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('appointments')
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }

    return data;
};
