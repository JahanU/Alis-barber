import { readEnv } from './env';

/**
 * CONFIGURATION: Business Identity
 *
 * ROLE: Centralize business identifier retrieval for both client and server contexts.
 */

// Support multiple casings/prefixes to align with local env naming.
export const BUSINESS_ID =
    readEnv('BUSINESS_ID') ||
    readEnv('VITE_BUSINESS_ID') ||
    '';
