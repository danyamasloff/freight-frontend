import { z } from 'zod'
import type {
    RouteSummary,
    RouteDetail,
    RouteRequest,
    RouteResponse,
    RouteCreateUpdate,
    RouteWeatherForecast,
    WeatherHazardWarning,
    GeoPoint
} from '@/shared/types/api'

// Re-export API types
export type {
    RouteSummary,
    RouteDetail,
    RouteRequest,
    RouteResponse,
    RouteCreateUpdate,
    RouteWeatherForecast,
    WeatherHazardWarning,
    GeoPoint
}

// Route status types
export type RouteStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// Form schemas
export const routeFormSchema = z.object({
    name: z.string().min(3, 'Название маршрута должно содержать минимум 3 символа').max(100),
    startAddress: z.string().min(5, 'Адрес отправления должен содержать минимум 5 символов'),
    endAddress: z.string().min(5, 'Адрес назначения должен содержать минимум 5 символов'),
    startLat: z.coerce.number().min(-90).max(90),
    startLon: z.coerce.number().min(-180).max(180),
    endLat: z.coerce.number().min(-90).max(90),
    endLon: z.coerce.number().min(-180).max(180),
    vehicleId: z.coerce.number().optional(),
    driverId: z.coerce.number().optional(),
    cargoId: z.coerce.number().optional(),
    departureTime: z.string().optional(),
    avoidTolls: z.boolean().default(false),
    avoidHighways: z.boolean().default(false),
    avoidFerries: z.boolean().default(false),
    waypoints: z.array(z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    })).optional(),
})

export type RouteFormValues = z.infer<typeof routeFormSchema>

// Route planning types
export interface RouteWaypoint {
    id: string
    lat: number
    lng: number
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

// Vehicle type options for routing
export const VEHICLE_TYPES = [
    { value: 'truck', label: 'Грузовик' },
    { value: 'van', label: 'Фургон' },
    { value: 'car', label: 'Легковой автомобиль' },
    { value: 'motorcycle', label: 'Мотоцикл' },
] as const

// Route optimization strategies
export const OPTIMIZATION_STRATEGIES = [
    { value: 'fastest', label: 'Быстрейший маршрут' },
    { value: 'shortest', label: 'Кратчайший маршрут' },
    { value: 'balanced', label: 'Сбалансированный' },
    { value: 'economical', label: 'Экономичный' },
] as const