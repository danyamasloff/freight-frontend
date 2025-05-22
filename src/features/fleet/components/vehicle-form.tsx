import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';

import { useCreateVehicleMutation, useUpdateVehicleMutation } from '@/shared/api/vehiclesApiSlice';
import { VehicleStatus, VehicleDetailDto } from '@/shared/types/vehicle';
import { useToast } from '@/hooks/use-toast';

// Схема валидации формы
const vehicleFormSchema = z.object({
    licensePlate: z.string().min(2, {
        message: "Номер ТС должен содержать минимум 2 символа",
    }),
    brand: z.string().min(1, {
        message: "Укажите марку ТС",
    }),
    model: z.string().min(1, {
        message: "Укажите модель ТС",
    }),
    year: z.coerce.number().min(1900, {
        message: "Год должен быть не меньше 1900",
    }).max(new Date().getFullYear() + 1, {
        message: "Год не может быть больше следующего года",
    }),
    vin: z.string().optional(),
    heightCm: z.coerce.number().min(0),
    widthCm: z.coerce.number().min(0),
    lengthCm: z.coerce.number().min(0),
    emptyWeightKg: z.coerce.number().min(0),
    grossWeightKg: z.coerce.number().min(0),
    fuelTankCapacityL: z.coerce.number().min(0),
    currentFuelL: z.coerce.number().min(0).optional(),
    fuelConsumptionPer100km: z.coerce.number().min(0),
    currentOdometerKm: z.coerce.number().min(0).optional(),
    status: z.nativeEnum(VehicleStatus),

    // Даты и сертификаты
    registrationExpiryDate: z.date().optional(),
    insuranceExpiryDate: z.date().optional(),
    lastMaintenanceDate: z.date().optional(),
    nextMaintenanceDate: z.date().optional(),

    // Специальные разрешения
    hasDangerousGoodsPermission: z.boolean().default(false),
    hasOversizedCargoPermission: z.boolean().default(false),
    hasRefrigerator: z.boolean().default(false),
    refrigeratorMinTempC: z.coerce.number().optional(),
    refrigeratorMaxTempC: z.coerce.number().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
    initialData?: Partial<VehicleDetailDto>;
    id?: number;
}

export function VehicleForm({ initialData, id }: VehicleFormProps) {
    const [activeTab, setActiveTab] = useState("basic");
    const { toast } = useToast();
    const navigate = useNavigate();

    const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
    const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

    const isLoading = isCreating || isUpdating;
    const isEditMode = !!id;

    // Преобразование дат из строк в объекты Date для формы
    const formattedInitialData = initialData ? {
        ...initialData,
        registrationExpiryDate: initialData.registrationExpiryDate ?
            new Date(initialData.registrationExpiryDate) : undefined,
        insuranceExpiryDate: initialData.insuranceExpiryDate ?
            new Date(initialData.insuranceExpiryDate) : undefined,
        lastMaintenanceDate: initialData.lastMaintenanceDate ?
            new Date(initialData.lastMaintenanceDate) : undefined,
        nextMaintenanceDate: initialData.nextMaintenanceDate ?
            new Date(initialData.nextMaintenanceDate) : undefined,
    } : {};

    // Инициализация формы
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            licensePlate: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            heightCm: 0,
            widthCm: 0,
            lengthCm: 0,
            emptyWeightKg: 0,
            grossWeightKg: 0,
            fuelTankCapacityL: 0,
            fuelConsumptionPer100km: 0,
            status: VehicleStatus.AVAILABLE,
            hasDangerousGoodsPermission: false,
            hasOversizedCargoPermission: false,
            hasRefrigerator: false,
            ...formattedInitialData,
        },
    });

    const hasRefrigerator = form.watch('hasRefrigerator');

    async function onSubmit(values: VehicleFormValues) {
        try {
            // Подготовка данных для API (преобразование дат в ISO строки)
            const vehicleData = {
                ...values,
                registrationExpiryDate: values.registrationExpiryDate?.toISOString().split('T')[0],
                insuranceExpiryDate: values.insuranceExpiryDate?.toISOString().split('T')[0],
                lastMaintenanceDate: values.lastMaintenanceDate?.toISOString().split('T')[0],
                nextMaintenanceDate: values.nextMaintenanceDate?.toISOString().split('T')[0],
            };

            if (isEditMode && id) {
                await updateVehicle({ id, data: vehicleData }).unwrap();
                toast({
                    title: "ТС обновлено",
                    description: `Транспортное средство "${values.brand} ${values.model}" успешно обновлено`
                });
                navigate(`/fleet/${id}`);
            } else {
                const result = await createVehicle(vehicleData).unwrap();
                toast({
                    title: "ТС создано",
                    description: `Транспортное средство "${values.brand} ${values.model}" успешно создано`
                });
                navigate(`/fleet/${result.id}`);
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить данные ТС. Пожалуйста, попробуйте снова.",
                variant: "destructive"
            });
            console.error("Vehicle save error:", error);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Редактирование ТС' : 'Добавление нового ТС'}</CardTitle>
                <CardDescription>
                    {isEditMode
                        ? 'Редактирование информации о транспортном средстве'
                        : 'Заполните информацию о транспортном средстве'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Основные данные</TabsTrigger>
                                <TabsTrigger value="technical">Технические характеристики</TabsTrigger>
                                <TabsTrigger value="papers">Документы и разрешения</TabsTrigger>
                            </TabsList>

                            {/* Основные данные */}
                            <TabsContent value="basic" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="licensePlate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Гос. номер</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="A123БВ777" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="brand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Марка</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Mercedes-Benz" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Модель</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Actros" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Год выпуска</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="vin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>VIN номер</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1HGBH41JXMN109186" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Статус ТС</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите статус" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={VehicleStatus.AVAILABLE}>Доступно</SelectItem>
                                                    <SelectItem value={VehicleStatus.IN_USE}>В использовании</SelectItem>
                                                    <SelectItem value={VehicleStatus.MAINTENANCE}>На техобслуживании</SelectItem>
                                                    <SelectItem value={VehicleStatus.OUT_OF_SERVICE}>Не на ходу</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Технические характеристики */}
                            <TabsContent value="technical" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="heightCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Высота (см)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="widthCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ширина (см)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lengthCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Длина (см)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="emptyWeightKg"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Снаряженная масса (кг)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="grossWeightKg"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Полная масса (кг)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fuelTankCapacityL"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Объем бака (л)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currentFuelL"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Текущий уровень топлива (л)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="fuelConsumptionPer100km"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Расход топлива (л/100км)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="currentOdometerKm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Текущий пробег (км)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-4" />

                                {/* Спец. оборудование */}
                                <FormField
                                    control={form.control}
                                    name="hasRefrigerator"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Рефрижератор</FormLabel>
                                                <FormDescription>
                                                    Транспортное средство оборудовано холодильной установкой
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

                                {hasRefrigerator && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="refrigeratorMinTempC"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Минимальная температура (°C)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="refrigeratorMaxTempC"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Максимальная температура (°C)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            {/* Документы и разрешения */}
                            <TabsContent value="papers" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="registrationExpiryDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок регистрации ТС</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="insuranceExpiryDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок страховки</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lastMaintenanceDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Дата последнего ТО</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="nextMaintenanceDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Дата следующего ТО</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator className="my-4" />

                                <FormField
                                    control={form.control}
                                    name="hasDangerousGoodsPermission"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Перевозка опасных грузов</FormLabel>
                                                <FormDescription>
                                                    Имеет разрешение на перевозку опасных грузов (ADR)
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
                                    name="hasOversizedCargoPermission"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Перевозка негабаритных грузов</FormLabel>
                                                <FormDescription>
                                                    Имеет разрешение на перевозку негабаритных и тяжеловесных грузов
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
                            </TabsContent>
                        </Tabs>

                        <CardFooter className="flex justify-end gap-2 px-0">
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
                                {isEditMode ? 'Обновить ТС' : 'Создать ТС'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}