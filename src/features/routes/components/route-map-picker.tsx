import React, { useCallback, useRef, useState, useEffect } from 'react'
import { YMaps, Map, Placemark, Polyline, GeolocationControl, TrafficControl, ZoomControl } from '@pbe/react-yandex-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    Crosshair,
    Target,
    CheckCircle2,
    Loader2,
    Plus,
    Search,
    Car,
    Truck,
    Settings,
    Info,
    DollarSign,
    CloudRain,
    Hotel,
    Coffee,
    ParkingSquare,
    Banknote
} from 'lucide-react'
import { formatDistance, formatDuration, formatCurrency } from '@/shared/utils/format'
import { useToast } from '@/hooks/use-toast'
import { useCalculateRouteMutation, usePlanRouteByNamesQuery } from '@/shared/api/routesSlice'
import { useFindPlaceQuery, useGetFuelStationsQuery, useGetRestAreasQuery, useGetFoodStopsQuery, useGetParkingQuery, useGetLodgingQuery, useGetAtmsQuery } from '@/shared/api/geocodingSlice'
import { useDebounce } from 'use-debounce'

interface RouteMapPickerBackendProps {
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
        riskScore?: number
        estimatedFuelCost?: number
        estimatedTollCost?: number
        totalEstimatedCost?: number
    }) => void
    vehicleType?: 'car' | 'truck'
    vehicleId?: number
    driverId?: number
    cargoId?: number
    className?: string
}

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY

export function RouteMapPickerBackend({
                                          startAddress: initialStartAddress,
                                          endAddress: initialEndAddress,
                                          startCoords: initialStartCoords,
                                          endCoords: initialEndCoords,
                                          waypoints = [],
                                          onStartChange,
                                          onEndChange,
                                          onWaypointsChange,
                                          onRouteBuilt,
                                          vehicleType = 'truck',
                                          vehicleId,
                                          driverId,
                                          cargoId,
                                          className
                                      }: RouteMapPickerBackendProps) {
    const mapRef = useRef<any>(null)
    const ymapsRef = useRef<any>(null)
    const [mapCenter, setMapCenter] = useState<[number, number]>([55.751574, 37.573856])
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
    const [routeInfo, setRouteInfo] = useState<any>(null)
    const [trafficEnabled, setTrafficEnabled] = useState(false)
    const [showPOI, setShowPOI] = useState(false)
    const [poiType, setPoiType] = useState<string>('fuel')

    // Form state
    const [startAddress, setStartAddress] = useState(initialStartAddress || '')
    const [endAddress, setEndAddress] = useState(initialEndAddress || '')
    const [startCoords, setStartCoords] = useState(initialStartCoords)
    const [endCoords, setEndCoords] = useState(initialEndCoords)
    const [searchingStart, setSearchingStart] = useState(false)
    const [searchingEnd, setSearchingEnd] = useState(false)

    // Debounced values for search
    const [debouncedStartAddress] = useDebounce(startAddress, 500)
    const [debouncedEndAddress] = useDebounce(endAddress, 500)

    const { toast } = useToast()
    const [calculateRoute, { isLoading: isCalculatingRoute }] = useCalculateRouteMutation()

    // POI queries
    const currentLocation = routeCoordinates.length > 0
        ? routeCoordinates[Math.floor(routeCoordinates.length / 2)]
        : mapCenter

    const { data: fuelStations } = useGetFuelStationsQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 10000 },
        { skip: !showPOI || poiType !== 'fuel' }
    )

    const { data: restAreas } = useGetRestAreasQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 20000 },
        { skip: !showPOI || poiType !== 'rest' }
    )

    const { data: foodStops } = useGetFoodStopsQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 10000 },
        { skip: !showPOI || poiType !== 'food' }
    )

    const { data: parking } = useGetParkingQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 10000 },
        { skip: !showPOI || poiType !== 'parking' }
    )

    const { data: lodging } = useGetLodgingQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 20000 },
        { skip: !showPOI || poiType !== 'lodging' }
    )

    const { data: atms } = useGetAtmsQuery(
        { lat: currentLocation[0], lon: currentLocation[1], radius: 5000 },
        { skip: !showPOI || poiType !== 'atm' }
    )

    // Place search queries
    const { data: startPlaces } = useFindPlaceQuery(
        { query: debouncedStartAddress },
        { skip: !searchingStart || debouncedStartAddress.length < 3 }
    )

    const { data: endPlaces } = useFindPlaceQuery(
        { query: debouncedEndAddress },
        { skip: !searchingEnd || debouncedEndAddress.length < 3 }
    )

    const handleMapLoad = useCallback((ymaps: any) => {
        ymapsRef.current = ymaps
        console.log('Yandex Maps API loaded')
    }, [])

    const handleMapReady = useCallback((map: any) => {
        mapRef.current = map

        if (startCoords && endCoords) {
            const bounds = ymapsRef.current?.util.bounds.fromPoints([startCoords, endCoords])
            if (bounds) {
                map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 })
            }
        } else if (startCoords) {
            map.setCenter(startCoords, 13)
        }
    }, [startCoords, endCoords])

    const handleMapClick = useCallback((e: any) => {
        const coords = e.get('coords') as [number, number]

        if (!startCoords) {
            setStartCoords(coords)
            onStartChange?.(coords, 'Выбранная точка')
            toast({
                title: "Начальная точка установлена",
                description: "Выберите конечную точку на карте"
            })
        } else if (!endCoords) {
            setEndCoords(coords)
            onEndChange?.(coords, 'Выбранная точка')
            toast({
                title: "Конечная точка установлена",
                description: "Нажмите 'Построить маршрут' для расчета"
            })
        } else {
            const newWaypoint = {
                lat: coords[0],
                lng: coords[1],
                address: 'Промежуточная точка'
            }
            const updatedWaypoints = [...waypoints, newWaypoint]
            onWaypointsChange?.(updatedWaypoints)
            toast({
                title: "Промежуточная точка добавлена",
                description: "Маршрут будет пересчитан"
            })
        }
    }, [startCoords, endCoords, waypoints, onStartChange, onEndChange, onWaypointsChange, toast])

    const buildRouteWithBackend = useCallback(async () => {
        if (!startCoords || !endCoords) {
            toast({
                title: "Ошибка",
                description: "Укажите начальную и конечную точки маршрута",
                variant: "destructive"
            })
            return
        }

        try {
            const routeRequest = {
                startLat: startCoords[0],
                startLon: startCoords[1],
                endLat: endCoords[0],
                endLon: endCoords[1],
                startAddress: startAddress || 'Начальная точка',
                endAddress: endAddress || 'Конечная точка',
                vehicleId,
                driverId,
                cargoId,
                waypoints: waypoints.map(wp => ({
                    latitude: wp.lat,
                    longitude: wp.lng,
                    address: wp.address
                }))
            }

            const result = await calculateRoute(routeRequest).unwrap()

            if (result.coordinates && result.coordinates.length > 0) {
                // Преобразуем координаты для Yandex Maps
                const yandexCoords = result.coordinates.map((coord: number[]) =>
                    [coord[1], coord[0]] as [number, number] // GraphHopper: [lng, lat], Yandex: [lat, lng]
                )

                setRouteCoordinates(yandexCoords)
                setRouteInfo(result)
                onRouteBuilt?.(result)

                toast({
                    title: "Маршрут построен",
                    description: `${formatDistance(result.distance * 1000)} • ${formatDuration(result.duration * 60)}`
                })

                // Подгоняем карту под маршрут
                if (mapRef.current && ymapsRef.current) {
                    const bounds = ymapsRef.current.util.bounds.fromPoints(yandexCoords)
                    mapRef.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 })
                }
            }
        } catch (error) {
            console.error('Route calculation error:', error)
            toast({
                title: "Ошибка построения маршрута",
                description: "Не удалось рассчитать маршрут. Проверьте соединение с сервером.",
                variant: "destructive"
            })
        }
    }, [startCoords, endCoords, startAddress, endAddress, waypoints, vehicleId, driverId, cargoId, calculateRoute, onRouteBuilt, toast])

    const clearRoute = useCallback(() => {
        setRouteCoordinates([])
        setRouteInfo(null)
        setStartCoords(undefined)
        setEndCoords(undefined)
        setStartAddress('')
        setEndAddress('')
        onStartChange?.(null as any, '')
        onEndChange?.(null as any, '')
        onWaypointsChange?.([])
        toast({
            title: "Маршрут очищен",
            description: "Все точки маршрута удалены"
        })
    }, [onStartChange, onEndChange, onWaypointsChange, toast])

    const removeWaypoint = useCallback((index: number) => {
        const updatedWaypoints = waypoints.filter((_, i) => i !== index)
        onWaypointsChange?.(updatedWaypoints)
        toast({
            title: "Точка удалена",
            description: "Промежуточная точка удалена из маршрута"
        })
    }, [waypoints, onWaypointsChange, toast])

    const selectStartPlace = useCallback((place: any) => {
        const coords: [number, number] = [place.latitude, place.longitude]
        setStartCoords(coords)
        setStartAddress(place.name)
        onStartChange?.(coords, place.name)
        setSearchingStart(false)
    }, [onStartChange])

    const selectEndPlace = useCallback((place: any) => {
        const coords: [number, number] = [place.latitude, place.longitude]
        setEndCoords(coords)
        setEndAddress(place.name)
        onEndChange?.(coords, place.name)
        setSearchingEnd(false)
    }, [onEndChange])

    const getPOIIcon = (type: string) => {
        switch (type) {
            case 'fuel': return <Fuel className="h-4 w-4" />
            case 'rest': return <Hotel className="h-4 w-4" />
            case 'food': return <Coffee className="h-4 w-4" />
            case 'parking': return <ParkingSquare className="h-4 w-4" />
            case 'lodging': return <Hotel className="h-4 w-4" />
            case 'atm': return <Banknote className="h-4 w-4" />
            default: return <MapPin className="h-4 w-4" />
        }
    }

    const getCurrentPOIData = () => {
        switch (poiType) {
            case 'fuel': return fuelStations || []
            case 'rest': return restAreas || []
            case 'food': return foodStops || []
            case 'parking': return parking || []
            case 'lodging': return lodging || []
            case 'atm': return atms || []
            default: return []
        }
    }

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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Settings className="h-4 w-4 mr-1" />
                                        Опции
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Настройки карты</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setTrafficEnabled(!trafficEnabled)}>
                                        <Traffic className="h-4 w-4 mr-2" />
                                        {trafficEnabled ? 'Скрыть пробки' : 'Показать пробки'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShowPOI(!showPOI)}>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {showPOI ? 'Скрыть POI' : 'Показать POI'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearRoute}
                                disabled={!startCoords && !endCoords && waypoints.length === 0}
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Очистить
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Address Input Form */}
                    <div className="p-4 space-y-4 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Начальная точка</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Введите адрес отправления"
                                        className="pl-10"
                                        value={startAddress}
                                        onChange={(e) => {
                                            setStartAddress(e.target.value)
                                            setSearchingStart(true)
                                        }}
                                        onFocus={() => setSearchingStart(true)}
                                    />
                                    {searchingStart && startPlaces && startPlaces.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                                            {startPlaces.map((place) => (
                                                <button
                                                    key={place.id}
                                                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                                    onClick={() => selectStartPlace(place)}
                                                >
                                                    <div className="font-medium">{place.name}</div>
                                                    {place.description && (
                                                        <div className="text-sm text-muted-foreground">{place.description}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Конечная точка</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Введите адрес назначения"
                                        className="pl-10"
                                        value={endAddress}
                                        onChange={(e) => {
                                            setEndAddress(e.target.value)
                                            setSearchingEnd(true)
                                        }}
                                        onFocus={() => setSearchingEnd(true)}
                                    />
                                    {searchingEnd && endPlaces && endPlaces.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                                            {endPlaces.map((place) => (
                                                <button
                                                    key={place.id}
                                                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                                    onClick={() => selectEndPlace(place)}
                                                >
                                                    <div className="font-medium">{place.name}</div>
                                                    {place.description && (
                                                        <div className="text-sm text-muted-foreground">{place.description}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label>Тип ТС:</Label>
                                <Badge variant={vehicleType === 'truck' ? 'default' : 'secondary'}>
                                    {vehicleType === 'truck' ? <Truck className="h-3 w-3 mr-1" /> : <Car className="h-3 w-3 mr-1" />}
                                    {vehicleType === 'truck' ? 'Грузовик' : 'Легковой'}
                                </Badge>
                            </div>

                            <Button
                                onClick={buildRouteWithBackend}
                                disabled={!startCoords || !endCoords || isCalculatingRoute}
                                className="ml-auto"
                            >
                                {isCalculatingRoute ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Расчет маршрута...
                                    </>
                                ) : (
                                    <>
                                        <RouteIcon className="h-4 w-4 mr-2" />
                                        Построить маршрут
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Route Information */}
                    {routeInfo && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <RouteIcon className="h-4 w-4" />
                                        Расстояние
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {formatDistance(routeInfo.distance * 1000)}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Время в пути
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {formatDuration(routeInfo.duration * 60)}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Fuel className="h-4 w-4" />
                                        Расход топлива
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {routeInfo.fuelConsumption ? `${routeInfo.fuelConsumption.toFixed(1)} л` : '-'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        Стоимость
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {routeInfo.totalEstimatedCost ? formatCurrency(routeInfo.totalEstimatedCost) : '-'}
                                    </div>
                                </div>
                            </div>

                            {routeInfo.riskScore && (
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Оценка риска:</span>
                                        <Badge variant={
                                            routeInfo.riskScore > 0.7 ? 'destructive' :
                                                routeInfo.riskScore > 0.4 ? 'secondary' : 'default'
                                        }>
                                            {routeInfo.riskScore > 0.7 ? 'Высокий' :
                                                routeInfo.riskScore > 0.4 ? 'Средний' : 'Низкий'}
                                        </Badge>
                                    </div>

                                    {routeInfo.weatherRisk && routeInfo.weatherRisk > 0.3 && (
                                        <div className="flex items-center gap-2">
                                            <CloudRain className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">Погодные риски</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* POI Controls */}
                    {showPOI && (
                        <div className="p-4 border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Показать:</span>
                                <div className="flex gap-2">
                                    {[
                                        { type: 'fuel', label: 'АЗС' },
                                        { type: 'rest', label: 'Отдых' },
                                        { type: 'food', label: 'Еда' },
                                        { type: 'parking', label: 'Парковка' },
                                        { type: 'lodging', label: 'Отель' },
                                        { type: 'atm', label: 'Банкомат' }
                                    ].map((poi) => (
                                        <Button
                                            key={poi.type}
                                            variant={poiType === poi.type ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPoiType(poi.type)}
                                        >
                                            {getPOIIcon(poi.type)}
                                            <span className="ml-1">{poi.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Waypoints List */}
                    {waypoints.length > 0 && (
                        <div className="p-4 border-b bg-muted/30">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Промежуточные точки:</div>
                                {waypoints.map((waypoint, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm">{waypoint.address || `Точка ${index + 1}`}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeWaypoint(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
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
                                onClick={handleMapClick}
                            >
                                {/* Controls */}
                                <GeolocationControl
                                    options={{
                                        float: 'right',
                                        position: { top: 10, right: 10 }
                                    }}
                                />

                                <TrafficControl
                                    options={{
                                        float: 'right',
                                        position: { top: 60, right: 10 }
                                    }}
                                    state={{
                                        expanded: trafficEnabled
                                    }}
                                />

                                <ZoomControl
                                    options={{
                                        float: 'right',
                                        position: { top: 110, right: 10 }
                                    }}
                                />

                                {/* Start Point */}
                                {startCoords && (
                                    <Placemark
                                        geometry={startCoords}
                                        options={{
                                            preset: 'islands#greenCircleDotIcon',
                                            iconCaptionMaxWidth: '200',
                                            draggable: true
                                        }}
                                        properties={{
                                            iconCaption: startAddress || 'Начальная точка',
                                            balloonContent: startAddress || 'Точка отправления'
                                        }}
                                        onDragEnd={(e: any) => {
                                            const newCoords = e.get('target').geometry.getCoordinates()
                                            setStartCoords(newCoords)
                                            onStartChange?.(newCoords, startAddress)
                                        }}
                                    />
                                )}

                                {/* End Point */}
                                {endCoords && (
                                    <Placemark
                                        geometry={endCoords}
                                        options={{
                                            preset: 'islands#redCircleDotIcon',
                                            iconCaptionMaxWidth: '200',
                                            draggable: true
                                        }}
                                        properties={{
                                            iconCaption: endAddress || 'Конечная точка',
                                            balloonContent: endAddress || 'Точка назначения'
                                        }}
                                        onDragEnd={(e: any) => {
                                            const newCoords = e.get('target').geometry.getCoordinates()
                                            setEndCoords(newCoords)
                                            onEndChange?.(newCoords, endAddress)
                                        }}
                                    />
                                )}

                                {/* Waypoints */}
                                {waypoints.map((waypoint, index) => (
                                    <Placemark
                                        key={index}
                                        geometry={[waypoint.lat, waypoint.lng]}
                                        options={{
                                            preset: 'islands#blueCircleDotIcon',
                                            iconCaptionMaxWidth: '200',
                                            draggable: true
                                        }}
                                        properties={{
                                            iconCaption: waypoint.address || `Точка ${index + 1}`,
                                            balloonContent: waypoint.address || `Промежуточная точка ${index + 1}`
                                        }}
                                        onDragEnd={(e: any) => {
                                            const newCoords = e.get('target').geometry.getCoordinates()
                                            const updatedWaypoints = [...waypoints]
                                            updatedWaypoints[index] = {
                                                lat: newCoords[0],
                                                lng: newCoords[1],
                                                address: waypoint.address
                                            }
                                            onWaypointsChange?.(updatedWaypoints)
                                        }}
                                    />
                                ))}

                                {/* Route Polyline */}
                                {routeCoordinates.length > 0 && (
                                    <Polyline
                                        geometry={routeCoordinates}
                                        options={{
                                            strokeColor: vehicleType === 'truck' ? '#1e40af' : '#16a34a',
                                            strokeWidth: 5,
                                            strokeOpacity: 0.8,
                                            strokeStyle: 'solid'
                                        }}
                                    />
                                )}

                                {/* POI Markers */}
                                {showPOI && getCurrentPOIData().map((poi) => (
                                    <Placemark
                                        key={poi.id}
                                        geometry={[poi.latitude, poi.longitude]}
                                        options={{
                                            preset: poiType === 'fuel' ? 'islands#redGasStationIcon' :
                                                poiType === 'food' ? 'islands#orangeFoodIcon' :
                                                    poiType === 'lodging' ? 'islands#blueHotelIcon' :
                                                        poiType === 'parking' ? 'islands#blueParkingIcon' :
                                                            poiType === 'atm' ? 'islands#greenMoneyIcon' :
                                                                'islands#blueIcon',
                                            iconCaptionMaxWidth: '200'
                                        }}
                                        properties={{
                                            iconCaption: poi.name,
                                            balloonContentHeader: poi.name,
                                            balloonContentBody: poi.description || poi.type,
                                            balloonContentFooter: `Источник: ${poi.provider}`
                                        }}
                                    />
                                ))}
                            </Map>
                        </YMaps>
                    </div>

                    {/* Instructions */}
                    {routeInfo && routeInfo.instructions && routeInfo.instructions.length > 0 && (
                        <div className="p-4 border-t">
                            <details className="group">
                                <summary className="cursor-pointer flex items-center justify-between">
                                    <h3 className="font-medium">Инструкции по маршруту</h3>
                                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="mt-4 space-y-2">
                                    {routeInfo.instructions.map((instruction: any, index: number) => (
                                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{instruction.text}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDistance(instruction.distance * 1000)} • {formatDuration(instruction.time * 60)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}