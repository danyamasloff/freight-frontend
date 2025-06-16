import { apiSlice } from './apiSlice'
import { RouteRequestDto, RouteResponseDto, transformToBackendRouteRequest } from '@/shared/types/backend-sync'

// Frontend типы для UI (синхронизированы с вашим backend)
export interface RouteSummary {
    id: number
    name: string
    startAddress: string
    endAddress: string
    distance: number
    duration: number
    createdAt: string
    status: 'DRAFT' | 'CALCULATED' | 'IN_PROGRESS' | 'COMPLETED'
    vehicleId?: number
    driverId?: number
    cargoId?: number
}

export interface RouteDetail extends RouteSummary {
    coordinates: number[][]
    instructions: Array<{
        text: string
        distance: number
        time: number
        streetName?: string
        exitNumber?: number
        turnAngle?: number
    }>
    waypoints: Array<{
        id?: number
        name: string
        address: string
        latitude: number
        longitude: number
        waypointType: string
        stayDurationMinutes?: number
    }>
    departureTime?: string
    estimatedFuelCost?: number
    estimatedTollCost?: number
    estimatedTotalCost?: number
    overallRiskScore?: number
    weatherRiskScore?: number
    roadQualityRiskScore?: number
    rtoCompliant?: boolean
    rtoWarnings?: string[]
}

export interface RouteCreateUpdate {
    name?: string
    startLat: number
    startLon: number
    endLat: number
    endLon: number
    startAddress?: string
    endAddress?: string
    vehicleId?: number
    driverId?: number
    cargoId?: number
    departureTime?: string
    waypoints?: Array<{
        name: string
        address: string
        latitude: number
        longitude: number
        waypointType: string
        stayDurationMinutes?: number
    }>
    avoidTolls?: boolean
    considerWeather?: boolean
    considerTraffic?: boolean
}

export interface WeatherForecastRequest {
    routeId?: number
    coordinates: Array<{ lat: number; lon: number }>
    departureTime?: string
}

export interface WeatherHazardRequest {
    routeId?: number
    coordinates: Array<{ lat: number; lon: number }>
    departureTime?: string
    vehicleType?: string
}

export interface PlaceSearchResult {
    name: string
    lat: number
    lon: number
    address: string
    type: string
    description?: string
    provider?: string
}

// Трансформация данных между Frontend и Backend
const transformRouteSummary = (route: any): RouteSummary => ({
    id: route.id,
    name: route.name || `Маршрут ${route.id}`,
    startAddress: route.startAddress || 'Неизвестно',
    endAddress: route.endAddress || 'Неизвестно',
    distance: route.distance || 0,
    duration: route.duration || 0,
    createdAt: route.createdAt || new Date().toISOString(),
    status: route.status || 'DRAFT',
    vehicleId: route.vehicleId,
    driverId: route.driverId,
    cargoId: route.cargoId,
})

const transformRouteDetail = (route: any): RouteDetail => ({
    ...transformRouteSummary(route),
    coordinates: route.coordinates || [],
    instructions: route.instructions || [],
    waypoints: route.waypoints || [],
    departureTime: route.departureTime,
    estimatedFuelCost: route.estimatedFuelCost,
    estimatedTollCost: route.estimatedTollCost,
    estimatedTotalCost: route.estimatedTotalCost,
    overallRiskScore: route.overallRiskScore,
    weatherRiskScore: route.weatherRiskScore,
    roadQualityRiskScore: route.roadQualityRiskScore,
    rtoCompliant: route.rtoCompliant,
    rtoWarnings: route.rtoWarnings || [],
})

const transformCreateUpdateToBackend = (data: RouteCreateUpdate): any => ({
    name: data.name,
    startLat: data.startLat,
    startLon: data.startLon,
    endLat: data.endLat,
    endLon: data.endLon,
    startAddress: data.startAddress,
    endAddress: data.endAddress,
    vehicleId: data.vehicleId,
    driverId: data.driverId,
    cargoId: data.cargoId,
    departureTime: data.departureTime,
    waypoints: data.waypoints?.map(wp => ({
        name: wp.name,
        address: wp.address,
        latitude: wp.latitude,
        longitude: wp.longitude,
        waypointType: wp.waypointType,
        stayDurationMinutes: wp.stayDurationMinutes
    })),
    avoidTolls: data.avoidTolls,
    considerWeather: data.considerWeather,
    considerTraffic: data.considerTraffic,
})

export const routesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === CRUD операции для сохраненных маршрутов (соответствуют вашему RouteController) ===
        getRoutes: builder.query<RouteSummary[], void>({
            query: () => '/routes',
            providesTags: ['Route'],
            transformResponse: (response: any[]) => response.map(transformRouteSummary),
        }),

        getRoute: builder.query<RouteDetail, number>({
            query: (id) => `/routes/${id}`,
            providesTags: (result, error, id) => [{ type: 'Route', id }],
            transformResponse: transformRouteDetail,
        }),

        createRoute: builder.mutation<RouteDetail, RouteCreateUpdate>({
            query: (routeData) => ({
                url: '/routes',
                method: 'POST',
                body: transformCreateUpdateToBackend(routeData),
            }),
            invalidatesTags: ['Route'],
            transformResponse: transformRouteDetail,
        }),

        updateRoute: builder.mutation<RouteDetail, { id: number; data: RouteCreateUpdate }>({
            query: ({ id, data }) => ({
                url: `/routes/${id}`,
                method: 'PUT',
                body: transformCreateUpdateToBackend(data),
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Route', id }],
            transformResponse: transformRouteDetail,
        }),

        deleteRoute: builder.mutation<void, number>({
            query: (id) => ({
                url: `/routes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Route', id }],
        }),

        // === Расчет маршрутов (ваш основной endpoint /calculate) ===
        calculateRoute: builder.mutation<RouteResponseDto, RouteRequestDto>({
            query: (routeRequest) => ({
                url: '/routes/calculate',
                method: 'POST',
                body: transformToBackendRouteRequest(routeRequest),
            }),
            invalidatesTags: ['Route'],
        }),

        // === Планирование маршрутов (ваши endpoints /plan и /plan-by-name) ===
        planRoute: builder.query<RouteResponseDto, {
            fromLat: number
            fromLon: number
            toLat: number
            toLon: number
            vehicleType?: string
        }>({
            query: ({ fromLat, fromLon, toLat, toLon, vehicleType = 'car' }) => {
                const params = new URLSearchParams({
                    fromLat: fromLat.toString(),
                    fromLon: fromLon.toString(),
                    toLat: toLat.toString(),
                    toLon: toLon.toString(),
                    vehicleType,
                })
                return `/routes/plan?${params}`
            },
        }),

        planRouteByName: builder.query<RouteResponseDto, {
            fromPlace: string
            toPlace: string
            vehicleType?: string
        }>({
            query: ({ fromPlace, toPlace, vehicleType = 'car' }) => {
                const params = new URLSearchParams({
                    fromPlace,
                    toPlace,
                    vehicleType,
                })
                return `/routes/plan-by-name?${params}`
            },
        }),

        // === Поиск мест (ваш endpoint /find-place) ===
        findPlace: builder.query<PlaceSearchResult[], {
            query: string
            placeType?: string
            lat?: number
            lon?: number
        }>({
            query: ({ query, placeType, lat, lon }) => {
                const params = new URLSearchParams({ query })
                if (placeType) params.append('placeType', placeType)
                if (lat) params.append('lat', lat.toString())
                if (lon) params.append('lon', lon.toString())
                return `/routes/find-place?${params}`
            },
        }),

        // === Геокодирование (ваш endpoint /geocode-place) ===
        geocodePlace: builder.query<{
            name: string
            latitude: number
            longitude: number
            description: string
            type: string
            provider: string
        }, string>({
            query: (placeName) => `/routes/geocode-place?placeName=${encodeURIComponent(placeName)}`,
        }),

        // === Погодные данные (ваши endpoints /weather-forecast и /weather-hazards) ===
        getWeatherForecast: builder.mutation<{
            routeId?: number
            totalDistance: number
            estimatedDuration: number
            overallWeatherRisk: 'LOW' | 'MEDIUM' | 'HIGH'
            weatherSegments: Array<{
                segmentIndex: number
                startLat: number
                startLon: number
                endLat: number
                endLon: number
                startTime: string
                endTime: string
                weatherCondition: string
                temperature: number
                humidity: number
                windSpeed: number
                precipitation: number
                visibility: number
                riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
            }>
            hazardWarnings: Array<{
                type: 'HEAVY_RAIN' | 'SNOW' | 'FOG' | 'ICE' | 'WIND' | 'STORM'
                severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
                startTime: string
                endTime: string
                affectedSegments: number[]
                description: string
                recommendation: string
            }>
        }, { route: RouteResponseDto; departureTime?: string }>({
            query: ({ route, departureTime }) => ({
                url: `/routes/weather-forecast${departureTime ? `?departureTime=${departureTime}` : ''}`,
                method: 'POST',
                body: route,
            }),
        }),

        getWeatherHazards: builder.mutation<Array<{
            type: 'HEAVY_RAIN' | 'SNOW' | 'FOG' | 'ICE' | 'WIND' | 'STORM'
            severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
            startTime: string
            endTime: string
            affectedSegments: number[]
            description: string
            recommendation: string
        }>, { route: RouteResponseDto; departureTime?: string }>({
            query: ({ route, departureTime }) => ({
                url: `/routes/weather-hazards${departureTime ? `?departureTime=${departureTime}` : ''}`,
                method: 'POST',
                body: route,
            }),
        }),
    }),
})

// Экспорт хуков для использования в компонентах
export const {
    useGetRoutesQuery,
    useGetRouteQuery,
    useCreateRouteMutation,
    useUpdateRouteMutation,
    useDeleteRouteMutation,
    useCalculateRouteMutation,
    usePlanRouteQuery,
    useLazyPlanRouteQuery,
    usePlanRouteByNameQuery,
    useLazyPlanRouteByNameQuery,
    useFindPlaceQuery,
    useLazyFindPlaceQuery,
    useGeocodePlaceQuery,
    useLazyGeocodePlaceQuery,
    useGetWeatherForecastMutation,
    useGetWeatherHazardsMutation,
} = routesSlice