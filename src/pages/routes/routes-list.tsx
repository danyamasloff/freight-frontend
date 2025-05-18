import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetRoutesQuery, useDeleteRouteMutation } from '@/shared/api/routesSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistance, formatDuration } from '@/shared/utils/format'

export function RoutesListPage() {
    const { toast } = useToast()
    const { data: routes, isLoading, error } = useGetRoutesQuery()
    const [deleteRoute] = useDeleteRouteMutation()
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        try {
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
        }
    }

    if (isLoading) {
        return <div>Загрузка маршрутов...</div>
    }

    if (error) {
        return <div>Ошибка загрузки маршрутов</div>
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

            <div className="grid gap-4">
                {routes?.map((route) => (
                    <Card key={route.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{route.name}</CardTitle>
                                <Badge
                                    variant={
                                        route.status === 'COMPLETED' ? 'default' :
                                            route.status === 'IN_PROGRESS' ? 'secondary' :
                                                route.status === 'CANCELLED' ? 'destructive' :
                                                    'outline'
                                    }
                                >
                                    {route.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to={`/routes/${route.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Просмотр
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
                                    disabled={deleteId === route.id}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}