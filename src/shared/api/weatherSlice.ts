import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
    WeatherData,
    WeatherForecast,
    RouteWeatherForecast,
    WeatherHazardWarning,
    RouteResponse,
    RoutePointWeather
} from '@/shared/types/api'

// Типы для погодных данных
export interface WeatherDataDto {
    temperature: number
    feelsLike?: number
    humidity: number
    pressure: number
    windSpeed: number
    windDirection?: number
    cloudiness?: number
    visibility?: number
    rainVolume1h?: number
    rainVolume3h?: number
    snowVolume1h?: number
    snowVolume3h?: number
    weatherId?: number
    weatherMain?: string
    weatherDescription?: string
    weatherIcon?: string
    sunrise?: string
    sunset?: string
    cityName?: string
    forecastTime?: string
    riskScore?: number
}

export interface WeatherForecastDto {
    cityName: string
    cityCountry?: string
    forecasts: WeatherDataDto[]
}

export interface RoutePointWeatherDto {
    pointIndex: number
    distanceFromStart: number
    estimatedTime: string
    weatherData: WeatherDataDto
}

export interface WeatherHazardWarningDto {
    hazardType: string
    severity: string
    distanceFromStart: number
    expectedTime: string
    description: string
    recommendation: string
}

export interface RouteWeatherForecastDto {
    departureTime: string
    pointForecasts: RoutePointWeatherDto[]
    hazardWarnings: WeatherHazardWarningDto[]
}

// API slice для погоды
export const weatherApi = createApi({
    reducerPath: 'weatherApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/weather',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        // Текущая погода
        getCurrentWeather: builder.query<WeatherDataDto, { lat: number, lon: number }>({
            query: ({ lat, lon }) => ({
                url: '/current',
                params: { lat, lon }
            }),
        }),

        // Прогноз погоды
        getWeatherForecast: builder.query<WeatherForecastDto, { lat: number, lon: number }>({
            query: ({ lat, lon }) => ({
                url: '/forecast',
                params: { lat, lon }
            }),
        }),

        // Прогноз погоды для времени прибытия
        getWeatherForArrival: builder.query<WeatherDataDto, {
            lat: number,
            lon: number,
            arrivalTime: string
        }>({
            query: ({ lat, lon, arrivalTime }) => ({
                url: '/forecast-for-arrival',
                params: { lat, lon, arrivalTime }
            }),
        }),

        // Прогноз погоды для маршрута
        getRouteWeatherForecast: builder.mutation<RouteWeatherForecastDto, {
            route: any,
            departureTime?: string
        }>({
            query: ({ route, departureTime }) => ({
                url: '/route-forecast',
                method: 'POST',
                body: route,
                params: departureTime ? { departureTime } : {}
            }),
        }),

        // Предупреждения о погодных опасностях
        getHazardWarnings: builder.mutation<WeatherHazardWarningDto[], {
            route: any,
            departureTime?: string
        }>({
            query: ({ route, departureTime }) => ({
                url: '/hazard-warnings',
                method: 'POST',
                body: route,
                params: departureTime ? { departureTime } : {}
            }),
        }),
    }),
})

export const {
    useGetCurrentWeatherQuery,
    useGetWeatherForecastQuery,
    useGetWeatherForArrivalQuery,
    useGetRouteWeatherForecastMutation,
    useGetHazardWarningsMutation,
} = weatherApi