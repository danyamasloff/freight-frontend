import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import {
    Truck,
    Users,
    Route,
    Package,
    TrendingUp,
    AlertTriangle,
    Clock,
    DollarSign,
    Plus,
    ArrowRight,
    Activity,
    MapPin,
    Calendar,
    BarChart3,
    Settings,
    Bell,
    Zap,
    Target,
    Fuel,
    Shield,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ROUTES } from '@/shared/constants'
import { useEventMonitoring } from '@/hooks/useEventMonitoring'

// Mock data - replace with real API calls
const dashboardStats = {
    totalVehicles: 42,
    activeDrivers: 38,
    routesInProgress: 15,
    pendingCargo: 8,
    totalRevenue: 1250000,
    fuelCosts: 186000,
    onTimeDeliveries: 94.5,
    alerts: 3,
    efficiency: 87.2,
    fuelEfficiency: 92.1,
    maintenanceAlerts: 2,
    completedRoutes: 156
}

const recentActivities = [
    {
        id: 1,
        type: 'route_completed',
        message: 'Маршрут Москва - СПб завершен',
        time: '15 мин назад',
        driver: 'Петров А.И.',
        status: 'success',
        icon: CheckCircle2
    },
    {
        id: 2,
        type: 'vehicle_maintenance',
        message: 'Техническое обслуживание завершено',
        time: '1 час назад',
        vehicle: 'МН123АВ',
        status: 'info',
        icon: Settings
    },
    {
        id: 3,
        type: 'new_route',
        message: 'Новый маршрут создан',
        time: '2 часа назад',
        route: 'Москва - Казань',
        status: 'info',
        icon: Route
    },
    {
        id: 4,
        type: 'alert',
        message: 'Требуется внимание: низкий уровень топлива',
        time: '3 часа назад',
        vehicle: 'АВ456СД',
        status: 'warning',
        icon: AlertTriangle
    },
    {
        id: 5,
        type: 'driver_break',
        message: 'Водитель вышел на обязательный отдых',
        time: '4 часа назад',
        driver: 'Сидоров В.П.',
        status: 'info',
        icon: Clock
    }
]

const quickActions = [
    {
        title: 'Создать маршрут',
        description: 'Добавить новый маршрут доставки',
        icon: Route,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        link: ROUTES.ROUTE_CREATE
    },
    {
        title: 'Добавить водителя',
        description: 'Зарегистрировать нового водителя',
        icon: Users,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        link: ROUTES.DRIVER_CREATE
    },
    {
        title: 'Добавить ТС',
        description: 'Зарегистрировать транспортное средство',
        icon: Truck,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        link: ROUTES.VEHICLE_CREATE
    },
    {
        title: 'Новый груз',
        description: 'Добавить информацию о грузе',
        icon: Package,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        link: ROUTES.CARGO_CREATE
    }
]

// Анимационные варианты
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3 }
    },
    hover: { 
        scale: 1.02,
        transition: { duration: 0.2 }
    }
}

export function DashboardPage() {
    const navigate = useNavigate()
    const { forceCheck } = useEventMonitoring()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-primary'
            case 'warning':
                return 'text-muted-foreground'
            case 'error':
                return 'text-destructive'
            default:
                return 'text-muted-foreground'
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-primary/10'
            case 'warning':
                return 'bg-muted'
            case 'error':
                return 'bg-destructive/10'
            default:
                return 'bg-muted'
        }
    }

    return (
        <motion.div 
            className="space-y-8 p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Панель управления
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Обзор активности транспортной компании
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link to={ROUTES.ANALYTICS}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Аналитика
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
            >
                <motion.div variants={cardVariants} whileHover="hover">
                    <Card 
                        className="claude-card cursor-pointer border shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => navigate(ROUTES.FLEET)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Транспортные средства
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Truck className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {dashboardStats.totalVehicles}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                    +2 за последний месяц
                                </p>
                            </div>
                            <div className="mt-3">
                                <Progress value={85} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    85% готовы к работе
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover">
                    <Card 
                        className="claude-card cursor-pointer border shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => navigate(ROUTES.DRIVERS)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Активные водители
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {dashboardStats.activeDrivers}
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                    Сейчас на линии
                                </p>
                            </div>
                            <div className="mt-3">
                                <Progress value={92} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    92% эффективность
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover">
                    <Card 
                        className="claude-card cursor-pointer border shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => navigate(ROUTES.ROUTES)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Маршруты в пути
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Route className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {dashboardStats.routesInProgress}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                    {dashboardStats.pendingCargo} ожидающих груза
                                </p>
                            </div>
                            <div className="mt-3">
                                <Progress value={dashboardStats.onTimeDeliveries} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dashboardStats.onTimeDeliveries}% в срок
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="claude-card border shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Выручка за месяц
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {(dashboardStats.totalRevenue / 1000000).toFixed(1)}M ₽
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                    +12.5% от предыдущего месяца
                                </p>
                            </div>
                            <div className="mt-3">
                                <Progress value={78} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    78% от цели
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold">Последние события</CardTitle>
                                <Button variant="ghost" size="sm">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => {
                                    const IconComponent = activity.icon
                                    return (
                                        <motion.div 
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className={`p-2 rounded-full ${getStatusBgColor(activity.status)}`}>
                                                <IconComponent className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.message}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{activity.time}</span>
                                                    {activity.driver && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{activity.driver}</span>
                                                        </>
                                                    )}
                                                    {activity.vehicle && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{activity.vehicle}</span>
                                                        </>
                                                    )}
                                                    {activity.route && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{activity.route}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div variants={itemVariants}>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold">Показатели эффективности</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium">Доставки в срок</span>
                                        </div>
                                        <span className="text-lg font-bold text-primary">
                                            {dashboardStats.onTimeDeliveries}%
                                        </span>
                                    </div>
                                    <Progress value={dashboardStats.onTimeDeliveries} className="h-2" />
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Fuel className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium">Эффективность топлива</span>
                                        </div>
                                        <span className="text-lg font-bold text-primary">
                                            {dashboardStats.fuelEfficiency}%
                                        </span>
                                    </div>
                                    <Progress value={dashboardStats.fuelEfficiency} className="h-2" />
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium">Общая эффективность</span>
                                        </div>
                                        <span className="text-lg font-bold text-primary">
                                            {dashboardStats.efficiency}%
                                        </span>
                                    </div>
                                    <Progress value={dashboardStats.efficiency} className="h-2" />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboardStats.completedRoutes}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Завершено маршрутов
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-foreground">
                                            {dashboardStats.maintenanceAlerts}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Требуют ТО
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Быстрые действия</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Основные операции системы управления грузоперевозками
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon
                                return (
                                    <motion.div
                                        key={action.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card 
                                            className="claude-card cursor-pointer border hover:shadow-md transition-all duration-300 h-full"
                                            onClick={() => navigate(action.link)}
                                        >
                                            <CardContent className="p-6 flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-3 rounded-full ${action.bgColor}`}>
                                                        <IconComponent className={`h-6 w-6 ${action.color}`} />
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-foreground mb-2">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}