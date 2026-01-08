import { readServerEnv } from './serverEnv';

/**
 * Server-only Business Identity
 *
 * Uses process.env via readServerEnv to avoid import.meta in server bundles.
 */
export const BUSINESS_ID = readServerEnv('VITE_BUSINESS_ID');
