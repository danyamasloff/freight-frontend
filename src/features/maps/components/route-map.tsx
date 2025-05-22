import React, { useState, useRef, useCallback, useEffect } from 'react'
import { YMaps, Map, RouteButton, TrafficControl, RouteEditor, Placemark, Polyline } from '@pbe/react-yandex-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    Navigation,
    Layers,
    Eye,
    EyeOff
} from 'lucide-react'
import { formatDistance, formatDuration } from '@/shared/utils/format'
import { useToast } from '@/hooks/use-toast'
import { useGetRoutesQuery } from '@/shared/api/routesSlice'
import type { RouteSummary } from '@/shared/types/api'

interface RouteMapProps {
    className?: string
    routes?: RouteSummary[]
    onRouteSelect?: (routes: RouteSummary[]) => void
}

interface RouteInfo {
    id: string
    name: string
    distance: number
    duration: number
    timestamp: number
    coordinates?: [number, number][]
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
    showExistingRoutes: boolean
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
const MOSCOW_CENTER: [number, number] = [55.751574, 37.573856]

export function RouteMap({ className, routes = [], onRouteSelect }: RouteMapProps) {
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
        routingMode: 'truck',
        avoidTolls: false,
        avoidTraffic: true,
        avoidFerries: false,
        showExistingRoutes: true
    })
    const [waypoints, setWaypoints] = useState<Waypoint[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Place[]>([])
    const [showSettings, setShowSettings] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [visibleRoutes, setVisibleRoutes] = useState<Set<number>>(new Set())

    const navigationIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
    const ymapsRef = useRef<any>(null)
    const mapRef = useRef<any>(null)
    const { toast } = useToast()

    // Load existing routes from API
    const { data: existingRoutes } = useGetRoutesQuery()

    // Initialize Speech Synthesis
    useEffect(() => {
        if ('speechSynthesis' in window) {
            speechSynthesisRef.current = window.speechSynthesis
        }
    }, [])

    // Initialize visible routes
    useEffect(() => {
        if (existingRoutes && mapSettings.showExistingRoutes) {
            setVisibleRoutes(new Set(existingRoutes.map(r => r.id)))
        } else {
            setVisibleRoutes(new Set())
        }
    }, [existingRoutes, mapSettings.showExistingRoutes])

    // Search places
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

    // Add waypoint
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

    // Remove waypoint
    const removeWaypoint = (id: string) => {
        setWaypoints(prev => prev.filter(w => w.id !== id))
        toast({ title: 'Промежуточная точка удалена' })
    }

    // Handle route built
    const handleRouteBuilt = useCallback((route: any) => {
        try {
            const activeRoute = route.getActiveRoute()
            if (activeRoute) {
                const distance = activeRoute.properties.get('distance') || 0
                const duration = activeRoute.properties.get('duration') || 0
                const coordinates = activeRoute.geometry.getCoordinates()

                const routeData: RouteInfo = {
                    id: `route_${Date.now()}`,
                    name: `Маршрут ${new Date().toLocaleTimeString()}`,
                    distance,
                    duration,
                    timestamp: Date.now(),
                    coordinates,
                    alternativeRoutes: route.getRoutes().slice(1, 4)
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

    // Speech function
    const speak = (text: string) => {
        if (navigationState.voiceEnabled && speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ru-RU'
            speechSynthesisRef.current.speak(utterance)
        }
    }

    // Navigation functions
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

    // Toggle favorite
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

    // Export route
    const exportRoute = (format: 'json' | 'gpx') => {
        if (!routeInfo) return

        const data = format === 'json'
            ? JSON.stringify(routeInfo, null, 2)
            : `<?xml version="1.0"?><gpx version="1.1"><trk><name>${routeInfo.name}</name></trk></gpx>`

        const blob = new Blob([data], {
            type: format === 'json' ? 'application/json' : 'application/gpx+xml'
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `route_${routeInfo.id}.${format}`
        link.click()
        URL.revokeObjectURL(url)

        toast({ title: `Маршрут экспортирован в ${format.toUpperCase()}` })
    }

    // Update map settings
    const updateMapSettings = (newSettings: Partial<MapSettings>) => {
        setMapSettings(prev => ({ ...prev, ...newSettings }))

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

    // Toggle route visibility
    const toggleRouteVisibility = (routeId: number) => {
        setVisibleRoutes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(routeId)) {
                newSet.delete(routeId)
            } else {
                newSet.add(routeId)
            }
            return newSet
        })
    }

    // Get route color
    const getRouteColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return '#22c55e'
            case 'PLANNED': return '#3b82f6'
            case 'COMPLETED': return '#6b7280'
            case 'CANCELLED': return '#ef4444'
            default: return '#3b82f6'
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
            {/* Sidebar */}
            <Card className="w-[420px] flex-shrink-0 overflow-hidden shadow-lg">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-600 text-white">
                                <Navigation2 className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">Планировщик маршрутов</span>
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

                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="p-6 space-y-6">
                            {/* Settings Panel */}
                            {showSettings && (
                                <Card className="bg-muted/50">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                Тип транспорта
                                            </h4>
                                            <Select
                                                value={mapSettings.routingMode}
                                                onValueChange={(value) => updateMapSettings({ routingMode: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="auto">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-4 w-4" />
                                                            Автомобиль
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="truck">
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4" />
                                                            Грузовик
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="pedestrian">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            Пешком
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="masstransit">
                                                        <div className="flex items-center gap-2">
                                                            <Bus className="h-4 w-4" />
                                                            Общественный транспорт
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Layers className="h-4 w-4" />
                                                Настройки карты
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium">Показать пробки</label>
                                                    <Switch
                                                        checked={mapSettings.showTraffic}
                                                        onCheckedChange={(checked) =>
                                                            updateMapSettings({ showTraffic: checked })
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium">Объекты на карте</label>
                                                    <Switch
                                                        checked={mapSettings.showPOI}
                                                        onCheckedChange={(checked) =>
                                                            updateMapSettings({ showPOI: checked })
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium">Существующие маршруты</label>
                                                    <Switch
                                                        checked={mapSettings.showExistingRoutes}
                                                        onCheckedChange={(checked) =>
                                                            updateMapSettings({ showExistingRoutes: checked })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-semibold">Избегать</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { key: 'avoidTolls', label: 'Платные дороги' },
                                                    { key: 'avoidTraffic', label: 'Пробки' },
                                                    { key: 'avoidFerries', label: 'Паромы' }
                                                ].map(({ key, label }) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">{label}</label>
                                                        <Switch
                                                            checked={mapSettings[key as keyof MapSettings] as boolean}
                                                            onCheckedChange={(checked) =>
                                                                updateMapSettings({ [key]: checked })
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Search */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Поиск мест
                                </h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Найти место..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-3">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <Card className="border-2">
                                        <CardContent className="p-2 max-h-48 overflow-y-auto">
                                            {searchResults.map((place, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded transition-colors group"
                                                    onClick={() => {
                                                        if (mapRef.current) {
                                                            mapRef.current.setCenter(place.coords, 15)
                                                        }
                                                        setSearchQuery('')
                                                        setSearchResults([])
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-sm truncate">{place.name}</div>
                                                            {place.description && (
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {place.description}
                                                                </div>
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
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Existing Routes */}
                            {existingRoutes && existingRoutes.length > 0 && mapSettings.showExistingRoutes && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Route className="h-4 w-4" />
                                        Существующие маршруты
                                    </h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {existingRoutes.map((route) => (
                                            <Card key={route.id} className="border">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm truncate">
                                                                {route.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatDistance(route.distance)} • {formatDuration(route.duration)}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleRouteVisibility(route.id)}
                                                            className="h-6 w-6"
                                                        >
                                                            {visibleRoutes.has(route.id) ? (
                                                                <Eye className="h-3 w-3" />
                                                            ) : (
                                                                <EyeOff className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Waypoints */}
                            {waypoints.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Промежуточные точки
                                    </h4>
                                    <div className="space-y-2">
                                        {waypoints.map((waypoint, index) => (
                                            <Card key={waypoint.id} className="border">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div className="font-medium text-sm truncate">
                                                                {waypoint.name}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeWaypoint(waypoint.id)}
                                                            className="text-red-500 hover:bg-red-50 h-6 w-6"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Route Info */}
                            {routeInfo && (
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="route">Маршрут</TabsTrigger>
                                        <TabsTrigger value="navigation">Навигация</TabsTrigger>
                                        <TabsTrigger value="history">История</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="route" className="space-y-4 mt-4">
                                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold">{routeInfo.name}</h3>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleFavorite(routeInfo)}
                                                            className="h-8 w-8"
                                                        >
                                                            {favoriteRoutes.some(r => r.id === routeInfo.id) ?
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> :
                                                                <StarOff className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => exportRoute('json')}
                                                            className="h-8 w-8"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Route className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <div className="text-xs text-gray-600">Расстояние</div>
                                                            <div className="font-semibold">{formatDistance(routeInfo.distance)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-green-600" />
                                                        <div>
                                                            <div className="text-xs text-gray-600">Время</div>
                                                            <div className="font-semibold">{formatDuration(routeInfo.duration)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => exportRoute('gpx')}
                                                className="flex-1"
                                            >
                                                <Download className="mr-1 h-3 w-3" />
                                                GPX
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => exportRoute('json')}
                                                className="flex-1"
                                            >
                                                <Download className="mr-1 h-3 w-3" />
                                                JSON
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="navigation" className="space-y-4 mt-4">
                                        {!navigationState.isActive ? (
                                            <div className="text-center space-y-4">
                                                <Button
                                                    onClick={startNavigation}
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                >
                                                    <Navigation2 className="mr-2 h-4 w-4" />
                                                    Начать навигацию
                                                </Button>
                                                <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                                                    <span className="text-sm">Голосовые подсказки</span>
                                                    <Switch
                                                        checked={navigationState.voiceEnabled}
                                                        onCheckedChange={(checked) =>
                                                            setNavigationState(prev => ({ ...prev, voiceEnabled: checked }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-semibold">Прогресс</span>
                                                            <Badge variant="outline">
                                                                {navigationState.progress.toFixed(0)}%
                                                            </Badge>
                                                        </div>
                                                        <div className="w-full bg-green-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                                                                style={{ width: `${navigationState.progress}%` }}
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-sm text-green-700 font-medium">
                                                            {navigationState.currentInstruction}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="flex items-center justify-center gap-2">
                                                    {navigationState.isPlaying ? (
                                                        <Button onClick={pauseNavigation} variant="outline" size="sm">
                                                            <Pause className="mr-1 h-3 w-3" />
                                                            Пауза
                                                        </Button>
                                                    ) : (
                                                        <Button onClick={resumeNavigation} className="bg-green-600 hover:bg-green-700" size="sm">
                                                            <Play className="mr-1 h-3 w-3" />
                                                            Продолжить
                                                        </Button>
                                                    )}
                                                    <Button onClick={stopNavigation} variant="destructive" size="sm">
                                                        <Square className="mr-1 h-3 w-3" />
                                                        Стоп
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            setNavigationState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
                                                        }
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        {navigationState.voiceEnabled ?
                                                            <Volume2 className="h-3 w-3" /> :
                                                            <VolumeX className="h-3 w-3" />
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="history" className="space-y-4 mt-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">История</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setRouteHistory([])}
                                                className="h-6 w-6"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {routeHistory.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">История пуста</p>
                                                </div>
                                            ) : (
                                                routeHistory.map((route) => (
                                                    <Card key={route.id} className="cursor-pointer hover:bg-muted transition-colors">
                                                        <CardContent className="p-3">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-sm truncate">{route.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {formatDistance(route.distance)} • {formatDuration(route.duration)}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
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
                                                                    className="h-6 w-6"
                                                                >
                                                                    {favoriteRoutes.some(r => r.id === route.id) ?
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> :
                                                                        <StarOff className="h-3 w-3" />
                                                                    }
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}

                            {!routeInfo && (
                                <Card className="border-dashed">
                                    <CardContent className="p-6 text-center">
                                        <Navigation2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                        <div className="font-medium mb-1">Постройте маршрут</div>
                                        <div className="text-sm text-muted-foreground">
                                            Используйте кнопки на карте для планирования
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Map */}
            <Card className="flex-1 overflow-hidden shadow-lg">
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
                                center: MOSCOW_CENTER,
                                zoom: 10,
                                controls: ['zoomControl', 'fullscreenControl']
                            }}
                            width="100%"
                            height="100%"
                            options={{
                                suppressMapOpenBlock: true,
                                suppressObsoleteBrowserNotifier: true
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

                            {mapSettings.showTraffic && (
                                <TrafficControl
                                    options={{
                                        float: "right"
                                    }}
                                />
                            )}

                            <RouteEditor />

                            {/* Existing routes visualization */}
                            {existingRoutes?.map((route) => (
                                visibleRoutes.has(route.id) && (
                                    <Placemark
                                        key={`start-${route.id}`}
                                        geometry={[55.751574 + Math.random() * 0.1, 37.573856 + Math.random() * 0.1]}
                                        options={{
                                            preset: 'islands#greenDotIconWithCaption',
                                            iconCaptionMaxWidth: '200'
                                        }}
                                        properties={{
                                            iconCaption: route.name,
                                            balloonContent: `
                                                <div>
                                                    <strong>${route.name}</strong><br/>
                                                    ${route.startAddress} → ${route.endAddress}<br/>
                                                    ${formatDistance(route.distance)} • ${formatDuration(route.duration)}
                                                </div>
                                            `
                                        }}
                                    />
                                )
                            ))}

                            {/* Waypoints */}
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