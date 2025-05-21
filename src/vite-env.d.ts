/// <reference types="vite/client" />

interface ImportMetaEnv {
    // API Configuration
    readonly VITE_API_BASE_URL: string
    readonly VITE_WS_URL: string

    // App Configuration
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_DESCRIPTION: string

    // Feature flags
    readonly VITE_ENABLE_DEV_TOOLS: string
    readonly VITE_ENABLE_ANALYTICS: string
    readonly VITE_ENABLE_PWA: string
    readonly VITE_ENABLE_REAL_TIME: string

    // External APIs
    readonly VITE_YANDEX_MAPS_API_KEY: string
    readonly VITE_GOOGLE_MAPS_API_KEY: string

    // Performance
    readonly VITE_ENABLE_BUNDLE_ANALYZER: string
    readonly VITE_ENABLE_SOURCE_MAPS: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}