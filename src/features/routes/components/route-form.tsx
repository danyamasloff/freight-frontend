import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateRouteMutation, useUpdateRouteMutation } from '@/shared/api/routesSlice'
import { useGetDriversQuery } from '@/shared/api/driversSlice'
import { useGetVehiclesQuery } from '@/shared/api/vehiclesApiSlice'
import { useGetCargosQuery } from '@/shared/api/cargoSlice'
import { useToast } from '@/hooks/use-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    MapPin,
    Navigation,
    Truck,
    User,
    Package,
    Settings,
    Loader2,
    Plus,
    X,
    Search,
    Calendar,
    Info,
    Map
} from 'lucide-react'

import { routeFormSchema, type RouteFormValues, type RouteDetail } from '../types'
import { RouteMapPicker } from './route-map-picker.tsx'

interface RouteFormProps {
    initialData?: Partial<RouteDetail>
    id?: number
}

export function RouteForm({ initialData, id }: RouteFormProps) {
    const [activeTab, setActiveTab] = useState("route")
    const { toast } = useToast()
    const navigate = useNavigate()

    const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation()
    const [updateRoute, { isLoading: isUpdating }] = useUpdateRouteMutation()

    const { data: drivers, isLoading: driversLoading } = useGetDriversQuery()
    const { data: vehicles, isLoading: vehiclesLoading } = useGetVehiclesQuery()
    const { data: cargos, isLoading: cargosLoading } = useGetCargosQuery()

    const isLoading = isCreating || isUpdating
    const isEditMode = !!id

    const form = useForm<RouteFormValues>({
        resolver: zodResolver(routeFormSchema),
        defaultValues: {
            name: '',
            startAddress: '',
            endAddress: '',
            startLat: 0,
            startLon: 0,
            endLat: 0,
            endLon: 0,
            vehicleId: undefined,
            driverId: undefined,
            cargoId: undefined,
            departureTime: undefined,
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false,
            waypoints: [],
            ...initialData,
        },
    })

    async function onSubmit(values: RouteFormValues) {
        try {
            const routeData = {
                name: values.name,
                startLat: values.startLat,
                startLon: values.startLon,
                endLat: values.endLat,
                endLon: values.endLon,
                startAddress: values.startAddress,
                endAddress: values.endAddress,
                vehicleId: values.vehicleId || 0,
                driverId: values.driverId,
                cargoId: values.cargoId,
                departureTime: values.departureTime,
                waypoints: values.waypoints,
            }

            if (isEditMode && id) {
                await updateRoute({ id, data: routeData }).unwrap()
                toast({
                    title: "Маршрут обновлен",
                    description: `Маршрут "${values.name}" успешно обновлен`
                })
                navigate(`/routes/${id}`)
            } else {
                const result = await createRoute(routeData).unwrap()
                toast({
                    title: "Маршрут создан",
                    description: `Маршрут "${values.name}" успешно создан`
                })
                navigate(`/routes/${result.id}`)
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить маршрут. Пожалуйста, попробуйте снова.",
                variant: "destructive"
            })
            console.error("Route save error:", error)
        }
    }

    const addWaypoint = () => {
        const currentWaypoints = form.getValues('waypoints') || []
        form.setValue('waypoints', [
            ...currentWaypoints,
            { lat: 0, lng: 0, address: '' }
        ])
    }

    const removeWaypoint = (index: number) => {
        const currentWaypoints = form.getValues('waypoints') || []
        form.setValue('waypoints', currentWaypoints.filter((_, i) => i !== index))
    }

    // Проверка наличия координат для карты
    const hasCoordinates = () => {
        const startLat = form.watch('startLat')
        const startLon = form.watch('startLon')
        const endLat = form.watch('endLat')
        const endLon = form.watch('endLon')

        return (startLat !== 0 || startLon !== 0) && (endLat !== 0 || endLon !== 0)
    }

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    {isEditMode ? 'Редактирование маршрута' : 'Создание нового маршрута'}
                </CardTitle>
                <CardDescription>
                    Заполните информацию о маршруте и назначьте необходимые ресурсы
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="route">Маршрут</TabsTrigger>
                                <TabsTrigger value="map">
                                    <Map className="h-4 w-4 mr-1" />
                                    Карта
                                </TabsTrigger>
                                <TabsTrigger value="resources">Ресурсы</TabsTrigger>
                                <TabsTrigger value="options">Параметры</TabsTrigger>
                                <TabsTrigger value="schedule">Расписание</TabsTrigger>
                            </TabsList>

                            {/* Route Configuration */}
                            <TabsContent value="route" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Название маршрута</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Например: Москва - Санкт-Петербург экспресс" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Дайте маршруту понятное название для быстрой идентификации
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Адрес отправления</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Введите адрес отправления"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Адрес назначения</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Введите адрес назначения"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Координаты будут определены автоматически при построении маршрута на карте.
                                        Вы также можете указать их вручную ниже.
                                    </AlertDescription>
                                </Alert>

                                <details className="space-y-4">
                                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                        Показать координаты (необязательно)
                                    </summary>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="startLat"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Широта (старт)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                placeholder="55.7558"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="startLon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Долгота (старт)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                placeholder="37.6176"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="endLat"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Широта (финиш)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                placeholder="59.9311"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="endLon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Долгота (финиш)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                placeholder="30.3609"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </details>

                                <Separator />

                                {/* Waypoints */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Промежуточные точки</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addWaypoint}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Добавить точку
                                        </Button>
                                    </div>

                                    {form.watch('waypoints')?.map((_, index) => (
                                        <div key={index} className="flex items-end gap-2 p-3 border rounded-lg">
                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`waypoints.${index}.address`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Адрес</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Адрес точки"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`waypoints.${index}.lat`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Широта</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="any"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`waypoints.${index}.lng`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Долгота</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="any"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeWaypoint(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Map Tab */}
                            <TabsContent value="map" className="space-y-4 pt-4">
                                <RouteMapPicker
                                    startAddress={form.watch('startAddress')}
                                    endAddress={form.watch('endAddress')}
                                    startCoords={
                                        form.watch('startLat') && form.watch('startLon')
                                            ? [form.watch('startLat'), form.watch('startLon')]
                                            : undefined
                                    }
                                    endCoords={
                                        form.watch('endLat') && form.watch('endLon')
                                            ? [form.watch('endLat'), form.watch('endLon')]
                                            : undefined
                                    }
                                    waypoints={form.watch('waypoints') || []}
                                    vehicleType={
                                        vehicles?.find(v => v.id === form.watch('vehicleId'))?.brand?.toLowerCase().includes('car')
                                            ? 'car'
                                            : 'truck'
                                    }
                                    vehicleId={form.watch('vehicleId')}
                                    driverId={form.watch('driverId')}
                                    cargoId={form.watch('cargoId')}
                                    onStartChange={(coords, address) => {
                                        form.setValue('startLat', coords[0])
                                        form.setValue('startLon', coords[1])
                                        if (address) form.setValue('startAddress', address)
                                    }}
                                    onEndChange={(coords, address) => {
                                        form.setValue('endLat', coords[0])
                                        form.setValue('endLon', coords[1])
                                        if (address) form.setValue('endAddress', address)
                                    }}
                                    onWaypointsChange={(waypoints) => {
                                        form.setValue('waypoints', waypoints)
                                    }}
                                    onRouteBuilt={(route) => {
                                        // Можно сохранить дополнительную информацию о маршруте
                                        console.log('Route built:', route)
                                    }}
                                />
                            </TabsContent>

                            {/* Resources Assignment */}
                            <TabsContent value="resources" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Транспортное средство *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите транспортное средство" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {vehiclesLoading ? (
                                                        <SelectItem value="loading" disabled>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Загрузка...
                                                        </SelectItem>
                                                    ) : vehicles?.length === 0 ? (
                                                        <SelectItem value="empty" disabled>
                                                            Нет доступных ТС
                                                        </SelectItem>
                                                    ) : (
                                                        vehicles?.map((vehicle) => (
                                                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <Truck className="h-4 w-4" />
                                                                    <span>{vehicle.licensePlate} - {vehicle.brand} {vehicle.model}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Выберите транспортное средство для выполнения маршрута
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="driverId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Водитель</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите водителя (необязательно)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Не назначен</SelectItem>
                                                    {driversLoading ? (
                                                        <SelectItem value="loading" disabled>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Загрузка...
                                                        </SelectItem>
                                                    ) : (
                                                        drivers?.map((driver) => (
                                                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4" />
                                                                    <span>{driver.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Назначьте водителя для маршрута
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cargoId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Груз</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите груз (необязательно)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Не назначен</SelectItem>
                                                    {cargosLoading ? (
                                                        <SelectItem value="loading" disabled>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Загрузка...
                                                        </SelectItem>
                                                    ) : (
                                                        cargos?.map((cargo) => (
                                                            <SelectItem key={cargo.id} value={cargo.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-4 w-4" />
                                                                    <span>{cargo.name} ({cargo.weightKg} кг)</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Выберите груз для перевозки
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Route Options */}
                            <TabsContent value="options" className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="avoidTolls"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Избегать платных дорог</FormLabel>
                                                    <FormDescription>
                                                        Планировать маршрут без использования платных дорог
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="avoidHighways"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Избегать автомагистралей</FormLabel>
                                                    <FormDescription>
                                                        Использовать альтернативные маршруты без автомагистралей
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="avoidFerries"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Избегать паромов</FormLabel>
                                                    <FormDescription>
                                                        Планировать маршрут без использования паромных переправ
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* Schedule */}
                            <TabsContent value="schedule" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="departureTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Время отправления</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    setDate={(date) => field.onChange(date?.toISOString())}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Планируемое время начала выполнения маршрута
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={isLoading}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditMode ? 'Обновить маршрут' : 'Создать маршрут'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}