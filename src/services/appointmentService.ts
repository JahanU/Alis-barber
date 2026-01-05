/**
 * SERVICE: Appointment Management (server + client shared)
 *
 * ROLE: Create appointment records in Supabase.
 */
import { supabase } from '../config/supabaseClient';

export interface Appointment {
    id?: string;
    business_id?: string;
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
 * If staff_id/business_id are missing, they are resolved from existing availability and staff records.
 */
export const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
    let staffId = appointment.staff_id;

    if (!staffId) {
        const { data: availability } = await supabase
            .from('staff_availability')
            .select('staff_id')
            .eq('availability_type', 'working_hours')
            .eq('is_recurring', true)
            .limit(1)
            .maybeSingle();

        if (availability) {
            staffId = availability.staff_id;
        }
    }

    if (!staffId) {
        throw new Error('No staff member available to assign to this appointment');
    }

    let businessId = appointment.business_id;
    if (!businessId) {
        const { data: staff, error: staffError } = await supabase
            .from('staff')
            .select('business_id')
            .eq('id', staffId)
            .single();

        if (staffError || !staff) {
            throw staffError ?? new Error('Failed to resolve business for staff');
        }

        businessId = staff.business_id;
    }

    const record = {
        ...appointment,
        staff_id: staffId,
        business_id: businessId,
        duration_minutes: appointment.duration_minutes || 60,
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
