import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    AlertCircle,
    Loader2,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { useGetDriversQuery } from '@/shared/api/driversSlice'
import { DrivingStatus, DRIVER_STATUS_CONFIG, type DriverSummary } from '../types'
import { DriverStatusPanel } from './driver-status-panel'

export function DriversPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const { data: drivers, isLoading, error } = useGetDriversQuery()

    // Filter and sort drivers
    const filteredAndSortedDrivers = drivers?.filter(driver => {
        // Search filter
        const matchesSearch = searchQuery
            ? driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.phone?.toLowerCase().includes(searchQuery.toLowerCase())
            : true

        // Status filter
        const matchesStatus = filterStatus === 'ALL' || driver.status === filterStatus

        return matchesSearch && matchesStatus
    })?.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortBy) {
            case 'name':
                aValue = a.name
                bValue = b.name
                break
            case 'experience':
                aValue = a.experience || 0
                bValue = b.experience || 0
                break
            case 'rating':
                aValue = a.rating || 0
                bValue = b.rating || 0
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

    const getDriverInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getStatusBadge = (status: DrivingStatus) => {
        const config = DRIVER_STATUS_CONFIG[status]
        return (
            <Badge variant={status === DrivingStatus.DRIVING ? "default" : "secondary"}>
                <span className="mr-1">{config.icon}</span>
                {config.label}
            </Badge>
        )
    }

    const isLicenseExpiringSoon = (driver: DriverSummary) => {
        // This would need to be implemented based on license expiry data from API
        return false
    }

    const formatLocation = (location?: { lat: number; lng: number; address?: string }) => {
        if (!location) return 'Неизвестно'
        if (location.address) return location.address
        return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить список водителей. Пожалуйста, попробуйте позже.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Водители</h1>
                    <p className="text-muted-foreground mt-1">
                        Управление водителями и мониторинг их статуса
                    </p>
                </div>
                <Button asChild>
                    <Link to="/drivers/create">
                        <Plus className="mr-2 h-4 w-4" /> Добавить водителя
                    </Link>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Всего водителей</p>
                                <p className="text-2xl font-bold">{drivers?.length || 0}</p>
                            </div>
                            <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">На маршруте</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {drivers?.filter(d => d.status === DrivingStatus.DRIVING).length || 0}
                                </p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">На отдыхе</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {drivers?.filter(d => [DrivingStatus.REST_BREAK, DrivingStatus.DAILY_REST, DrivingStatus.WEEKLY_REST].includes(d.status)).length || 0}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Требует внимания</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {drivers?.filter(driver => isLicenseExpiringSoon(driver)).length || 0}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список водителей</CardTitle>
                    <CardDescription>
                        Управление водительским составом и мониторинг их рабочего времени
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters and Search */}
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по имени, номеру прав или телефону"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Фильтр по статусу" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Все статусы</SelectItem>
                                    <Separator className="my-1" />
                                    {Object.values(DrivingStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {DRIVER_STATUS_CONFIG[status].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Сортировка" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">По имени</SelectItem>
                                    <SelectItem value="experience">По стажу</SelectItem>
                                    <SelectItem value="rating">По рейтингу</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Загрузка водителей...</span>
                        </div>
                    ) : filteredAndSortedDrivers.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <User className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Водители не найдены</h3>
                            <p className="mt-2 text-muted-foreground">
                                {searchQuery || filterStatus !== 'ALL'
                                    ? "Попробуйте изменить параметры поиска или фильтрации"
                                    : "Нажмите на кнопку 'Добавить водителя', чтобы добавить первого водителя"}
                            </p>
                            {!(searchQuery || filterStatus !== 'ALL') && (
                                <Button asChild className="mt-4">
                                    <Link to="/drivers/create">
                                        <Plus className="mr-2 h-4 w-4" /> Добавить водителя
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Водитель</TableHead>
                                        <TableHead>Контакты</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Местоположение</TableHead>
                                        <TableHead>Стаж/Рейтинг</TableHead>
                                        <TableHead className="text-right w-32">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedDrivers.map((driver) => (
                                        <TableRow key={driver.id}>
                                            <TableCell>{driver.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-xs">
                                                            {getDriverInitials(driver.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{driver.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            № {driver.licenseNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {driver.phone && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {driver.phone}
                                                        </div>
                                                    )}
                                                    {driver.email && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {driver.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(driver.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    <span className="max-w-32 truncate">
                                                        {formatLocation(driver.currentLocation)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">
                                                        {driver.experience ? `${driver.experience} лет` : '-'}
                                                    </div>
                                                    {driver.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-muted-foreground">★</span>
                                                            <span className="text-xs">{driver.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/drivers/${driver.id}`}>
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