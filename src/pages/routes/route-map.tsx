import React, { useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    MapPin,
    Navigation,
    Clock,
    Ruler,
    Fuel,
    Route as RouteIcon,
    Settings,
    Save,
    RefreshCw
} from 'lucide-react'

import { RouteMap } from '@/features/maps/components/route-map'
import { RouteType, type MapWaypoint, type RouteGeometry } from '@/features/maps/types'
import { useGetRouteQuery, useUpdateRouteMutation } from '@/shared/api/routesSlice'
import { formatDistance, formatDuration } from '@/shared/utils/format'

export function RouteMapPage() {
    const { id } = useParams<{ id: string }>()
    const routeId = id ? parseInt(id, 10) : null

    const {
        data: route,
        isLoading,
        error
    } = useGetRouteQuery(routeId!, { skip: !routeId })

    const [updateRoute] = useUpdateRouteMutation()

    const [routeType, setRouteType] = useState<RouteType>(RouteType.TRUCK)
    const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Convert route data to waypoints format
    const waypoints: MapWaypoint[] = useMemo(() => {
        if (!route) return []

        const points: MapWaypoint[] = []

        // Start point
        if (route.coordinates && route.coordinates.length > 0) {
            points.push({
                id: 'start',
                coordinates: route.coordinates[0],
                address: route.startAddress,
                label: 'Точка отправления',
                color: '#22c55e',
                draggable: true
            })
        }

        // Waypoints if any
        if (route.waypoints) {
            route.waypoints.forEach((waypoint, index) => {
                points.push({
                    id: `waypoint-${index}`,
                    coordinates: [waypoint.lng, waypoint.lat],
                    address: waypoint.address,
                    label: `Промежуточная точка ${index + 1}`,
                    color: '#f59e0b',
                    draggable: true
                })
            })
        }

        // End point
        if (route.coordinates && route.coordinates.length > 0) {
            const lastCoordinate = route.coordinates[route.coordinates.length - 1]
            points.push({
                id: 'end',
                coordinates: lastCoordinate,
                address: route.endAddress,
                label: 'Точка назначения',
                color: '#ef4444',
                draggable: true
            })
        }

        return points
    }, [route])

    // Initial route geometry from loaded route data
    const initialRouteGeometry: RouteGeometry | null = useMemo(() => {
        if (!route?.coordinates) return null

        return {
            coordinates: route.coordinates,
            distance: route.distance,
            duration: route.duration,
            instructions: route.instructions
        }
    }, [route])

    // Handle waypoint changes
    const handleWaypointChange = useCallback((updatedWaypoint: MapWaypoint) => {
        setHasUnsavedChanges(true)
        // Handle waypoint position updates
        console.log('Waypoint updated:', updatedWaypoint)
    }, [])

    // Handle route geometry changes
    const handleRouteChange = useCallback((geometry: RouteGeometry) => {
        setRouteGeometry(geometry)
        setHasUnsavedChanges(true)
    }, [])

    // Handle route type change
    const handleRouteTypeChange = useCallback((type: RouteType) => {
        setRouteType(type)
        setHasUnsavedChanges(true)
    }, [])

    // Save route changes
    const handleSaveChanges = useCallback(async () => {
        if (!route || !routeGeometry) return

        try {
            await updateRoute({
                id: route.id,
                data: {
                    ...route,
                    distance: routeGeometry.distance,
                    duration: routeGeometry.duration,
                    coordinates: routeGeometry.coordinates,
                }
            }).unwrap()

            setHasUnsavedChanges(false)
        } catch (error) {
            console.error('Failed to save route:', error)
        }
    }, [route, routeGeometry, updateRoute])

    // Reset changes
    const handleResetChanges = useCallback(() => {
        setRouteGeometry(initialRouteGeometry)
        setHasUnsavedChanges(false)
    }, [initialRouteGeometry])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !route) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Card className="w-96">
                    <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">
                            {error ? 'Ошибка загрузки маршрута' : 'Маршрут не найден'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const displayedGeometry = routeGeometry || initialRouteGeometry

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Карта маршрута</h1>
                    <p className="text-muted-foreground">
                        {route.name} • {route.startAddress} → {route.endAddress}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleResetChanges}
                                size="sm"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Сбросить
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                size="sm"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить изменения
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Route info */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RouteIcon className="h-5 w-5" />
                                Информация о маршруте
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">Откуда:</span>
                                </div>
                                <p className="text-sm font-medium">{route.startAddress}</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-muted-foreground">Куда:</span>
                                </div>
                                <p className="text-sm font-medium">{route.endAddress}</p>
                            </div>

                            {displayedGeometry && (
                                <>
                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm text-muted-foreground">Расстояние</span>
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {formatDistance(displayedGeometry.distance)}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm text-muted-foreground">Время</span>
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {formatDuration(displayedGeometry.duration)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">Статус маршрута</span>
                                <Badge variant={
                                    route.status === 'COMPLETED' ? 'default' :
                                        route.status === 'IN_PROGRESS' ? 'secondary' :
                                            route.status === 'CANCELLED' ? 'destructive' :
                                                'outline'
                                }>
                                    {route.status}
                                </Badge>
                            </div>

                            {route.estimatedCost && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Fuel className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-muted-foreground">Стоимость</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {route.estimatedCost.toLocaleString('ru-RU')} ₽
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Route type controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Тип маршрута
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(RouteType).map((type) => (
                                    <Button
                                        key={type}
                                        variant={routeType === type ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleRouteTypeChange(type)}
                                    >
                                        {type === RouteType.TRUCK && 'Грузовик'}
                                        {type === RouteType.DRIVING && 'Автомобиль'}
                                        {type === RouteType.WALKING && 'Пешком'}
                                        {type === RouteType.TRANSIT && 'Транспорт'}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map */}
                <div className="lg:col-span-3">
                    <Card className="h-[calc(100vh-300px)]">
                        <CardContent className="p-0 h-full">
                            <RouteMap
                                className="h-full w-full relative"
                                waypoints={waypoints}
                                routeType={routeType}
                                routeGeometry={displayedGeometry}
                                onWaypointChange={handleWaypointChange}
                                onRouteChange={handleRouteChange}
                                height="100%"
                                width="100%"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}