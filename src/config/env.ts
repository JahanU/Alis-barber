/**
 * Provide a cross-runtime fallback that reads from Node’s process.env or
 * Vite’s import.meta.env depending on which context is available.
 */
const readEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key];
    }

    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
        // @ts-ignore - import.meta may be missing in some runtimes
        return import.meta.env[key] as string;
    }

    return undefined;
};

export { readEnv };
