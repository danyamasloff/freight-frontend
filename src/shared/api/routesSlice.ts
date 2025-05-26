import { apiSlice } from './apiSlice'
import type {
    RouteSummary,
    RouteDetail,
    RouteRequest,
    RouteResponse,
    RouteCreateUpdate,
    RouteWeatherForecast,
    WeatherHazardWarning,
    GeoLocation
} from '@/shared/types/api'

export const routesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // CRUD операции
        getRoutes: builder.query<RouteSummary[], void>({
            query: () => '/routes',
            providesTags: ['Route'],
        }),
        getRoute: builder.query<RouteDetail, number>({
            query: (id) => `/routes/${id}`,
            providesTags: (result, error, id) => [{ type: 'Route', id }],
        }),
        createRoute: builder.mutation<RouteDetail, RouteCreateUpdate>({
            query: (routeData) => ({
                url: '/routes',
                method: 'POST',
                body: routeData,
            }),
            invalidatesTags: ['Route'],
        }),
        updateRoute: builder.mutation<RouteDetail, { id: number; data: RouteCreateUpdate }>({
            query: ({ id, data }) => ({
                url: `/routes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Route', id }],
        }),
        deleteRoute: builder.mutation<void, number>({
            query: (id) => ({
                url: `/routes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Route'],
        }),

        // Расчет маршрутов - ОБЯЗАТЕЛЬНО mutation для POST запросов
        calculateRoute: builder.mutation<RouteResponse, RouteRequest>({
            query: (routeData) => ({
                url: '/routes/calculate',
                method: 'POST',
                body: routeData,
            }),
        }),

        // Планирование маршрута по координатам - используем query для GET
        planRoute: builder.query<RouteResponse, {
            fromLat: number
            fromLon: number
            toLat: number
            toLon: number
            vehicleType?: string
        }>({
            query: ({ fromLat, fromLon, toLat, toLon, vehicleType = 'truck' }) =>
                `/routes/plan?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}&vehicleType=${vehicleType}`,
        }),

        // Планирование маршрута по названиям - используем query для GET
        planRouteByNames: builder.query<RouteResponse, {
            fromPlace: string
            toPlace: string
            vehicleType?: string
        }>({
            query: ({ fromPlace, toPlace, vehicleType = 'truck' }) =>
                `/routes/plan-by-name?fromPlace=${encodeURIComponent(fromPlace)}&toPlace=${encodeURIComponent(toPlace)}&vehicleType=${vehicleType}`,
        }),

        // Поиск мест - query для GET
        findPlace: builder.query<GeoLocation[], {
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

        // Погода на маршруте - mutation для POST
        getRouteWeatherForecast: builder.mutation<RouteWeatherForecast, {
            route: RouteResponse
            departureTime?: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/routes/weather-forecast${departureTime ? `?departureTime=${departureTime}` : ''}`,
                method: 'POST',
                body: route,
            }),
        }),

        // Погодные предупреждения - mutation для POST
        getWeatherHazards: builder.mutation<WeatherHazardWarning[], {
            route: RouteResponse
            departureTime?: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/routes/weather-hazards${departureTime ? `?departureTime=${departureTime}` : ''}`,
                method: 'POST',
                body: route,
            }),
        }),
    }),
})

export const {
    useGetRoutesQuery,
    useGetRouteQuery,
    useCreateRouteMutation,
    useUpdateRouteMutation,
    useDeleteRouteMutation,
    useCalculateRouteMutation, // Правильное название для mutation
    usePlanRouteQuery,
    usePlanRouteByNamesQuery,
    useFindPlaceQuery,
    useGetRouteWeatherForecastMutation,
    useGetWeatherHazardsMutation,
} = routesSlice