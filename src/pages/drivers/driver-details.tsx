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
    User,
    FileSpreadsheet,
    Timer,
    ChartBar,
    CreditCard,
    MailOpen,
    Phone,
    ShieldAlert,
    GraduationCap,
    Lock,
    Truck,
    Route,
    Pencil
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useGetDriverQuery } from '@/shared/api/driversApiSlice';
import { DrivingStatus } from '@/shared/types/driver';
import { formatDateTime } from '@/shared/utils/format';
import { DriverStatusUpdate } from '@/features/drivers/components/driver-status-update';

export default function DriverDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const driverId = parseInt(id || '0');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("info");

    const { data: driver, isLoading, error } = useGetDriverQuery(driverId, {
        skip: isNaN(driverId) || driverId <= 0
    });

    if (isNaN(driverId) || driverId <= 0) {
        navigate('/drivers');
        return null;
    }

    // Функция форматирования статуса водителя
    const formatStatus = (status?: DrivingStatus) => {
        if (!status) return 'Не указан';

        switch (status) {
            case DrivingStatus.DRIVING:
                return 'За рулем';
            case DrivingStatus.REST_BREAK:
                return 'Короткий отдых';
            case DrivingStatus.DAILY_REST:
                return 'Дневной отдых';
            case DrivingStatus.WEEKLY_REST:
                return 'Недельный отдых';
            case DrivingStatus.OTHER_WORK:
                return 'Другая работа';
            case DrivingStatus.AVAILABILITY:
                return 'Доступен';
            default:
                return status;
        }
    };

    // Получение класса статуса для бейджа
    const getStatusVariant = (status?: DrivingStatus) => {
        if (!status) return 'secondary';

        switch (status) {
            case DrivingStatus.DRIVING:
                return 'default';
            case DrivingStatus.REST_BREAK:
                return 'secondary';
            case DrivingStatus.DAILY_REST:
                return 'secondary';
            case DrivingStatus.WEEKLY_REST:
                return 'secondary';
            case DrivingStatus.OTHER_WORK:
                return 'outline';
            case DrivingStatus.AVAILABILITY:
                return 'success';
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
                    Не удалось загрузить данные о водителе. Пожалуйста, попробуйте позже.
                </AlertDescription>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/drivers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </Alert>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/drivers">Водители</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">
                    {isLoading
                        ? "Загрузка..."
                        : driver
                            ? `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`
                            : "Детали водителя"
                    }
                </span>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Основная информация о водителе */}
                <div className="col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-4 mb-6">
                            <TabsTrigger value="info">Основная информация</TabsTrigger>
                            <TabsTrigger value="rto">Режим труда и отдыха</TabsTrigger>
                            <TabsTrigger value="docs">Документы</TabsTrigger>
                            <TabsTrigger value="performance">Эффективность</TabsTrigger>
                        </TabsList>

                        {/* Основная информация */}
                        <TabsContent value="info">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">
                                        {isLoading ? <Skeleton className="h-6 w-40" /> : (
                                            <div className="flex items-center">
                                                <User className="h-5 w-5 mr-2" />
                                                {`${driver?.lastName || ''} ${driver?.firstName || ''} ${driver?.middleName || ''}`}
                                            </div>
                                        )}
                                    </CardTitle>
                                    <div className="flex space-x-2">
                                        {!isLoading && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/drivers/edit/${driverId}`}>
                                                    <Edit className="h-4 w-4 mr-1" /> Редактировать
                                                </Link>
                                            </Button>
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
                                                    <div className="text-sm text-muted-foreground">Номер водительского удостоверения</div>
                                                    <div className="font-medium">{driver?.licenseNumber}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Дата рождения</div>
                                                    <div className="font-medium">{driver?.birthDate || 'Не указана'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Телефон</div>
                                                    <div className="font-medium flex items-center">
                                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {driver?.phoneNumber || 'Не указан'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Email</div>
                                                    <div className="font-medium flex items-center">
                                                        <MailOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {driver?.email || 'Не указан'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Опыт вождения</div>
                                                    <div className="font-medium">{driver?.drivingExperienceYears || 0} лет</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Категории прав</div>
                                                    <div className="font-medium">{driver?.licenseCategories || 'Не указаны'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Создан</div>
                                                    <div className="font-medium flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {driver?.createdAt ? formatDateTime(driver.createdAt) : 'Не указано'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Обновлен</div>
                                                    <div className="font-medium flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {driver?.updatedAt ? formatDateTime(driver.updatedAt) : 'Не указано'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Опасные грузы</div>
                                                    <div className="font-medium">
                                                        {driver?.hasDangerousGoodsCertificate ? (
                                                            <Badge variant="success">Допуск имеется</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Нет допуска</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Международные перевозки</div>
                                                    <div className="font-medium">
                                                        {driver?.hasInternationalTransportationPermit ? (
                                                            <Badge variant="success">Допуск имеется</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Нет допуска</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {(driver?.hourlyRate !== undefined || driver?.perKilometerRate !== undefined) && (
                                                <div className="mt-6 p-4 border rounded-lg bg-muted/10">
                                                    <div className="text-sm font-medium mb-2">Тарифы оплаты труда</div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {driver?.hourlyRate !== undefined && (
                                                            <div className="text-lg">
                                                                <span className="text-muted-foreground text-sm">Почасовая ставка:</span>
                                                                <span className="font-bold ml-2">{driver.hourlyRate} ₽/час</span>
                                                            </div>
                                                        )}
                                                        {driver?.perKilometerRate !== undefined && (
                                                            <div className="text-lg">
                                                                <span className="text-muted-foreground text-sm">За километр:</span>
                                                                <span className="font-bold ml-2">{driver.perKilometerRate} ₽/км</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Режим труда и отдыха */}
                        <TabsContent value="rto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium">Режим труда и отдыха</CardTitle>
                                    <CardDescription>Контроль соблюдения норм РТО</CardDescription>
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
                                            <div className="p-4 border rounded-lg mb-6">
                                                <div className="text-lg font-semibold mb-3">Текущий статус</div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Статус</div>
                                                        <div className="flex items-center">
                                                            <Badge variant={getStatusVariant(driver?.currentDrivingStatus)} className="text-base px-3 py-1">
                                                                {formatStatus(driver?.currentDrivingStatus)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Начало текущего статуса</div>
                                                        <div className="font-medium">
                                                            {driver?.currentStatusStartTime
                                                                ? formatDateTime(driver.currentStatusStartTime)
                                                                : 'Не указано'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg mb-6">
                                                <div className="text-lg font-semibold mb-3">Время вождения</div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="p-3 bg-muted/20 rounded-lg">
                                                        <div className="text-sm text-muted-foreground mb-1">Непрерывное вождение</div>
                                                        <div className="text-xl font-bold">
                                                            {driver?.continuousDrivingMinutes !== undefined
                                                                ? `${Math.floor(driver.continuousDrivingMinutes / 60)}ч ${driver.continuousDrivingMinutes % 60}м`
                                                                : '—'
                                                            }
                                                            <span className="text-sm font-normal text-muted-foreground ml-2">/ 4ч 30м</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-2 rounded-full mt-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{
                                                                    width: `${driver?.continuousDrivingMinutes
                                                                        ? Math.min(100, (driver.continuousDrivingMinutes / 270) * 100)
                                                                        : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-muted/20 rounded-lg">
                                                        <div className="text-sm text-muted-foreground mb-1">Дневное вождение</div>
                                                        <div className="text-xl font-bold">
                                                            {driver?.dailyDrivingMinutesToday !== undefined
                                                                ? `${Math.floor(driver.dailyDrivingMinutesToday / 60)}ч ${driver.dailyDrivingMinutesToday % 60}м`
                                                                : '—'
                                                            }
                                                            <span className="text-sm font-normal text-muted-foreground ml-2">/ 9ч</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-2 rounded-full mt-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{
                                                                    width: `${driver?.dailyDrivingMinutesToday
                                                                        ? Math.min(100, (driver.dailyDrivingMinutesToday / 540) * 100)
                                                                        : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-muted/20 rounded-lg">
                                                        <div className="text-sm text-muted-foreground mb-1">Недельное вождение</div>
                                                        <div className="text-xl font-bold">
                                                            {driver?.weeklyDrivingMinutes !== undefined
                                                                ? `${Math.floor(driver.weeklyDrivingMinutes / 60)}ч ${driver.weeklyDrivingMinutes % 60}м`
                                                                : '—'
                                                            }
                                                            <span className="text-sm font-normal text-muted-foreground ml-2">/ 56ч</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-2 rounded-full mt-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{
                                                                    width: `${driver?.weeklyDrivingMinutes
                                                                        ? Math.min(100, (driver.weeklyDrivingMinutes / 3360) * 100)
                                                                        : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {driver && <DriverStatusUpdate driverId={driver.id} currentStatus={driver.currentDrivingStatus} />}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Документы */}
                        <TabsContent value="docs">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium">Документы</CardTitle>
                                    <CardDescription>Документы и квалификационные данные водителя</CardDescription>
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
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-lg font-semibold">Водительское удостоверение</div>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-4 w-4 mr-1" /> Редактировать
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Номер</div>
                                                        <div className="font-medium">{driver?.licenseNumber || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Категории</div>
                                                        <div className="font-medium">{driver?.licenseCategories || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Дата выдачи</div>
                                                        <div className="font-medium">{driver?.licenseIssueDate || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Срок действия</div>
                                                        <div className="font-medium">
                                                            {driver?.licenseExpiryDate || '—'}
                                                            {driver?.licenseExpiryDate && new Date(driver.licenseExpiryDate) < new Date() && (
                                                                <Badge variant="destructive" className="ml-2">Истёк</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-lg font-semibold">Медицинская справка</div>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-4 w-4 mr-1" /> Редактировать
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Номер справки</div>
                                                        <div className="font-medium">Нет данных</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Ограничения</div>
                                                        <div className="font-medium">Нет данных</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Дата выдачи</div>
                                                        <div className="font-medium">Нет данных</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Срок действия</div>
                                                        <div className="font-medium">Нет данных</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-lg font-semibold">Дополнительные допуски</div>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-4 w-4 mr-1" /> Редактировать
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                                        <div className="flex items-center">
                                                            <ShieldAlert className="h-5 w-5 mr-2" />
                                                            <div>
                                                                <div className="font-medium">Перевозка опасных грузов (ADR)</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {driver?.dangerousGoodsCertificateExpiry
                                                                        ? `Действует до: ${driver.dangerousGoodsCertificateExpiry}`
                                                                        : 'Срок действия не указан'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {driver?.hasDangerousGoodsCertificate ? (
                                                            <Badge variant="success">Активен</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Отсутствует</Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                                        <div className="flex items-center">
                                                            <GraduationCap className="h-5 w-5 mr-2" />
                                                            <div>
                                                                <div className="font-medium">Международные перевозки</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Разрешение на международные перевозки грузов
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {driver?.hasInternationalTransportationPermit ? (
                                                            <Badge variant="success">Активен</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Отсутствует</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Эффективность */}
                        <TabsContent value="performance">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium">Эффективность</CardTitle>
                                    <CardDescription>Показатели эффективности работы</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center p-8">
                                        <ChartBar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <h3 className="text-lg font-medium mb-2">Данные об эффективности</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Для просмотра аналитики эффективности водителя необходимо запросить отчет за выбранный период
                                        </p>
                                        <Button asChild>
                                            <Link to={`/drivers/${driverId}/performance`}>
                                                <ChartBar className="mr-2 h-4 w-4" /> Анализ эффективности
                                            </Link>
                                        </Button>
                                    </div>
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
                                <Link to={`/routes/create?driverId=${driverId}`}>
                                    <Route className="mr-2 h-4 w-4" /> Назначить на маршрут
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to={`/drivers/${driverId}/rto-analysis`}>
                                    <Timer className="mr-2 h-4 w-4" /> Анализ РТО
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to={`/drivers/${driverId}/performance`}>
                                    <ChartBar className="mr-2 h-4 w-4" /> Эффективность
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to={`/drivers/${driverId}/docs`}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Документы
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Текущий статус */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Текущий статус</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-2">Статус</div>
                                        <Badge variant={getStatusVariant(driver?.currentDrivingStatus)} className="text-base px-3 py-1">
                                            {formatStatus(driver?.currentDrivingStatus)}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <div className="text-sm text-muted-foreground">Начало текущего статуса</div>
                                        <div className="font-medium">
                                            {driver?.currentStatusStartTime
                                                ? formatDateTime(driver.currentStatusStartTime)
                                                : 'Не указано'
                                            }
                                        </div>
                                    </div>

                                    <Button
                                        variant="default"
                                        className="w-full"
                                        disabled={!driver}
                                    >
                                        <Truck className="mr-2 h-4 w-4" /> Проверить доступность для рейса
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Лицензия */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Лицензия</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center">
                                                <Lock className="h-4 w-4 mr-2" />
                                                <span className="font-medium">Водительское удостоверение</span>
                                            </div>
                                            {driver?.licenseExpiryDate && new Date(driver.licenseExpiryDate) > new Date() ? (
                                                <Badge variant="success">Активно</Badge>
                                            ) : (
                                                <Badge variant="destructive">Истекло</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Номер:</div>
                                        <div className="font-medium">{driver?.licenseNumber || 'Не указан'}</div>
                                        <div className="flex justify-between mt-2">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Выдано:</div>
                                                <div className="font-medium">{driver?.licenseIssueDate || 'Не указано'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Действует до:</div>
                                                <div className="font-medium">{driver?.licenseExpiryDate || 'Не указано'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Категории</div>
                                            <div className="text-sm text-muted-foreground">{driver?.licenseCategories || 'Не указаны'}</div>
                                        </div>
                                        <div>
                                            {driver?.licenseCategories?.includes('C') && (
                                                <Badge className="mr-1">C</Badge>
                                            )}
                                            {driver?.licenseCategories?.includes('E') && (
                                                <Badge>E</Badge>
                                            )}
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