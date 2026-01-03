/**
 * SERVICE: Appointment Management
 * 
 * ROLE: Manages customer appointments in Supabase
 * ACTIONS: Create, read, update, and cancel appointments
 */
import { supabase } from '../config/supabaseClient';
import { getCurrentStaff } from './staffService';

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
    appointment_time: string; // HH:MM:SS format (Supabase time type)
    duration_minutes?: number;
    status?: 'confirmed' | 'cancelled' | 'completed';
    payment_status: 'paid_online' | 'pay_in_store';
    notes?: string | null;
    google_event_id?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Shared function to save an appointment record.
 * Can be called from frontend (anon client) or backend (service role client).
 * Automatically assigns staff_id if not provided.
 */

// TODO: handle for multiple shops and staff members
export const createAppointment = async (
    appointment: Appointment): Promise<Appointment> => {
    let staffId = appointment.staff_id;
    if (!staffId) {
        // Look for the first staff member who has availability set
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


/**
 * Get appointments for a date range (for calendar view)
 */
export const getAppointmentsForDateRange = async (startDate: string, endDate: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .eq('status', 'confirmed')
        .order('appointment_date')
        .order('appointment_time');

    if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }

    return data || [];
};

/**
 * Get all appointments for the current staff user
 */
export const getMyAppointments = async (): Promise<Appointment[]> => {
    const staff = await getCurrentStaff();

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', staff.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time');

    if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }

    return data || [];
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId: string): Promise<void> => {
    const { error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

    if (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
};
