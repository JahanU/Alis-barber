/**
 * CONFIGURATION: Business Identity
 *
 * ROLE: Centralize business identifier retrieval for both client and server contexts.
 */

const readEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key];
    }

    // @ts-ignore - import.meta may be undefined in some runtimes (Netlify functions)
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
        // @ts-ignore
        return import.meta.env[key] as string;
    }

    return undefined;
};

// TODO maybe remove BUSINESS_ID from env vars and use only VITE_BUSINESS_ID
// Support multiple casings/prefixes to align with local env naming.
export const BUSINESS_ID =
    readEnv('BUSINESS_ID') ||
    readEnv('VITE_BUSINESS_ID') ||
    '';
