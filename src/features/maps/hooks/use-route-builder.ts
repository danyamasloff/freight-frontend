import { useCallback, useRef } from 'react'
import type {
    LngLat,
    RouteType,
    YMapsInstance,
    RouteGeometry
} from '../types'

interface UseRouteBuilderReturn {
    buildRoute: (
        points: LngLat[],
        type: RouteType,
        onSuccess: (geometry: RouteGeometry) => void,
        onError?: (error: Error) => void
    ) => void
    isBuilding: boolean
}

export function useRouteBuilder(
    ymaps: YMapsInstance | null,
    mapInstance: ymaps.Map | null
): UseRouteBuilderReturn {
    const isBuilding = useRef(false)

    const buildRoute = useCallback((
        points: LngLat[],
        type: RouteType,
        onSuccess: (geometry: RouteGeometry) => void,
        onError?: (error: Error) => void
    ) => {
        if (!ymaps || !mapInstance || points.length < 2) {
            return
        }

        if (isBuilding.current) {
            return
        }

        isBuilding.current = true

        try {
            // Convert route type to Yandex Maps routing mode
            const routingModeMap = {
                [RouteType.DRIVING]: 'auto',
                [RouteType.TRUCK]: 'truck',
                [RouteType.WALKING]: 'pedestrian',
                [RouteType.TRANSIT]: 'masstransit',
            }

            const multiRoute = new ymaps.multiRouter.MultiRoute(
                {
                    referencePoints: points,
                    params: {
                        routingMode: routingModeMap[type],
                        avoidTrafficJams: type === RouteType.TRUCK,
                    }
                },
                {
                    wayPointVisible: false,
                    boundsAutoApply: false,
                    routeStrokeWidth: 5,
                    routeStrokeColor: type === RouteType.TRUCK ? '#ff6b35' : '#3b82f6',
                }
            )

            multiRoute.model.events.add('requestsuccess', () => {
                const activeRoute = multiRoute.getActiveRoute()

                if (activeRoute) {
                    const coordinates = activeRoute.geometry.getCoordinates()
                    const distance = activeRoute.properties.get('distance') || 0
                    const duration = activeRoute.properties.get('duration') || 0

                    onSuccess({
                        coordinates,
                        distance,
                        duration,
                    })
                }

                // Clean up
                mapInstance.geoObjects.remove(multiRoute as unknown as ymaps.IGeoObject)
                isBuilding.current = false
            })

            multiRoute.model.events.add('requesterror', () => {
                const error = new Error('Failed to build route')
                onError?.(error)
                mapInstance.geoObjects.remove(multiRoute as unknown as ymaps.IGeoObject)
                isBuilding.current = false
            })

            // Add to map temporarily for calculation
            mapInstance.geoObjects.add(multiRoute as unknown as ymaps.IGeoObject)

        } catch (error) {
            isBuilding.current = false
            onError?.(error instanceof Error ? error : new Error('Unknown error'))
        }
    }, [ymaps, mapInstance])

    return {
        buildRoute,
        isBuilding: isBuilding.current
    }
}