/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_BARBER_EMAIL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
