import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Truck,
    Plus,
    Search,
    TruckIcon,
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

import { useGetVehiclesQuery } from '@/shared/api/vehiclesApiSlice';
import { VehicleStatus } from '@/shared/types/vehicle';

export default function FleetPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const { data: vehicles, isLoading, error } = useGetVehiclesQuery();

    // Фильтрация и поиск
    const filteredVehicles = vehicles?.filter(vehicle => {
        // Поиск
        const matchesSearch = searchQuery
            ? `${vehicle.brand} ${vehicle.model} ${vehicle.licensePlate}`.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        // Фильтр по статусу
        const matchesFilter = filterStatus === 'ALL' || vehicle.status === filterStatus;

        return matchesSearch && matchesFilter;
    }) || [];

    // Форматирование отображения статуса
    const formatStatus = (status: VehicleStatus) => {
        switch (status) {
            case VehicleStatus.AVAILABLE:
                return 'Доступно';
            case VehicleStatus.IN_USE:
                return 'В использовании';
            case VehicleStatus.MAINTENANCE:
                return 'На техобслуживании';
            case VehicleStatus.OUT_OF_SERVICE:
                return 'Не на ходу';
            default:
                return status;
        }
    };

    // Получение класса статуса для бейджа
    const getStatusVariant = (status: VehicleStatus) => {
        switch (status) {
            case VehicleStatus.AVAILABLE:
                return 'success';
            case VehicleStatus.IN_USE:
                return 'default';
            case VehicleStatus.MAINTENANCE:
                return 'warning';
            case VehicleStatus.OUT_OF_SERVICE:
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить список транспортных средств. Пожалуйста, попробуйте позже.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Автопарк</h1>
                    <p className="text-muted-foreground mt-1">
                        Управление транспортными средствами компании
                    </p>
                </div>
                <Button asChild>
                    <Link to="/fleet/create">
                        <Plus className="mr-2 h-4 w-4" /> Добавить ТС
                    </Link>
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Список транспортных средств</CardTitle>
                    <CardDescription>
                        Просмотр и управление информацией о транспортных средствах компании
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по марке, модели или номеру"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="Фильтр по статусу" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Все статусы</SelectItem>
                                    {Object.values(VehicleStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {formatStatus(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Загрузка транспортных средств...</span>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <TruckIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Транспортные средства не найдены</h3>
                            <p className="mt-2 text-muted-foreground">
                                {searchQuery || filterStatus !== 'ALL'
                                    ? "Попробуйте изменить параметры поиска или фильтрации"
                                    : "Нажмите на кнопку 'Добавить ТС', чтобы добавить новое транспортное средство"}
                            </p>
                            {!(searchQuery || filterStatus !== 'ALL') && (
                                <Button asChild className="mt-4">
                                    <Link to="/fleet/create">
                                        <Plus className="mr-2 h-4 w-4" /> Добавить ТС
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
                                                Марка/Модель
                                                <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Гос. номер</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead className="text-right w-24">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVehicles.map((vehicle) => (
                                        <TableRow key={vehicle.id}>
                                            <TableCell>{vehicle.id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {vehicle.brand} {vehicle.model}
                                                </div>
                                            </TableCell>
                                            <TableCell>{vehicle.licensePlate}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(vehicle.status)}>
                                                    {formatStatus(vehicle.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/fleet/${vehicle.id}`}>
                                                        <Truck className="h-4 w-4 mr-1" /> Детали
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