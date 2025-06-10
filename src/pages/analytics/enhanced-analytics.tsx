import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
    Filter,
    AlertTriangle,
    CheckCircle2,
    Info,
    Loader2,
    RefreshCw
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { NotificationCenter } from '@/components/ui/notification-center'
import { useGetNotificationsQuery } from '@/shared/api/notificationsSlice'
import { useGetRoutesQuery } from '@/shared/api/routesSlice'
import { useGetVehiclesQuery } from '@/shared/api/vehiclesApiSlice'
import { useGetDriversQuery } from '@/shared/api/driversSlice'
import { formatCurrency, formatDistance, formatDuration } from '@/shared/utils/format'

interface AnalyticsData {
    revenue: {
        current: number
        previous: number
        change: number
    }
    costs: {
        current: number
        previous: number
        change: number
    }
    profit: {
        current: number
        previous: number
        change: number
    }
    efficiency: {
        fuelConsumption: number
        onTimeDeliveries: number
        vehicleUtilization: number
        driverUtilization: number
    }
    routeAnalytics: Array<{
        route: string
        frequency: number
        revenue: number
        profit: number
        averageTime: string
        efficiency: number
    }>
    driverPerformance: Array<{
        name: string
        routes: number
        revenue: number
        efficiency: number
        rating: number
        violations: number
    }>
    monthlyData: Array<{
        month: string
        revenue: number
        costs: number
        routes: number
        fuelConsumption: number
    }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function EnhancedAnalyticsPage() {
    const [timePeriod, setTimePeriod] = useState('6m')
    const [isLoading, setIsLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [activeTab, setActiveTab] = useState('overview')

    // API запросы
    const { data: notifications = [] } = useGetNotificationsQuery({ limit: 10 })
    const { data: routes = [], isLoading: routesLoading } = useGetRoutesQuery()
    const { data: vehicles = [], isLoading: vehiclesLoading } = useGetVehiclesQuery()
    const { data: drivers = [], isLoading: driversLoading } = useGetDriversQuery()

    useEffect(() => {
        if (!routesLoading && !vehiclesLoading && !driversLoading) {
            generateAnalyticsData()
        }
    }, [routes, vehicles, drivers, timePeriod, routesLoading, vehiclesLoading, driversLoading])

    const generateAnalyticsData = () => {
        setIsLoading(true)
        
        // Симулируем обработку данных
        setTimeout(() => {
            const data: AnalyticsData = {
                revenue: {
                    current: calculateTotalRevenue(),
                    previous: calculateTotalRevenue() * 0.85,
                    change: 17.4
                },
                costs: {
                    current: calculateTotalCosts(),
                    previous: calculateTotalCosts() * 0.9,
                    change: 10.4
                },
                profit: {
                    current: calculateTotalRevenue() - calculateTotalCosts(),
                    previous: (calculateTotalRevenue() - calculateTotalCosts()) * 0.8,
                    change: 31.3
                },
                efficiency: {
                    fuelConsumption: calculateAverageFuelConsumption(),
                    onTimeDeliveries: 94.5,
                    vehicleUtilization: calculateVehicleUtilization(),
                    driverUtilization: calculateDriverUtilization()
                },
                routeAnalytics: generateRouteAnalytics(),
                driverPerformance: generateDriverPerformance(),
                monthlyData: generateMonthlyData()
            }
            
            setAnalyticsData(data)
            setIsLoading(false)
        }, 1000)
    }

    const calculateTotalRevenue = () => {
        return routes.reduce((total, route) => {
            return total + (route.estimatedCost || 0) * 1.3 // Добавляем маржу
        }, 0)
    }

    const calculateTotalCosts = () => {
        return routes.reduce((total, route) => {
            return total + (route.estimatedCost || 0)
        }, 0)
    }

    const calculateAverageFuelConsumption = () => {
        if (vehicles.length === 0) return 0
        return vehicles.reduce((total, vehicle) => {
            return total + (vehicle.fuelConsumptionPer100km || 0)
        }, 0) / vehicles.length
    }

    const calculateVehicleUtilization = () => {
        if (vehicles.length === 0) return 0
        const inUse = vehicles.filter(v => v.status === 'IN_USE').length
        return (inUse / vehicles.length) * 100
    }

    const calculateDriverUtilization = () => {
        if (drivers.length === 0) return 0
        const active = drivers.filter(d => d.currentDrivingStatus === 'DRIVING').length
        return (active / drivers.length) * 100
    }

    const generateRouteAnalytics = () => {
        // Группируем маршруты по популярным направлениям
        const routeGroups = routes.reduce((acc, route) => {
            const key = `${route.startAddress} - ${route.endAddress}`
            if (!acc[key]) {
                acc[key] = {
                    route: key,
                    frequency: 0,
                    totalRevenue: 0,
                    totalDistance: 0,
                    totalDuration: 0
                }
            }
            acc[key].frequency += 1
            acc[key].totalRevenue += (route.estimatedCost || 0) * 1.3
            acc[key].totalDistance += route.distance || 0
            acc[key].totalDuration += route.duration || 0
            return acc
        }, {} as any)

        return Object.values(routeGroups).map((group: any) => ({
            route: group.route,
            frequency: group.frequency,
            revenue: group.totalRevenue,
            profit: group.totalRevenue * 0.3,
            averageTime: formatDuration(group.totalDuration / group.frequency),
            efficiency: Math.min(95, 80 + Math.random() * 15)
        })).slice(0, 5)
    }

    const generateDriverPerformance = () => {
        return drivers.slice(0, 5).map(driver => ({
            name: `${driver.firstName} ${driver.lastName}`,
            routes: Math.floor(Math.random() * 50) + 20,
            revenue: Math.floor(Math.random() * 500000) + 300000,
            efficiency: Math.floor(Math.random() * 20) + 80,
            rating: 4.2 + Math.random() * 0.8,
            violations: Math.floor(Math.random() * 3)
        }))
    }

    const generateMonthlyData = () => {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']
        return months.map(month => ({
            month,
            revenue: Math.floor(Math.random() * 500000) + 1000000,
            costs: Math.floor(Math.random() * 300000) + 600000,
            routes: Math.floor(Math.random() * 20) + 30,
            fuelConsumption: Math.floor(Math.random() * 2000) + 8000
        }))
    }

    const getChangeClass = (change: number) => {
        return change > 0 ? 'text-green-600' : 'text-red-600'
    }

    const getChangeIcon = (change: number) => {
        return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    }

    const handleRefresh = () => {
        generateAnalyticsData()
    }

    const handleNotificationClick = (notification: any) => {
        // Обработка клика по уведомлению
        console.log('Notification clicked:', notification)
    }

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Загрузка аналитических данных...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!analyticsData) {
        return (
            <div className="container py-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Ошибка загрузки</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить аналитические данные. Попробуйте обновить страницу.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
                    <p className="text-muted-foreground">
                        Анализ эффективности и финансовых показателей
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <NotificationCenter
                        notifications={notifications}
                        onMarkAsRead={() => {}}
                        onMarkAllAsRead={() => {}}
                        onDismiss={() => {}}
                        onNotificationClick={handleNotificationClick}
                    />
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
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Обновить
                    </Button>
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
                        <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(analyticsData.revenue.change)}`}>
                            {getChangeIcon(analyticsData.revenue.change)}
                            <span className="ml-1">+{analyticsData.revenue.change}%</span>
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
                        <div className="text-2xl font-bold">{formatCurrency(analyticsData.costs.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(-analyticsData.costs.change)}`}>
                            {getChangeIcon(analyticsData.costs.change)}
                            <span className="ml-1">+{analyticsData.costs.change}%</span>
                            <span className="text-muted-foreground ml-1">за период</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Прибыль</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analyticsData.profit.current)}</div>
                        <div className={`flex items-center text-sm ${getChangeClass(analyticsData.profit.change)}`}>
                            {getChangeIcon(analyticsData.profit.change)}
                            <span className="ml-1">+{analyticsData.profit.change}%</span>
                            <span className="text-muted-foreground ml-1">за период</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Маршруты</CardTitle>
                        <Route className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{routes.length}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <span>Всего в системе</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Детальная аналитика */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="routes">Маршруты</TabsTrigger>
                    <TabsTrigger value="performance">Эффективность</TabsTrigger>
                    <TabsTrigger value="drivers">Водители</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Динамика доходов и расходов</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={analyticsData.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Legend />
                                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Выручка" />
                                        <Area type="monotone" dataKey="costs" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Расходы" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Эффективность операций</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Использование ТС</span>
                                        <span>{analyticsData.efficiency.vehicleUtilization.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={analyticsData.efficiency.vehicleUtilization} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Использование водителей</span>
                                        <span>{analyticsData.efficiency.driverUtilization.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={analyticsData.efficiency.driverUtilization} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Доставки в срок</span>
                                        <span>{analyticsData.efficiency.onTimeDeliveries}%</span>
                                    </div>
                                    <Progress value={analyticsData.efficiency.onTimeDeliveries} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="routes" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Популярные маршруты</CardTitle>
                            <CardDescription>Анализ наиболее востребованных направлений</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.routeAnalytics.map((route, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{route.route}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {route.frequency} поездок • {route.averageTime} среднее время
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(route.revenue)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Эффективность: {route.efficiency.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Расход топлива по месяцам</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${value} л`} />
                                        <Bar dataKey="fuelConsumption" fill="#8884d8" name="Расход топлива" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Количество маршрутов</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="routes" stroke="#8884d8" strokeWidth={2} name="Маршруты" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="drivers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Производительность водителей</CardTitle>
                            <CardDescription>Топ-5 водителей по эффективности</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.driverPerformance.map((driver, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">{index + 1}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{driver.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {driver.routes} маршрутов • Рейтинг: {driver.rating.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(driver.revenue)}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={driver.violations === 0 ? "default" : "destructive"}>
                                                    {driver.violations === 0 ? "Без нарушений" : `${driver.violations} нарушений`}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {driver.efficiency}%
                                                </span>
                                            </div>
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