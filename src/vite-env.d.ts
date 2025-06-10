/// <reference types="vite/client" />

interface ImportMetaEnv {
    // API Configuration
    readonly VITE_API_BASE_URL: string
    readonly VITE_WEBSOCKET_URL: string
    readonly VITE_OPENWEATHER_API_KEY: string
    readonly VITE_YANDEX_MAPS_API_KEY: string
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    readonly VITE_MAPBOX_ACCESS_TOKEN: string
    readonly VITE_GEOCODING_API_KEY: string
    readonly VITE_TRAFFIC_API_KEY: string
    readonly VITE_WEATHER_API_KEY: string
    readonly VITE_ANALYTICS_ID: string
    readonly VITE_SENTRY_DSN: string

    // App Configuration
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_DESCRIPTION: string
    readonly VITE_BUILD_TIME: string
    readonly VITE_COMMIT_HASH: string
    readonly VITE_BRANCH_NAME: string
    readonly VITE_ENVIRONMENT: string
    readonly VITE_DEBUG: string
    readonly VITE_LOG_LEVEL: string
    readonly VITE_FEATURE_FLAGS: string

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