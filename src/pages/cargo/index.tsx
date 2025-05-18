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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Package,
    Plus,
    Search,
    Filter,
    Thermometer,
    Weight,
    Ruler,
    DollarSign,
    AlertTriangle,
    Clock,
    MapPin,
    Truck,
    Eye,
    Edit,
    MoreHorizontal,
    Calendar,
    Shield
} from 'lucide-react'

// Mock cargo data
const cargoItems = [
    {
        id: 1,
        type: 'Продукты питания',
        description: 'Замороженные овощи',
        weight: 15000, // kg
        volume: 45, // m³
        value: 850000, // rubles
        temperatureMin: -18,
        temperatureMax: -15,
        hazardous: false,
        status: 'READY',
        origin: 'Москва, ул. Складская, 15',
        destination: 'СПб, пр. Невский, 88',
        pickupDate: '2024-01-22',
        deliveryDate: '2024-01-23',
        route: {
            id: 1,
            name: 'Москва - СПб',
            status: 'PLANNED'
        },
        client: {
            name: 'ООО "Продукты Север"',
            contact: '+7 (812) 123-45-67'
        },
        specialRequirements: ['Температурный режим', 'Быстрая доставка'],
        insurance: true,
        documents: ['CMR', 'Санитарный сертификат', 'Таможенная декларация']
    },
    {
        id: 2,
        type: 'Строительные материалы',
        description: 'Кирпич облицовочный',
        weight: 22000,
        volume: 28,
        value: 420000,
        temperatureMin: null,
        temperatureMax: null,
        hazardous: false,
        status: 'IN_TRANSIT',
        origin: 'Тула, Промзона Север',
        destination: 'Казань, ул. Стройматериалов, 45',
        pickupDate: '2024-01-20',
        deliveryDate: '2024-01-22',
        route: {
            id: 2,
            name: 'Тула - Казань',
            status: 'IN_PROGRESS'
        },
        driver: 'Иванов С.М.',
        vehicle: 'В456ГД77',
        progress: 65,
        client: {
            name: 'Стройбаза "Монолит"',
            contact: '+7 (843) 987-65-43'
        },
        specialRequirements: ['Бережная погрузка'],
        insurance: true,
        documents: ['ТТН', 'Сертификат качества']
    },
    {
        id: 3,
        type: 'Опасные грузы',
        description: 'Химические реагенты',
        weight: 8500,
        volume: 12,
        value: 1200000,
        temperatureMin: 5,
        temperatureMax: 25,
        hazardous: true,
        status: 'DELIVERED',
        origin: 'Нижний Новгород, Химзавод',
        destination: 'Екатеринбург, НИИ "Химпром"',
        pickupDate: '2024-01-18',
        deliveryDate: '2024-01-20',
        actualDeliveryDate: '2024-01-20',
        route: {
            id: 3,
            name: 'Н.Новгород - Екатеринбург',
            status: 'COMPLETED'
        },
        driver: 'Петров А.И.',
        vehicle: 'А123БВ77',
        client: {
            name: 'НИИ "Химпром"',
            contact: '+7 (343) 555-66-77'
        },
        specialRequirements: ['ADR сертификат', 'Спецтранспорт', 'Сопровождение'],
        insurance: true,
        documents: ['ДОПОГ', 'Паспорт безопасности', 'Разрешение на перевозку']
    },
    {
        id: 4,
        type: 'Бытовая техника',
        description: 'Холодильники и стиральные машины',
        weight: 12000,
        volume: 65,
        value: 2100000,
        temperatureMin: null,
        temperatureMax: null,
        hazardous: false,
        status: 'DELAYED',
        origin: 'Самара, Торговый комплекс',
        destination: 'Уфа, ТЦ "Планета"',
        pickupDate: '2024-01-19',
        deliveryDate: '2024-01-21',
        expectedDeliveryDate: '2024-01-23',
        route: {
            id: 4,
            name: 'Самара - Уфа',
            status: 'IN_PROGRESS'
        },
        driver: 'Сидоров К.В.',
        vehicle: 'Е789ЖЗ77',
        delayReason: 'Поломка транспортного средства',
        client: {
            name: 'ТЦ "Планета"',
            contact: '+7 (347) 777-88-99'
        },
        specialRequirements: ['Вертикальная перевозка', 'Упаковка'],
        insurance: true,
        documents: ['ТТН', 'Гарантийные талоны']
    }
]

const cargoStats = {
    total: cargoItems.length,
    ready: cargoItems.filter(c => c.status === 'READY').length,
    inTransit: cargoItems.filter(c => c.status === 'IN_TRANSIT').length,
    delivered: cargoItems.filter(c => c.status === 'DELIVERED').length,
    delayed: cargoItems.filter(c => c.status === 'DELAYED').length,
    totalWeight: cargoItems.reduce((sum, c) => sum + c.weight, 0),
    totalValue: cargoItems.reduce((sum, c) => sum + c.value, 0),
    hazardous: cargoItems.filter(c => c.hazardous).length
}

export function CargoPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')

    const filteredCargo = cargoItems.filter(cargo => {
        const matchesSearch = cargo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cargo.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cargo.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cargo.destination.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || cargo.status === statusFilter
        const matchesType = typeFilter === 'all' || cargo.type === typeFilter

        return matchesSearch && matchesStatus && matchesType
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'READY': return 'bg-blue-500'
            case 'IN_TRANSIT': return 'bg-green-500'
            case 'DELIVERED': return 'bg-gray-500'
            case 'DELAYED': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'READY': return 'Готов к отправке'
            case 'IN_TRANSIT': return 'В пути'
            case 'DELIVERED': return 'Доставлен'
            case 'DELAYED': return 'Задержка'
            default: return status
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'READY': return 'secondary'
            case 'IN_TRANSIT': return 'default'
            case 'DELIVERED': return 'outline'
            case 'DELAYED': return 'destructive'
            default: return 'outline'
        }
    }

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} т`
        }
        return `${weight} кг`
    }

    const formatCurrency = (amount: number) => {
        return `${(amount / 1000).toFixed(0)}k ₽`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Управление грузами</h1>
                    <p className="text-muted-foreground">
                        Отслеживание и управление грузоперевозками
                    </p>
                </div>

                <Button asChild>
                    <Link to="/cargo/add">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить груз
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего грузов</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cargoStats.total}</div>
                        <div className="text-sm text-muted-foreground">
                            {cargoStats.inTransit} в пути • {cargoStats.ready} готовы
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Общий вес</CardTitle>
                        <Weight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(cargoStats.totalWeight / 1000).toFixed(1)} т
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Всех грузов
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(cargoStats.totalValue / 1000000).toFixed(1)}M ₽
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Страховая стоимость
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Опасные грузы</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {cargoStats.hazardous}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Требуют спецтранспорт
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Список грузов</TabsTrigger>
                    <TabsTrigger value="tracking">Отслеживание</TabsTrigger>
                    <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Поиск по описанию, адресу..."
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
                                        <SelectItem value="READY">Готов к отправке</SelectItem>
                                        <SelectItem value="IN_TRANSIT">В пути</SelectItem>
                                        <SelectItem value="DELIVERED">Доставлен</SelectItem>
                                        <SelectItem value="DELAYED">Задержка</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Тип груза" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все типы</SelectItem>
                                        <SelectItem value="Продукты питания">Продукты питания</SelectItem>
                                        <SelectItem value="Строительные материалы">Стройматериалы</SelectItem>
                                        <SelectItem value="Опасные грузы">Опасные грузы</SelectItem>
                                        <SelectItem value="Бытовая техника">Бытовая техника</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Больше фильтров
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cargo List */}
                    <div className="space-y-4">
                        {filteredCargo.map((cargo) => (
                            <Card key={cargo.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {cargo.description}
                                                {cargo.hazardous && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Опасный
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">{cargo.type}</p>
                                        </div>
                                        <Badge variant={getStatusVariant(cargo.status)}>
                                            {getStatusLabel(cargo.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Маршрут</p>
                                            <p className="font-medium">{cargo.origin} → {cargo.destination}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {cargo.route.name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Характеристики</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Weight className="h-3 w-3" />
                                                    <span>{formatWeight(cargo.weight)}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Ruler className="h-3 w-3" />
                                                    <span>{cargo.volume} м³</span>
                                                </div>
                                            </div>
                                            {(cargo.temperatureMin !== null || cargo.temperatureMax !== null) && (
                                                <div className="flex items-center space-x-1 text-sm mt-1">
                                                    <Thermometer className="h-3 w-3" />
                                                    <span>
                                                        {cargo.temperatureMin}°C до {cargo.temperatureMax}°C
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Даты</p>
                                            <div className="text-sm space-y-1">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Забор: {cargo.pickupDate}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Доставка: {cargo.deliveryDate}</span>
                                                </div>
                                                {cargo.status === 'DELAYED' && cargo.expectedDeliveryDate && (
                                                    <div className="flex items-center space-x-1 text-red-600">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Ожидается: {cargo.expectedDeliveryDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Стоимость</p>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="font-medium">{formatCurrency(cargo.value)}</span>
                                                {cargo.insurance && (
                                                    <Shield className="h-3 w-3 text-green-600" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {cargo.client.name}
                                            </p>
                                        </div>
                                    </div>

                                    {cargo.status === 'IN_TRANSIT' && cargo.progress && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Прогресс доставки</span>
                                                <span>{cargo.progress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${cargo.progress}%` }}
                                                />
                                            </div>
                                            {cargo.driver && cargo.vehicle && (
                                                <p className="text-xs text-muted-foreground">
                                                    Водитель: {cargo.driver} • ТС: {cargo.vehicle}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {cargo.status === 'DELAYED' && cargo.delayReason && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">Причина задержки:</span>
                                            </div>
                                            <p className="text-sm text-red-700 mt-1">{cargo.delayReason}</p>
                                        </div>
                                    )}

                                    {cargo.specialRequirements.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Особые требования:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {cargo.specialRequirements.map((req, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {req}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Подробнее
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Редактировать
                                            </Button>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {cargo.route.status === 'PLANNED' && cargo.status === 'READY' && (
                                                <Button size="sm">
                                                    <Truck className="h-4 w-4 mr-2" />
                                                    Назначить ТС
                                                </Button>
                                            )}
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
                    {filteredCargo.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-16">
                                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Грузы не найдены</h3>
                                <p className="text-muted-foreground mb-4">
                                    Попробуйте изменить критерии поиска или добавьте новый груз
                                </p>
                                <Button asChild>
                                    <Link to="/cargo/add">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Добавить груз
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Отслеживание в реальном времени</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">Карта отслеживания грузов</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Интеграция с картами и GPS трекингом
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Статистика по типам грузов</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {['Продукты питания', 'Строительные материалы', 'Опасные грузы', 'Бытовая техника'].map((type) => {
                                        const count = cargoItems.filter(c => c.type === type).length
                                        const percentage = (count / cargoItems.length) * 100
                                        return (
                                            <div key={type} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{type}</span>
                                                    <span>{count} ({percentage.toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Статусы доставки</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { status: 'READY', label: 'Готов к отправке', color: 'bg-blue-600' },
                                        { status: 'IN_TRANSIT', label: 'В пути', color: 'bg-green-600' },
                                        { status: 'DELIVERED', label: 'Доставлен', color: 'bg-gray-600' },
                                        { status: 'DELAYED', label: 'Задержка', color: 'bg-red-600' }
                                    ].map((item) => {
                                        const count = cargoItems.filter(c => c.status === item.status).length
                                        const percentage = (count / cargoItems.length) * 100
                                        return (
                                            <div key={item.status} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{item.label}</span>
                                                    <span>{count} ({percentage.toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className={`${item.color} h-2 rounded-full`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}