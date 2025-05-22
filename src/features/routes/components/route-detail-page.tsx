import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    ChevronRight,
    Clock,
    Edit,
    Loader2,
    MapPin,
    Route as RouteIcon,
    User,
    Truck,
    Package,
    Navigation,
    Play,
    Pause,
    Square,
    Download,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Cloud,
    Thermometer,
    Wind
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { useGetRouteQuery, useDeleteRouteMutation } from '@/shared/api/routesSlice'
import { useToast } from '@/hooks/use-toast'
import { formatDistance, formatDuration, formatDateTime, formatCurrency } from '@/shared/utils/format'
import { ROUTE_STATUS_CONFIG, type RouteStatus } from '../types'

export function RouteDetailPage() {
    const { id } = useParams<{ id: string }>()
    const routeId = parseInt(id || '0')
    const navigate = useNavigate()
    const { toast } = useToast()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    const { data: route, isLoading, error } = useGetRouteQuery(routeId)
    const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation()

    useEffect(() => {
        if (!id || isNaN(routeId)) {
            navigate('/routes')
        }
    }, [id, routeId, navigate])

    const handleDelete = async () => {
        try {
            await deleteRoute(routeId).unwrap()
            toast({
                title: "Маршрут удален",
                description: "Маршрут успешно удален из системы."
            })
            navigate('/routes')
        } catch (error) {
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить маршрут. Пожалуйста, попробуйте еще раз.",
                variant: "destructive"
            })
            console.error("Error deleting route:", error)
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const getStatusBadge = (status: RouteStatus) => {
        const config = ROUTE_STATUS_CONFIG[status] || ROUTE_STATUS_CONFIG.PLANNED
        return (
            <Badge variant={config.variant} className="gap-1">
                <span>{config.icon}</span>
                {config.label}
            </Badge>
        )
    }

    const getRiskLevelBadge = (riskScore?: number) => {
        if (!riskScore) return null

        let variant: 'default' | 'destructive' | 'secondary' = 'default'
        let label = 'Низкий'

        if (riskScore > 0.7) {
            variant = 'destructive'
            label = 'Высокий'
        } else if (riskScore > 0.4) {
            variant = 'secondary'
            label = 'Средний'
        }

        return <Badge variant={variant}>{label} риск</Badge>
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить данные о маршруте. Пожалуйста, попробуйте позже.
                </AlertDescription>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/routes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </Alert>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/routes">Маршруты</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">
                    {isLoading ? "Загрузка..." : route?.name || "Детали маршрута"}
                </span>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="col-span-8">
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-2xl">
                                {isLoading ? <Skeleton className="h-8 w-48" /> : (
                                    <div className="flex items-center gap-3">
                                        <RouteIcon className="h-6 w-6" />
                                        {route?.name}
                                    </div>
                                )}
                            </CardTitle>
                            <div className="flex space-x-2">
                                {!isLoading && (
                                    <>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/routes/edit/${routeId}`}>
                                                <Edit className="h-4 w-4 mr-1" /> Редактировать
                                            </Link>
                                        </Button>
                                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Удалить
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Удаление маршрута</DialogTitle>
                                                    <DialogDescription>
                                                        Вы уверены, что хотите удалить маршрут "{route?.name}"? Это действие нельзя отменить.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                        Отмена
                                                    </Button>
                                                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Удалить
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Статус</div>
                                        <div>{route ? getStatusBadge((route.status as RouteStatus) || 'PLANNED') : '-'}</div>
                                    </div>

                                    <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Расстояние</div>
                                        <div className="font-medium text-lg">
                                            {route ? formatDistance(route.distance) : '-'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Время в пути</div>
                                        <div className="font-medium text-lg">
                                            {route ? formatDuration(route.duration) : '-'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Обзор</TabsTrigger>
                            <TabsTrigger value="details">Детали</TabsTrigger>
                            <TabsTrigger value="weather">Погода</TabsTrigger>
                            <TabsTrigger value="tracking">Отслеживание</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Маршрут</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mt-2" />
                                                <div>
                                                    <div className="font-medium">Точка отправления</div>
                                                    <div className="text-muted-foreground">{route?.startAddress}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mt-2" />
                                                <div>
                                                    <div className="font-medium">Точка назначения</div>
                                                    <div className="text-muted-foreground">{route?.endAddress}</div>
                                                </div>
                                            </div>

                                            {route?.waypoints && route.waypoints.length > 0 && (
                                                <div>
                                                    <div className="font-medium mb-2">Промежуточные точки</div>
                                                    {route.waypoints.map((waypoint, index) => (
                                                        <div key={index} className="flex items-start gap-3 ml-4">
                                                            <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
                                                            <div className="text-muted-foreground">
                                                                {waypoint.address || `${waypoint.lat}, ${waypoint.lng}`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Назначенные ресурсы</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3">
                                                <Truck className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Транспорт</div>
                                                    <div className="font-medium">
                                                        {route?.vehicle ? route.vehicle.licensePlate : 'Не назначен'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Водитель</div>
                                                    <div className="font-medium">
                                                        {route?.driver ? route.driver.name : 'Не назначен'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Груз</div>
                                                    <div className="font-medium">
                                                        {route?.cargo ? route.cargo.name : 'Не назначен'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Анализ маршрута</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Оценка риска</span>
                                                    <span className="font-medium">
                                                        {getRiskLevelBadge(route?.riskScore)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Расход топлива</span>
                                                    <span className="font-medium">
                                                        {route?.fuelConsumption ? `${route.fuelConsumption} л` : '-'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Платные дороги</span>
                                                    <span className="font-medium">
                                                        {route?.estimatedTollCost ? formatCurrency(route.estimatedTollCost) : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Погодный риск</span>
                                                    <span className="font-medium">
                                                        {route?.weatherRisk ? `${Math.round(route.weatherRisk * 100)}%` : '-'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Дорожный риск</span>
                                                    <span className="font-medium">
                                                        {route?.roadQualityRisk ? `${Math.round(route.roadQualityRisk * 100)}%` : '-'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Общая стоимость</span>
                                                    <span className="font-medium text-lg">
                                                        {route?.totalEstimatedCost ? formatCurrency(route.totalEstimatedCost) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Технические детали</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">ID маршрута</span>
                                            <span className="font-medium">{route?.id}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Время отправления</span>
                                            <span className="font-medium">
                                                {route?.departureTime ? formatDateTime(route.departureTime) : 'Не указано'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Дата создания</span>
                                            <span className="font-medium">
                                                {route?.createdAt ? formatDateTime(route.createdAt) : '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Последнее обновление</span>
                                            <span className="font-medium">
                                                {route?.updatedAt ? formatDateTime(route.updatedAt) : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {route?.riskFactors && route.riskFactors.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Факторы риска</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {route.riskFactors.map((factor, index) => (
                                                <Alert key={index} className="py-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>{factor}</AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="weather" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Прогноз погоды</CardTitle>
                                    <CardDescription>
                                        Погодные условия по маршруту
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Cloud className="h-12 w-12 mx-auto mb-4" />
                                        <p>Прогноз погоды будет доступен после активации маршрута</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tracking" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Отслеживание маршрута</CardTitle>
                                    <CardDescription>
                                        Мониторинг выполнения маршрута в реальном времени
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Navigation className="h-12 w-12 mx-auto mb-4" />
                                        <p>Отслеживание будет доступно после начала выполнения маршрута</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Управление маршрутом</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {route?.status === 'PLANNED' && (
                                <Button className="w-full justify-start">
                                    <Play className="mr-2 h-4 w-4" /> Начать выполнение
                                </Button>
                            )}

                            {route?.status === 'IN_PROGRESS' && (
                                <>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Pause className="mr-2 h-4 w-4" /> Приостановить
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Square className="mr-2 h-4 w-4" /> Завершить
                                    </Button>
                                </>
                            )}

                            <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" /> Экспорт
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <TrendingUp className="mr-2 h-4 w-4" /> Аналитика
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Информация о расходах</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Топливо</span>
                                        <span className="font-medium">
                                            {route?.estimatedFuelCost ? formatCurrency(route.estimatedFuelCost) : '-'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Платные дороги</span>
                                        <span className="font-medium">
                                            {route?.estimatedTollCost ? formatCurrency(route.estimatedTollCost) : '-'}
                                        </span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-medium">
                                        <span>Общая стоимость</span>
                                        <span>
                                            {route?.totalEstimatedCost ? formatCurrency(route.totalEstimatedCost) : '-'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}