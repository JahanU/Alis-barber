import { createClient } from '@supabase/supabase-js';
import { readServerEnv } from './serverEnv';

// Accept both Vite-prefixed and plain env names to match local/production setups.
const supabaseUrl = readServerEnv('VITE_SUPABASE_URL');
const supabaseServiceRoleKey = readServerEnv('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl) {
    throw new Error('Missing Supabase URL environment variable (VITE_SUPABASE_URL or SUPABASE_URL).');
}

if (!supabaseServiceRoleKey) {
    throw new Error('Missing Supabase Service Role Key (VITE_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY).');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
);
