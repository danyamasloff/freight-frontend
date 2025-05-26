import { apiSlice } from './apiSlice'
import type { GeoPoint, GeoLocation } from '@/shared/types/api'

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
    }),
})

export const {
    useGeocodeQuery,
    useReverseGeocodeQuery,
    useSearchPlacesQuery,
    useFindPlaceQuery,
    useGetFuelStationsQuery,
    useGetRestAreasQuery,
    useGetFoodStopsQuery,
    useGetParkingQuery,
    useGetLodgingQuery,
    useGetAtmsQuery,
    useGetPharmaciesQuery,
    useGetHospitalsQuery,
} = geocodingSlice