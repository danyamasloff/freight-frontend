import {useState} from 'react'
import {Link} from 'react-router-dom'
import {
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    AlertCircle,
    Loader2,
    Route as RouteIcon,
    MapPin,
    Clock,
    Truck,
    User,
    Calendar,
    Navigation,
    CheckCircle2,
    Calculator
} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {Separator} from '@/components/ui/separator'

import {useGetRoutesQuery} from '@/shared/api/routesSlice'
import {formatDistance, formatDuration, formatDateTime} from '@/shared/utils/format'
import {ROUTE_STATUS_CONFIG, type RouteStatus} from '../types'
import type {RouteSummary} from '@/shared/types/api'

export function RoutesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<RouteStatus | 'ALL'>('ALL')
    const [sortBy, setSortBy] = useState('departureTime')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const {data: routes, isLoading, error} = useGetRoutesQuery()

    // Filter and sort routes
    const filteredAndSortedRoutes = routes?.filter(route => {
        // Search filter
        const matchesSearch = searchQuery
            ? route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.startAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.endAddress.toLowerCase().includes(searchQuery.toLowerCase())
            : true

        // Status filter
        const matchesStatus = filterStatus === 'ALL' || route.status === filterStatus

        return matchesSearch && matchesStatus
    })?.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortBy) {
            case 'name':
                aValue = a.name
                bValue = b.name
                break
            case 'distance':
                aValue = a.distance
                bValue = b.distance
                break
            case 'duration':
                aValue = a.duration
                bValue = b.duration
                break
            case 'departureTime':
                aValue = a.departureTime ? new Date(a.departureTime).getTime() : 0
                bValue = b.departureTime ? new Date(b.departureTime).getTime() : 0
                break
            case 'estimatedCost':
                aValue = a.estimatedCost || 0
                bValue = b.estimatedCost || 0
                break
            default:
                aValue = a.name
                bValue = b.name
        }

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
    }) || []

    const getStatusBadge = (status: RouteStatus) => {
        const config = ROUTE_STATUS_CONFIG[status] || ROUTE_STATUS_CONFIG.PLANNED
        return (
            <Badge variant={config.variant} className="gap-1">
                <span>{config.icon}</span>
                {config.label}
            </Badge>
        )
    }

    const getRouteStats = () => {
        if (!routes) return {total: 0, planned: 0, inProgress: 0, completed: 0}

        return {
            total: routes.length,
            planned: routes.filter(r => r.status === 'PLANNED').length,
            inProgress: routes.filter(r => r.status === 'IN_PROGRESS').length,
            completed: routes.filter(r => r.status === 'COMPLETED').length,
        }
    }

    const stats = getRouteStats()

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить список маршрутов. Пожалуйста, попробуйте позже.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Маршруты</h1>
                    <p className="text-muted-foreground mt-1">
                        Планирование и управление маршрутами доставки
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link to="/routes/planner">
                            <Calculator className="mr-2 h-4 w-4"/>
                            Планировщик
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to="/routes/create">
                            <Plus className="mr-2 h-4 w-4"/> Создать маршрут
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Всего маршрутов</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <RouteIcon className="h-8 w-8 text-muted-foreground"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Планируется</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">В пути</p>
                                <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
                            </div>
                            <Navigation className="h-8 w-8 text-green-600"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Завершено</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-gray-600"/>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список маршрутов</CardTitle>
                    <CardDescription>
                        Планирование, отслеживание и управление маршрутами доставки
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters and Search */}
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                placeholder="Поиск по названию или адресам"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground"/>
                            <Select
                                value={filterStatus}
                                onValueChange={(value: RouteStatus | 'ALL') => setFilterStatus(value)}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Фильтр по статусу"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Все статусы</SelectItem>
                                    <Separator className="my-1"/>
                                    <SelectItem value="PLANNED">Планируется</SelectItem>
                                    <SelectItem value="IN_PROGRESS">В пути</SelectItem>
                                    <SelectItem value="COMPLETED">Завершен</SelectItem>
                                    <SelectItem value="CANCELLED">Отменен</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Сортировка"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="departureTime">По времени отправления</SelectItem>
                                    <SelectItem value="name">По названию</SelectItem>
                                    <SelectItem value="distance">По расстоянию</SelectItem>
                                    <SelectItem value="duration">По времени в пути</SelectItem>
                                    <SelectItem value="estimatedCost">По стоимости</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                <ArrowUpDown className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <span className="ml-2 text-muted-foreground">Загрузка маршрутов...</span>
                        </div>
                    ) : filteredAndSortedRoutes.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground"/>
                            <h3 className="mt-4 text-lg font-medium">Маршруты не найдены</h3>
                            <p className="mt-2 text-muted-foreground">
                                {searchQuery || filterStatus !== 'ALL'
                                    ? "Попробуйте изменить параметры поиска или фильтрации"
                                    : "Нажмите на кнопку 'Создать маршрут', чтобы создать первый маршрут"}
                            </p>
                            {!(searchQuery || filterStatus !== 'ALL') && (
                                <div className="flex gap-2 justify-center mt-4">
                                    <Button asChild>
                                        <Link to="/routes/create">
                                            <Plus className="mr-2 h-4 w-4"/> Создать маршрут
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link to="/routes/planner">
                                            <Calculator className="mr-2 h-4 w-4"/> Планировщик
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Маршрут</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Расстояние/Время</TableHead>
                                        <TableHead>Ресурсы</TableHead>
                                        <TableHead>Отправление</TableHead>
                                        <TableHead className="text-right">Стоимость</TableHead>
                                        <TableHead className="text-right w-32">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedRoutes.map((route) => (
                                        <TableRow key={route.id}>
                                            <TableCell>{route.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{route.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <MapPin className="h-3 w-3"/>
                                                            <span
                                                                className="max-w-48 truncate">{route.startAddress}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3"/>
                                                            <span
                                                                className="max-w-48 truncate">{route.endAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge((route.status as RouteStatus) || 'PLANNED')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <RouteIcon className="h-3 w-3 text-muted-foreground"/>
                                                        {formatDistance(route.distance)}
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="h-3 w-3"/>
                                                        {formatDuration(route.duration)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {route.vehicleId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Truck className="h-3 w-3 mr-1"/>
                                                            ТС
                                                        </Badge>
                                                    )}
                                                    {route.driverId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <User className="h-3 w-3 mr-1"/>
                                                            Водитель
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {route.departureTime ? (
                                                        formatDateTime(route.departureTime)
                                                    ) : (
                                                        <span className="text-muted-foreground">Не указано</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {route.estimatedCost ? (
                                                    <div className="font-medium">
                                                        {route.estimatedCost.toLocaleString()} ₽
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/routes/${route.id}`}>
                                                        Детали
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}