import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Edit,
    Loader2,
    Truck,
    FileSpreadsheet,
    Fuel,
    Gauge,
    AlertTriangle,
    Settings,
    Route,
    Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { useGetVehicleQuery, useDeleteVehicleMutation } from '@/shared/api/vehiclesApiSlice';
import { VehicleStatus } from '@/shared/types/vehicle';
import { formatDateTime } from '@/shared/utils/format';
import { useToast } from '@/hooks/use-toast';
import { FuelUpdate } from '@/features/fleet/components/fuel-update';
import { OdometerUpdate } from '@/features/fleet/components/odometer-update';

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const vehicleId = parseInt(id || '0');
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("info");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: vehicle, isLoading, error } = useGetVehicleQuery(vehicleId, {
        skip: isNaN(vehicleId) || vehicleId <= 0
    });
    const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

    if (isNaN(vehicleId) || vehicleId <= 0) {
        navigate('/fleet');
        return null;
    }

    const handleDelete = async () => {
        try {
            await deleteVehicle(vehicleId).unwrap();
            toast({
                title: "ТС удалено",
                description: "Транспортное средство успешно удалено из системы"
            });
            navigate('/fleet');
        } catch (error) {
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить транспортное средство",
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    // Форматирование отображения статуса
    const formatStatus = (status?: VehicleStatus) => {
        if (!status) return 'Неизвестно';

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
    const getStatusVariant = (status?: VehicleStatus) => {
        if (!status) return 'secondary';

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
                    Не удалось загрузить данные о транспортном средстве. Пожалуйста, попробуйте позже.
                </AlertDescription>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/fleet')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </Alert>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/fleet">Автопарк</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">
                    {isLoading
                        ? "Загрузка..."
                        : vehicle
                            ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
                            : "Детали ТС"
                    }
                </span>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Основная информация о ТС */}
                <div className="col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Основная информация</TabsTrigger>
                            <TabsTrigger value="technical">Технические характеристики</TabsTrigger>
                            <TabsTrigger value="documents">Документы</TabsTrigger>
                        </TabsList>

                        {/* Основная информация */}
                        <TabsContent value="info">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">
                                        {isLoading ? <Skeleton className="h-6 w-40" /> : (
                                            <div className="flex items-center">
                                                <Truck className="h-5 w-5 mr-2" />
                                                {`${vehicle?.brand || ''} ${vehicle?.model || ''}`}
                                            </div>
                                        )}
                                    </CardTitle>
                                    <div className="flex space-x-2">
                                        {!isLoading && (
                                            <>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/fleet/edit/${vehicleId}`}>
                                                        <Edit className="h-4 w-4 mr-1" /> Редактировать
                                                    </Link>
                                                </Button>
                                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <AlertTriangle className="h-4 w-4 mr-1" /> Удалить
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Удаление транспортного средства</DialogTitle>
                                                            <DialogDescription>
                                                                Вы уверены, что хотите удалить ТС "{vehicle?.brand} {vehicle?.model} ({vehicle?.licensePlate})"? Это действие нельзя отменить.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                                Отмена
                                                            </Button>
                                                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Удалить
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Гос. номер</div>
                                                    <div className="font-medium">{vehicle?.licensePlate}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Статус</div>
                                                    <div>
                                                        <Badge variant={getStatusVariant(vehicle?.status)}>
                                                            {formatStatus(vehicle?.status)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Год выпуска</div>
                                                    <div className="font-medium">{vehicle?.year}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">VIN</div>
                                                    <div className="font-medium">{vehicle?.vin || 'Не указан'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Создано</div>
                                                    <div className="font-medium flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {vehicle?.createdAt ? formatDateTime(vehicle.createdAt) : 'Не указано'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Обновлено</div>
                                                    <div className="font-medium flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {vehicle?.updatedAt ? formatDateTime(vehicle.updatedAt) : 'Не указано'}
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-6" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {vehicle && (
                                                    <>
                                                        <FuelUpdate
                                                            vehicleId={vehicle.id}
                                                            currentFuel={vehicle.currentFuelL}
                                                            tankCapacity={vehicle.fuelTankCapacityL}
                                                        />
                                                        <OdometerUpdate
                                                            vehicleId={vehicle.id}
                                                            currentOdometer={vehicle.currentOdometerKm}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Технические характеристики */}
                        <TabsContent value="technical">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium">Технические характеристики</CardTitle>
                                    <CardDescription>Технические параметры транспортного средства</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-medium mb-3">Габариты и вес</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Длина</span>
                                                            <span className="font-medium">{vehicle?.lengthCm} см</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Ширина</span>
                                                            <span className="font-medium">{vehicle?.widthCm} см</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Высота</span>
                                                            <span className="font-medium">{vehicle?.heightCm} см</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Снаряженная масса</span>
                                                            <span className="font-medium">{vehicle?.emptyWeightKg} кг</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Полная масса</span>
                                                            <span className="font-medium">{vehicle?.grossWeightKg} кг</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium mb-3">Топливо и пробег</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Объем бака</span>
                                                            <span className="font-medium">{vehicle?.fuelTankCapacityL} л</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Текущий уровень топлива</span>
                                                            <span className="font-medium">{vehicle?.currentFuelL || 0} л</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Расход топлива</span>
                                                            <span className="font-medium">{vehicle?.fuelConsumptionPer100km} л/100км</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Текущий пробег</span>
                                                            <span className="font-medium">{vehicle?.currentOdometerKm || 0} км</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-6" />

                                            <div className="space-y-4">
                                                <h3 className="font-medium">Специальное оборудование</h3>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="flex items-center p-3 bg-muted/20 rounded-lg">
                                                        <div className="mr-3">
                                                            {vehicle?.hasRefrigerator ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Рефрижератор</div>
                                                            {vehicle?.hasRefrigerator && vehicle?.refrigeratorMinTempC !== undefined && vehicle?.refrigeratorMaxTempC !== undefined && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    Диапазон температур: от {vehicle.refrigeratorMinTempC}°C до {vehicle.refrigeratorMaxTempC}°C
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center p-3 bg-muted/20 rounded-lg">
                                                        <div className="mr-3">
                                                            {vehicle?.hasDangerousGoodsPermission ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Перевозка опасных грузов</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {vehicle?.hasDangerousGoodsPermission
                                                                    ? "Имеется разрешение"
                                                                    : "Нет разрешения"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center p-3 bg-muted/20 rounded-lg">
                                                        <div className="mr-3">
                                                            {vehicle?.hasOversizedCargoPermission ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Перевозка негабаритных грузов</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {vehicle?.hasOversizedCargoPermission
                                                                    ? "Имеется разрешение"
                                                                    : "Нет разрешения"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Документы */}
                        <TabsContent value="documents">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium">Документы</CardTitle>
                                    <CardDescription>Информация о документах и сроках проверок</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-4 border rounded-lg">
                                                    <h3 className="font-medium mb-3">Регистрация ТС</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Срок действия</span>
                                                            <div>
                                                                <span className="font-medium">{vehicle?.registrationExpiryDate || 'Не указано'}</span>
                                                                {vehicle?.registrationExpiryDate && new Date(vehicle.registrationExpiryDate) < new Date() && (
                                                                    <Badge variant="destructive" className="ml-2">Истек</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 border rounded-lg">
                                                    <h3 className="font-medium mb-3">Страховка</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Срок действия</span>
                                                            <div>
                                                                <span className="font-medium">{vehicle?.insuranceExpiryDate || 'Не указано'}</span>
                                                                {vehicle?.insuranceExpiryDate && new Date(vehicle.insuranceExpiryDate) < new Date() && (
                                                                    <Badge variant="destructive" className="ml-2">Истек</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <h3 className="font-medium mb-3">Техобслуживание</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Последнее ТО</span>
                                                        <span className="font-medium">{vehicle?.lastMaintenanceDate || 'Не указано'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Следующее ТО</span>
                                                        <div>
                                                            <span className="font-medium">{vehicle?.nextMaintenanceDate || 'Не указано'}</span>
                                                            {vehicle?.nextMaintenanceDate && new Date(vehicle.nextMaintenanceDate) < new Date() && (
                                                                <Badge variant="destructive" className="ml-2">Просрочено</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Боковая информация */}
                <div className="col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Действия</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full justify-start" asChild>
                                <Link to={`/routes/create?vehicleId=${vehicleId}`}>
                                    <Route className="mr-2 h-4 w-4" /> Назначить на маршрут
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="mr-2 h-4 w-4" /> Техобслуживание
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <Info className="mr-2 h-4 w-4" /> История эксплуатации
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Документы
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Статус */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Статус</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-2">Статус</div>
                                        <Badge variant={getStatusVariant(vehicle?.status)} className="text-base px-3 py-1">
                                            {formatStatus(vehicle?.status)}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Текущий пробег</span>
                                            <span className="font-medium">{vehicle?.currentOdometerKm || 0} км</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Уровень топлива</span>
                                            <span className="font-medium">{vehicle?.currentFuelL || 0} / {vehicle?.fuelTankCapacityL || 0} л</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Специальные разрешения */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Специальные разрешения</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                        <div>
                                            {vehicle?.hasDangerousGoodsPermission ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">Опасные грузы (ADR)</div>
                                            <div className="text-sm text-muted-foreground">
                                                {vehicle?.hasDangerousGoodsPermission ? "Разрешено" : "Нет разрешения"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                        <div>
                                            {vehicle?.hasOversizedCargoPermission ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">Негабаритные грузы</div>
                                            <div className="text-sm text-muted-foreground">
                                                {vehicle?.hasOversizedCargoPermission ? "Разрешено" : "Нет разрешения"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                        <div>
                                            {vehicle?.hasRefrigerator ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">Рефрижератор</div>
                                            <div className="text-sm text-muted-foreground">
                                                {vehicle?.hasRefrigerator
                                                    ? `${vehicle.refrigeratorMinTempC || 0}°C до ${vehicle.refrigeratorMaxTempC || 0}°C`
                                                    : "Не оборудовано"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}