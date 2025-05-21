import {useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {
    ArrowLeft,
    TrendingUp,
    Loader2,
    Truck,
    Fuel,
    Clock,
    AlertCircle,
    Medal,
    Star
} from 'lucide-react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {DatePicker} from '@/components/ui/date-picker';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import {useGetDriverQuery, useAnalyzeDriverPerformanceQuery} from '@/shared/api/driversApiSlice';

export function DriverPerformance() {
    const {id} = useParams<{ id: string }>();
    const driverId = parseInt(id || '0');

    const [startDate, setStartDate] = useState<Date | undefined>(
        new Date(new Date().setMonth(new Date().getMonth() - 3))
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());

    const {data: driver} = useGetDriverQuery(driverId, {
        skip: isNaN(driverId) || driverId <= 0
    });

    const formatDateForQuery = (date?: Date) => {
        return date ? format(date, 'yyyy-MM-dd') : undefined;
    };

    const {data: performance, isLoading, error} = useAnalyzeDriverPerformanceQuery({
        driverId,
        startDate: formatDateForQuery(startDate),
        endDate: formatDateForQuery(endDate),
    }, {
        skip: isNaN(driverId) || driverId <= 0
    });

    // Форматируем данные для графика из истории эффективности
    const chartData = performance?.performanceHistory?.map(point => ({
        date: new Date(point.date).toLocaleDateString('ru-RU'),
        fuelEfficiency: point.fuelEfficiency,
        timeEfficiency: point.timeEfficiency,
        rating: point.rating
    })) || [];

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button variant="outline" asChild>
                    <Link to={`/drivers/${driverId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Назад к водителю
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">Анализ эффективности водителя</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Панель выбора параметров */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Параметры анализа</CardTitle>
                        <CardDescription>Выберите период для анализа</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Водитель</label>
                            <div className="p-2 border rounded-md">
                                {driver ? (
                                    <div className="font-medium">
                                        {driver.lastName} {driver.firstName} {driver.middleName}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">Водитель не выбран</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Начало периода</label>
                            <DatePicker date={startDate} setDate={setStartDate}/>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Конец периода</label>
                            <DatePicker date={endDate} setDate={setEndDate}/>
                        </div>

                        <Button disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Применить
                        </Button>
                    </CardContent>
                </Card>

                {/* Результаты анализа */}
                <div className="md:col-span-2">
                    {error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>
                                Не удалось загрузить данные о производительности. Пожалуйста, попробуйте позже.
                            </AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <span className="ml-2 text-muted-foreground">Загрузка данных...</span>
                        </div>
                    ) : performance ? (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Основные показатели</CardTitle>
                                    <CardDescription>
                                        Период: {startDate && format(startDate, 'dd.MM.yyyy')} - {endDate && format(endDate, 'dd.MM.yyyy')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-muted/10 rounded-lg text-center space-y-1">
                                            <Truck className="mx-auto h-5 w-5 text-primary"/>
                                            <div className="text-sm text-muted-foreground">Завершено рейсов</div>
                                            <div
                                                className="text-2xl font-bold">{performance.completedRoutesCount || 0}</div>
                                        </div>

                                        <div className="p-3 bg-muted/10 rounded-lg text-center space-y-1">
                                            <TrendingUp className="mx-auto h-5 w-5 text-primary"/>
                                            <div className="text-sm text-muted-foreground">Пройденное расстояние</div>
                                            <div
                                                className="text-2xl font-bold">{performance.totalDistanceDrivenKm?.toFixed(0) || 0} км
                                            </div>
                                        </div>

                                        <div className="p-3 bg-muted/10 rounded-lg text-center space-y-1">
                                            <Fuel className="mx-auto h-5 w-5 text-primary"/>
                                            <div className="text-sm text-muted-foreground">Эффективность топлива</div>
                                            <div
                                                className="text-2xl font-bold">{performance.avgFuelEfficiencyPercent?.toFixed(0) || 0}%
                                            </div>
                                        </div>

                                        <div className="p-3 bg-muted/10 rounded-lg text-center space-y-1">
                                            <Clock className="mx-auto h-5 w-5 text-primary"/>
                                            <div className="text-sm text-muted-foreground">Эффективность времени</div>
                                            <div
                                                className="text-2xl font-bold">{performance.avgDeliveryTimeEfficiencyPercent?.toFixed(0) || 0}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center mb-3">
                                                <Star className="h-5 w-5 text-yellow-500 mr-2"/>
                                                <div className="text-lg font-medium">Рейтинг</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className="text-3xl font-bold">{performance.rating?.toFixed(1) || 0}</div>
                                                <div className="text-sm text-muted-foreground ml-2">из 5.0</div>
                                            </div>
                                        </div>

                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center mb-3">
                                                <Medal className="h-5 w-5 text-yellow-500 mr-2"/>
                                                <div className="text-lg font-medium">Рейтинг эффективности</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="text-3xl font-bold">{performance.rankingByEfficiency || '-'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Топ {performance.percentileByEfficiency?.toFixed(0) || 0}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {chartData.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Динамика показателей</CardTitle>
                                        <CardDescription>
                                            Изменение показателей эффективности за выбранный период
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3"/>
                                                    <XAxis dataKey="date"/>
                                                    <YAxis/>
                                                    <Tooltip/>
                                                    <Legend/>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="fuelEfficiency"
                                                        name="Эфф. топлива"
                                                        stroke="#3b82f6"
                                                        activeDot={{r: 8}}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="timeEfficiency"
                                                        name="Эфф. времени"
                                                        stroke="#10b981"
                                                        activeDot={{r: 8}}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="rating"
                                                        name="Рейтинг"
                                                        stroke="#f59e0b"
                                                        activeDot={{r: 8}}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Расширенная статистика</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Средняя скорость</div>
                                            <div
                                                className="font-medium">{performance.avgSpeedKmh?.toFixed(1) || '—'} км/ч
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Потрачено топлива</div>
                                            <div
                                                className="font-medium">{performance.totalFuelConsumptionLiters?.toFixed(1) || '—'} л
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Средний расход</div>
                                            <div
                                                className="font-medium">{performance.avgFuelConsumptionPer100km?.toFixed(1) || '—'} л/100км
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Время вождения</div>
                                            <div className="font-medium">
                                                {performance.totalDrivingMinutes
                                                    ? `${Math.floor(performance.totalDrivingMinutes / 60)}ч ${performance.totalDrivingMinutes % 60}м`
                                                    : '—'}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Время отдыха</div>
                                            <div className="font-medium">
                                                {performance.totalRestMinutes
                                                    ? `${Math.floor(performance.totalRestMinutes / 60)}ч ${performance.totalRestMinutes % 60}м`
                                                    : '—'}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Инциденты</div>
                                            <div className="font-medium">{performance.incidentsCount || 0}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-12 bg-muted/10 rounded-lg border">
                            <div className="text-center">
                                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
                                <h3 className="text-lg font-medium mb-2">Нет данных для анализа</h3>
                                <p className="text-muted-foreground mb-4">
                                    Выберите период для анализа эффективности работы водителя
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DriverPerformance;