import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Truck,
    Route,
    Users,
    Fuel,
    Clock,
    Calendar,
    Download,
    Filter
} from 'lucide-react'

// Mock data for charts
const revenueData = [
    { month: 'Янв', revenue: 1200000, costs: 800000 },
    { month: 'Фев', revenue: 1350000, costs: 850000 },
    { month: 'Мар', revenue: 1100000, costs: 750000 },
    { month: 'Апр', revenue: 1450000, costs: 900000 },
    { month: 'Май', revenue: 1600000, costs: 950000 },
    { month: 'Июн', revenue: 1750000, costs: 1000000 },
]

const performanceMetrics = {
    revenue: {
        current: 8450000,
        previous: 7200000,
        change: 17.4
    },
    costs: {
        current: 5300000,
        previous: 4800000,
        change: 10.4
    },
    profit: {
        current: 3150000,
        previous: 2400000,
        change: 31.3
    },
    efficiency: {
        fuelConsumption: 8.5, // l/100km average
        onTimeDeliveries: 94.5,
        vehicleUtilization: 87.2,
        driverUtilization: 91.8
    }
}

const routeAnalytics = [
    {
        route: 'Москва - СПб',
        frequency: 45,
        revenue: 2100000,
        profit: 630000,
        averageTime: '8.5 ч',
        efficiency: 92
    },
    {
        route: 'Москва - Казань',
        frequency: 32,
        revenue: 1800000,
        profit: 540000,
        averageTime: '12 ч',
        efficiency: 88
    },
    {
        route: 'СПб - Новгород',
        frequency: 28,
        revenue: 980000,
        profit: 294000,
        averageTime: '3.5 ч',
        efficiency: 95
    },
]

const driverPerformance = [
    {
        name: 'Петров А.И.',
        routes: 56,
        revenue: 680000,
        efficiency: 96.2,
        rating: 4.9,
        violations: 0
    },
    {
        name: 'Иванов С.М.',
        routes: 52,
        revenue: 650000,
        efficiency: 94.8,
        rating: 4.7,
        violations: 1
    },
    {
        name: 'Сидоров К.В.',
        routes: 48,
        revenue: 580000,
        efficiency: 91.5,
        rating: 4.6,
        violations: 0
    },
]

export function AnalyticsPage() {
    const [timePeriod, setTimePeriod] = useState('6m')

    const formatCurrency = (amount: number) => {
        return (amount / 1000000).toFixed(1) + 'M ₽'
    }

    const getChangeClass = (change: number) => {
        return change > 0 ? 'text-green-600' : 'text-red-600'
    }

    const getChangeIcon = (change: number) => {
        return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
                    <p className="text-muted-foreground">
                        Анализ эффективности и финансовых показателей
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">Последний месяц</SelectItem>
                            <SelectItem value="3m">3 месяца</SelectItem>
                            <SelectItem value="6m">6 месяцев</SelectItem>
                            <SelectItem value="1y">Год</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Фильтры
                    </Button>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Выручка</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.revenue.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(performanceMetrics.revenue.change)}`}>
                            {getChangeIcon(performanceMetrics.revenue.change)}
                            <span className="ml-1">+{performanceMetrics.revenue.change}%</span>
                            <span className="text-muted-foreground ml-1">за период</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Расходы</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.costs.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(-performanceMetrics.costs.change)}`}>
                            {getChangeIcon(performanceMetrics.costs.change)}
                            <span className="ml-1">+{performanceMetrics.costs.change}%</span>
                            <span className="text-muted-foreground ml-1">за период</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Прибыль</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.profit.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(performanceMetrics.profit.change)}`}>
                            {getChangeIcon(performanceMetrics.profit.change)}
                            <span className="ml-1">+{performanceMetrics.profit.change}%</span>
                            <span className="text-muted-foreground ml-1">за период</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Доставки вовремя</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceMetrics.efficiency.onTimeDeliveries}%</div>
                        <p className="text-xs text-muted-foreground">
                            Цель: 95%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="routes">Маршруты</TabsTrigger>
                    <TabsTrigger value="drivers">Водители</TabsTrigger>
                    <TabsTrigger value="costs">Затраты</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Revenue Chart Placeholder */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Выручка и расходы</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                                    <div className="text-center">
                                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">График выручки и расходов</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Интеграция с charting библиотекой
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Показатели эффективности</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Расход топлива</span>
                                        <span className="text-sm font-medium">{performanceMetrics.efficiency.fuelConsumption} л/100км</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Использование ТС</span>
                                        <span className="text-sm font-medium">{performanceMetrics.efficiency.vehicleUtilization}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${performanceMetrics.efficiency.vehicleUtilization}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Загрузка водителей</span>
                                        <span className="text-sm font-medium">{performanceMetrics.efficiency.driverUtilization}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${performanceMetrics.efficiency.driverUtilization}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="routes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Анализ маршрутов</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {routeAnalytics.map((route, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium">{route.route}</p>
                                            <p className="text-sm text-muted-foreground">{route.frequency} рейсов</p>
                                        </div>
                                        <div className="flex items-center space-x-8">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Выручка</p>
                                                <p className="font-medium">{formatCurrency(route.revenue)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Прибыль</p>
                                                <p className="font-medium">{formatCurrency(route.profit)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Среднее время</p>
                                                <p className="font-medium">{route.averageTime}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Эффективность</p>
                                                <Badge variant={route.efficiency > 90 ? "default" : "secondary"}>
                                                    {route.efficiency}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="drivers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Эффективность водителей</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {driverPerformance.map((driver, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium">{driver.name}</p>
                                            <p className="text-sm text-muted-foreground">{driver.routes} маршрутов</p>
                                        </div>
                                        <div className="flex items-center space-x-8">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Выручка</p>
                                                <p className="font-medium">{formatCurrency(driver.revenue)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Эффективность</p>
                                                <p className="font-medium">{driver.efficiency}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Рейтинг</p>
                                                <div className="flex items-center space-x-1">
                                                    <span className="font-medium">{driver.rating}</span>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-2 h-2 rounded-full ${
                                                                    i < Math.floor(driver.rating)
                                                                        ? 'bg-yellow-400'
                                                                        : 'bg-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Нарушения</p>
                                                <Badge variant={driver.violations === 0 ? "default" : "destructive"}>
                                                    {driver.violations}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="costs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Fuel className="h-5 w-5" />
                                    Расходы на топливо
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Общие расходы</span>
                                        <span className="font-bold">1.8M ₽</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Средний расход на км</span>
                                        <span className="font-medium">14.5 ₽</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Экономия за месяц</span>
                                        <span className="font-medium text-green-600">+125k ₽</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Обслуживание техники
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Планового ТО</span>
                                        <span className="font-bold">450k ₽</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Внеплановых ремонтов</span>
                                        <span className="font-medium">187k ₽</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Запчасти</span>
                                        <span className="font-medium">298k ₽</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}