import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Timer,
    Truck,
    Route,
    AlertTriangle,
    Coffee,
    Bed,
    Car,
    Check,
    X,
    Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { DateTimePicker } from '@/components/ui/date-time-picker.tsx';

import { useGetDriverQuery } from '@/shared/api/driversApiSlice.ts';
import { useGetRoutesQuery } from '@/shared/api/routesSlice.ts';
import { useAnalyzeDriverRestTimeMutation } from '@/shared/api/driversApiSlice.ts';
import { DriverRestAnalysisDto, RestStopRecommendationDto } from '@/shared/types/driver.ts';
import { formatDateTime } from '@/shared/utils/format.ts';

export function RtoAnalysis() {
    const { id } = useParams<{ id: string }>();
    const driverId = parseInt(id || '0');

    const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState<DriverRestAnalysisDto | null>(null);
    const [departureTime, setDepartureTime] = useState<Date>(new Date());

    const { data: driver } = useGetDriverQuery(driverId, {
        skip: isNaN(driverId) || driverId <= 0
    });

    const { data: routes } = useGetRoutesQuery();
    const [analyzeRest, { isLoading }] = useAnalyzeDriverRestTimeMutation();

    const handleAnalysis = async () => {
        if (!selectedRouteId) return;

        try {
            const result = await analyzeRest({
                driverId,
                routeId: selectedRouteId
            }).unwrap();

            setAnalysis(result);
        } catch (error) {
            console.error("Failed to analyze rest time:", error);
        }
    };

    const formatRestDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
    };

    // Функция для отображения иконки для типа отдыха
    const getRestIcon = (restType: string) => {
        if (restType.includes('Короткий')) return <Coffee className="h-5 w-5" />;
        if (restType.includes('Длительный')) return <Coffee className="h-5 w-5" />;
        if (restType.includes('Суточный')) return <Bed className="h-5 w-5" />;
        return <Timer className="h-5 w-5" />;
    };

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button variant="outline" asChild>
                    <Link to={`/drivers/${driverId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к водителю
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">Анализ режима труда и отдыха</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Панель выбора параметров */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Параметры анализа</CardTitle>
                        <CardDescription>Выберите маршрут для анализа РТО</CardDescription>
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
                            <label className="text-sm font-medium mb-1 block">Маршрут</label>
                            <Select
                                value={selectedRouteId?.toString() || ''}
                                onValueChange={(value) => setSelectedRouteId(parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите маршрут" />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes?.map(route => (
                                        <SelectItem key={route.id} value={route.id.toString()}>
                                            {route.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Время отправления</label>
                            <DateTimePicker
                                date={departureTime}
                                setDate={setDepartureTime}
                            />
                        </div>

                        <Button
                            onClick={handleAnalysis}
                            disabled={!selectedRouteId || isLoading}
                            className="w-full"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Выполнить анализ
                        </Button>
                    </CardContent>
                </Card>

                {/* Результаты анализа */}
                <div className="md:col-span-2 space-y-6">
                    {analysis ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Результаты анализа РТО</CardTitle>
                                        <Badge variant={analysis.compliantWithRegulations ? "success" : "destructive"}>
                                            {analysis.compliantWithRegulations
                                                ? "Соответствует нормативам"
                                                : "Не соответствует нормативам"}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Анализ режима труда и отдыха водителя для выбранного маршрута
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm text-muted-foreground">Отправление</label>
                                            <div className="font-medium flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {analysis.departureTime
                                                    ? formatDateTime(analysis.departureTime)
                                                    : "Не указано"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm text-muted-foreground">Прибытие</label>
                                            <div className="font-medium flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {analysis.estimatedArrivalTime
                                                    ? formatDateTime(analysis.estimatedArrivalTime)
                                                    : "Не указано"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm text-muted-foreground">Время в пути</label>
                                            <div className="font-medium flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {analysis.estimatedTripDurationMinutes
                                                    ? formatRestDuration(analysis.estimatedTripDurationMinutes)
                                                    : "Не указано"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm text-muted-foreground">Текущий статус</label>
                                            <div className="font-medium">
                                                {analysis.currentDrivingStatus || "Не указан"}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Оставшееся время вождения</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-3 bg-muted/20 rounded-lg">
                                                <div className="text-sm text-muted-foreground mb-1">Непрерывное вождение</div>
                                                <div className="text-xl font-bold">
                                                    {analysis.remainingContinuousDrivingMinutes !== undefined
                                                        ? formatRestDuration(analysis.remainingContinuousDrivingMinutes)
                                                        : "—"}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted/20 rounded-lg">
                                                <div className="text-sm text-muted-foreground mb-1">Суточное вождение</div>
                                                <div className="text-xl font-bold">
                                                    {analysis.remainingDailyDrivingMinutes !== undefined
                                                        ? formatRestDuration(analysis.remainingDailyDrivingMinutes)
                                                        : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {analysis.summary && (
                                        <div className="p-4 border rounded-lg bg-muted/10">
                                            <h3 className="text-lg font-medium mb-2">Сводка</h3>
                                            <div className="whitespace-pre-line text-muted-foreground">
                                                {analysis.summary}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Рекомендации по остановкам */}
                            {analysis.restStopRecommendations && analysis.restStopRecommendations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Рекомендуемые остановки</CardTitle>
                                        <CardDescription>
                                            Рекомендации по остановкам для отдыха во время поездки
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {analysis.restStopRecommendations.map((stop, index) => (
                                                <Card key={index} className="bg-muted/5">
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold mr-3">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="text-lg font-medium flex items-center">
                                                                        {getRestIcon(stop.restType)}
                                                                        <span className="ml-2">{stop.restType}</span>
                                                                        <Badge variant="outline" className="ml-2">
                                                                            {formatRestDuration(stop.recommendedRestDurationMinutes)}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {stop.reason}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 md:mt-0">
                                                                {stop.expectedArrivalAtStop && (
                                                                    <div className="text-sm">
                                                                        Прибытие: {formatDateTime(stop.expectedArrivalAtStop)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Расстояние от начала</div>
                                                                    <div className="font-medium">{stop.distanceFromStartKm.toFixed(1)} км</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Время от начала</div>
                                                                    <div className="font-medium">{stop.timeFromDeparture}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {stop.locationName && (
                                                            <div className="p-3 border rounded-lg mt-3">
                                                                <div className="font-medium mb-1">{stop.locationName}</div>
                                                                {stop.locationDescription && (
                                                                    <div className="text-sm text-muted-foreground mb-2">
                                                                        {stop.locationDescription}
                                                                    </div>
                                                                )}

                                                                {stop.facilities && Object.entries(stop.facilities).length > 0 && (
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                                                        {Object.entries(stop.facilities).map(([key, value]) => (
                                                                            <div key={key} className="flex items-center text-sm">
                                                                                {value ? (
                                                                                    <Check className="h-4 w-4 text-green-500 mr-1" />
                                                                                ) : (
                                                                                    <X className="h-4 w-4 text-muted-foreground mr-1" />
                                                                                )}
                                                                                <span>{key}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full p-12 bg-muted/10 rounded-lg border">
                            <div className="text-center">
                                <Timer className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <h3 className="text-lg font-medium mb-2">Нет данных для анализа</h3>
                                <p className="text-muted-foreground mb-4">
                                    Выберите маршрут и время отправления для анализа режима труда и отдыха
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RtoAnalysis;