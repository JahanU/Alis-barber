/**
 * SERVICE: Appointment Management
 * 
 * ROLE: Manages customer appointments in Supabase
 * ACTIONS: Create, read, update, and cancel appointments
 */
import { supabase } from '../config/supabaseClient';

export interface Appointment {
    id?: string;
    staff_user_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service_id: string;
    service_name: string;
    service_price: string;
    appointment_date: string; // YYYY-MM-DD format
    appointment_time: string; // HH:MM format
    duration_minutes?: number;
    status?: 'confirmed' | 'cancelled' | 'completed';
    payment_status?: 'paid' | 'pay_in_store';
    stripe_session_id?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Create a new appointment
 */
export const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
    const { data: { user } } = await supabase.auth.getUser();

    // For now, we'll use a default staff user ID if not authenticated
    // In production, you'd want to handle staff assignment differently
    const record = {
        ...appointment,
        staff_user_id: user?.id || null,
        duration_minutes: appointment.duration_minutes || 60,
        status: appointment.status || 'confirmed',
        payment_status: appointment.payment_status || 'pay_in_store',
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
 * Get all appointments for a specific date
 */
export const getAppointmentsForDate = async (date: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', date)
        .eq('status', 'confirmed')
        .order('appointment_time');

    if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }

    return data || [];
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_user_id', user.id)
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

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
    const { error } = await supabase
        .from('appointments')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

    if (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
};

/**
 * Check if a specific time slot is already booked
 */
export const isSlotBooked = async (date: string, time: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .eq('status', 'confirmed')
        .limit(1);

    if (error) {
        console.error('Error checking slot:', error);
        return false;
    }

    return (data && data.length > 0);
};
