export type LngLat = [number, number]

export enum RouteType {
    DRIVING = 'driving',
    TRUCK = 'truck',
    WALKING = 'walking',
    TRANSIT = 'transit',
}

export interface MapWaypoint {
    id: string
    coordinates: LngLat
    address?: string
    label: string
    draggable?: boolean
    color?: string
}

export interface RouteGeometry {
    coordinates: LngLat[]
    distance: number
    duration: number
    instructions?: RouteInstruction[]
}

export interface RouteInstruction {
    text: string
    distance: number
    duration: number
    coordinates: LngLat
}

export interface MapBounds {
    southwest: LngLat
    northeast: LngLat
}

export interface RouteData {
    geometry: RouteGeometry
    bounds: MapBounds
    type: RouteType
    waypoints: MapWaypoint[]
}

// Yandex Maps API types
export interface YMapsInstance {
    multiRouter: {
        MultiRoute: new (config: any, options: any) => YMapsMultiRoute
    }
    route: (points: LngLat[], options?: any) => Promise<YMapsRoute>
    geocode: (address: string, options?: any) => Promise<any>
}

export interface YMapsMultiRoute {
    model: {
        events: {
            add: (event: string, callback: () => void) => void
        }
    }
    getActiveRoute: () => YMapsRoute | null
}

export interface YMapsRoute {
    geometry: {
        getCoordinates: () => LngLat[]
    }
    getBounds: () => [LngLat, LngLat]
    properties: {
        get: (property: string) => number
    }
}

export interface PlacemarkDragEvent {
    originalEvent: {
        target: {
            geometry: {
                getCoordinates(): LngLat
            }
        }
    }
}