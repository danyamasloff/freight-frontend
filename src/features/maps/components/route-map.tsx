import React, { useState, useRef, useCallback, useEffect } from 'react'
import { YMaps, Map, RouteButton, TrafficControl, RouteEditor, Placemark } from '@pbe/react-yandex-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Navigation2,
    Play,
    Pause,
    Square,
    Volume2,
    VolumeX,
    Route,
    Clock,
    Download,
    Star,
    StarOff,
    History,
    Trash2,
    MapPin,
    Settings,
    Car,
    Truck,
    User,
    Bus,
    Plus,
    X,
    Search,
    Navigation
} from 'lucide-react'
import { formatDistance, formatDuration } from '@/shared/utils/format'
import { useToast } from '@/hooks/use-toast'

interface RouteMapProps {
    className?: string
}

interface RouteInfo {
    id: string
    name: string
    distance: number
    duration: number
    timestamp: number
    alternativeRoutes?: any[]
}

interface NavigationState {
    isActive: boolean
    isPlaying: boolean
    progress: number
    voiceEnabled: boolean
    currentInstruction: string
}

interface MapSettings {
    showTraffic: boolean
    mapType: 'map' | 'satellite' | 'hybrid'
    showPOI: boolean
    routingMode: string
    avoidTolls: boolean
    avoidTraffic: boolean
    avoidFerries: boolean
}

interface Waypoint {
    id: string
    name: string
    coords: [number, number]
}

interface Place {
    name: string
    coords: [number, number]
    description?: string
}

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY

export function RouteMap({ className }: RouteMapProps) {
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
    const [navigationState, setNavigationState] = useState<NavigationState>({
        isActive: false,
        isPlaying: false,
        progress: 0,
        voiceEnabled: true,
        currentInstruction: ''
    })
    const [routeHistory, setRouteHistory] = useState<RouteInfo[]>([])
    const [favoriteRoutes, setFavoriteRoutes] = useState<RouteInfo[]>([])
    const [activeTab, setActiveTab] = useState('route')
    const [mapSettings, setMapSettings] = useState<MapSettings>({
        showTraffic: false,
        mapType: 'map',
        showPOI: true,
        routingMode: 'auto',
        avoidTolls: false,
        avoidTraffic: true,
        avoidFerries: false
    })
    const [waypoints, setWaypoints] = useState<Waypoint[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Place[]>([])
    const [showSettings, setShowSettings] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const navigationIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
    const ymapsRef = useRef<any>(null)
    const mapRef = useRef<any>(null)
    const { toast } = useToast()

    // Инициализация Speech Synthesis
    useEffect(() => {
        if ('speechSynthesis' in window) {
            speechSynthesisRef.current = window.speechSynthesis
        }
    }, [])

    // Поиск мест
    const searchPlaces = useCallback(async (query: string) => {
        if (!ymapsRef.current || query.length < 3) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const result = await ymapsRef.current.geocode(query, { results: 10 })
            const places: Place[] = []

            for (let i = 0; i < result.geoObjects.getLength(); i++) {
                const geoObject = result.geoObjects.get(i)
                places.push({
                    name: geoObject.getAddressLine(),
                    coords: geoObject.geometry.getCoordinates(),
                    description: geoObject.getLocalities().join(', ')
                })
            }

            setSearchResults(places)
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                searchPlaces(searchQuery)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, searchPlaces])

    // Добавление промежуточной точки
    const addWaypoint = (place: Place) => {
        const waypoint: Waypoint = {
            id: `waypoint_${Date.now()}`,
            name: place.name,
            coords: place.coords
        }
        setWaypoints(prev => [...prev, waypoint])
        setSearchQuery('')
        setSearchResults([])
        toast({ title: 'Промежуточная точка добавлена', description: place.name })
    }

    // Удаление промежуточной точки
    const removeWaypoint = (id: string) => {
        setWaypoints(prev => prev.filter(w => w.id !== id))
        toast({ title: 'Промежуточная точка удалена' })
    }

    // Обработчики событий маршрута
    const handleRouteBuilt = useCallback((route: any) => {
        try {
            const activeRoute = route.getActiveRoute()
            if (activeRoute) {
                const distance = activeRoute.properties.get('distance') || 0
                const duration = activeRoute.properties.get('duration') || 0

                // Получаем альтернативные маршруты
                const alternatives = route.getRoutes().slice(1, 4)

                const routeData: RouteInfo = {
                    id: `route_${Date.now()}`,
                    name: `Маршрут ${new Date().toLocaleTimeString()}`,
                    distance,
                    duration,
                    timestamp: Date.now(),
                    alternativeRoutes: alternatives
                }

                setRouteInfo(routeData)
                setRouteHistory(prev => [routeData, ...prev.slice(0, 19)])

                toast({
                    title: 'Маршрут построен!',
                    description: `${formatDistance(distance)} • ${formatDuration(duration)}`
                })
            }
        } catch (error) {
            toast({ title: 'Ошибка обработки маршрута', variant: 'destructive' })
        }
    }, [toast])

    // Функция озвучивания
    const speak = (text: string) => {
        if (navigationState.voiceEnabled && speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ru-RU'
            speechSynthesisRef.current.speak(utterance)
        }
    }

    // Навигационные функции
    const startNavigation = () => {
        if (!routeInfo) return

        setNavigationState({
            isActive: true,
            isPlaying: true,
            progress: 0,
            voiceEnabled: navigationState.voiceEnabled,
            currentInstruction: 'Начните движение по маршруту'
        })

        speak('Навигация начата')

        navigationIntervalRef.current = setInterval(() => {
            setNavigationState(prev => {
                const newProgress = Math.min(prev.progress + 2, 100)

                if (newProgress >= 100) {
                    speak('Вы прибыли в пункт назначения')
                    return { ...prev, progress: 100, isPlaying: false }
                }

                return {
                    ...prev,
                    progress: newProgress,
                    currentInstruction: `Продолжайте движение (${newProgress.toFixed(0)}%)`
                }
            })
        }, 1000)
    }

    const pauseNavigation = () => {
        setNavigationState(prev => ({ ...prev, isPlaying: false }))
        if (navigationIntervalRef.current) {
            clearInterval(navigationIntervalRef.current)
        }
        speak('Навигация приостановлена')
    }

    const resumeNavigation = () => {
        setNavigationState(prev => ({ ...prev, isPlaying: true }))
        startNavigation()
    }

    const stopNavigation = () => {
        setNavigationState({
            isActive: false,
            isPlaying: false,
            progress: 0,
            voiceEnabled: navigationState.voiceEnabled,
            currentInstruction: ''
        })
        if (navigationIntervalRef.current) {
            clearInterval(navigationIntervalRef.current)
        }
        speak('Навигация остановлена')
    }

    // Переключение избранного
    const toggleFavorite = (route: RouteInfo) => {
        const isFavorite = favoriteRoutes.some(r => r.id === route.id)
        const updatedFavorites = isFavorite
            ? favoriteRoutes.filter(r => r.id !== route.id)
            : [...favoriteRoutes, route]

        setFavoriteRoutes(updatedFavorites)
        toast({
            title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
        })
    }

    // Экспорт маршрута
    const exportRoute = (format: 'json' | 'gpx') => {
        if (!routeInfo) return

        const data = format === 'json'
            ? JSON.stringify(routeInfo, null, 2)
            : `<?xml version="1.0"?><gpx><n>${routeInfo.name}</n></gpx>`

        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'application/gpx+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `route_${routeInfo.id}.${format}`
        link.click()
        URL.revokeObjectURL(url)

        toast({ title: `Маршрут экспортирован в ${format.toUpperCase()}` })
    }

    // Обновление настроек карты
    const updateMapSettings = (newSettings: Partial<MapSettings>) => {
        setMapSettings(prev => ({ ...prev, ...newSettings }))

        // Здесь можно добавить логику обновления карты
        if (mapRef.current && ymapsRef.current) {
            try {
                if ('mapType' in newSettings && mapRef.current.setType) {
                    mapRef.current.setType(`yandex#${newSettings.mapType}`)
                }
            } catch (error) {
                console.error('Map settings update error:', error)
            }
        }
    }

    useEffect(() => {
        return () => {
            if (navigationIntervalRef.current) {
                clearInterval(navigationIntervalRef.current)
            }
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel()
            }
        }
    }, [])

    return (
        <div className={`h-full flex gap-6 ${className}`}>
            {/* Боковая панель */}
            <Card className="w-[480px] flex-shrink-0 overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                            <Navigation2 className="h-6 w-6 text-blue-600" />
                            <span className="text-xl">Планировщик маршрутов</span>
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(!showSettings)}
                            className="h-10 w-10"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Настройки */}
                    {showSettings && (
                        <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-base font-semibold">Тип транспорта</label>
                                    <Select
                                        value={mapSettings.routingMode}
                                        onValueChange={(value) => updateMapSettings({ routingMode: value })}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">
                                                <div className="flex items-center gap-3 py-1">
                                                    <Car className="h-5 w-5" />
                                                    <span className="text-base">Автомобиль</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="truck">
                                                <div className="flex items-center gap-3 py-1">
                                                    <Truck className="h-5 w-5" />
                                                    <span className="text-base">Грузовик</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="pedestrian">
                                                <div className="flex items-center gap-3 py-1">
                                                    <User className="h-5 w-5" />
                                                    <span className="text-base">Пешком</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="masstransit">
                                                <div className="flex items-center gap-3 py-1">
                                                    <Bus className="h-5 w-5" />
                                                    <span className="text-base">Общественный транспорт</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-base font-semibold">Избегать</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                                            <Checkbox
                                                id="avoid-tolls"
                                                checked={mapSettings.avoidTolls}
                                                onCheckedChange={(checked) =>
                                                    updateMapSettings({ avoidTolls: !!checked })
                                                }
                                                className="h-5 w-5"
                                            />
                                            <label htmlFor="avoid-tolls" className="text-base cursor-pointer">Платные дороги</label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                                            <Checkbox
                                                id="avoid-traffic"
                                                checked={mapSettings.avoidTraffic}
                                                onCheckedChange={(checked) =>
                                                    updateMapSettings({ avoidTraffic: !!checked })
                                                }
                                                className="h-5 w-5"
                                            />
                                            <label htmlFor="avoid-traffic" className="text-base cursor-pointer">Пробки</label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                                            <Checkbox
                                                id="avoid-ferries"
                                                checked={mapSettings.avoidFerries}
                                                onCheckedChange={(checked) =>
                                                    updateMapSettings({ avoidFerries: !!checked })
                                                }
                                                className="h-5 w-5"
                                            />
                                            <label htmlFor="avoid-ferries" className="text-base cursor-pointer">Паромы</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-base font-semibold">Настройки карты</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                                            <Checkbox
                                                id="show-traffic"
                                                checked={mapSettings.showTraffic}
                                                onCheckedChange={(checked) =>
                                                    updateMapSettings({ showTraffic: !!checked })
                                                }
                                                className="h-5 w-5"
                                            />
                                            <label htmlFor="show-traffic" className="text-base cursor-pointer">Показать пробки</label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                                            <Checkbox
                                                id="show-poi"
                                                checked={mapSettings.showPOI}
                                                onCheckedChange={(checked) =>
                                                    updateMapSettings({ showPOI: !!checked })
                                                }
                                                className="h-5 w-5"
                                            />
                                            <label htmlFor="show-poi" className="text-base cursor-pointer">Объекты на карте</label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Поиск мест */}
                    <div className="space-y-3">
                        <label className="text-base font-semibold">Поиск мест</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Найти место..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-base"
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-4">
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <Card className="max-h-60 overflow-y-auto border-2">
                                <CardContent className="p-3">
                                    {searchResults.map((place, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                                            onClick={() => {
                                                if (mapRef.current) {
                                                    mapRef.current.setCenter(place.coords, 13)
                                                }
                                                setSearchQuery('')
                                                setSearchResults([])
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-base">{place.name}</div>
                                                    {place.description && (
                                                        <div className="text-sm text-gray-500">{place.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addWaypoint(place)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Промежуточные точки */}
                    {waypoints.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-base font-semibold">Промежуточные точки</label>
                            <div className="space-y-2">
                                {waypoints.map((waypoint, index) => (
                                    <Card key={waypoint.id} className="border-2">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="text-base font-medium">{waypoint.name}</div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeWaypoint(waypoint.id)}
                                                    className="text-red-500 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Информация о маршруте */}
                    {routeInfo && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-12">
                                <TabsTrigger value="route" className="text-base">Маршрут</TabsTrigger>
                                <TabsTrigger value="navigation" className="text-base">Навигация</TabsTrigger>
                                <TabsTrigger value="history" className="text-base">История</TabsTrigger>
                            </TabsList>

                            <TabsContent value="route" className="space-y-4 mt-6">
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-lg">{routeInfo.name}</h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleFavorite(routeInfo)}
                                                    className="h-9 w-9"
                                                >
                                                    {favoriteRoutes.some(r => r.id === routeInfo.id) ?
                                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> :
                                                        <StarOff className="h-5 w-5" />
                                                    }
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => exportRoute('json')}
                                                    className="h-9 w-9"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex items-center gap-3">
                                                <Route className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Расстояние</div>
                                                    <div className="font-semibold text-lg">{formatDistance(routeInfo.distance)}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Время</div>
                                                    <div className="font-semibold text-lg">{formatDuration(routeInfo.duration)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Альтернативные маршруты */}
                                {routeInfo.alternativeRoutes && routeInfo.alternativeRoutes.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-base font-semibold">Альтернативные маршруты</label>
                                        {routeInfo.alternativeRoutes.map((route: any, index: number) => (
                                            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-medium text-base">Вариант {index + 1}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {formatDistance(route.properties?.get('distance') || 0)} •
                                                                {formatDuration(route.properties?.get('duration') || 0)}
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" className="h-9">
                                                            Выбрать
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => exportRoute('gpx')}
                                        className="flex-1 h-11"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Экспорт в GPX
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => exportRoute('json')}
                                        className="flex-1 h-11"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Экспорт в JSON
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="navigation" className="space-y-4 mt-6">
                                {!navigationState.isActive ? (
                                    <div className="text-center space-y-6">
                                        <Button
                                            onClick={startNavigation}
                                            className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg"
                                        >
                                            <Navigation2 className="mr-3 h-6 w-6" />
                                            Начать навигацию
                                        </Button>
                                        <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                                            <span className="text-base">Голосовые подсказки</span>
                                            <Switch
                                                checked={navigationState.voiceEnabled}
                                                onCheckedChange={(checked) =>
                                                    setNavigationState(prev => ({ ...prev, voiceEnabled: checked }))
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-base font-semibold">Прогресс навигации</span>
                                                    <Badge variant="outline" className="text-base px-3 py-1">
                                                        {navigationState.progress.toFixed(0)}%
                                                    </Badge>
                                                </div>
                                                <div className="w-full bg-green-200 rounded-full h-4">
                                                    <div
                                                        className="bg-green-600 h-4 rounded-full transition-all duration-1000"
                                                        style={{ width: `${navigationState.progress}%` }}
                                                    />
                                                </div>
                                                <div className="mt-3 text-base text-green-700 font-medium">
                                                    {navigationState.currentInstruction}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="flex items-center justify-center gap-3">
                                            {navigationState.isPlaying ? (
                                                <Button onClick={pauseNavigation} variant="outline" className="h-12 px-6">
                                                    <Pause className="mr-2 h-5 w-5" />
                                                    Пауза
                                                </Button>
                                            ) : (
                                                <Button onClick={resumeNavigation} className="bg-green-600 hover:bg-green-700 h-12 px-6">
                                                    <Play className="mr-2 h-5 w-5" />
                                                    Продолжить
                                                </Button>
                                            )}
                                            <Button onClick={stopNavigation} variant="destructive" className="h-12 px-6">
                                                <Square className="mr-2 h-5 w-5" />
                                                Стоп
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setNavigationState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
                                                }
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12"
                                            >
                                                {navigationState.voiceEnabled ?
                                                    <Volume2 className="h-5 w-5" /> :
                                                    <VolumeX className="h-5 w-5" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">История маршрутов</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setRouteHistory([])}
                                        className="h-9"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {routeHistory.map((route) => (
                                        <Card key={route.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-base">{route.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {formatDistance(route.distance)} • {formatDuration(route.duration)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(route.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleFavorite(route)
                                                        }}
                                                        className="h-9 w-9"
                                                    >
                                                        {favoriteRoutes.some(r => r.id === route.id) ?
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> :
                                                            <StarOff className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {routeHistory.length === 0 && (
                                    <Card>
                                        <CardContent className="p-6 text-center text-gray-500">
                                            <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <div className="text-base">История маршрутов пуста</div>
                                        </CardContent>
                                    </Card>
                                )}

                                {favoriteRoutes.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">Избранные маршруты</h4>
                                        {favoriteRoutes.map((route) => (
                                            <Card key={route.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-medium text-base">{route.name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {formatDistance(route.distance)} • {formatDuration(route.duration)}
                                                            </div>
                                                        </div>
                                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}

                    {!routeInfo && (
                        <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                                <Navigation2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <div>Постройте маршрут на карте</div>
                                <div className="text-sm mt-1">Используйте кнопки "Маршруты" и "Пробки" на карте</div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Карта */}
            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full">
                    <YMaps
                        query={{
                            apikey: YANDEX_API_KEY,
                            load: "package.full",
                            lang: "ru_RU"
                        }}
                    >
                        <Map
                            defaultState={{
                                center: [55.751574, 37.573856],
                                zoom: 9,
                                controls: []
                            }}
                            width="100%"
                            height="100%"
                            options={{
                                suppressMapOpenBlock: true
                            }}
                            onLoad={(ymaps) => {
                                ymapsRef.current = ymaps
                            }}
                            instanceRef={(ref) => {
                                mapRef.current = ref
                            }}
                        >
                            <RouteButton
                                options={{
                                    float: "right",
                                    size: "large"
                                }}
                                onRouteBuilt={handleRouteBuilt}
                            />

                            <TrafficControl
                                options={{
                                    float: "right"
                                }}
                            />

                            <RouteEditor />

                            {/* Промежуточные точки на карте */}
                            {waypoints.map((waypoint, index) => (
                                <Placemark
                                    key={waypoint.id}
                                    geometry={waypoint.coords}
                                    options={{
                                        preset: 'islands#violetDotIconWithCaption',
                                        iconCaptionMaxWidth: '200'
                                    }}
                                    properties={{
                                        iconCaption: `${index + 1}. ${waypoint.name}`,
                                        balloonContent: waypoint.name
                                    }}
                                />
                            ))}
                        </Map>
                    </YMaps>
                </CardContent>
            </Card>
        </div>
    )
}