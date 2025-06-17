import { apiSlice } from './apiSlice';

export interface GeoPoint {
    lat: number;
    lon: number;
    displayName?: string;
}

export interface GeoLocationDto {
    id?: number;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    type?: string;
    provider?: string;
    // Добавляем поля для обратной совместимости
    lat?: number;
    lon?: number;
    displayName?: string;
    osmId?: string;
    osmType?: string;
    category?: string;
    importance?: number;
    icon?: string;
    address?: {
        house_number?: string;
        road?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

export const geocodingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        geocode: builder.query<GeoPoint, string>({
            query: (placeName: string) => ({
                url: '/geocoding/geocode',
                params: { placeName },
            }),
            providesTags: ['Geocoding'],
        }),
        reverseGeocode: builder.query<GeoLocationDto, { lat: number; lon: number }>({
            query: ({ lat, lon }: { lat: number; lon: number }) => ({
                url: '/geocoding/reverse',
                params: { lat, lon },
            }),
            providesTags: ['Geocoding'],
        }),
        searchPlaces: builder.query<GeoLocationDto[], {
            query?: string;
            osmTag?: string;
            limit?: number;
            lat?: number;
            lon?: number;
        }>({
            query: (params: {
                query?: string;
                osmTag?: string;
                limit?: number;
                lat?: number;
                lon?: number;
            }) => ({
                url: '/geocoding/search',
                params,
            }),
            providesTags: ['Geocoding'],
        }),
        findFuelStations: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 5000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/fuel-stations',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findRestAreas: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 15000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/rest-areas',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findFoodStops: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 10000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/food-stops',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findParkingSpots: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 10000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/parking',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findLodging: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 20000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/lodging',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findAtms: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 5000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/atms',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findPharmacies: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 5000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/pharmacies',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
        findHospitals: builder.query<GeoLocationDto[], {
            lat: number;
            lon: number;
            radius?: number;
        }>({
            query: ({ lat, lon, radius = 10000 }: {
                lat: number;
                lon: number;
                radius?: number;
            }) => ({
                url: '/geocoding/hospitals',
                params: { lat, lon, radius },
            }),
            providesTags: ['Geocoding'],
        }),
    }),
});

export const {
    useGeocodeQuery,
    useLazyGeocodeQuery,
    useReverseGeocodeQuery,
    useLazyReverseGeocodeQuery,
    useSearchPlacesQuery,
    useLazySearchPlacesQuery,
    useFindFuelStationsQuery,
    useLazyFindFuelStationsQuery,
    useFindRestAreasQuery,
    useLazyFindRestAreasQuery,
    useFindFoodStopsQuery,
    useLazyFindFoodStopsQuery,
    useFindParkingSpotsQuery,
    useLazyFindParkingSpotsQuery,
    useFindLodgingQuery,
    useLazyFindLodgingQuery,
    useFindAtmsQuery,
    useLazyFindAtmsQuery,
    useFindPharmaciesQuery,
    useLazyFindPharmaciesQuery,
    useFindHospitalsQuery,
    useLazyFindHospitalsQuery,
} = geocodingApi; 