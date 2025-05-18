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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Shield,
    Calendar,
    User,
    Truck,
    AlertCircle,
    Download,
    Search,
    Filter,
    XCircle
} from 'lucide-react'

// Mock compliance data
const complianceOverview = {
    totalDrivers: 45,
    compliantDrivers: 41,
    totalVehicles: 38,
    compliantVehicles: 35,
    upcomingExpirations: 12,
    violations: 3,
    complianceScore: 92.5
}

const driverCompliance = [
    {
        id: 1,
        name: 'Петров Александр',
        license: {
            number: 'AB123456',
            expiry: '2027-03-20',
            status: 'valid',
            daysToExpiry: 820
        },
        medical: {
            lastCheck: '2024-06-15',
            nextCheck: '2025-06-15',
            status: 'valid',
            daysToExpiry: 145
        },
        workingTimeCompliance: 95.8,
        violations: []
    },
    {
        id: 2,
        name: 'Иванов Сергей',
        license: {
            number: 'CD789012',
            expiry: '2024-08-15',
            status: 'expiring',
            daysToExpiry: 45
        },
        medical: {
            lastCheck: '2023-12-10',
            nextCheck: '2024-12-10',
            status: 'valid',
            daysToExpiry: 285
        },
        workingTimeCompliance: 88.2,
        violations: ['Превышение рабочего времени 15.01.2024']
    },
    {
        id: 3,
        name: 'Сидоров Константин',
        license: {
            number: 'EF345678',
            expiry: '2026-11-30',
            status: 'valid',
            daysToExpiry: 580
        },
        medical: {
            lastCheck: '2024-01-20',
            nextCheck: '2025-01-20',
            status: 'expiring',
            daysToExpiry: 28
        },
        workingTimeCompliance: 91.5,
        violations: []
    }
]

const vehicleCompliance = [
    {
        id: 1,
        licensePlate: 'А123БВ77',
        brand: 'Volvo',
        model: 'FH',
        year: 2020,
        insurance: {
            expiry: '2024-12-31',
            status: 'valid',
            daysToExpiry: 195
        },
        technicalInspection: {
            lastCheck: '2024-03-15',
            nextCheck: '2025-03-15',
            status: 'valid',
            daysToExpiry: 285
        },
        emissions: {
            lastCheck: '2024-03-15',
            nextCheck: '2025-03-15',
            status: 'valid',
            daysToExpiry: 285
        },
        violations: []
    },
    {
        id: 2,
        licensePlate: 'В456ГД77',
        brand: 'MAN',
        model: 'TGX',
        year: 2019,
        insurance: {
            expiry: '2024-02-28',
            status: 'expired',
            daysToExpiry: -15
        },
        technicalInspection: {
            lastCheck: '2024-01-10',
            nextCheck: '2025-01-10',
            status: 'valid',
            daysToExpiry: 245
        },
        emissions: {
            lastCheck: '2024-01-10',
            nextCheck: '2025-01-10',
            status: 'valid',
            daysToExpiry: 245
        },
        violations: ['Просроченная страховка']
    }
]

const rtoViolations = [
    {
        id: 1,
        driver: 'Иванов С.М.',
        date: '2024-01-15',
        type: 'Превышение рабочего времени',
        description: 'Работа более 9 часов без перерыва',
        severity: 'medium',
        status: 'resolved'
    },
    {
        id: 2,
        driver: 'Кузнецов Д.А.',
        date: '2024-01-12',
        type: 'Недостаточный отдых',
        description: 'Отдых менее 11 часов между сменами',
        severity: 'high',
        status: 'pending'
    },
    {
        id: 3,
        driver: 'Морозов И.В.',
        date: '2024-01-08',
        type: 'Превышение недельного лимита',
        description: 'Превышение 56 часов в неделю',
        severity: 'high',
        status: 'resolved'
    }
]

export function CompliancePage() {
    const [selectedTab, setSelectedTab] = useState('overview')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'valid': return 'bg-green-500'
            case 'expiring': return 'bg-yellow-500'
            case 'expired': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'valid': return <CheckCircle className="h-4 w-4" />
            case 'expiring': return <Clock className="h-4 w-4" />
            case 'expired': return <XCircle className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'valid': return 'Действует'
            case 'expiring': return 'Истекает'
            case 'expired': return 'Просрочен'
            default: return 'Неизвестно'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'high': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Соответствие требованиям</h1>
                    <p className="text-muted-foreground">
                        Мониторинг соблюдения нормативных требований и РТО
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Search className="h-4 w-4 mr-2" />
                        Поиск
                    </Button>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Фильтры
                    </Button>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Отчет
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Общий балл</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{complianceOverview.complianceScore}%</div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Progress value={complianceOverview.complianceScore} className="flex-1" />
                            <Badge variant={complianceOverview.complianceScore > 90 ? "default" : "secondary"}>
                                {complianceOverview.complianceScore > 90 ? "Отлично" : "Хорошо"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Соответствие водителей</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {complianceOverview.compliantDrivers}/{complianceOverview.totalDrivers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((complianceOverview.compliantDrivers / complianceOverview.totalDrivers) * 100)}% соответствуют
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Соответствие ТС</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {complianceOverview.compliantVehicles}/{complianceOverview.totalVehicles}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((complianceOverview.compliantVehicles / complianceOverview.totalVehicles) * 100)}% соответствуют
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {complianceOverview.upcomingExpirations}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Истекающие документы
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="drivers">Водители</TabsTrigger>
                    <TabsTrigger value="vehicles">Транспорт</TabsTrigger>
                    <TabsTrigger value="violations">Нарушения РТО</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    Истекающие документы
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Права водителя (Иванов С.)</p>
                                            <p className="text-sm text-muted-foreground">45 дней до истечения</p>
                                        </div>
                                        <Badge variant="destructive">Критично</Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Медосмотр (Сидоров К.)</p>
                                            <p className="text-sm text-muted-foreground">28 дней до истечения</p>
                                        </div>
                                        <Badge variant="secondary">Внимание</Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Страховка ТС (В456ГД77)</p>
                                            <p className="text-sm text-muted-foreground">Просрочена на 15 дней</p>
                                        </div>
                                        <Badge variant="destructive">Просрочена</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Недавние нарушения РТО
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {rtoViolations.slice(0, 3).map((violation) => (
                                        <div key={violation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <p className="font-medium">{violation.type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {violation.driver} • {violation.date}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={violation.status === 'resolved' ? 'default' : 'destructive'}
                                            >
                                                {violation.status === 'resolved' ? 'Решено' : 'Требует действий'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="drivers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Соответствие водителей</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {driverCompliance.map((driver) => (
                                    <div key={driver.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-medium">{driver.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Удостоверение: {driver.license.number}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Соблюдение РТО</p>
                                                <p className="font-medium">{driver.workingTimeCompliance}%</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Водительские права</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(driver.license.status)}
                                                        <span className="text-sm">
                                                            {getStatusLabel(driver.license.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {driver.license.daysToExpiry > 0
                                                        ? `${driver.license.daysToExpiry} дней до истечения`
                                                        : `Просрочено на ${Math.abs(driver.license.daysToExpiry)} дней`
                                                    }
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Медосмотр</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(driver.medical.status)}
                                                        <span className="text-sm">
                                                            {getStatusLabel(driver.medical.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {driver.medical.daysToExpiry > 0
                                                        ? `${driver.medical.daysToExpiry} дней до истечения`
                                                        : `Просрочено на ${Math.abs(driver.medical.daysToExpiry)} дней`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {driver.violations.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm font-medium text-destructive mb-2">
                                                    Нарушения:
                                                </p>
                                                {driver.violations.map((violation, index) => (
                                                    <p key={index} className="text-xs text-muted-foreground">
                                                        • {violation}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Соответствие транспортных средств</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vehicleCompliance.map((vehicle) => (
                                    <div key={vehicle.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-medium">{vehicle.licensePlate}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Страховка</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(vehicle.insurance.status)}
                                                        <span className="text-sm">
                                                            {getStatusLabel(vehicle.insurance.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {vehicle.insurance.daysToExpiry > 0
                                                        ? `${vehicle.insurance.daysToExpiry} дней до истечения`
                                                        : `Просрочено на ${Math.abs(vehicle.insurance.daysToExpiry)} дней`
                                                    }
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Техосмотр</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(vehicle.technicalInspection.status)}
                                                        <span className="text-sm">
                                                            {getStatusLabel(vehicle.technicalInspection.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {vehicle.technicalInspection.daysToExpiry} дней до истечения
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Экология</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(vehicle.emissions.status)}
                                                        <span className="text-sm">
                                                            {getStatusLabel(vehicle.emissions.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {vehicle.emissions.daysToExpiry} дней до истечения
                                                </p>
                                            </div>
                                        </div>

                                        {vehicle.violations.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm font-medium text-destructive mb-2">
                                                    Нарушения:
                                                </p>
                                                {vehicle.violations.map((violation, index) => (
                                                    <p key={index} className="text-xs text-muted-foreground">
                                                        • {violation}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="violations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Нарушения режима труда и отдыха</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {rtoViolations.map((violation) => (
                                    <div key={violation.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">{violation.type}</h3>
                                            <Badge
                                                variant={violation.status === 'resolved' ? 'default' : 'destructive'}
                                            >
                                                {violation.status === 'resolved' ? 'Решено' : 'Требует действий'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Водитель:</span>
                                                <p className="font-medium">{violation.driver}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Дата:</span>
                                                <p className="font-medium">{violation.date}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Важность:</span>
                                                <p className={`font-medium ${getSeverityColor(violation.severity)}`}>
                                                    {violation.severity === 'high' ? 'Высокая' :
                                                        violation.severity === 'medium' ? 'Средняя' : 'Низкая'}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator className="my-3" />

                                        <p className="text-sm text-muted-foreground">
                                            {violation.description}
                                        </p>
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