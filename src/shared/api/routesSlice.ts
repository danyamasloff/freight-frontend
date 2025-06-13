import { apiSlice } from './apiSlice'
import type {
    RouteRequestDto,
    RouteResponseDto,
    RouteWeatherForecastBackendDto,
    WeatherHazardWarningDto,
    GeoLocationBackendDto
} from '@/shared/types/backend-sync'
import {
    transformToFrontendRoute,
    transformToBackendRouteRequest
} from '@/shared/types/backend-sync'
import type {
    RouteSummary,
    RouteDetail,
    RouteCreateUpdate,
    GeoLocation
} from '@/shared/types/api'

// Функция для преобразования данных из API в формат фронтенда
const transformRouteData = (route: any): RouteDetail => {
    console.log('Transforming route data:', route)
    
    return {
        ...route,
        // API возвращает distance в километрах (BigDecimal), преобразуем в метры для formatDistance
        distance: route.distance ? Math.round(route.distance * 1000) : 
                 (route.distanceKm ? Math.round(route.distanceKm * 1000) : 0),
        
        // API возвращает duration в минутах (long), преобразуем в секунды для formatDuration  
        duration: route.duration ? Math.round(route.duration * 60) : 
                 (route.estimatedDurationMinutes ? Math.round(route.estimatedDurationMinutes * 60) : 0),
        
        // Экономические показатели (уже в правильном формате)
        estimatedCost: route.estimatedTotalCost || route.estimatedCost || 0,
        estimatedFuelCost: route.estimatedFuelCost || 0,
        estimatedTollCost: route.estimatedTollCost || 0,
        estimatedDriverCost: route.estimatedDriverCost || 0,
        estimatedTotalCost: route.estimatedTotalCost || route.estimatedCost || 0,
        
        // Расход топлива
        estimatedFuelConsumption: route.estimatedFuelConsumption || route.fuelConsumption || 0,
        fuelConsumption: route.estimatedFuelConsumption || route.fuelConsumption || 0,
        
        // Анализ рисков (преобразуем из десятичных в проценты)
        riskScore: route.overallRiskScore ? Math.round(route.overallRiskScore * 100) : (route.riskScore || 0),
        overallRiskScore: route.overallRiskScore ? Math.round(route.overallRiskScore * 100) : (route.riskScore || 0),
        weatherRisk: route.weatherRiskScore ? Math.round(route.weatherRiskScore * 100) : (route.weatherRisk || 0),
        weatherRiskScore: route.weatherRiskScore ? Math.round(route.weatherRiskScore * 100) : (route.weatherRisk || 0),
        roadQualityRisk: route.roadQualityRiskScore ? Math.round(route.roadQualityRiskScore * 100) : (route.roadQualityRisk || 0),
        roadQualityRiskScore: route.roadQualityRiskScore ? Math.round(route.roadQualityRiskScore * 100) : (route.roadQualityRisk || 0),
        trafficRisk: route.trafficRiskScore ? Math.round(route.trafficRiskScore * 100) : (route.trafficRisk || 0),
        trafficRiskScore: route.trafficRiskScore ? Math.round(route.trafficRiskScore * 100) : (route.trafficRisk || 0),
        
        // Остальные поля
        coordinates: route.coordinates || [],
        instructions: route.instructions || [],
        rtoCompliant: route.rtoCompliant || false,
        rtoWarnings: route.rtoWarnings || [],
        departureTime: route.departureTime,
        startAddress: route.startAddress,
        endAddress: route.endAddress,
    }
}

const transformRouteSummary = (route: any): RouteSummary => {
    return {
        ...route,
        // API возвращает distance в километрах (BigDecimal), преобразуем в метры для formatDistance
        distance: route.distance ? Math.round(route.distance * 1000) : 
                 (route.distanceKm ? Math.round(route.distanceKm * 1000) : 0),
        
        // API возвращает duration в минутах (long), преобразуем в секунды для formatDuration
        duration: route.duration ? Math.round(route.duration * 60) : 
                 (route.estimatedDurationMinutes ? Math.round(route.estimatedDurationMinutes * 60) : 0),
        
        // Экономические показатели
        estimatedCost: route.estimatedTotalCost || route.estimatedCost || 0,
        estimatedTotalCost: route.estimatedTotalCost || route.estimatedCost || 0,
    }
}

// Интерфейсы для запросов (синхронизированы с Backend)
export interface RouteCalculateRequest extends RouteRequestDto {
    // Дополнительные поля для удобства Frontend
    startLat: number;
    startLon: number;
    endLat: number;
    endLon: number;
    vehicleId?: number;
    driverId?: number;
    cargoId?: number;
    departureTime?: string;
    considerWeather?: boolean;
    considerTraffic?: boolean;
}

export interface RoutePlanRequest {
    fromLat: number;
    fromLon: number;
    toLat: number;
    toLon: number;
    vehicleType?: string;
}

export interface RoutePlanByNameRequest {
    fromPlace: string;
    toPlace: string;
    vehicleType?: string;
}

export interface FindPlaceRequest {
    query: string;
    placeType?: string;
    lat?: number;
    lon?: number;
}

export const routesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === CRUD операции для сохраненных маршрутов ===
        getRoutes: builder.query<RouteSummary[], void>({
            query: () => '/routes',
            providesTags: ['Route'],
            transformResponse: (response: any[]) => response.map(transformRouteSummary),
        }),
        getRoute: builder.query<RouteDetail, number>({
            query: (id) => `/routes/${id}`,
            providesTags: (result, error, id) => [{ type: 'Route', id }],
            transformResponse: (response: any) => transformRouteData(response),
        }),
        createRoute: builder.mutation<RouteDetail, RouteCreateUpdate>({
            query: (routeData) => ({
                url: '/routes',
                method: 'POST',
                body: routeData,
            }),
            invalidatesTags: ['Route'],
            transformResponse: (response: any) => transformRouteData(response),
        }),
        updateRoute: builder.mutation<RouteDetail, { id: number; data: RouteCreateUpdate }>({
            query: ({ id, data }) => ({
                url: `/routes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Route', id }],
            transformResponse: (response: any) => transformRouteData(response),
        }),
        deleteRoute: builder.mutation<void, number>({
            query: (id) => ({
                url: `/routes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Route'],
        }),

        // === Расчет маршрутов (синхронизировано с Backend) ===
        calculateRoute: builder.mutation<RouteResponseDto, RouteRequestDto>({
            query: (requestData) => ({
                url: '/routes/calculate',
                method: 'POST',
                body: transformToBackendRouteRequest(requestData),
            }),
            transformResponse: (response: RouteResponseDto) => transformToFrontendRoute(response),
        }),

        // === Планирование маршрута по координатам ===
        planRoute: builder.query<RouteResponseDto, RoutePlanRequest>({
            query: ({ fromLat, fromLon, toLat, toLon, vehicleType = 'truck' }) =>
                `/routes/plan?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}&vehicleType=${vehicleType}`,
            transformResponse: (response: RouteResponseDto) => transformToFrontendRoute(response),
        }),

        // === Планирование маршрута по названиям ===
        planRouteByNames: builder.query<RouteResponseDto, RoutePlanByNameRequest>({
            query: ({ fromPlace, toPlace, vehicleType = 'truck' }) =>
                `/routes/plan-by-name?fromPlace=${encodeURIComponent(fromPlace)}&toPlace=${encodeURIComponent(toPlace)}&vehicleType=${vehicleType}`,
            transformResponse: (response: RouteResponseDto) => transformToFrontendRoute(response),
        }),

        // === Поиск мест ===
        findPlace: builder.query<GeoLocationBackendDto[], FindPlaceRequest>({
            query: ({ query, placeType, lat, lon }) => {
                const params = new URLSearchParams({ query });
                if (placeType) params.append('placeType', placeType);
                if (lat !== undefined) params.append('lat', lat.toString());
                if (lon !== undefined) params.append('lon', lon.toString());
                return `/routes/find-place?${params.toString()}`;
            },
        }),

        // === Погодный прогноз для маршрута ===
        getRouteWeatherForecast: builder.mutation<RouteWeatherForecastBackendDto, {
            route: RouteResponseDto;
            departureTime?: string;
        }>({
            query: ({ route, departureTime }) => {
                const params = departureTime ? `?departureTime=${encodeURIComponent(departureTime)}` : '';
                return {
                    url: `/routes/weather-forecast${params}`,
                    method: 'POST',
                    body: route,
                };
            },
        }),

        // === Погодные предупреждения ===
        getWeatherHazards: builder.mutation<WeatherHazardWarningDto[], {
            route: RouteResponseDto;
            departureTime?: string;
        }>({
            query: ({ route, departureTime }) => {
                const params = departureTime ? `?departureTime=${encodeURIComponent(departureTime)}` : '';
                return {
                    url: `/routes/weather-hazards${params}`,
                    method: 'POST',
                    body: route,
                };
            },
        }),
    }),
});

// === Экспорт хуков ===
export const {
    // CRUD операции
    useGetRoutesQuery,
    useGetRouteQuery,
    useCreateRouteMutation,
    useUpdateRouteMutation,
    useDeleteRouteMutation,
    
    // Расчет маршрутов
    useCalculateRouteMutation,
    usePlanRouteQuery,
    usePlanRouteByNamesQuery,
    
    // Поиск и геокодирование
    useFindPlaceQuery,
    
    // Погода
    useGetRouteWeatherForecastMutation,
    useGetWeatherHazardsMutation,
} = routesSlice;