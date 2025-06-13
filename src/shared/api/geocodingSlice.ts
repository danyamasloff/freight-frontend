import { apiSlice } from './apiSlice'
import type { GeoPoint, GeoLocation } from '@/shared/types/api'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface GeocodingResult {
    lat: number;
    lon: number;
    display_name: string;
    importance: number;
    place_id?: string;
    osm_id?: string;
    address?: {
        country?: string;
        country_code?: string;
        state?: string;
        city?: string;
        town?: string;
        village?: string;
        road?: string;
        house_number?: string;
        postcode?: string;
    };
}

export interface ReverseGeocodingResult extends GeocodingResult {
    addresstype: string;
    category: string;
    type: string;
}

export interface GeoLocationDto {
    id?: number
    name: string
    description: string
    latitude: number
    longitude: number
    type: string
    provider: string
}

export const geocodingSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        geocode: builder.query<GeoPoint, string>({
            query: (placeName) => `/geocoding/geocode?placeName=${encodeURIComponent(placeName)}`,
        }),
        reverseGeocode: builder.query<GeoLocation, { lat: number; lon: number }>({
            query: ({ lat, lon }) => `/geocoding/reverse?lat=${lat}&lon=${lon}`,
        }),
        searchPlaces: builder.query<GeoLocation[], {
            query?: string
            osmTag?: string
            limit?: number
            lat?: number
            lon?: number
        }>({
            query: (params) => {
                const searchParams = new URLSearchParams()
                if (params.query) searchParams.append('query', params.query)
                if (params.osmTag) searchParams.append('osmTag', params.osmTag)
                if (params.limit) searchParams.append('limit', params.limit.toString())
                if (params.lat) searchParams.append('lat', params.lat.toString())
                if (params.lon) searchParams.append('lon', params.lon.toString())
                return `/geocoding/search?${searchParams}`
            },
        }),
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
        getFuelStations: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 5000 }) =>
                `/geocoding/fuel-stations?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getRestAreas: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 15000 }) =>
                `/geocoding/rest-areas?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getFoodStops: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 10000 }) =>
                `/geocoding/food-stops?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getParking: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 10000 }) =>
                `/geocoding/parking?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getLodging: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 20000 }) =>
                `/geocoding/lodging?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getAtms: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 5000 }) =>
                `/geocoding/atms?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getPharmacies: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 5000 }) =>
                `/geocoding/pharmacies?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        getHospitals: builder.query<GeoLocation[], {
            lat: number
            lon: number
            radius?: number
        }>({
            query: ({ lat, lon, radius = 10000 }) =>
                `/geocoding/hospitals?lat=${lat}&lon=${lon}&radius=${radius}`,
        }),
        geocodeAddress: builder.query<GeocodingResult[], string>({
            query: (address) => ({
                url: '/api/geocoding/search',
                params: { 
                    q: address,
                    format: 'json',
                    limit: 10,
                    addressdetails: 1,
                    accept_language: 'ru'
                }
            }),
            transformResponse: (response: any[]) => {
                // Фильтруем и сортируем результаты по важности
                return response
                    .filter(item => item.lat && item.lon)
                    .map(item => ({
                        lat: parseFloat(item.lat),
                        lon: parseFloat(item.lon),
                        display_name: item.display_name,
                        importance: item.importance || 0,
                        place_id: item.place_id,
                        osm_id: item.osm_id,
                        address: item.address
                    }))
                    .sort((a, b) => b.importance - a.importance);
            },
        }),
        reverseGeocodeAddress: builder.query<ReverseGeocodingResult, { lat: number; lon: number }>({
            query: ({ lat, lon }) => ({
                url: '/api/geocoding/reverse',
                params: { 
                    lat: lat.toString(),
                    lon: lon.toString(),
                    format: 'json',
                    addressdetails: 1,
                    accept_language: 'ru'
                }
            }),
            transformResponse: (response: any) => ({
                lat: parseFloat(response.lat),
                lon: parseFloat(response.lon),
                display_name: response.display_name,
                importance: response.importance || 0,
                place_id: response.place_id,
                osm_id: response.osm_id,
                address: response.address,
                addresstype: response.addresstype,
                category: response.category,
                type: response.type
            }),
        }),
        findNearbyPOI: builder.query<GeocodingResult[], { 
            lat: number; 
            lon: number; 
            radius?: number; 
            category?: string 
        }>({
            query: ({ lat, lon, radius = 5000, category = 'amenity' }) => ({
                url: '/api/geocoding/nearby',
                params: {
                    lat: lat.toString(),
                    lon: lon.toString(),
                    radius: radius.toString(),
                    category,
                    format: 'json',
                    limit: 20
                }
            }),
        }),
        autocompleteAddress: builder.query<GeocodingResult[], { 
            query: string; 
            countryCode?: string;
            bounded?: boolean;
            viewbox?: string;
        }>({
            query: ({ query, countryCode = 'RU', bounded = true, viewbox }) => ({
                url: '/api/geocoding/autocomplete',
                params: {
                    q: query,
                    countrycodes: countryCode,
                    bounded: bounded ? '1' : '0',
                    viewbox: viewbox || '19.6,41.2,169.6,82.1', // Россия
                    format: 'json',
                    limit: 5,
                    addressdetails: 1,
                    accept_language: 'ru'
                }
            }),
            // Кеширование на 5 минут для автокомплита
            keepUnusedDataFor: 300,
        }),
    }),
})

export const {
    useGeocodeQuery,
    useFindPlaceQuery,
    useGetFuelStationsQuery,
    useGetRestAreasQuery,
    useGetFoodStopsQuery,
    useGetParkingQuery,
    useGetLodgingQuery,
    useGetAtmsQuery,
    useGetPharmaciesQuery,
    useGetHospitalsQuery,
    useGeocodeAddressQuery: useGeocodeAddressQueryOriginal,
    useLazyGeocodeAddressQuery,
    useLazyReverseGeocodeQuery,
    useFindNearbyPOIQuery,
    useAutocompleteAddressQuery,
    useLazyAutocompleteAddressQuery,
} = geocodingSlice

// API slice для новых endpoint'ов с GraphHopper
export const geocodingApi = createApi({
    reducerPath: 'geocodingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        // Автокомплит для поиска мест через GraphHopper
        autocompletePlace: builder.query<GeoLocationDto[], string>({
            query: (query) => ({
                url: '/routes/autocomplete',
                params: { 
                    query,
                    limit: 5 
                }
            }),
        }),

        // Геокодирование места по названию через GraphHopper
        geocodePlace: builder.query<GeoLocationDto, string>({
            query: (placeName) => ({
                url: '/routes/geocode-place',
                params: { placeName }
            }),
        }),

        // Поиск АЗС через GraphHopper
        findFuelStations: builder.query<GeoLocationDto[], {
            lat: number,
            lon: number,
            radius?: number
        }>({
            query: ({ lat, lon, radius = 5000 }) => ({
                url: '/geocoding/fuel-stations',
                params: { lat, lon, radius }
            }),
        }),

        // Поиск зон отдыха через GraphHopper
        findRestAreas: builder.query<GeoLocationDto[], {
            lat: number,
            lon: number,
            radius?: number
        }>({
            query: ({ lat, lon, radius = 15000 }) => ({
                url: '/geocoding/rest-areas',
                params: { lat, lon, radius }
            }),
        }),
    }),
})

export const {
    useAutocompletePlaceQuery,
    useGeocodePlaceQuery,
    useFindFuelStationsQuery,
    useFindRestAreasQuery,
} = geocodingApi

// Для совместимости с существующим кодом - используем hooks из первого API
export const useGeocodeAddressQuery = useAutocompleteAddressQuery
export const useSearchPlacesQuery = useGeocodePlaceQuery
export const useReverseGeocodeQuery = useLazyReverseGeocodeQuery