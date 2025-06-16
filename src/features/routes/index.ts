// freight-frontend/src/features/routes/types/index.ts

export interface RoutePoint {
    lat: number
    lon: number
    address?: string
    type: 'start' | 'waypoint' | 'end'
    order: number
}

export interface RouteOptimizationOptions {
    optimizeOrder: boolean
    considerTraffic: boolean
    preferHighways: boolean
    avoidTolls: boolean
    vehicleRestrictions: boolean
}

export interface RouteAnalysis {
    distance: number
    duration: number
    fuelConsumption: number
    estimatedCost: number
    riskScore: number
    weatherRisk: number
    trafficRisk: number
    riskFactors: string[]
    recommendations: string[]
}

export interface RoutePlanningRequest {
    startLat: number
    startLon: number
    endLat: number
    endLon: number
    vehicleId?: number
    driverId?: number
    cargoId?: number
    departureTime?: string
    considerWeather?: boolean
    considerTraffic?: boolean
}

export interface RouteWaypoint {
    lat: number
    lon: number
    address?: string
    stopType?: 'fuel' | 'rest' | 'delivery' | 'pickup'
    duration?: number
}

export interface DetailedRouteResponse {
    id?: string
    startPoint: string
    endPoint: string
    distance: number
    duration: number
    fuelConsumption: number
    fuelCost: number
    tollCost: number
    estimatedDriverCost: number
    totalCost: number
    overallRiskScore: number
    weatherRisk: number
    roadQualityRisk: number
    trafficRisk: number
    cargoRisk?: number
    coordinates: Array<[number, number]>
    weatherForecast?: WeatherForecast[]
    alerts?: RouteAlert[]
    estimatedFuelCost?: number
}

export interface WeatherForecast {
    location: string
    time: string
    temperature: number
    description: string
    windSpeed: number
    humidity: number
    visibility: number
    precipitation: number
    conditions: string
}

export interface RouteAlert {
    type: 'weather' | 'traffic' | 'road' | 'vehicle' | 'compliance'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    location?: RoutePoint
    timestamp?: string
}

export interface RouteFormData {
    startAddress: string
    endAddress: string
    startLat?: number
    startLon?: number
    endLat?: number
    endLon?: number
    vehicleId?: string
    driverId?: string
    departureTime?: string
}

// Status display configuration
export const ROUTE_STATUS_CONFIG = {
    PLANNED: {
        label: 'Планируется',
        variant: 'outline' as const,
        icon: '📋',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50'
    },
    IN_PROGRESS: {
        label: 'В пути',
        variant: 'default' as const,
        icon: '🚛',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50'
    },
    COMPLETED: {
        label: 'Завершен',
        variant: 'secondary' as const,
        icon: '✅',
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50'
    },
    CANCELLED: {
        label: 'Отменен',
        variant: 'destructive' as const,
        icon: '❌',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50'
    },
} as const

export const VEHICLE_TYPES = [
    { value: 'truck', label: 'Грузовик' },
    { value: 'van', label: 'Фургон' },
    { value: 'car', label: 'Легковой автомобиль' },
    { value: 'motorcycle', label: 'Мотоцикл' },
] as const

export const OPTIMIZATION_STRATEGIES = [
    { value: 'fastest', label: 'Быстрейший маршрут' },
    { value: 'shortest', label: 'Кратчайший маршрут' },
    { value: 'balanced', label: 'Сбалансированный' },
    { value: 'economical', label: 'Экономичный' },
] as const

export { RouteCalculationResult } from './components/route-calculation-result'

// Страницы (публичный API)
export { default as RoutesPage } from './pages/routes-page';
export { default as RouteDetailPage } from './pages/route-detail-page';
export { default as CreateRoutePage } from './pages/create-route-page';
export { default as RoutePlannerPage } from './pages/route-planner-page';
export { default as RouteMapPage } from './pages/route-map-page';

// Компоненты планировщика (при необходимости)
// export { RoutePlanner } from './components/route-planner';
// export { RouteForm } from './components/route-form';