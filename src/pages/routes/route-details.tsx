import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetRouteQuery } from '@/shared/api/routesSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Map, Edit } from 'lucide-react'
import { formatDistance, formatDuration, formatDateTime } from '@/shared/utils/format'

export function RouteDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const routeId = id ? parseInt(id, 10) : null

    const { data: route, isLoading, error } = useGetRouteQuery(routeId!, { skip: !routeId })

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Загрузка...</div>
    }

    if (error || !route) {
        return <div className="text-center text-destructive">Маршрут не найден</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/routes">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{route.name}</h1>
                        <p className="text-muted-foreground">
                            {route.startAddress} → {route.endAddress}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                        <Link to={`/routes/${route.id}/map`}>
                            <Map className="h-4 w-4 mr-2" />
                            Показать на карте
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to={`/routes/${route.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Статус</label>
                            <div className="mt-1">
                                <Badge>{route.status}</Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Расстояние</label>
                            <p className="text-lg font-semibold">{formatDistance(route.distance)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Время в пути</label>
                            <p className="text-lg font-semibold">{formatDuration(route.duration)}</p>
                        </div>
                        {route.departureTime && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Время отправления</label>
                                <p className="text-lg font-semibold">{formatDateTime(route.departureTime)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Участники</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {route.vehicle && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Транспортное средство</label>
                                <p className="font-medium">{route.vehicle.licensePlate} ({route.vehicle.brand} {route.vehicle.model})</p>
                            </div>
                        )}
                        {route.driver && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Водитель</label>
                                <p className="font-medium">{route.driver.name}</p>
                            </div>
                        )}
                        {route.cargo && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Груз</label>
                                <p className="font-medium">{route.cargo.type} ({route.cargo.weight} кг)</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}