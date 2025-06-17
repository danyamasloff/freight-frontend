import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG } from '@/shared/config/api-config'

export interface RouteAnalyticsDto {
    distance: number;           // км
    duration: number;           // минуты
    stopTime: number;           // минуты
    avgSpeed: number;           // км/ч
    fuelConsumption: {
        total: number;          // л
        per100km: number;       // л/100км
    };
    cost: {
        total: number;          // ₽
        perKm: number;          // ₽/км
    };
    // risk scores
    overallRisk: number;        // %, 0–70
    weatherRisk: number;        // %, 0–70
    roadRisk: number;           // %, 0–70
}

export const analyticsApi = createApi({
    reducerPath: 'analyticsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_CONFIG.BASE_URL}`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['RouteAnalytics', 'Route', 'Driver'],
    endpoints: (builder) => ({
        // Получение деталей маршрута
        getRouteDetails: builder.query<any, number>({
            query: (routeId) => `/routes/${routeId}`,
            providesTags: (result, error, routeId) => [{ type: 'Route', id: routeId }],
        }),
        
        // Планирование маршрута по координатам  
        getPlanByCoordinates: builder.query<any, {
            fromLat: number;
            fromLon: number;
            toLat: number;
            toLon: number;
        }>({
            query: ({ fromLat, fromLon, toLat, toLon }) => {
                const params = new URLSearchParams({
                    fromLat: fromLat.toString(),
                    fromLon: fromLon.toString(),
                    toLat: toLat.toString(),
                    toLon: toLon.toString(),
                });
                return `/routes/plan?${params}`;
            },
        }),
        
        // Получение данных водителя
        getDriverDetails: builder.query<any, number>({
            query: (driverId) => `/drivers/${driverId}`,
            providesTags: (result, error, driverId) => [{ type: 'Driver', id: driverId }],
        }),
        
        // Оригинальный endpoint для аналитики (если понадобится)
        getRouteAnalytics: builder.query<RouteAnalyticsDto, {
            distance: number;
            duration: number;
            driverFuelConsumption?: number;
            driverRatePerKm?: number;
            fuelPricePerLitre?: number;
            tollRatePerKm?: number;
        }>({
            query: (params) => ({
                url: '/analytics/route',
                params,
            }),
            providesTags: ['RouteAnalytics'],
        }),

        // Аналитика конкретного маршрута
        getRouteAnalyticsById: builder.query<any, number>({
            query: (routeId) => `/analytics/route/${routeId}`,
            providesTags: (result, error, routeId) => [{ type: 'RouteAnalytics', id: routeId }],
        }),

        // Общая аналитика компании
        getCompanyAnalytics: builder.query<any, {
            period?: string;
            startDate?: string;
            endDate?: string;
        }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.period) searchParams.append('period', params.period);
                if (params.startDate) searchParams.append('startDate', params.startDate);
                if (params.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/company?${searchParams}`;
            },
            providesTags: ['RouteAnalytics'],
        }),

        // Аналитика по водителям
        getDriversAnalytics: builder.query<any, {
            period?: string;
            limit?: number;
        }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.period) searchParams.append('period', params.period);
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/analytics/drivers?${searchParams}`;
            },
            providesTags: ['RouteAnalytics'],
        }),

        // Аналитика по маршрутам
        getRoutesAnalytics: builder.query<any, {
            period?: string;
            limit?: number;
        }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.period) searchParams.append('period', params.period);
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/analytics/routes?${searchParams}`;
            },
            providesTags: ['RouteAnalytics'],
        }),
    }),
})

export const { 
    useGetRouteAnalyticsQuery, 
    useLazyGetRouteAnalyticsQuery,
    useGetRouteDetailsQuery,
    useLazyGetRouteDetailsQuery,
    useGetPlanByCoordinatesQuery,
    useLazyGetPlanByCoordinatesQuery,
    useGetDriverDetailsQuery,
    useLazyGetDriverDetailsQuery,
    useGetRouteAnalyticsByIdQuery,
    useLazyGetRouteAnalyticsByIdQuery,
    useGetCompanyAnalyticsQuery,
    useLazyGetCompanyAnalyticsQuery,
    useGetDriversAnalyticsQuery,
    useLazyGetDriversAnalyticsQuery,
    useGetRoutesAnalyticsQuery,
    useLazyGetRoutesAnalyticsQuery
} = analyticsApi 