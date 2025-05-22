import { useState, useEffect } from 'react'
import { useAnalyzeRestTimeMutation } from '@/shared/api/driversSlice'
import { useToast } from '@/hooks/use-toast'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    Calendar,
    Loader2,
    RefreshCw,
    TrendingUp,
    Shield,
    Coffee,
    Bed
} from 'lucide-react'

import { formatDistance, formatDuration } from '@/shared/utils/format'
import type { RouteResponse } from '@/shared/types/api'
import type { RestTimeAnalysisResult, WORKING_TIME_LIMITS } from '../types'

interface RestTimeAnalysisProps {
    driverId: number
    route?: RouteResponse
    departureTime?: string
    className?: string
}

export function RestTimeAnalysis({
                                     driverId,
                                     route,
                                     departureTime,
                                     className
                                 }: RestTimeAnalysisProps) {
    const { toast } = useToast()
    const [analysisResult, setAnalysisResult] = useState<RestTimeAnalysisResult | null>(null)
    const [selectedRestStop, setSelectedRestStop] = useState<number>(0)

    const [analyzeRestTime, { isLoading: isAnalyzing }] = useAnalyzeRestTimeMutation()

    const runAnalysis = async () => {
        if (!route || !departureTime) {
            toast({
                title: 'Недостаточно данных',
                description: 'Для анализа РТО необходимы маршрут и время отправления',
                variant: 'destructive'
            })
            return
        }

        try {
            const result = await analyzeRestTime({
                driverId,
                route,
                departureTime
            }).unwrap()

            // Extend result with additional analysis
            const extendedResult: RestTimeAnalysisResult = {
                ...result,
                riskLevel: calculateRiskLevel(result),
                nextMandatoryRestAt: calculateNextMandatoryRest(result, departureTime),
                recommendedRestStops: result.restStopRecommendations || [],
                violations: analyzeViolations(result)
            }

            setAnalysisResult(extendedResult)
        } catch (error) {
            toast({
                title: 'Ошибка анализа',
                description: 'Не удалось выполнить анализ РТО. Попробуйте еще раз.',
                variant: 'destructive'
            })
            console.error('Rest time analysis error:', error)
        }
    }

    // Auto-run analysis when dependencies change
    useEffect(() => {
        if (route && departureTime && driverId) {
            runAnalysis()
        }
    }, [route, departureTime, driverId])

    const calculateRiskLevel = (analysis: any): RestTimeAnalysisResult['riskLevel'] => {
        if (!analysis.compliant) return 'CRITICAL'
        if (analysis.warnings.length > 2) return 'HIGH'
        if (analysis.warnings.length > 0) return 'MEDIUM'
        return 'LOW'
    }

    const calculateNextMandatoryRest = (analysis: any, departure: string): string => {
        const departureDate = new Date(departure)
        // Simplified calculation - in real implementation, calculate based on driving time
        const nextRestTime = new Date(departureDate.getTime() + (4.5 * 60 * 60 * 1000))
        return nextRestTime.toISOString()
    }

    const analyzeViolations = (analysis: any): RestTimeAnalysisResult['violations'] => {
        const violations: RestTimeAnalysisResult['violations'] = []

        if (analysis.totalDrivingTime > 32400) { // 9 hours
            violations.push({
                type: 'DRIVING_TIME',
                severity: 'VIOLATION',
                description: 'Превышен лимит времени вождения в день (9 часов)',
                timeToViolation: 0
            })
        } else if (analysis.totalDrivingTime > 28800) { // 8 hours
            violations.push({
                type: 'DRIVING_TIME',
                severity: 'WARNING',
                description: 'Приближение к лимиту времени вождения в день',
                timeToViolation: 32400 - analysis.totalDrivingTime
            })
        }

        if (analysis.totalRestTime < 39600) { // 11 hours
            violations.push({
                type: 'DAILY_REST',
                severity: 'VIOLATION',
                description: 'Недостаточное время ежедневного отдыха (минимум 11 часов)'
            })
        }

        return violations
    }

    const getRiskLevelConfig = (level: RestTimeAnalysisResult['riskLevel']) => {
        switch (level) {
            case 'LOW':
                return { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', label: 'Низкий' }
            case 'MEDIUM':
                return { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Средний' }
            case 'HIGH':
                return { color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', label: 'Высокий' }
            case 'CRITICAL':
                return { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', label: 'Критический' }
        }
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit'
        })
    }

    if (!route || !departureTime) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Анализ РТО недоступен</h3>
                    <p className="text-muted-foreground">
                        Для выполнения анализа требуется выбрать маршрут и время отправления
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Анализ соответствия РТО
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Обновить
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isAnalyzing ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">Выполняется анализ РТО...</p>
                        </div>
                    </div>
                ) : analysisResult ? (
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Обзор</TabsTrigger>
                            <TabsTrigger value="schedule">График</TabsTrigger>
                            <TabsTrigger value="stops">Остановки</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                            {/* Compliance Status */}
                            <div className={`p-4 rounded-lg ${analysisResult.compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                                <div className="flex items-center gap-3">
                                    {analysisResult.compliant ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    )}
                                    <div>
                                        <h3 className={`font-semibold ${analysisResult.compliant ? 'text-green-800' : 'text-red-800'}`}>
                                            {analysisResult.compliant ? 'Соответствует требованиям РТО' : 'Нарушение требований РТО'}
                                        </h3>
                                        <p className={`text-sm ${analysisResult.compliant ? 'text-green-600' : 'text-red-600'}`}>
                                            {analysisResult.compliant
                                                ? 'Маршрут соответствует нормативам по времени работы и отдыха'
                                                : 'Обнаружены нарушения нормативов. Требуется корректировка маршрута.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Level */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
                                        <span className="text-sm text-muted-foreground">Уровень риска</span>
                                    </div>
                                    <Badge
                                        variant={analysisResult.riskLevel === 'LOW' ? 'default' : 'destructive'}
                                        className="text-sm"
                                    >
                                        {getRiskLevelConfig(analysisResult.riskLevel).label}
                                    </Badge>
                                </div>

                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                                        <span className="text-sm text-muted-foreground">Следующий отдых</span>
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatTime(analysisResult.nextMandatoryRestAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Working Time Summary */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Время работы и отдыха</h4>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Общее время вождения</span>
                                        <span className="font-medium">
                                            {formatDuration(analysisResult.totalDrivingTime)} / 9ч
                                        </span>
                                    </div>
                                    <Progress
                                        value={(analysisResult.totalDrivingTime / 32400) * 100}
                                        className="h-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Общее время отдыха</span>
                                        <span className="font-medium">
                                            {formatDuration(analysisResult.totalRestTime)} / 11ч
                                        </span>
                                    </div>
                                    <Progress
                                        value={(analysisResult.totalRestTime / 39600) * 100}
                                        className="h-2"
                                    />
                                </div>
                            </div>

                            {/* Violations */}
                            {analysisResult.violations.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Предупреждения и нарушения</h4>
                                    {analysisResult.violations.map((violation, index) => (
                                        <Alert
                                            key={index}
                                            variant={violation.severity === 'VIOLATION' ? 'destructive' : 'default'}
                                            className="py-2"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                {violation.description}
                                                {violation.timeToViolation && (
                                                    <span className="block mt-1 text-xs text-muted-foreground">
                                                        Время до нарушения: {formatDuration(violation.timeToViolation)}
                                                    </span>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="schedule" className="space-y-4 mt-4">
                            <div className="space-y-3">
                                <h4 className="font-medium">Рекомендуемый график работы</h4>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                            <span className="font-medium">Начало движения</span>
                                        </div>
                                        <span className="text-sm">
                                            {formatTime(departureTime)} • {formatDate(departureTime)}
                                        </span>
                                    </div>

                                    {analysisResult.recommendedRestStops.map((stop, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Coffee className="h-4 w-4 text-yellow-600" />
                                                <span className="font-medium">
                                                    {stop.reason === 'MANDATORY_BREAK' ? 'Обязательный перерыв' : 'Рекомендуемый отдых'}
                                                </span>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div>{formatTime(stop.recommendedArrivalTime)}</div>
                                                <div className="text-muted-foreground">
                                                    {formatDuration(stop.restDuration)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                            <span className="font-medium">Прибытие</span>
                                        </div>
                                        <span className="text-sm">
                                            Расчетное время прибытия
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="stops" className="space-y-4 mt-4">
                            {analysisResult.recommendedRestStops.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="font-medium">Рекомендуемые места отдыха</h4>

                                    {analysisResult.recommendedRestStops.map((stop, index) => (
                                        <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                Остановка {index + 1}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {stop.reason === 'MANDATORY_BREAK' ? 'Обязательная' : 'Рекомендуемая'}
                                                            </Badge>
                                                        </div>

                                                        <div className="text-sm text-muted-foreground">
                                                            Координаты: {stop.location.lat.toFixed(6)}, {stop.location.lng.toFixed(6)}
                                                        </div>

                                                        {stop.facilityTypes && stop.facilityTypes.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {stop.facilityTypes.map((facility, fi) => (
                                                                    <Badge key={fi} variant="secondary" className="text-xs">
                                                                        {facility}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {formatTime(stop.recommendedArrivalTime)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Отдых: {formatDuration(stop.restDuration)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Остановки не требуются</h3>
                                    <p className="text-muted-foreground">
                                        Для данного маршрута дополнительные остановки для отдыха не нужны
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Анализ не выполнен</h3>
                        <p className="text-muted-foreground mb-4">
                            Нажмите кнопку "Обновить" для выполнения анализа РТО
                        </p>
                        <Button onClick={runAnalysis}>
                            Выполнить анализ
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}