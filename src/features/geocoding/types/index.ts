import { LucideIcon } from 'lucide-react'

export interface POICategory {
    id: string
    label: string
    icon: LucideIcon
    description: string
    defaultRadius: number
    maxRadius: number
    osmTags: string[]
}

export interface POISearchResult {
    id: string
    name: string
    category: string
    distance?: number
    coordinates: [number, number]
    address?: string
    additionalInfo?: Record<string, any>
}

export interface POIFilter {
    category?: string
    radius?: number
    sortBy?: 'distance' | 'name' | 'rating'
    limit?: number
}

export interface GeocodingState {
    currentLocation: {
        latitude: number
        longitude: number
    } | null
    lastSearchQuery: string
    searchHistory: string[]
    favoriteLocations: any[]
}

export interface PlaceSearchOptions {
    useCurrentLocation?: boolean
    showDistance?: boolean
    groupByCategory?: boolean
    autoExpand?: boolean
}