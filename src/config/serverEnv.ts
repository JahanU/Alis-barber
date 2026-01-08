/**
 * Server-only environment reader.
 * Uses process.env exclusively to avoid import.meta in server bundles.
 */
const readServerEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key];
    }

    return undefined;
};

const requireServerEnv = (key: string): string => {
    const value = readServerEnv(key);
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

export { readServerEnv, requireServerEnv };
