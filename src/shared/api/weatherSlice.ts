import { apiSlice } from './apiSlice'
import type {
    WeatherData,
    WeatherForecast,
    RouteWeatherForecast,
    WeatherHazardWarning,
    RouteResponse,
    RoutePointWeather
} from '@/shared/types/api'

export const weatherSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Получить текущую погоду для указанных координат
        getCurrentWeather: builder.query<WeatherData, { lat: number; lon: number }>({
            query: ({ lat, lon }) => ({
                url: `/weather/current`,
                params: { lat, lon }
            }),
            providesTags: ['Weather'],
        }),

        // Получить 5-дневный прогноз погоды для указанных координат
        getWeatherForecast: builder.query<WeatherForecast, { lat: number; lon: number }>({
            query: ({ lat, lon }) => ({
                url: `/weather/forecast`,
                params: { lat, lon }
            }),
            providesTags: ['Weather'],
        }),

        // Получить прогноз погоды для маршрута с учетом времени движения
        getRouteWeatherForecast: builder.mutation<RouteWeatherForecast, {
            route: RouteResponse
            departureTime: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/weather/route-forecast`,
                method: 'POST',
                body: route,
                params: { 
                    departureTime: new Date(departureTime).toISOString()
                },
            }),
            invalidatesTags: ['Weather'],
        }),

        // Получить предупреждения о погодных опасностях на маршруте
        getHazardWarnings: builder.mutation<WeatherHazardWarning[], {
            route: RouteResponse
            departureTime: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/weather/hazard-warnings`,
                method: 'POST',
                body: route,
                params: { 
                    departureTime: new Date(departureTime).toISOString()
                },
            }),
            invalidatesTags: ['Weather'],
        }),

        // Анализ погодных рисков для конкретной точки и времени
        analyzeWeatherRisk: builder.query<number, {
            lat: number
            lon: number
            targetTime: string
        }>({
            query: ({ lat, lon, targetTime }) => ({
                url: `/weather/analyze-risk`,
                params: { 
                    lat, 
                    lon, 
                    targetTime: new Date(targetTime).toISOString()
                }
            }),
            providesTags: ['Weather'],
        }),

        // Получить прогноз погоды для конкретного времени (для точки маршрута)
        getForecastForTime: builder.query<WeatherData, {
            lat: number
            lon: number
            targetTime: string
        }>({
            query: ({ lat, lon, targetTime }) => ({
                url: `/weather/forecast-for-time`,
                params: { 
                    lat, 
                    lon, 
                    targetTime: new Date(targetTime).toISOString()
                }
            }),
            providesTags: ['Weather'],
        }),
    }),
})

export const {
    useGetCurrentWeatherQuery,
    useGetWeatherForecastQuery,
    useGetRouteWeatherForecastMutation,
    useGetHazardWarningsMutation,
    useAnalyzeWeatherRiskQuery,
    useGetForecastForTimeQuery,
    useLazyGetCurrentWeatherQuery,
    useLazyGetWeatherForecastQuery,
    useLazyAnalyzeWeatherRiskQuery,
    useLazyGetForecastForTimeQuery,
} = weatherSlice