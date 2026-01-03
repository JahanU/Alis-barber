import { supabase } from '../config/supabaseClient';

export interface StaffRecord {
    id: string;
    business_id: string;
    user_id: string;
    email: string;
    name: string;
    role: string;
}

export const getCurrentStaff = async (): Promise<Pick<StaffRecord, 'id' | 'business_id'>> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('staff')
        .select('id,business_id')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        throw error ?? new Error('Staff record not found for user');
    }

    return data;
};
