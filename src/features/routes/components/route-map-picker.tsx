import React, { useCallback, useRef, useState } from 'react'
import { YMaps, Map, Placemark, GeolocationControl, TrafficControl, RoutePanel } from '@pbe/react-yandex-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    MapPin,
    Navigation,
    Trash2,
    RotateCcw,
    Route as RouteIcon,
    Clock,
    Fuel,
    AlertTriangle,
    Map as MapIconLucide,
    Traffic,
    Crosshair,
    Target,
    CheckCircle2
} from 'lucide-react'
import { formatDistance, formatDuration } from '@/shared/utils/format'
import { useToast } from '@/hooks/use-toast'

interface RouteMapPickerProps {
    startAddress?: string
    endAddress?: string
    startCoords?: [number, number]
    endCoords?: [number, number]
    waypoints?: Array<{ lat: number; lng: number; address?: string }>
    onStartChange?: (coords: [number, number], address?: string) => void
    onEndChange?: (coords: [number, number], address?: string) => void
    onWaypointsChange?: (waypoints: Array<{ lat: number; lng: number; address?: string }>) => void
    onRouteBuilt?: (route: {
        distance: number
        duration: number
        coordinates: [number, number][]
        instructions?: any[]
    }) => void
    className?: string
}

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY

export function RouteMapPicker({
                                   startAddress,
                                   endAddress,
                                   startCoords,
                                   endCoords,
                                   waypoints = [],
                                   onStartChange,
                                   onEndChange,
                                   onWaypointsChange,
                                   onRouteBuilt,
                                   className
                               }: RouteMapPickerProps) {
    const mapRef = useRef<any>(null)
    const ymapsRef = useRef<any>(null)
    const routePanelRef = useRef<any>(null)
    const [mapCenter, setMapCenter] = useState<[number, number]>([55.751574, 37.573856])
    const [routeInfo, setRouteInfo] = useState<{
        distance: number
        duration: number
        coordinates: [number, number][]
        instructions?: any[]
    } | null>(null)
    const [trafficEnabled, setTrafficEnabled] = useState(false)
    const [isRouteBuilding, setIsRouteBuilding] = useState(false)
    const { toast } = useToast()

    const handleMapLoad = useCallback((ymaps: any) => {
        ymapsRef.current = ymaps
        console.log('Yandex Maps API loaded')
    }, [])

    const handleMapReady = useCallback((map: any) => {
        mapRef.current = map
        console.log('Map ready')

        // Если есть начальные координаты, центрируем карту
        if (startCoords && endCoords) {
            const bounds = ymapsRef.current?.util.bounds.fromPoints([startCoords, endCoords])
            if (bounds) {
                map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 })
            }
        } else if (startCoords) {
            map.setCenter(startCoords, 13)
        }
    }, [startCoords, endCoords])

    const handleRoutePanelLoad = useCallback((routePanel: any) => {
        console.log('RoutePanel loaded:', routePanel)
        routePanelRef.current = routePanel

        if (!routePanel) return

        try {
            // Настройка RoutePanel
            routePanel.options.set({
                float: 'left',
                types: {
                    auto: true,
                    pedestrian: false,
                    masstransit: false,
                    taxi: false
                },
                routingMode: 'auto',
                showHeader: true,
                autofocus: false
            })

            // Установка начальных точек если они есть
            if (startCoords && endCoords) {
                const wayPointsData = [
                    { coordinates: startCoords, name: startAddress || 'Начальная точка' },
                    ...waypoints.map(wp => ({
                        coordinates: [wp.lat, wp.lng],
                        name: wp.address || 'Промежуточная точка'
                    })),
                    { coordinates: endCoords, name: endAddress || 'Конечная точка' }
                ]
                routePanel.state.set('waypoints', wayPointsData)
            }

            // Обработчик построения маршрута
            routePanel.events.add('routechange', () => {
                console.log('Route changed')
                setIsRouteBuilding(true)

                try {
                    const route = routePanel.getRoute()
                    if (route) {
                        const activeRoute = route.getActiveRoute()
                        if (activeRoute) {
                            const coordinates = activeRoute.geometry.getCoordinates()
                            const distance = activeRoute.properties.get('distance') || 0
                            const duration = activeRoute.properties.get('duration') || 0
                            const instructions = activeRoute.properties.get('segments') || []

                            const routeData = {
                                distance,
                                duration,
                                coordinates,
                                instructions
                            }

                            setRouteInfo(routeData)
                            onRouteBuilt?.(routeData)

                            // Получаем точки маршрута из RoutePanel
                            const wayPointsData = routePanel.state.get('waypoints')
                            if (wayPointsData && wayPointsData.length >= 2) {
                                const startPoint = wayPointsData[0]
                                const endPoint = wayPointsData[wayPointsData.length - 1]

                                if (startPoint && startPoint.coordinates) {
                                    onStartChange?.(startPoint.coordinates, startPoint.name)
                                }

                                if (endPoint && endPoint.coordinates) {
                                    onEndChange?.(endPoint.coordinates, endPoint.name)
                                }

                                // Промежуточные точки
                                const intermediatePoints = wayPointsData.slice(1, -1).map((point: any) => ({
                                    lat: point.coordinates[0],
                                    lng: point.coordinates[1],
                                    address: point.name
                                }))

                                onWaypointsChange?.(intermediatePoints)
                            }

                            toast({
                                title: "Маршрут построен",
                                description: `${formatDistance(distance)} • ${formatDuration(duration)}`
                            })
                        }
                    }
                } catch (error) {
                    console.error('Error processing route:', error)
                    toast({
                        title: "Ошибка",
                        description: "Не удалось обработать маршрут",
                        variant: "destructive"
                    })
                } finally {
                    setIsRouteBuilding(false)
                }
            })

            // Обработчик ошибок построения маршрута
            routePanel.events.add('routeerror', (e: any) => {
                console.error('Route error:', e)
                setIsRouteBuilding(false)
                toast({
                    title: "Ошибка построения маршрута",
                    description: "Не удалось построить маршрут между указанными точками",
                    variant: "destructive"
                })
            })

        } catch (error) {
            console.error('Error setting up RoutePanel:', error)
        }
    }, [startCoords, endCoords, startAddress, endAddress, waypoints, onStartChange, onEndChange, onWaypointsChange, onRouteBuilt, toast])

    const clearRoute = useCallback(() => {
        if (routePanelRef.current) {
            try {
                routePanelRef.current.state.set('waypoints', [])
                setRouteInfo(null)
                toast({
                    title: "Маршрут очищен",
                    description: "Все точки маршрута удалены"
                })
            } catch (error) {
                console.error('Error clearing route:', error)
            }
        }
    }, [toast])

    const setCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
                    setMapCenter(coords)
                    if (mapRef.current) {
                        mapRef.current.setCenter(coords, 15)
                    }
                    toast({
                        title: "Местоположение определено",
                        description: "Карта перемещена к вашему местоположению"
                    })
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    toast({
                        title: "Ошибка геолокации",
                        description: "Не удалось определить местоположение",
                        variant: "destructive"
                    })
                }
            )
        } else {
            toast({
                title: "Геолокация недоступна",
                description: "Ваш браузер не поддерживает геолокацию",
                variant: "destructive"
            })
        }
    }, [toast])

    const toggleTraffic = useCallback(() => {
        setTrafficEnabled(!trafficEnabled)
        toast({
            title: trafficEnabled ? "Пробки скрыты" : "Пробки показаны",
            description: trafficEnabled ? "Слой пробок отключен" : "Слой пробок включен"
        })
    }, [trafficEnabled, toast])

    const fitToBounds = useCallback(() => {
        if (mapRef.current && routeInfo && routeInfo.coordinates.length > 0) {
            try {
                const bounds = ymapsRef.current?.util.bounds.fromPoints(routeInfo.coordinates)
                if (bounds) {
                    mapRef.current.setBounds(bounds, {
                        checkZoomRange: true,
                        zoomMargin: [50, 50, 50, 50]
                    })
                }
            } catch (error) {
                console.error('Error fitting to bounds:', error)
            }
        }
    }, [routeInfo])

    if (!YANDEX_API_KEY) {
        return (
            <Alert variant="destructive" className={className}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Не найден API ключ Yandex Maps. Проверьте переменную окружения VITE_YANDEX_MAPS_API_KEY.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="h-5 w-5 text-blue-600" />
                            Планирование маршрута
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={trafficEnabled ? "default" : "outline"}
                                size="sm"
                                onClick={toggleTraffic}
                            >
                                <Traffic className="h-4 w-4 mr-1" />
                                Пробки
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={setCurrentLocation}
                            >
                                <Crosshair className="h-4 w-4 mr-1" />
                                Моё место
                            </Button>
                            {routeInfo && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={fitToBounds}
                                >
                                    <Target className="h-4 w-4 mr-1" />
                                    Показать весь маршрут
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearRoute}
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Очистить
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Route Information */}
                    {routeInfo && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <RouteIcon className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Расстояние</div>
                                            <div className="font-semibold text-lg">{formatDistance(routeInfo.distance)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Время в пути</div>
                                            <div className="font-semibold text-lg">{formatDuration(routeInfo.duration)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Fuel className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Примерный расход</div>
                                            <div className="font-semibold text-lg">
                                                {Math.round((routeInfo.distance / 1000) * 0.25)} л
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="default" className="bg-green-600 gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Маршрут построен
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Building Route Status */}
                    {isRouteBuilding && (
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-b">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                                    Построение маршрута...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Map Container */}
                    <div className="relative">
                        <YMaps
                            query={{
                                apikey: YANDEX_API_KEY,
                                load: "package.full",
                                lang: "ru_RU"
                            }}
                        >
                            <Map
                                defaultState={{
                                    center: mapCenter,
                                    zoom: 10,
                                    controls: []
                                }}
                                width="100%"
                                height="600px"
                                options={{
                                    suppressMapOpenBlock: true,
                                    yandexMapDisablePoiInteractivity: true
                                }}
                                onLoad={handleMapLoad}
                                instanceRef={handleMapReady}
                            >
                                {/* Route Panel */}
                                <RoutePanel
                                    instanceRef={handleRoutePanelLoad}
                                    options={{
                                        float: 'left',
                                        maxWidth: '350px'
                                    }}
                                />

                                {/* Geolocation Control */}
                                <GeolocationControl
                                    options={{
                                        float: 'right',
                                        position: { top: 10, right: 10 }
                                    }}
                                />

                                {/* Traffic Control */}
                                <TrafficControl
                                    options={{
                                        float: 'right',
                                        position: { top: 60, right: 10 }
                                    }}
                                    state={{
                                        expanded: trafficEnabled
                                    }}
                                />

                                {/* Start Point Placemark */}
                                {startCoords && (
                                    <Placemark
                                        geometry={startCoords}
                                        options={{
                                            preset: 'islands#greenDotIconWithCaption',
                                            iconCaptionMaxWidth: '200'
                                        }}
                                        properties={{
                                            iconCaption: startAddress || 'Начальная точка',
                                            balloonContent: startAddress || 'Точка отправления'
                                        }}
                                    />
                                )}

                                {/* End Point Placemark */}
                                {endCoords && (
                                    <Placemark
                                        geometry={endCoords}
                                        options={{
                                            preset: 'islands#redDotIconWithCaption',
                                            iconCaptionMaxWidth: '200'
                                        }}
                                        properties={{
                                            iconCaption: endAddress || 'Конечная точка',
                                            balloonContent: endAddress || 'Точка назначения'
                                        }}
                                    />
                                )}

                                {/* Waypoints Placemarks */}
                                {waypoints.map((waypoint, index) => (
                                    <Placemark
                                        key={index}
                                        geometry={[waypoint.lat, waypoint.lng]}
                                        options={{
                                            preset: 'islands#blueDotIconWithCaption',
                                            iconCaptionMaxWidth: '200'
                                        }}
                                        properties={{
                                            iconCaption: waypoint.address || `Точка ${index + 1}`,
                                            balloonContent: waypoint.address || `Промежуточная точка ${index + 1}`
                                        }}
                                    />
                                ))}
                            </Map>
                        </YMaps>
                    </div>

                    {/* Map Instructions */}
                    <div className="p-4 bg-muted/30 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapIconLucide className="h-4 w-4" />
                            <span>
                                Используйте панель маршрутов слева для добавления точек или кликните по карте.
                                Включите пробки для актуальной информации о дорожной ситуации.
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}