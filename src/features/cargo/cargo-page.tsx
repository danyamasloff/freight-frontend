import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    Plus,
    Search,
    PackagePlus,
    Loader2,
    Filter,
    ArrowUpDown,
    AlertCircle,
    TrendingUp,
    Activity,
    Grid,
    List,
    Eye,
    Edit,
    MoreVertical,
    Weight,
    Thermometer,
    Shield,
    AlertTriangle,
    Truck,
    Clock,
    DollarSign,
    Scale,
    Zap,
    CheckCircle2,
    XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

import { useGetCargosQuery } from '@/shared/api/cargoSlice';
import { CargoType } from '@/shared/types/cargo';

export function CargoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data: cargos, isLoading, error } = useGetCargosQuery();

    // Фильтрация и поиск
    const filteredCargos = cargos?.filter(cargo => {
        const matchesSearch = searchQuery
            ? cargo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cargo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            : true;

        const matchesFilter = filterType === 'ALL' || cargo.cargoType === filterType;

        return matchesSearch && matchesFilter;
    }) || [];

    // Статистика грузов
    const getCargoStats = () => {
        if (!cargos) return { 
            total: 0, 
            dangerous: 0, 
            fragile: 0, 
            perishable: 0, 
            oversized: 0,
            totalWeight: 0,
            avgWeight: 0
        };

        const totalWeight = cargos.reduce((sum, cargo) => sum + cargo.weightKg, 0);
        
        return {
            total: cargos.length,
            dangerous: cargos.filter(c => c.isDangerous).length,
            fragile: cargos.filter(c => c.isFragile).length,
            perishable: cargos.filter(c => c.isPerishable).length,
            oversized: cargos.filter(c => c.isOversized).length,
            totalWeight,
            avgWeight: cargos.length > 0 ? Math.round(totalWeight / cargos.length) : 0
        };
    };

    const stats = getCargoStats();

    // Получение бейджа для типа груза
    const getCargoTypeBadge = (type: CargoType) => {
        const variantMap: Record<CargoType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            [CargoType.GENERAL]: 'default',
            [CargoType.BULK]: 'default',
            [CargoType.LIQUID]: 'secondary',
            [CargoType.CONTAINER]: 'default',
            [CargoType.REFRIGERATED]: 'secondary',
            [CargoType.DANGEROUS]: 'destructive',
            [CargoType.OVERSIZED]: 'outline',
            [CargoType.HEAVY]: 'outline',
            [CargoType.LIVESTOCK]: 'secondary',
            [CargoType.PERISHABLE]: 'secondary',
            [CargoType.VALUABLE]: 'default',
            [CargoType.FRAGILE]: 'outline',
        };

        const labelMap: Record<CargoType, string> = {
            [CargoType.GENERAL]: 'Генеральный',
            [CargoType.BULK]: 'Навалочный',
            [CargoType.LIQUID]: 'Жидкий',
            [CargoType.CONTAINER]: 'Контейнерный',
            [CargoType.REFRIGERATED]: 'Рефрижераторный',
            [CargoType.DANGEROUS]: 'Опасный',
            [CargoType.OVERSIZED]: 'Негабаритный',
            [CargoType.HEAVY]: 'Тяжеловесный',
            [CargoType.LIVESTOCK]: 'Животные',
            [CargoType.PERISHABLE]: 'Скоропортящийся',
            [CargoType.VALUABLE]: 'Ценный',
            [CargoType.FRAGILE]: 'Хрупкий',
        };

        return (
            <Badge variant={variantMap[type]}>
                {labelMap[type]}
            </Badge>
        );
    };

    const getCargoTypeIcon = (type: CargoType) => {
        switch (type) {
            case CargoType.DANGEROUS:
                return AlertTriangle;
            case CargoType.REFRIGERATED:
                return Thermometer;
            case CargoType.FRAGILE:
                return Shield;
            case CargoType.HEAVY:
                return Weight;
            case CargoType.OVERSIZED:
                return Scale;
            default:
                return Package;
        }
    };

    // Получение бейджа для особенностей груза
    const getFeatureBadge = (isActive: boolean, label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default') => {
        if (!isActive) return null;
        return (
            <Badge variant={variant} className="text-xs">
                {label}
            </Badge>
        );
    };

    // Анимационные варианты
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить список грузов. Пожалуйста, попробуйте позже.
                </AlertDescription>
            </Alert>
        );
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
                            Грузы
                        </h1>
                        <p className="text-muted-foreground text-lg">
                        Управление грузами и их назначение на маршруты
                    </p>
                </div>
                    <Button asChild size="lg">
                    <Link to="/cargo/create">
                            <Plus className="mr-2 h-5 w-5" />
                            Добавить груз
                    </Link>
                </Button>
            </div>
            </motion.div>

            {/* Статистика */}
            <motion.div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Всего грузов
                            </CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Package className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {stats.total}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                    Общее количество
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Общий вес
                            </CardTitle>
                            <div className="p-2 bg-blue-500/10 rounded-full">
                                <Weight className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {(stats.totalWeight / 1000).toFixed(1)}т
                            </div>
                            <div className="flex items-center gap-2">
                                <Scale className="h-3 w-3 text-blue-500" />
                                <p className="text-xs text-muted-foreground">
                                    Средний: {stats.avgWeight} кг
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Особые требования
                            </CardTitle>
                            <div className="p-2 bg-orange-500/10 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {stats.dangerous + stats.fragile + stats.perishable}
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-orange-500" />
                                <p className="text-xs text-muted-foreground">
                                    Требуют внимания
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Опасные грузы
                            </CardTitle>
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                </CardHeader>
                <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {stats.dangerous}
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-red-500" />
                                <p className="text-xs text-muted-foreground">
                                    Требуют ДОПОГ
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Фильтры и поиск */}
            <motion.div variants={itemVariants}>
                <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                        placeholder="Поиск по названию или описанию..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Фильтр по типу" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Все типы</SelectItem>
                                    <Separator className="my-1" />
                                    {Object.values(CargoType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getCargoTypeBadge(type as CargoType)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Список грузов */}
            <motion.div variants={itemVariants}>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Загрузка грузов...</span>
                        </div>
                    ) : filteredCargos.length === 0 ? (
                    <Card className="border shadow-sm">
                        <CardContent className="text-center py-12">
                            <PackagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Грузы не найдены</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || filterType !== 'ALL'
                                    ? "Попробуйте изменить параметры поиска или фильтрации"
                                    : "Нажмите на кнопку 'Добавить груз', чтобы создать новый груз"}
                            </p>
                            {!(searchQuery || filterType !== 'ALL') && (
                                <Button asChild>
                                    <Link to="/cargo/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Добавить груз
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className={viewMode === 'grid' 
                        ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                        : "space-y-4"
                    }>
                        {filteredCargos.map((cargo, index) => {
                            const TypeIcon = getCargoTypeIcon(cargo.cargoType);
                            return (
                                <motion.div
                                    key={cargo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card className="border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                        {cargo.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        ID: {cargo.id}
                                                    </CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/cargo/${cargo.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Просмотр
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/cargo/${cargo.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Редактировать
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Truck className="mr-2 h-4 w-4" />
                                                            Назначить на маршрут
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                {getCargoTypeBadge(cargo.cargoType)}
                                                <div className="flex items-center gap-1 text-sm font-medium">
                                                    <Weight className="h-3 w-3 text-muted-foreground" />
                                                    {cargo.weightKg.toLocaleString()} кг
                        </div>
                                            </div>

                                                {cargo.description && (
                                                <div className="text-sm text-muted-foreground line-clamp-2">
                                                        {cargo.description}
                                                    </div>
                                                )}

                                            <Separator />

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Характеристики</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {getFeatureBadge(cargo.isFragile, 'Хрупкий', 'outline')}
                                                    {getFeatureBadge(cargo.isDangerous, 'Опасный', 'destructive')}
                                                    {getFeatureBadge(cargo.isPerishable, 'Скоропортящийся', 'secondary')}
                                                    {getFeatureBadge(cargo.isOversized, 'Негабаритный', 'outline')}
                                                    {getFeatureBadge(cargo.requiresTemperatureControl, 'Темп. режим', 'secondary')}
                                                    {!cargo.isFragile && !cargo.isDangerous && !cargo.isPerishable && !cargo.isOversized && !cargo.requiresTemperatureControl && (
                                                        <Badge variant="default" className="text-xs">
                                                            Стандартный
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <Link to={`/cargo/${cargo.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Подробнее
                                                    </Link>
                                                </Button>
                        </div>
                </CardContent>
            </Card>
                                </motion.div>
                            );
                        })}
        </div>
                )}
            </motion.div>
        </motion.div>
    );
}