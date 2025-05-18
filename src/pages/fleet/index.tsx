import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Truck,
    Plus,
    Search,
    Filter,
    MapPin,
    Fuel,
    Wrench,
    Calendar,
    Eye,
    Edit,
    MoreHorizontal,
    Gauge
} from 'lucide-react'

// Mock data
const vehicles = [
    {
        id: 1,
        licensePlate: 'А123БВ77',
        brand: 'Volvo',
        model: 'FH',
        year: 2020,
        status: 'IN_USE',
        currentLocation: 'Москва, ТТК',
        mileage: 285420,
        fuelLevel: 85,
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        driver: 'Петров А.И.',
        route: 'Москва - СПб',
        condition: 'excellent',
        vin: 'YV2A8A243FA123456'
    },
    {
        id: 2,
        licensePlate: 'В456ГД77',
        brand: 'MAN',
        model: 'TGX',
        year: 2019,
        status: 'MAINTENANCE',
        currentLocation: 'СТО "Техцентр"',
        mileage: 320150,
        fuelLevel: 45,
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-04-20',
        driver: null,
        route: null,
        condition: 'good',
        vin: 'WMA05XXX123456789'
    },
    {
        id: 3,
        licensePlate: 'Е789ЖЗ77',
        brand: 'Scania',
        model: 'R-Series',
        year: 2021,
        status: 'AVAILABLE',
        currentLocation: 'База, стоянка №3',
        mileage: 145780,
        fuelLevel: 92,
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-04-10',
        driver: null,
        route: null,
        condition: 'excellent',
        vin: 'YS2G4X20001234567'
    },
    {
        id: 4,
        licensePlate: 'И012КЛ77',
        brand: 'Mercedes-Benz',
        model: 'Actros',
        year: 2018,
        status: 'OUT_OF_SERVICE',
        currentLocation: 'СТО "Ремзона"',
        mileage: 450230,
        fuelLevel: 15,
        lastMaintenance: '2023-12-05',
        nextMaintenance: '2024-03-05',
        driver: null,
        route: null,
        condition: 'needs_repair',
        vin: 'WDB9630261L123456'
    }
]

const fleetStats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    inUse: vehicles.filter(v => v.status === 'IN_USE').length,
    maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
    outOfService: vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length,
    averageMileage: vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length,
    averageFuel: vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length,
    maintenanceDue: vehicles.filter(v => {
        const nextDate = new Date(v.nextMaintenance)
        const now = new Date()
        const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
        return daysUntil <= 30
    }).length
}

export function FleetPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500'
            case 'IN_USE': return 'bg-blue-500'
            case 'MAINTENANCE': return 'bg-yellow-500'
            case 'OUT_OF_SERVICE': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Доступен'
            case 'IN_USE': return 'На линии'
            case 'MAINTENANCE': return 'ТО'
            case 'OUT_OF_SERVICE': return 'Не в эксплуатации'
            default: return status
        }
    }

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'text-green-600'
            case 'good': return 'text-blue-600'
            case 'fair': return 'text-yellow-600'
            case 'needs_repair': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getConditionLabel = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'Отличное'
            case 'good': return 'Хорошее'
            case 'fair': return 'Удовлетворительное'
            case 'needs_repair': return 'Требует ремонта'
            default: return condition
        }
    }

    const getFuelLevelColor = (level: number) => {
        if (level > 50) return 'text-green-600'
        if (level > 25) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Автопарк</h1>
                    <p className="text-muted-foreground">
                        Управление транспортными средствами
                    </p>
                </div>

                <Button asChild>
                    <Link to="/fleet/add">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить ТС
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего ТС</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fleetStats.total}</div>
                        <div className="text-sm text-muted-foreground">
                            {fleetStats.inUse} на линии • {fleetStats.available} доступно
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Средний пробег</CardTitle>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(fleetStats.averageMileage / 1000).toFixed(0)}k км
                        </div>
                        <p className="text-xs text-muted-foreground">
                            На одно ТС
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Средний уровень топлива</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(fleetStats.averageFuel)}%</div>
                        <p className="text-xs text-muted-foreground">
                            По автопарку
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Требуют ТО</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {fleetStats.maintenanceDue}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            В течение 30 дней
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по номеру, марке..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="AVAILABLE">Доступен</SelectItem>
                                <SelectItem value="IN_USE">На линии</SelectItem>
                                <SelectItem value="MAINTENANCE">ТО</SelectItem>
                                <SelectItem value="OUT_OF_SERVICE">Не в эксплуатации</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Больше фильтров
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicles Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{vehicle.licensePlate}</CardTitle>
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Статус:</span>
                                <Badge variant="outline">
                                    {getStatusLabel(vehicle.status)}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Местоположение:</span>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs">{vehicle.currentLocation}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Пробег:</span>
                                    <span className="font-medium">
                                        {vehicle.mileage.toLocaleString()} км
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Топливо:</span>
                                    <div className="flex items-center space-x-2">
                                        <Fuel className="h-3 w-3" />
                                        <span className={`font-medium ${getFuelLevelColor(vehicle.fuelLevel)}`}>
                                            {vehicle.fuelLevel}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Состояние:</span>
                                <span className={`font-medium ${getConditionColor(vehicle.condition)}`}>
                                    {getConditionLabel(vehicle.condition)}
                                </span>
                            </div>

                            {vehicle.driver && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Водитель:</span>
                                    <span className="font-medium">{vehicle.driver}</span>
                                </div>
                            )}

                            {vehicle.route && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Маршрут:</span>
                                    <span className="font-medium">{vehicle.route}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Следующее ТО:</span>
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-xs">{vehicle.nextMaintenance}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to={`/fleet/${vehicle.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Подробнее
                                    </Link>
                                </Button>

                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && (
                <Card>
                    <CardContent className="text-center py-16">
                        <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Транспортные средства не найдены</h3>
                        <p className="text-muted-foreground mb-4">
                            Попробуйте изменить критерии поиска или добавьте новое ТС
                        </p>
                        <Button asChild>
                            <Link to="/fleet/add">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить ТС
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}