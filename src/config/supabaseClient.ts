import { createClient } from '@supabase/supabase-js';
import { readEnv } from './env';

const supabaseUrl = readEnv('VITE_SUPABASE_URL');
const supabaseServiceRoleKey = readEnv('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);