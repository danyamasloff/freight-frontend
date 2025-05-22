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
    Search
} from 'lucide-react'

import { routeFormSchema, type RouteFormValues, type RouteDetail } from '../types'

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

    const { data: drivers } = useGetDriversQuery()
    const { data: vehicles } = useGetVehiclesQuery()
    const { data: cargos } = useGetCargosQuery()

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

    const searchAddress = async (address: string, field: 'start' | 'end' | number) => {
        // Placeholder for geocoding functionality
        // In real implementation, you would use a geocoding service
        console.log('Searching address:', address, 'for field:', field)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
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
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="route">Маршрут</TabsTrigger>
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
                                                <Input placeholder="Введите название маршрута" {...field} />
                                            </FormControl>
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
                                                            onChange={(e) => {
                                                                field.onChange(e)
                                                                searchAddress(e.target.value, 'start')
                                                            }}
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
                                                            onChange={(e) => {
                                                                field.onChange(e)
                                                                searchAddress(e.target.value, 'end')
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                                            placeholder="55.7558"
                                                            {...field}
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
                                                            placeholder="37.6176"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

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

                            {/* Resources Assignment */}
                            <TabsContent value="resources" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Транспортное средство</FormLabel>
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
                                                    {vehicles?.map((vehicle) => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Truck className="h-4 w-4" />
                                                                <span>{vehicle.licensePlate} - {vehicle.brand} {vehicle.model}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                        <SelectValue placeholder="Выберите водителя" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {drivers?.map((driver) => (
                                                        <SelectItem key={driver.id} value={driver.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                <span>{driver.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                        <SelectValue placeholder="Выберите груз" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cargos?.map((cargo) => (
                                                        <SelectItem key={cargo.id} value={cargo.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                <span>{cargo.name} ({cargo.weightKg} кг)</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
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