// Конфигурация API для синхронизации с Backend
// Все значения должны соответствовать настройкам в application.properties

export const API_CONFIG = {
    // Base URL для API (синхронизировано с server.port в Backend)
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    
    // Timeout для запросов (в миллисекундах)
    REQUEST_TIMEOUT: 30000,
    
    // Retry configuration
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // JWT Configuration (синхронизировано с Backend JWT settings)
    JWT: {
        TOKEN_KEY: 'token',
        REFRESH_TOKEN_KEY: 'refreshToken',
        // Backend: app.jwt.expiration-ms=86400000 (24 часа)
        TOKEN_EXPIRATION_MS: 86400000,
        // Backend: app.jwt.refresh-expiration-ms=604800000 (7 дней)
        REFRESH_TOKEN_EXPIRATION_MS: 604800000,
    },
    
    // External API keys (синхронизировано с Backend properties)
    EXTERNAL_APIS: {
        OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
        GRAPHHOPPER_API_KEY: import.meta.env.VITE_GRAPHHOPPER_API_KEY,
    },
    
    // Default map settings
    MAP: {
        DEFAULT_CENTER: {
            lat: Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT) || 55.7558,
            lng: Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG) || 37.6176,
        },
        DEFAULT_ZOOM: Number(import.meta.env.VITE_DEFAULT_MAP_ZOOM) || 10,
    },
} as const;

// Endpoints configuration (синхронизировано с Backend @RequestMapping)
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: '/auth/signin',
        REGISTER: '/auth/signup',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/signout',
    },
    
    // Routes endpoints (синхронизировано с RouteController)
    ROUTES: {
        BASE: '/routes',
        CALCULATE: '/routes/calculate',
        PLAN: '/routes/plan',
        PLAN_BY_NAME: '/routes/plan-by-name',
        FIND_PLACE: '/routes/find-place',
        WEATHER_FORECAST: '/routes/weather-forecast',
        WEATHER_HAZARDS: '/routes/weather-hazards',
    },
    
    // Vehicles endpoints (синхронизировано с VehicleController)
    VEHICLES: {
        BASE: '/vehicles',
        FUEL_LEVEL: (id: number) => `/vehicles/${id}/fuel-level`,
        ODOMETER: (id: number) => `/vehicles/${id}/odometer`,
    },
    
    // Drivers endpoints (синхронизировано с DriverController)
    DRIVERS: {
        BASE: '/drivers',
        STATUS: (id: number) => `/drivers/${id}/status`,
        LOCATION: (id: number) => `/drivers/${id}/location`,
        BY_STATUS: (status: string) => `/drivers/status/${status}`,
        AVAILABLE: '/drivers/available',
    },
    
    // Cargo endpoints (синхронизировано с CargoController)
    CARGO: {
        BASE: '/cargo',
    },
    
    // Weather endpoints (синхронизировано с WeatherController)
    WEATHER: {
        BASE: '/weather',
        CURRENT: '/weather/current',
        FORECAST: '/weather/forecast',
    },
    
    // Geocoding endpoints (синхронизировано с GeocodingController)
    GEOCODING: {
        BASE: '/geocoding',
        SEARCH: '/geocoding/search',
        REVERSE: '/geocoding/reverse',
    },
    
    // Analytics endpoints (синхронизировано с RouteAnalyticsController)
    ANALYTICS: {
        BASE: '/analytics',
        ROUTE: '/analytics/route',
    },
} as const;

// Error codes mapping (синхронизировано с Backend exception handling)
export const API_ERROR_CODES = {
    // HTTP Status codes
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    
    // Custom error codes (должны соответствовать Backend)
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    ROUTING_ERROR: 'ROUTING_ERROR',
    GEOCODING_ERROR: 'GEOCODING_ERROR',
    WEATHER_ERROR: 'WEATHER_ERROR',
    VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
    DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
} as const;

// Default values (синхронизировано с Backend default values)
export const DEFAULT_VALUES = {
    // Route planning defaults
    ROUTE: {
        PROFILE: 'car',
        VEHICLE_TYPE: 'truck',
        CALC_POINTS: true,
        INSTRUCTIONS: true,
        POINTS_ENCODED: false,
        AVOID_TOLLS: false,
        AVOID_HIGHWAYS: false,
        AVOID_URBAN_AREAS: false,
        CONSIDER_WEATHER: true,
        CONSIDER_TRAFFIC: true,
    },
    
    // Vehicle defaults
    VEHICLE: {
        ENGINE_TYPE: 'DIESEL',
        EMISSION_CLASS: 'EURO_6',
        AXIS_CONFIGURATION: '4X2',
        AXIS_COUNT: 2,
        STATUS: 'AVAILABLE',
    },
    
    // Driver defaults (синхронизировано с Backend driver defaults)
    DRIVER: {
        DRIVING_STATUS: 'OFF_DUTY',
        DAILY_DRIVING_MINUTES_TODAY: 0,
        CONTINUOUS_DRIVING_MINUTES: 0,
        WEEKLY_DRIVING_MINUTES: 0,
        HAS_DANGEROUS_GOODS_CERTIFICATE: false,
        HAS_INTERNATIONAL_TRANSPORTATION_PERMIT: false,
    },
} as const;

// Risk analysis weights (синхронизировано с Backend risk.analysis.* properties)
export const RISK_ANALYSIS_WEIGHTS = {
    WEATHER: 0.4,           // risk.analysis.weather.weight
    ROAD_QUALITY: 0.3,      // risk.analysis.road.quality.weight
    ACCIDENT_STATISTICS: 0.3, // risk.analysis.accident.statistics.weight
} as const;

// Profitability weights (синхронизировано с Backend profitability.* properties)
export const PROFITABILITY_WEIGHTS = {
    FUEL_COST: 0.5,         // profitability.fuel.cost.weight
    TOLL_ROADS: 0.2,        // profitability.toll.roads.weight
    VEHICLE_WEAR: 0.2,      // profitability.vehicle.wear.weight
    DRIVER_TIME: 0.1,       // profitability.driver.time.weight
} as const;

// Driver rest time settings (синхронизировано с Backend driver.rest.* properties)
export const DRIVER_REST_SETTINGS = {
    SHORT_BREAK_MINUTES: 15,        // driver.rest.short.break.minutes
    LONG_BREAK_MINUTES: 45,         // driver.rest.long.break.minutes
    MAX_CONTINUOUS_MINUTES: 270,    // driver.work.max.continuous.minutes
    MAX_DAILY_MINUTES: 540,         // driver.work.max.daily.minutes
    
    // Search radius for rest stops (синхронизировано с Backend)
    SEARCH_RADIUS: {
        SHORT: 5000,                // driver.rest.search.radius.short
        LONG: 10000,               // driver.rest.search.radius.long
        DAILY: 20000,              // driver.rest.search.radius.daily
    },
    
    MAX_LOCATIONS: 5,              // driver.rest.max.locations
} as const;

// Cache settings
export const CACHE_SETTINGS = {
    // Время кеширования в минутах (синхронизировано с Backend caffeine spec)
    ROUTE_CACHE_DURATION: 60,
    WEATHER_CACHE_DURATION: 10,
    GEOCODING_CACHE_DURATION: 120,
    DRIVER_STATUS_CACHE_DURATION: 1,
    VEHICLE_STATUS_CACHE_DURATION: 5,
} as const; 