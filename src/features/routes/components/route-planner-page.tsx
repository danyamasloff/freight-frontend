import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {
    Calculator,
    ChevronRight,
    Map,
    Route as RouteIcon,
    Save,
    Search,
    Download
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Badge} from '@/components/ui/badge'
import {RoutePlanningForm} from './route-planning-form'
import {RouteMapPicker} from './route-map-picker.tsx'
import {PlaceSearch} from '@/features/geocoding/components/place-search'
import {formatDistance, formatDuration, formatCurrency} from '@/shared/utils/format'
import {useToast} from '@/hooks/use-toast'
import type {RouteResponseExtended, GeoLocation} from '@/shared/types/api'

export function RoutePlannerPage() {
    const [activeTab, setActiveTab] = useState('planning')
    const [calculatedRoute, setCalculatedRoute] = useState<RouteResponseExtended | null>(null)
    const [savedRoutes, setSavedRoutes] = useState<RouteResponseExtended[]>([])
    const navigate = useNavigate()
    const {toast} = useToast()

    const handleRouteCalculated = (route: RouteResponseExtended) => {
        setCalculatedRoute(route)
        setActiveTab('map') // Переключаемся на карту для просмотра

        toast({
            title: "Маршрут рассчитан",
            description: `${formatDistance(route.distance * 1000)} • ${formatDuration(route.duration * 60)}`
        })
    }

    const handlePlaceSelect = (place: GeoLocation) => {
        // Можно использовать выбранное место для автозаполнения формы
        setActiveTab('planning')
        toast({
            title: "Место выбрано",
            description: place.name
        })
    }

    const handleSaveRoute = () => {
        if (!calculatedRoute) return

        setSavedRoutes(prev => [...prev, calculatedRoute])
        toast({
            title: "Маршрут сохранен",
            description: "Маршрут добавлен в сохраненные"
        })
    }

    const handleCreateRoute = () => {
        if (!calculatedRoute) return

        // Переходим на страницу создания маршрута с предзаполненными данными
        navigate('/routes/create', {
            state: {calculatedRoute}
        })
    }

    const handleExportRoute = () => {
        if (!calculatedRoute) return

        // Экспорт маршрута в GPX или JSON
        const routeData = {
            distance: calculatedRoute.distance,
            duration: calculatedRoute.duration,
            coordinates: calculatedRoute.coordinates,
            startAddress: calculatedRoute.startAddress,
            endAddress: calculatedRoute.endAddress,
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(routeData, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `route-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)

        toast({
            title: "Маршрут экспортирован",
            description: "Файл загружен на ваше устройство"
        })
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/routes">Маршруты</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2"/>
                <span className="text-foreground font-medium">Планировщик маршрутов</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Calculator className="h-8 w-8"/>
                    Планировщик маршрутов
                </h1>
                <p className="text-muted-foreground mt-1">
                    Интерактивное планирование маршрутов с анализом рисков и экономики
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Основной контент */}
                <div className="col-span-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="planning" className="flex items-center gap-2">
                                <Calculator className="h-4 w-4"/>
                                Планирование
                            </TabsTrigger>
                            <TabsTrigger value="map" className="flex items-center gap-2">
                                <Map className="h-4 w-4"/>
                                Карта
                            </TabsTrigger>
                            <TabsTrigger value="search" className="flex items-center gap-2">
                                <Search className="h-4 w-4"/>
                                Поиск мест
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="planning">
                            <RoutePlanningForm onRouteCalculated={handleRouteCalculated}/>
                        </TabsContent>

                        <TabsContent value="map">
                            <RouteMapPicker
                                startCoords={calculatedRoute?.coordinates?.[0]}
                                endCoords={calculatedRoute?.coordinates?.[calculatedRoute.coordinates.length - 1]}
                                startAddress={calculatedRoute?.startAddress}
                                endAddress={calculatedRoute?.endAddress}
                                onRouteBuilt={(route) => {
                                    const extendedRoute: RouteResponseExtended = {
                                        distance: route.distance / 1000,
                                        duration: route.duration / 60,
                                        coordinates: route.coordinates,
                                        instructions: route.instructions || []
                                    }
                                    setCalculatedRoute(extendedRoute)
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="search">
                            <PlaceSearch
                                onPlaceSelect={handlePlaceSelect}
                                showCurrentLocation={true}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Боковая панель */}
                <div className="col-span-4 space-y-6">
                    {/* Информация о текущем маршруте */}
                    {calculatedRoute && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Текущий маршрут</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Расстояние</div>
                                        <div className="font-bold text-lg">
                                            {formatDistance(calculatedRoute.distance * 1000)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Время</div>
                                        <div className="font-bold text-lg">
                                            {formatDuration(calculatedRoute.duration * 60)}
                                        </div>
                                    </div>
                                </div>

                                {calculatedRoute.totalEstimatedCost && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Стоимость</div>
                                        <div className="font-bold text-xl text-blue-600">
                                            {formatCurrency(calculatedRoute.totalEstimatedCost)}
                                        </div>
                                    </div>
                                )}

                                {calculatedRoute.riskScore && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Уровень риска</div>
                                        <Badge variant={
                                            calculatedRoute.riskScore > 0.7 ? 'destructive' :
                                                calculatedRoute.riskScore > 0.4 ? 'secondary' : 'default'
                                        }>
                                            {Math.round(calculatedRoute.riskScore * 100)}% риск
                                        </Badge>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4">
                                    <Button onClick={handleCreateRoute} className="w-full">
                                        <RouteIcon className="h-4 w-4 mr-2"/>
                                        Создать маршрут
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" onClick={handleSaveRoute}>
                                            <Save className="h-4 w-4 mr-2"/>
                                            Сохранить
                                        </Button>
                                        <Button variant="outline" onClick={handleExportRoute}>
                                            <Download className="h-4 w-4 mr-2"/>
                                            Экспорт
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Сохраненные маршруты */}
                    {savedRoutes.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Сохраненные маршруты</CardTitle>
                                <CardDescription>
                                    {savedRoutes.length} маршрут(ов)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {savedRoutes.slice(0, 5).map((route, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                                            onClick={() => setCalculatedRoute(route)}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {formatDistance(route.distance * 1000)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDuration(route.duration * 60)}
                                                </div>
                                            </div>
                                            <RouteIcon className="h-4 w-4 text-muted-foreground"/>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Быстрые действия */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Быстрые действия</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to="/routes">
                                    <RouteIcon className="h-4 w-4 mr-2"/>
                                    Все маршруты
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to="/routes/create">
                                    <RouteIcon className="h-4 w-4 mr-2"/>
                                    Создать маршрут
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to="/analytics">
                                    <Calculator className="h-4 w-4 mr-2"/>
                                    Аналитика
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}