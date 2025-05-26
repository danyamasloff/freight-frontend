import { useCallback, useMemo } from 'react'
import { useGeolocation } from '@/hooks/use-geolocation'
import {
    useSearchPlacesQuery,
    useGetFuelStationsQuery,
    useGetFoodStopsQuery,
    useGetParkingQuery,
    useGetLodgingQuery,
    useGetAtmsQuery,
    useGetPharmaciesQuery,
    useGetHospitalsQuery,
    useGetRestAreasQuery,
} from '@/shared/api/geocodingSlice'
import type { POICategory, GeoLocation } from '@/shared/types/api'

export interface UseGeocodingOptions {
    defaultRadius?: number
    enableAutoLocation?: boolean
}

export function useGeocoding(options: UseGeocodingOptions = {}) {
    const { defaultRadius = 10000, enableAutoLocation = true } = options
    const { position, getCurrentPosition, isLoading: geoLoading } = useGeolocation()

    const searchParams = useMemo(() => ({
        lat: position?.latitude || 0,
        lon: position?.longitude || 0,
        radius: defaultRadius,
    }), [position, defaultRadius])

    const shouldSkip = !position?.latitude || !position?.longitude

    // POI queries - все доступные категории
    const fuelQuery = useGetFuelStationsQuery(searchParams, { skip: shouldSkip })
    const foodQuery = useGetFoodStopsQuery(searchParams, { skip: shouldSkip })
    const parkingQuery = useGetParkingQuery(searchParams, { skip: shouldSkip })
    const lodgingQuery = useGetLodgingQuery(searchParams, { skip: shouldSkip })
    const atmsQuery = useGetAtmsQuery(searchParams, { skip: shouldSkip })
    const pharmaciesQuery = useGetPharmaciesQuery(searchParams, { skip: shouldSkip })
    const hospitalsQuery = useGetHospitalsQuery(searchParams, { skip: shouldSkip })
    const restAreasQuery = useGetRestAreasQuery(searchParams, { skip: shouldSkip })

    const searchNearbyPOI = useCallback((category: POICategory, radius?: number) => {
        if (!position) return { data: [], isLoading: false, error: null }

        switch (category) {
            case 'fuel':
                return fuelQuery
            case 'food':
                return foodQuery
            case 'parking':
                return parkingQuery
            case 'lodging':
                return lodgingQuery
            case 'atms':
                return atmsQuery
            case 'pharmacies':
                return pharmaciesQuery
            case 'hospitals':
                return hospitalsQuery
            default:
                return { data: [], isLoading: false, error: null }
        }
    }, [position, fuelQuery, foodQuery, parkingQuery, lodgingQuery, atmsQuery, pharmaciesQuery, hospitalsQuery])

    const calculateDistance = useCallback((place: GeoLocation): number => {
        if (!position) return 0

        const R = 6371 // Радиус Земли в км
        const dLat = (place.latitude - position.latitude) * Math.PI / 180
        const dLon = (place.longitude - position.longitude) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(position.latitude * Math.PI / 180) * Math.cos(place.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c * 1000 // в метрах
    }, [position])

    const formatDistance = useCallback((distance: number): string => {
        return distance < 1000 ? `${Math.round(distance)} м` : `${(distance / 1000).toFixed(1)} км`
    }, [])

    // Функция для поиска конкретного типа POI
    const searchPOI = useCallback((category: POICategory, customRadius?: number) => {
        if (!position) return null

        const params = {
            lat: position.latitude,
            lon: position.longitude,
            radius: customRadius || defaultRadius
        }

        switch (category) {
            case 'fuel':
                return useGetFuelStationsQuery(params)
            case 'food':
                return useGetFoodStopsQuery(params)
            case 'parking':
                return useGetParkingQuery(params)
            case 'lodging':
                return useGetLodgingQuery(params)
            case 'atms':
                return useGetAtmsQuery(params)
            case 'pharmacies':
                return useGetPharmaciesQuery(params)
            case 'hospitals':
                return useGetHospitalsQuery(params)
            default:
                return null
        }
    }, [position, defaultRadius])

    return {
        position,
        getCurrentPosition,
        isLocationLoading: geoLoading,
        searchNearbyPOI,
        searchPOI,
        calculateDistance,
        formatDistance,
        queries: {
            fuel: fuelQuery,
            food: foodQuery,
            parking: parkingQuery,
            lodging: lodgingQuery,
            atms: atmsQuery,
            pharmacies: pharmaciesQuery,
            hospitals: hospitalsQuery,
            restAreas: restAreasQuery,
        }
    }
}