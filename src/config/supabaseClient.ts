import { createClient } from '@supabase/supabase-js';

// @ts-ignore - import.meta may be undefined in some runtimes (Netlify functions)
const supabaseUrl = typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = typeof process !== 'undefined' ? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY : import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);