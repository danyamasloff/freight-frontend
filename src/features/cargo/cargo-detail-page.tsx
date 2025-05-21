import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AlertCircle,
    Archive,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Cog,
    Edit,
    Loader2,
    MapPin,
    Package,
    Truck,
    User,
    XCircle,
    AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { useGetCargoQuery, useDeleteCargoMutation } from '@/shared/api/cargoSlice';
import { CargoType } from '@/shared/types/cargo';
import { useToast } from '@/hooks/use-toast';

export function CargoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const cargoId = parseInt(id || '0');
    const navigate = useNavigate();
    const { toast } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: cargo, isLoading, error } = useGetCargoQuery(cargoId);
    const [deleteCargo, { isLoading: isDeleting }] = useDeleteCargoMutation();

    useEffect(() => {
        if (!id || isNaN(cargoId)) {
            navigate('/cargo');
        }
    }, [id, cargoId, navigate]);

    const handleDelete = async () => {
        try {
            await deleteCargo(cargoId).unwrap();
            toast({
                title: "Груз удален",
                description: "Груз успешно удален из системы."
            });
            navigate('/cargo');
        } catch (error) {
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить груз. Пожалуйста, попробуйте еще раз.",
                variant: "destructive"
            });
            console.error("Error deleting cargo:", error);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCargoTypeLabel = (type?: CargoType) => {
        if (!type) return '-';

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

        return labelMap[type];
    };

    const getCargoTypeBadge = (type?: CargoType) => {
        if (!type) return null;

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

        return (
            <Badge variant={variantMap[type]} className="ml-2">
                {getCargoTypeLabel(type)}
            </Badge>
        );
    };

    if (error) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    Не удалось загрузить данные о грузе. Пожалуйста, попробуйте позже.
                </AlertDescription>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/cargo')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </Alert>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/cargo">Грузы</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">
          {isLoading ? "Загрузка..." : cargo?.name || "Детали груза"}
        </span>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Основная информация о грузе */}
                <div className="col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">
                                {isLoading ? <Skeleton className="h-6 w-40" /> : (
                                    <div className="flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        {cargo?.name}
                                        {getCargoTypeBadge(cargo?.cargoType)}
                                    </div>
                                )}
                            </CardTitle>
                            <div className="flex space-x-2">
                                {!isLoading && (
                                    <>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/cargo/edit/${cargoId}`}>
                                                <Edit className="h-4 w-4 mr-1" /> Редактировать
                                            </Link>
                                        </Button>
                                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Archive className="h-4 w-4 mr-1" /> Удалить
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Удаление груза</DialogTitle>
                                                    <DialogDescription>
                                                        Вы уверены, что хотите удалить груз "{cargo?.name}"? Это действие нельзя отменить.
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
                                    <div className="text-muted-foreground mb-4">
                                        {cargo?.description || "Описание отсутствует"}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">ID груза</div>
                                            <div className="font-medium">{cargo?.id}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Тип груза</div>
                                            <div className="font-medium">{getCargoTypeLabel(cargo?.cargoType)}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Дата создания</div>
                                            <div className="font-medium flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {formatDateTime(cargo?.createdAt)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Последнее обновление</div>
                                            <div className="font-medium flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {formatDateTime(cargo?.updatedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {cargo?.declaredValue && (
                                        <div className="mt-6 p-4 border rounded-lg bg-muted/10">
                                            <div className="text-sm font-medium mb-2">Объявленная стоимость</div>
                                            <div className="text-xl font-bold">
                                                {Number(cargo.declaredValue).toLocaleString()} {cargo.currency}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Спецификация груза</CardTitle>
                            <CardDescription>Технические характеристики груза</CardDescription>
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
                                            <h3 className="font-medium mb-2">Основные параметры</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Вес</span>
                                                    <span className="font-medium">{cargo?.weightKg} кг</span>
                                                </div>

                                                {cargo?.volumeCubicMeters && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Объем</span>
                                                        <span className="font-medium">{cargo.volumeCubicMeters} м³</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-medium mb-2">Габариты</h3>
                                            <div className="space-y-4">
                                                {cargo?.lengthCm && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Длина</span>
                                                        <span className="font-medium">{cargo.lengthCm} см</span>
                                                    </div>
                                                )}

                                                {cargo?.widthCm && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Ширина</span>
                                                        <span className="font-medium">{cargo.widthCm} см</span>
                                                    </div>
                                                )}

                                                {cargo?.heightCm && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Высота</span>
                                                        <span className="font-medium">{cargo.heightCm} см</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-medium mb-2">Особые требования</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    {cargo?.isFragile ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-muted-foreground mr-2" />
                                                    )}
                                                    <span>Хрупкий груз</span>
                                                </div>

                                                <div className="flex items-center">
                                                    {cargo?.isPerishable ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-muted-foreground mr-2" />
                                                    )}
                                                    <span>Скоропортящийся груз</span>
                                                </div>

                                                <div className="flex items-center">
                                                    {cargo?.isOversized ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-muted-foreground mr-2" />
                                                    )}
                                                    <span>Негабаритный груз</span>
                                                </div>

                                                <div className="flex items-center">
                                                    {cargo?.requiresCustomsClearance ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-muted-foreground mr-2" />
                                                    )}
                                                    <span>Требуется таможенная очистка</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {/* Температурный режим */}
                                            {cargo?.requiresTemperatureControl && (
                                                <div className="mb-6">
                                                    <h3 className="font-medium mb-2">Температурный режим</h3>
                                                    <div className="p-3 border rounded-lg">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-muted-foreground">Минимальная температура</span>
                                                            <span className="font-medium">{cargo.minTemperatureCelsius}°C</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Максимальная температура</span>
                                                            <span className="font-medium">{cargo.maxTemperatureCelsius}°C</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Опасный груз */}
                                            {cargo?.isDangerous && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Информация об опасном грузе</h3>
                                                    <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                                                        <div className="flex items-center mb-3">
                                                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                                            <span className="font-medium text-red-600 dark:text-red-400">Опасный груз</span>
                                                        </div>

                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-muted-foreground">Класс опасности</span>
                                                            <span className="font-medium">{cargo.dangerousGoodsClass}</span>
                                                        </div>

                                                        {cargo.unNumber && (
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Номер ООН</span>
                                                                <span className="font-medium">{cargo.unNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Боковая информация */}
                <div className="col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Действия</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full justify-start" asChild>
                                <Link to={`/routes/create?cargoId=${cargoId}`}>
                                    <MapPin className="mr-2 h-4 w-4" /> Назначить на маршрут
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <Truck className="mr-2 h-4 w-4" /> Найти подходящее ТС
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <User className="mr-2 h-4 w-4" /> Подобрать водителя
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <Cog className="mr-2 h-4 w-4" /> Настройки
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Статус назначения */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Статус назначения</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-2">Статус</div>
                                        <Badge variant="outline" className="text-base px-3 py-1">
                                            Не назначен
                                        </Badge>
                                    </div>

                                    <Button variant="default" className="w-full" asChild>
                                        <Link to={`/routes/create?cargoId=${cargoId}`}>
                                            Назначить на маршрут
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Совместимость */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Требования к перевозке</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    {cargo?.isDangerous && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                Требуются специальные разрешения для перевозки опасных грузов класса {cargo.dangerousGoodsClass}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {cargo?.requiresTemperatureControl && (
                                        <Alert className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Требуется рефрижератор с температурным режимом от {cargo.minTemperatureCelsius}°C до {cargo.maxTemperatureCelsius}°C
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {cargo?.isOversized && (
                                        <Alert className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Требуется транспорт для перевозки негабаритных грузов
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {!cargo?.isDangerous && !cargo?.requiresTemperatureControl && !cargo?.isOversized && (
                                        <div className="text-center py-4">
                                            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Стандартные требования к перевозке
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}