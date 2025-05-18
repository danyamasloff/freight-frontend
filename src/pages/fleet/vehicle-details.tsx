import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    Truck,
    MapPin,
    Fuel,
    Gauge,
    Calendar,
    Wrench,
    AlertTriangle,
    CheckCircle,
    Route,
    Clock,
    DollarSign,
    FileText,
    User,
    Settings,
    BarChart3
} from 'lucide-react'

// Mock vehicle data
const vehicleData = {
    id: 1,
    licensePlate: 'А123БВ77',
    brand: 'Volvo',
    model: 'FH',
    year: 2020,
    vin: 'YV2A8A243FA123456',
    status: 'IN_USE',
    condition: 'excellent',

    // Current state
    currentLocation: {
        address: 'Москва, ТТК, км 15',
        coordinates: [55.7558, 37.6176]
    },
    mileage: 285420,
    fuelLevel: 85,
    fuelCapacity: 500,
    driver: {
        name: 'Петров Александр Иванович',
        id: 1,
        phone: '+7 (999) 123-45-67'
    },
    route: {
        name: 'Москва - СПб',
        id: 1,
        progress: 35
    },

    // Technical specs
    specs: {
        engine: 'D13K460',
        power: 460, // HP
        transmission: 'I-Shift',
        fuelType: 'Дизель',
        emissionStandard: 'Euro 6',
        maxWeight: 40000, // kg
        emptyWeight: 12000, // kg
        wheelFormula: '4x2'
    },

    // Maintenance
    maintenance: {
        lastService: '2024-01-15',
        nextService: '2024-04-15',
        mileageAtLastService: 275000,
        nextServiceMileage: 285000,
        serviceInterval: 10000,
        warrantyExpiry: '2025-06-30'
    },

    // Documents
    documents: {
        registration: {
            number: 'AB123456',
            expiry: '2027-03-20',
            status: 'valid'
        },
        insurance: {
            company: 'РЕСО-Гарантия',
            policy: 'ABC1234567890',
            expiry: '2024-12-31',
            status: 'valid'
        },
        technicalInspection: {
            lastCheck: '2024-03-15',
            nextCheck: '2025-03-15',
            status: 'valid'
        }
    },

    // Performance data (last 30 days)
    performance: {
        fuelConsumption: 28.5, // l/100km
        averageSpeed: 65, // km/h
        totalDistance: 8420, // km
        workingHours: 180,
        idleTime: 15, // hours
        maintenanceCosts: 45000, // rubles
        efficiency: 94.2 // %
    },

    // Recent activity
    recentActivity: [
        {
            date: '2024-01-20',
            type: 'route_started',
            description: 'Начат маршрут Москва - СПб',
            details: 'Водитель: Петров А.И.'
        },
        {
            date: '2024-01-19',
            type: 'maintenance',
            description: 'Плановое ТО завершено',
            details: 'Замена масла, фильтров'
        },
        {
            date: '2024-01-18',
            type: 'fuel_fill',
            description: 'Заправка 450л',
            details: 'АЗС "Лукойл", г. Тверь'
        }
    ],

    // Alerts
    alerts: [
        {
            type: 'warning',
            message: 'Приближается плановое ТО',
            details: 'До следующего ТО осталось 580 км',
            priority: 'medium'
        }
    ]
}

export function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_USE': return 'bg-blue-500'
            case 'AVAILABLE': return 'bg-green-500'
            case 'MAINTENANCE': return 'bg-yellow-500'
            case 'OUT_OF_SERVICE': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'IN_USE': return 'На линии'
            case 'AVAILABLE': return 'Доступен'
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
        if (level > 50) return 'bg-green-500'
        if (level > 25) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/fleet">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            К автопарку
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{vehicleData.licensePlate}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-muted-foreground">
                                {vehicleData.brand} {vehicleData.model} ({vehicleData.year})
                            </span>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicleData.status)}`} />
                            <span className="text-sm">{getStatusLabel(vehicleData.status)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки
                    </Button>
                    <Button variant="outline">
                        <Wrench className="h-4 w-4 mr-2" />
                        Заказать ТО
                    </Button>
                    <Button>
                        <Route className="h-4 w-4 mr-2" />
                        Назначить маршрут
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Gauge className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Пробег</p>
                                <p className="text-2xl font-bold">
                                    {(vehicleData.mileage / 1000).toFixed(0)}k км
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Fuel className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Топливо</p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-2xl font-bold">{vehicleData.fuelLevel}%</p>
                                    <div className="w-16 bg-muted rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getFuelLevelColor(vehicleData.fuelLevel)}`}
                                            style={{ width: `${vehicleData.fuelLevel}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Состояние</p>
                                <p className={`text-2xl font-bold ${getConditionColor(vehicleData.condition)}`}>
                                    {getConditionLabel(vehicleData.condition)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Эффективность</p>
                                <p className="text-2xl font-bold">{vehicleData.performance.efficiency}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            {vehicleData.alerts.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-orange-800">
                                    {vehicleData.alerts[0].message}
                                </p>
                                <p className="text-sm text-orange-700 mt-1">
                                    {vehicleData.alerts[0].details}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="maintenance">Техобслуживание</TabsTrigger>
                    <TabsTrigger value="documents">Документы</TabsTrigger>
                    <TabsTrigger value="performance">Производительность</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Текущее состояние
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Местоположение</label>
                                    <p className="font-medium">{vehicleData.currentLocation.address}</p>
                                </div>

                                {vehicleData.driver && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Водитель</label>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{vehicleData.driver.name}</p>
                                            <Button variant="outline" size="sm">
                                                <User className="h-4 w-4 mr-2" />
                                                Подробнее
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {vehicleData.route && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Текущий маршрут</label>
                                        <p className="font-medium">{vehicleData.route.name}</p>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Прогресс</span>
                                                <span>{vehicleData.route.progress}%</span>
                                            </div>
                                            <Progress value={vehicleData.route.progress} />
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Топливо:</span>
                                        <p className="font-medium">
                                            {Math.round(vehicleData.fuelLevel * vehicleData.fuelCapacity / 100)} л
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Пробег:</span>
                                        <p className="font-medium">{vehicleData.mileage.toLocaleString()} км</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Технические характеристики
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">VIN:</span>
                                        <p className="font-medium">{vehicleData.vin}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Двигатель:</span>
                                        <p className="font-medium">{vehicleData.specs.engine}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Мощность:</span>
                                        <p className="font-medium">{vehicleData.specs.power} л.с.</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">КПП:</span>
                                        <p className="font-medium">{vehicleData.specs.transmission}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Топливо:</span>
                                        <p className="font-medium">{vehicleData.specs.fuelType}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Экологический класс:</span>
                                        <p className="font-medium">{vehicleData.specs.emissionStandard}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Полная масса:</span>
                                        <p className="font-medium">{vehicleData.specs.maxWeight.toLocaleString()} кг</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Снаряженная масса:</span>
                                        <p className="font-medium">{vehicleData.specs.emptyWeight.toLocaleString()} кг</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    График обслуживания
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Последнее ТО</label>
                                    <p className="font-medium">{vehicleData.maintenance.lastService}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Пробег: {vehicleData.maintenance.mileageAtLastService.toLocaleString()} км
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Следующее ТО</label>
                                    <p className="font-medium">{vehicleData.maintenance.nextService}</p>
                                    <p className="text-sm text-muted-foreground">
                                        При пробеге: {vehicleData.maintenance.nextServiceMileage.toLocaleString()} км
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Интервал ТО</label>
                                    <p className="font-medium">{vehicleData.maintenance.serviceInterval.toLocaleString()} км</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Гарантия до</label>
                                    <p className="font-medium">{vehicleData.maintenance.warrantyExpiry}</p>
                                </div>

                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        До следующего ТО
                                    </p>
                                    <div className="space-y-2">
                                        <Progress
                                            value={((vehicleData.mileage - vehicleData.maintenance.mileageAtLastService) / vehicleData.maintenance.serviceInterval) * 100}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Осталось: {vehicleData.maintenance.nextServiceMileage - vehicleData.mileage} км
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Расходы на обслуживание
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">За последний месяц</label>
                                    <p className="text-2xl font-bold">
                                        {vehicleData.performance.maintenanceCosts.toLocaleString()} ₽
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Плановое ТО</span>
                                        <span>25,000 ₽</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Расходные материалы</span>
                                        <span>12,000 ₽</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Внеплановый ремонт</span>
                                        <span>8,000 ₽</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Детальный отчет
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Свидетельство о регистрации</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Номер:</span>
                                    <p className="font-medium">{vehicleData.documents.registration.number}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Действует до:</span>
                                    <p className="font-medium">{vehicleData.documents.registration.expiry}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Действует
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Страхование</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Компания:</span>
                                    <p className="font-medium">{vehicleData.documents.insurance.company}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Полис:</span>
                                    <p className="font-medium">{vehicleData.documents.insurance.policy}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Действует до:</span>
                                    <p className="font-medium">{vehicleData.documents.insurance.expiry}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Действует
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Техосмотр</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Последний:</span>
                                    <p className="font-medium">{vehicleData.documents.technicalInspection.lastCheck}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Следующий до:</span>
                                    <p className="font-medium">{vehicleData.documents.technicalInspection.nextCheck}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Актуален
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Fuel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Расход топлива</p>
                                    <p className="text-2xl font-bold">{vehicleData.performance.fuelConsumption} л/100км</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Gauge className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Средняя скорость</p>
                                    <p className="text-2xl font-bold">{vehicleData.performance.averageSpeed} км/ч</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Route className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Пройдено за месяц</p>
                                    <p className="text-2xl font-bold">{vehicleData.performance.totalDistance.toLocaleString()} км</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Рабочих часов</p>
                                    <p className="text-2xl font-bold">{vehicleData.performance.workingHours} ч</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>График производительности</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">График производительности за период</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Интеграция с charting библиотекой
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>История событий</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vehicleData.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.description}</p>
                                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}