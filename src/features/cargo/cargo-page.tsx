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
    AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { useGetCargosQuery } from '@/shared/api/cargoSlice';
import { CargoType } from '@/shared/types/cargo';

export function CargoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const { data: cargos, isLoading, error } = useGetCargosQuery();

    // Фильтрация и поиск
    const filteredCargos = cargos?.filter(cargo => {
        // Поиск
        const matchesSearch = searchQuery
            ? cargo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cargo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            : true;

        // Фильтр по типу
        const matchesFilter = filterType === 'ALL' || cargo.cargoType === filterType;

        return matchesSearch && matchesFilter;
    }) || [];

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

    // Получение бейджа для особенностей груза
    const getFeatureBadge = (isActive: boolean, label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default') => {
        if (!isActive) return null;
        return (
            <Badge variant={variant} className="mr-1">
                {label}
            </Badge>
        );
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
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Грузы</h1>
                    <p className="text-muted-foreground mt-1">
                        Управление грузами и их назначение на маршруты
                    </p>
                </div>
                <Button asChild>
                    <Link to="/cargo/create">
                        <Plus className="mr-2 h-4 w-4" /> Добавить груз
                    </Link>
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Список грузов</CardTitle>
                    <CardDescription>
                        Здесь вы можете просмотреть все грузы, доступные для назначения на маршруты
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по названию или описанию"
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

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Загрузка грузов...</span>
                        </div>
                    ) : filteredCargos.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <PackagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Грузы не найдены</h3>
                            <p className="mt-2 text-muted-foreground">
                                {searchQuery || filterType !== 'ALL'
                                    ? "Попробуйте изменить параметры поиска или фильтрации"
                                    : "Нажмите на кнопку 'Добавить груз', чтобы создать новый груз"}
                            </p>
                            {!(searchQuery || filterType !== 'ALL') && (
                                <Button asChild className="mt-4">
                                    <Link to="/cargo/create">
                                        <Plus className="mr-2 h-4 w-4" /> Добавить груз
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead className="w-1/4">
                                            <div className="flex items-center">
                                                Название
                                                <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead className="text-right">Вес (кг)</TableHead>
                                        <TableHead>Особенности</TableHead>
                                        <TableHead className="text-right w-24">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCargos.map((cargo) => (
                                        <TableRow key={cargo.id}>
                                            <TableCell>{cargo.id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{cargo.name}</div>
                                                {cargo.description && (
                                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                                        {cargo.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getCargoTypeBadge(cargo.cargoType)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {cargo.weightKg.toLocaleString()} кг
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {getFeatureBadge(cargo.isFragile, 'Хрупкий', 'outline')}
                                                    {getFeatureBadge(cargo.isDangerous, 'Опасный', 'destructive')}
                                                    {getFeatureBadge(cargo.isPerishable, 'Скоропортящийся', 'secondary')}
                                                    {getFeatureBadge(cargo.isOversized, 'Негабаритный', 'outline')}
                                                    {getFeatureBadge(cargo.requiresTemperatureControl, 'Темп. режим', 'secondary')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/cargo/${cargo.id}`}>
                                                        <Package className="h-4 w-4 mr-1" /> Детали
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}