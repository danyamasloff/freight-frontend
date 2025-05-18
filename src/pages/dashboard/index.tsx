import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Truck,
    Users,
    Route,
    Package,
    TrendingUp,
    AlertTriangle,
    Clock,
    DollarSign
} from 'lucide-react'

// Mock data - replace with real API calls
const dashboardStats = {
    totalVehicles: 42,
    activeDrivers: 38,
    routesInProgress: 15,
    pendingCargo: 8,
    totalRevenue: 1250000,
    fuelCosts: 186000,
    onTimeDeliveries: 94.5,
    alerts: 3
}

const recentActivities = [
    {
        id: 1,
        type: 'route_completed',
        message: 'Маршрут Москва - СПб завершен',
        time: '15 мин назад',
        driver: 'Петров А.И.'
    },
    {
        id: 2,
        type: 'vehicle_maintenance',
        message: 'Техническое обслуживание завершено',
        time: '1 час назад',
        vehicle: 'МН123АВ'
    },
    {
        id: 3,
        type: 'new_route',
        message: 'Новый маршрут создан',
        time: '2 часа назад',
        route: 'Москва - Казань'
    }
]

export function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
                <p className="text-muted-foreground">
                    Обзор активности транспортной компании
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Транспортные средства
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats.totalVehicles}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 за последний месяц
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Активные водители
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats.activeDrivers}</div>
                        <p className="text-xs text-muted-foreground">
                            Сейчас на линии
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Маршруты в пути
                        </CardTitle>
                        <Route className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats.routesInProgress}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardStats.pendingCargo} ожидающих груза
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Выручка за месяц
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(dashboardStats.totalRevenue / 1000000).toFixed(1)}M ₽
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% от предыдущего месяца
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Последние события</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.message}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.time}
                                            {activity.driver && ` • ${activity.driver}`}
                                            {activity.vehicle && ` • ${activity.vehicle}`}
                                            {activity.route && ` • ${activity.route}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Показатели эффективности</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Доставки в срок</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {dashboardStats.onTimeDeliveries}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Активные уведомления</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {dashboardStats.alerts}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Расходы на топливо</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(dashboardStats.fuelCosts / 1000).toFixed(0)}к ₽
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                            <div className="flex items-center space-x-2">
                                <Route className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Создать маршрут</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Добавить новый маршрут доставки
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Добавить водителя</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Зарегистрировать нового водителя
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-purple-600" />
                                <span className="font-medium">Добавить ТС</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Зарегистрировать транспортное средство
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-orange-600" />
                                <span className="font-medium">Новый груз</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Добавить информацию о грузе
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}