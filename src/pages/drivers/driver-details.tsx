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
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Car,
    Clock,
    Route,
    Award,
    AlertTriangle,
    MapPin,
    Fuel,
    Calendar,
    Star
} from 'lucide-react'

// Mock data - replace with real API call
const driverData = {
    id: 1,
    name: 'Александр Петров',
    firstName: 'Александр',
    lastName: 'Петров',
    licenseNumber: 'AB123456',
    licenseCategory: ['B', 'C', 'E'],
    phone: '+7 (999) 123-45-67',
    email: 'a.petrov@company.com',
    experience: 8,
    rating: 4.8,
    status: 'DRIVING',
    currentLocation: [55.7558, 37.6176],
    workTimeStart: '08:00',
    workTimeEnd: '20:00',
    createdAt: '2020-03-15T10:00:00Z',

    // Additional stats
    stats: {
        totalDistance: 125000, // km
        totalRoutes: 342,
        onTimeDeliveries: 98.5,
        fuelEfficiency: 95.2,
        safetyScore: 94.8,
        monthlyHours: 180,
        maxHours: 200
    },

    // Recent routes
    recentRoutes: [
        {
            id: 1,
            name: 'Москва - СПб',
            status: 'COMPLETED',
            distance: 635,
            completedAt: '2024-01-15T14:30:00Z'
        },
        {
            id: 2,
            name: 'СПб - Новгород',
            status: 'IN_PROGRESS',
            distance: 180,
            progress: 65
        }
    ],

    // Compliance info
    compliance: {
        medicalCheckup: '2024-06-15',
        licenseExpiry: '2027-03-20',
        insuranceExpiry: '2024-12-31',
        nextRestRequired: '2024-01-16T10:00:00Z'
    },

    // Performance this month
    performance: {
        routesCompleted: 28,
        averageRating: 4.9,
        fuelSavings: 1250, // rubles
        violations: 0
    }
}

export function DriverDetailsPage() {
    const { id } = useParams<{ id: string }>()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRIVING': return 'bg-green-500'
            case 'REST_BREAK': return 'bg-yellow-500'
            case 'DAILY_REST': return 'bg-blue-500'
            case 'OFF_DUTY': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRIVING': return 'В пути'
            case 'REST_BREAK': return 'Перерыв'
            case 'DAILY_REST': return 'Суточный отдых'
            case 'WEEKLY_REST': return 'Недельный отдых'
            case 'OFF_DUTY': return 'Не на смене'
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/drivers">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{driverData.name}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(driverData.status)}`} />
                            <span className="text-muted-foreground">{getStatusLabel(driverData.status)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Позвонить
                    </Button>
                    <Button>
                        <Car className="h-4 w-4 mr-2" />
                        Назначить маршрут
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Route className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Всего маршрутов</p>
                                <p className="text-2xl font-bold">{driverData.stats.totalRoutes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <MapPin className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Пройдено км</p>
                                <p className="text-2xl font-bold">{(driverData.stats.totalDistance / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Доставки вовремя</p>
                                <p className="text-2xl font-bold">{driverData.stats.onTimeDeliveries}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Star className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">Рейтинг</p>
                                <div className="flex items-center space-x-1">
                                    <p className="text-2xl font-bold">{driverData.rating}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < Math.floor(driverData.rating)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Personal Info */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Личная информация
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">ФИО</label>
                            <p className="font-medium">{driverData.firstName} {driverData.lastName}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Номер удостоверения</label>
                            <p className="font-medium">{driverData.licenseNumber}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Категории</label>
                            <div className="flex gap-1 mt-1">
                                {driverData.licenseCategory.map((cat) => (
                                    <Badge key={cat} variant="outline">{cat}</Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Телефон</label>
                            <p className="font-medium">{driverData.phone}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="font-medium">{driverData.email}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Стаж работы</label>
                            <p className="font-medium">{driverData.experience} лет</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance & Compliance */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Эффективность и соответствие
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Performance metrics */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Эффективность топлива</span>
                                    <span className="text-sm text-muted-foreground">
                                        {driverData.stats.fuelEfficiency}%
                                    </span>
                                </div>
                                <Progress value={driverData.stats.fuelEfficiency} className="h-2" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Безопасность вождения</span>
                                    <span className="text-sm text-muted-foreground">
                                        {driverData.stats.safetyScore}%
                                    </span>
                                </div>
                                <Progress value={driverData.stats.safetyScore} className="h-2" />
                            </div>
                        </div>

                        {/* Working hours */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Рабочее время в месяце</span>
                                <span className="text-sm text-muted-foreground">
                                    {driverData.stats.monthlyHours} / {driverData.stats.maxHours} ч
                                </span>
                            </div>
                            <Progress
                                value={(driverData.stats.monthlyHours / driverData.stats.maxHours) * 100}
                                className="h-2"
                            />
                        </div>

                        <Separator />

                        {/* Compliance checks */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Документы и медосмотры</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Медосмотр</p>
                                        <p className="text-xs text-muted-foreground">до {driverData.compliance.medicalCheckup}</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-600">Действует</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Права</p>
                                        <p className="text-xs text-muted-foreground">до {driverData.compliance.licenseExpiry}</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-600">Действуют</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Последние маршруты
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {driverData.recentRoutes.map((route) => (
                            <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium">{route.name}</p>
                                    <p className="text-sm text-muted-foreground">{route.distance} км</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {route.status === 'IN_PROGRESS' && route.progress && (
                                        <div className="w-24">
                                            <Progress value={route.progress} className="h-2" />
                                            <p className="text-xs text-center mt-1">{route.progress}%</p>
                                        </div>
                                    )}
                                    <Badge
                                        variant={route.status === 'COMPLETED' ? 'default' : 'secondary'}
                                    >
                                        {route.status === 'COMPLETED' ? 'Завершен' : 'В пути'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}