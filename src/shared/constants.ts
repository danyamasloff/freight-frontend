export const APP_CONFIG = {
    name: import.meta.env.VITE_APP_NAME ?? 'Truck Navigator',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION ?? 'Advanced truck navigation system',
    apiUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
    wsUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws',
} as const

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',

    // Маршруты
    ROUTES: '/routes',
    ROUTE_DETAILS: '/routes/:id',
    ROUTE_CREATE: '/routes/create',
    ROUTE_EDIT: '/routes/edit/:id',

    // Водители
    DRIVERS: '/drivers',
    DRIVER_DETAILS: '/drivers/:id',
    DRIVER_CREATE: '/drivers/create',
    DRIVER_EDIT: '/drivers/edit/:id',
    DRIVER_STATUS: '/drivers/:id/status',
    DRIVER_PERFORMANCE: '/drivers/:id/performance',
    DRIVER_MEDICAL: '/drivers/:id/medical',
    DRIVER_QUALIFICATIONS: '/drivers/:id/qualifications',
    DRIVER_ROUTES: '/drivers/:id/routes',
    DRIVER_RTO_ANALYSIS: '/drivers/:id/rto-analysis',

    // Транспорт
    FLEET: '/fleet',
    VEHICLE_DETAILS: '/fleet/:id',
    VEHICLE_CREATE: '/fleet/create',
    VEHICLE_EDIT: '/fleet/edit/:id',

    // Грузы
    CARGO: '/cargo',
    CARGO_DETAILS: '/cargo/:id',
    CARGO_CREATE: '/cargo/create',
    CARGO_EDIT: '/cargo/edit/:id',

    // Аналитика
    ANALYTICS: '/analytics',
    COMPLIANCE: '/compliance',
    SETTINGS: '/settings',
} as const

export const QUERY_KEYS = {
    routes: ['routes'] as const,
    route: (id: string) => ['routes', id] as const,
    routeWeather: (id: string) => ['routes', id, 'weather'] as const,
    drivers: ['drivers'] as const,
    driver: (id: string) => ['drivers', id] as const,
    driverRest: (id: string) => ['drivers', id, 'rest'] as const,
    vehicles: ['vehicles'] as const,
    vehicle: (id: string) => ['vehicles', id] as const,
    cargo: ['cargo'] as const,
    cargoItem: (id: string) => ['cargo', id] as const,
    weather: ['weather'] as const,
    geocoding: ['geocoding'] as const,
} as const

export const STORAGE_KEYS = {
    theme: 'truck-navigator-theme',
    auth: 'truck-navigator-auth',
    settings: 'truck-navigator-settings',
    sidebar: 'sidebar-store',
} as const

// Статусы
export const VEHICLE_STATUS = {
    AVAILABLE: 'AVAILABLE',
    IN_USE: 'IN_USE',
    MAINTENANCE: 'MAINTENANCE',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
} as const

export const DRIVER_STATUS = {
    DRIVING: 'DRIVING',
    REST_BREAK: 'REST_BREAK',
    DAILY_REST: 'DAILY_REST',
    WEEKLY_REST: 'WEEKLY_REST',
    OFF_DUTY: 'OFF_DUTY',
} as const

export const ROUTE_STATUS = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const

export const CARGO_STATUS = {
    READY: 'READY',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    DELAYED: 'DELAYED',
} as const