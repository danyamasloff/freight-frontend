import { apiSlice } from './apiSlice'
import type {
    WeatherData,
    WeatherForecast,
    RouteWeatherForecast,
    WeatherHazardWarning,
    RouteResponse
} from '@/shared/types/api'

export const weatherSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentWeather: builder.query<WeatherData, { lat: number; lon: number }>({
            query: ({ lat, lon }) => `/weather/current?lat=${lat}&lon=${lon}`,
        }),
        getWeatherForecast: builder.query<WeatherForecast, { lat: number; lon: number }>({
            query: ({ lat, lon }) => `/weather/forecast?lat=${lat}&lon=${lon}`,
        }),
        getRouteWeatherForecast: builder.mutation<RouteWeatherForecast, {
            route: RouteResponse
            departureTime: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/weather/route-forecast?departureTime=${departureTime}`,
                method: 'POST',
                body: route,
            }),
        }),
        getHazardWarnings: builder.mutation<WeatherHazardWarning[], {
            route: RouteResponse
            departureTime: string
        }>({
            query: ({ route, departureTime }) => ({
                url: `/weather/hazard-warnings?departureTime=${departureTime}`,
                method: 'POST',
                body: route,
            }),
        }),
    }),
})

export const {
    useGetCurrentWeatherQuery,
    useGetWeatherForecastQuery,
    useGetRouteWeatherForecastMutation,
    useGetHazardWarningsMutation,
} = weatherSlice