import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Route as RouteIcon, ChevronRight, Map, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RouteForm } from './route-form'
import { RoutePlanningForm } from './route-planning-form'
import type { RouteResponseExtended } from '@/shared/types/api'
import {RouteMapPicker} from './route-map-picker.tsx';

export function CreateRoutePage() {
    const [activeTab, setActiveTab] = useState('planning')
    const [calculatedRoute, setCalculatedRoute] = useState<RouteResponseExtended | null>(null)
    const [routeCoordinates, setRouteCoordinates] = useState<{
        startCoords?: [number, number]
        endCoords?: [number, number]
        startAddress?: string
        endAddress?: string
    }>({})

    const handleRouteCalculated = (route: RouteResponseExtended) => {
        setCalculatedRoute(route)

        // Если есть координаты и адреса, извлекаем их для формы
        if (route.coordinates && route.coordinates.length > 0) {
            setRouteCoordinates({
                startCoords: route.coordinates[0],
                endCoords: route.coordinates[route.coordinates.length - 1],
                startAddress: route.startAddress,
                endAddress: route.endAddress
            })
        }

        // Автоматически переключаемся на вкладку создания
        setActiveTab('create')
    }

    const handleMapRouteBuilt = (route: {
        distance: number
        duration: number
        coordinates: [number, number][]
        instructions?: any[]
    }) => {
        // Преобразуем данные карты в RouteResponseExtended
        const extendedRoute: RouteResponseExtended = {
            distance: route.distance / 1000, // конвертируем в км
            duration: route.duration / 60, // конвертируем в минуты
            coordinates: route.coordinates,
            instructions: route.instructions || [],
            startAddress: routeCoordinates.startAddress,
            endAddress: routeCoordinates.endAddress
        }

        setCalculatedRoute(extendedRoute)
        setActiveTab('create')
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/routes">Маршруты</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Создание маршрута</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <RouteIcon className="h-8 w-8" />
                    Создание нового маршрута
                </h1>
                <p className="text-muted-foreground mt-1">
                    Спланируйте маршрут или создайте его вручную
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="planning" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Планирование
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        Карта
                    </TabsTrigger>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                        <RouteIcon className="h-4 w-4" />
                        Создание
                    </TabsTrigger>
                </TabsList>

                {/* Вкладка планирования маршрута */}
                <TabsContent value="planning">
                    <RoutePlanningForm onRouteCalculated={handleRouteCalculated} />
                </TabsContent>

                {/* Вкладка карты */}
                <TabsContent value="map">
                    <RouteMapPicker
                        startCoords={routeCoordinates.startCoords}
                        endCoords={routeCoordinates.endCoords}
                        startAddress={routeCoordinates.startAddress}
                        endAddress={routeCoordinates.endAddress}
                        onStartChange={(coords, address) => {
                            setRouteCoordinates(prev => ({
                                ...prev,
                                startCoords: coords,
                                startAddress: address
                            }))
                        }}
                        onEndChange={(coords, address) => {
                            setRouteCoordinates(prev => ({
                                ...prev,
                                endCoords: coords,
                                endAddress: address
                            }))
                        }}
                        onRouteBuilt={handleMapRouteBuilt}
                    />
                </TabsContent>

                {/* Вкладка создания маршрута */}
                <TabsContent value="create">
                    {calculatedRoute && (
                        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                            <CardHeader>
                                <CardTitle className="text-blue-800 dark:text-blue-200">
                                    Использовать рассчитанный маршрут
                                </CardTitle>
                                <CardDescription>
                                    Маршрут: {calculatedRoute.distance.toFixed(1)} км, {Math.round(calculatedRoute.duration)} мин
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={() => {
                                            // Автозаполнение формы данными из рассчитанного маршрута
                                            // Эта логика будет реализована в RouteForm
                                        }}
                                    >
                                        Использовать этот маршрут
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCalculatedRoute(null)}
                                    >
                                        Создать маршрут вручную
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <RouteForm
                        initialData={calculatedRoute ? {
                            startLat: calculatedRoute.coordinates?.[0]?.[0] || 0,
                            startLon: calculatedRoute.coordinates?.[0]?.[1] || 0,
                            endLat: calculatedRoute.coordinates?.[calculatedRoute.coordinates.length - 1]?.[0] || 0,
                            endLon: calculatedRoute.coordinates?.[calculatedRoute.coordinates.length - 1]?.[1] || 0,
                            startAddress: calculatedRoute.startAddress || '',
                            endAddress: calculatedRoute.endAddress || '',
                        } : undefined}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}