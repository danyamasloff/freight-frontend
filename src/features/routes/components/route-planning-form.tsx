import React, {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {
    Navigation,
    MapPin,
    Route as RouteIcon,
    Clock,
    Fuel,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Car,
    Truck
} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Badge} from '@/components/ui/badge'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Separator} from '@/components/ui/separator'

import {useGeolocation} from '@/hooks/use-geolocation'
import {useToast} from '@/hooks/use-toast'
import {usePlanRouteQuery, usePlanRouteByNamesQuery} from '@/shared/api/routesSlice'
import {formatDistance, formatDuration, formatCurrency} from '@/shared/utils/format'
import type {RouteResponseExtended} from '@/shared/types/api'

const routePlanningSchema = z.object({
    planningType: z.enum(['coordinates', 'places']),

    // Для координат
    fromLat: z.coerce.number().optional(),
    fromLon: z.coerce.number().optional(),
    toLat: z.coerce.number().optional(),
    toLon: z.coerce.number().optional(),

    // Для мест
    fromPlace: z.string().optional(),
    toPlace: z.string().optional(),

    vehicleType: z.enum(['car', 'truck']).default('car'),
})

type RoutePlanningFormData = z.infer<typeof routePlanningSchema>

interface RoutePlanningProps {
    onRouteCalculated?: (route: RouteResponseExtended) => void
    className?: string
}

export function RoutePlanningForm({onRouteCalculated, className}: RoutePlanningProps) {
    const [planningType, setPlanningType] = useState<'coordinates' | 'places'>('places')
    const [calculatedRoute, setCalculatedRoute] = useState<RouteResponseExtended | null>(null)
    const [skipQuery, setSkipQuery] = useState(true)

    const {position, getCurrentPosition} = useGeolocation()
    const {toast} = useToast()

    const form = useForm<RoutePlanningFormData>({
        resolver: zodResolver(routePlanningSchema),
        defaultValues: {
            planningType: 'places',
            vehicleType: 'car',
        },
    })

    const watchedValues = form.watch()

    // Параметры для запросов
    const coordinateParams = {
        fromLat: watchedValues.fromLat || 0,
        fromLon: watchedValues.fromLon || 0,
        toLat: watchedValues.toLat || 0,
        toLon: watchedValues.toLon || 0,
        vehicleType: watchedValues.vehicleType as 'car' | 'truck',
    }

    const placeParams = {
        fromPlace: watchedValues.fromPlace || '',
        toPlace: watchedValues.toPlace || '',
        vehicleType: watchedValues.vehicleType as 'car' | 'truck',
    }

    // Queries с условным пропуском
    const {
        data: routeByCoordinates,
        isLoading: isLoadingCoordinates,
        error: errorCoordinates,
    } = usePlanRouteQuery(coordinateParams, {
        skip: skipQuery || planningType !== 'coordinates' ||
            !watchedValues.fromLat || !watchedValues.fromLon ||
            !watchedValues.toLat || !watchedValues.toLon
    })

    const {
        data: routeByPlaces,
        isLoading: isLoadingPlaces,
        error: errorPlaces,
    } = usePlanRouteByNamesQuery(placeParams, {
        skip: skipQuery || planningType !== 'places' ||
            !watchedValues.fromPlace || !watchedValues.toPlace
    })

    const isLoading = isLoadingCoordinates || isLoadingPlaces
    const error = errorCoordinates || errorPlaces
    const routeData = routeByCoordinates || routeByPlaces

    // Обновляем calculatedRoute когда получаем данные
    useEffect(() => {
        if (routeData && routeData !== calculatedRoute) {
            setCalculatedRoute(routeData)
            onRouteCalculated?.(routeData)
            setSkipQuery(true) // Останавливаем запросы после получения результата

            toast({
                title: "Маршрут рассчитан",
                description: `${formatDistance(routeData.distance * 1000)} • ${formatDuration(routeData.duration * 60)}`
            })
        }
    }, [routeData, calculatedRoute, onRouteCalculated, toast])

    const handleUseCurrentLocation = () => {
        getCurrentPosition().then((pos) => {
            form.setValue('fromLat', pos.latitude)
            form.setValue('fromLon', pos.longitude)
            toast({
                title: "Местоположение определено",
                description: `${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}`
            })
        }).catch((error) => {
            toast({
                title: "Ошибка геолокации",
                description: error.message,
                variant: "destructive"
            })
        })
    }

    const handleCalculateRoute = () => {
        const values = form.getValues()

        if (planningType === 'coordinates') {
            if (!values.fromLat || !values.fromLon || !values.toLat || !values.toLon) {
                toast({
                    title: "Ошибка",
                    description: "Заполните все координаты",
                    variant: "destructive"
                })
                return
            }
        } else {
            if (!values.fromPlace?.trim() || !values.toPlace?.trim()) {
                toast({
                    title: "Ошибка",
                    description: "Укажите начальное и конечное место",
                    variant: "destructive"
                })
                return
            }
        }

        setCalculatedRoute(null) // Сбрасываем предыдущий результат
        setSkipQuery(false) // Запускаем запрос
    }

    const getRiskBadge = (riskScore?: number) => {
        if (!riskScore) return null

        let variant: 'default' | 'destructive' | 'secondary' = 'default'
        let label = 'Низкий'
        let color = 'text-green-600'

        if (riskScore > 0.7) {
            variant = 'destructive'
            label = 'Высокий'
            color = 'text-red-600'
        } else if (riskScore > 0.4) {
            variant = 'secondary'
            label = 'Средний'
            color = 'text-yellow-600'
        }

        return (
            <Badge variant={variant} className={color}>
                {label} риск ({Math.round(riskScore * 100)}%)
            </Badge>
        )
    }

    const getErrorMessage = (error: any) => {
        if (error?.data?.message) {
            return error.data.message
        }
        if (error?.message) {
            return error.message
        }
        if (typeof error === 'string') {
            return error
        }
        return 'Ошибка при расчете маршрута. Проверьте правильность данных.'
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5"/>
                        Планирование маршрута
                    </CardTitle>
                    <CardDescription>
                        Рассчитайте маршрут с анализом рисков и экономических показателей
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form className="space-y-4">
                            {/* Выбор типа планирования */}
                            <FormField
                                control={form.control}
                                name="planningType"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Способ планирования</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                setPlanningType(value as 'coordinates' | 'places')
                                                setSkipQuery(true)
                                                setCalculatedRoute(null)
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="places">По названию мест</SelectItem>
                                                <SelectItem value="coordinates">По координатам</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {/* Тип транспорта */}
                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Тип транспорта</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="car">
                                                    <div className="flex items-center gap-2">
                                                        <Car className="h-4 w-4"/>
                                                        Легковой автомобиль
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="truck">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4"/>
                                                        Грузовой автомобиль
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <Separator/>

                            {/* Планирование по местам */}
                            {planningType === 'places' && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fromPlace"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Откуда</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin
                                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                                        <Input
                                                            placeholder="Москва"
                                                            className="pl-9"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="toPlace"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Куда</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin
                                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                                        <Input
                                                            placeholder="Санкт-Петербург"
                                                            className="pl-9"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Планирование по координатам */}
                            {planningType === 'coordinates' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleUseCurrentLocation}
                                        >
                                            <Navigation className="h-4 w-4 mr-2"/>
                                            Использовать текущее местоположение
                                        </Button>
                                        {position && (
                                            <Badge variant="outline">
                                                {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fromLat"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Широта (откуда)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="55.7558"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="fromLon"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Долгота (откуда)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="37.6176"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="toLat"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Широта (куда)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="59.9311"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="toLon"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Долгота (куда)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="30.3609"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={handleCalculateRoute}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                ) : (
                                    <RouteIcon className="h-4 w-4 mr-2"/>
                                )}
                                {isLoading ? 'Расчет маршрута...' : 'Рассчитать маршрут'}
                            </Button>
                        </form>
                    </Form>

                    {/* Ошибки */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription>
                                {getErrorMessage(error)}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Результат расчета */}
                    {calculatedRoute && (
                        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <CheckCircle2 className="h-5 w-5"/>
                                    Маршрут рассчитан
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Основные параметры */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <RouteIcon className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-sm text-muted-foreground">Расстояние</span>
                                        </div>
                                        <div className="text-lg font-bold">
                                            {formatDistance(calculatedRoute.distance * 1000)}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-sm text-muted-foreground">Время в пути</span>
                                        </div>
                                        <div className="text-lg font-bold">
                                            {formatDuration(calculatedRoute.duration * 60)}
                                        </div>
                                    </div>
                                </div>

                                {/* Экономические показатели */}
                                {(calculatedRoute.estimatedFuelCost || calculatedRoute.totalEstimatedCost) && (
                                    <>
                                        <Separator/>
                                        <div className="space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <DollarSign className="h-4 w-4"/>
                                                Экономические показатели
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {calculatedRoute.estimatedFuelCost && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Fuel className="h-4 w-4 text-orange-600"/>
                                                            <span
                                                                className="text-sm text-muted-foreground">Топливо</span>
                                                        </div>
                                                        <div className="font-medium">
                                                            {formatCurrency(calculatedRoute.estimatedFuelCost)}
                                                        </div>
                                                    </div>
                                                )}

                                                {calculatedRoute.totalEstimatedCost && (
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground">Общая стоимость
                                                        </div>
                                                        <div className="text-lg font-bold text-blue-600">
                                                            {formatCurrency(calculatedRoute.totalEstimatedCost)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Анализ рисков */}
                                {calculatedRoute.riskScore && (
                                    <>
                                        <Separator/>
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Анализ рисков</h4>
                                            <div className="flex items-center gap-4">
                                                {getRiskBadge(calculatedRoute.riskScore)}
                                                {calculatedRoute.weatherRisk && (
                                                    <Badge variant="outline">
                                                        Погодный риск: {Math.round(calculatedRoute.weatherRisk * 100)}%
                                                    </Badge>
                                                )}
                                            </div>
                                            {calculatedRoute.riskFactors && calculatedRoute.riskFactors.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Факторы риска:</div>
                                                    <ul className="list-disc list-inside text-sm space-y-1">
                                                        {calculatedRoute.riskFactors.map((factor, index) => (
                                                            <li key={index}>{factor}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* РТО предупреждения */}
                                {calculatedRoute.rtoWarnings && calculatedRoute.rtoWarnings.length > 0 && (
                                    <>
                                        <Separator/>
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4"/>
                                            <AlertDescription>
                                                <div className="space-y-1">
                                                    <div className="font-medium">Предупреждения РТО:</div>
                                                    <ul className="list-disc list-inside text-sm">
                                                        {calculatedRoute.rtoWarnings.map((warning, index) => (
                                                            <li key={index}>{warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}