import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetRoutesQuery, useDeleteRouteMutation } from '@/shared/api/routesSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Eye,
    Edit,
    Trash2,
    Plus,
    Map,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistance, formatDuration } from '@/shared/utils/format'

export function RoutesPage() {
    const { toast } = useToast()
    const { data: routes, isLoading, error } = useGetRoutesQuery()
    const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation()
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id)
            await deleteRoute(id).unwrap()
            toast({
                title: 'Маршрут удален',
                description: 'Маршрут успешно удален из системы',
            })
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить маршрут',
                variant: 'destructive',
            })
        } finally {
            setDeletingId(null)
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'default'
            case 'IN_PROGRESS': return 'secondary'
            case 'CANCELLED': return 'destructive'
            default: return 'outline'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PLANNED': return 'Запланирован'
            case 'IN_PROGRESS': return 'В пути'
            case 'COMPLETED': return 'Завершен'
            case 'CANCELLED': return 'Отменен'
            default: return status
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                    <p className="text-muted-foreground">Загрузка маршрутов...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Card className="w-96">
                    <CardContent className="text-center py-12 space-y-4">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <p className="text-muted-foreground">Ошибка загрузки маршрутов</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Попробовать снова
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Маршруты</h1>
                    <p className="text-muted-foreground">
                        Управление маршрутами грузоперевозок
                    </p>
                </div>
                <Button asChild>
                    <Link to="/routes/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Создать маршрут
                    </Link>
                </Button>
            </div>

            {routes && routes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <Map className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Нет маршрутов</h3>
                                <p className="text-muted-foreground">
                                    Создайте свой первый маршрут для начала работы
                                </p>
                            </div>
                            <Button asChild>
                                <Link to="/routes/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать маршрут
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {routes?.map((route) => (
                        <Card key={route.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">{route.name}</CardTitle>
                                    <Badge variant={getStatusVariant(route.status)}>
                                        {getStatusLabel(route.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Маршрут</p>
                                        <p className="font-medium">
                                            {route.startAddress} → {route.endAddress}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Расстояние</p>
                                        <p className="font-medium">{formatDistance(route.distance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Время в пути</p>
                                        <p className="font-medium">{formatDuration(route.duration)}</p>
                                    </div>
                                    {route.estimatedCost && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Стоимость</p>
                                            <p className="font-medium">
                                                {route.estimatedCost.toLocaleString('ru-RU')} ₽
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-6">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/routes/${route.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Просмотр
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/routes/${route.id}/map`}>
                                            <Map className="mr-2 h-4 w-4" />
                                            Карта
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/routes/${route.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Редактировать
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(route.id)}
                                        disabled={deletingId === route.id || isDeleting}
                                    >
                                        {deletingId === route.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="mr-2 h-4 w-4" />
                                        )}
                                        Удалить
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}