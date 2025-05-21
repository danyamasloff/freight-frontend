import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CargoType } from '@/shared/types/cargo';
import { useCreateCargoMutation, useUpdateCargoMutation } from '@/shared/api/cargoSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Схема валидации формы
const cargoFormSchema = z.object({
    name: z.string().min(3, {
        message: "Название груза должно содержать минимум 3 символа",
    }).max(100, {
        message: "Название груза не должно превышать 100 символов",
    }),
    description: z.string().optional(),
    weightKg: z.coerce.number().min(1, {
        message: "Вес должен быть больше 0",
    }),
    volumeCubicMeters: z.coerce.number().optional(),
    lengthCm: z.coerce.number().optional(),
    widthCm: z.coerce.number().optional(),
    heightCm: z.coerce.number().optional(),
    cargoType: z.nativeEnum(CargoType),
    isFragile: z.boolean().default(false),
    isPerishable: z.boolean().default(false),
    isDangerous: z.boolean().default(false),
    dangerousGoodsClass: z.string().optional(),
    unNumber: z.string().optional(),
    isOversized: z.boolean().default(false),
    requiresTemperatureControl: z.boolean().default(false),
    minTemperatureCelsius: z.coerce.number().optional(),
    maxTemperatureCelsius: z.coerce.number().optional(),
    requiresCustomsClearance: z.boolean().default(false),
    declaredValue: z.coerce.number().optional(),
    currency: z.string().optional().default('RUB'),
}).refine(data => {
    if (data.isDangerous && !data.dangerousGoodsClass) {
        return false;
    }
    return true;
}, {
    message: "Укажите класс опасности для опасного груза",
    path: ["dangerousGoodsClass"],
}).refine(data => {
    if (data.requiresTemperatureControl && (data.minTemperatureCelsius === undefined || data.maxTemperatureCelsius === undefined)) {
        return false;
    }
    return true;
}, {
    message: "Укажите диапазон температур для температурного груза",
    path: ["minTemperatureCelsius"],
});

type CargoFormValues = z.infer<typeof cargoFormSchema>;

interface CargoFormProps {
    initialData?: Partial<CargoFormValues>;
    id?: number;
}

const cargoTypeOptions = [
    { value: CargoType.GENERAL, label: 'Генеральный' },
    { value: CargoType.BULK, label: 'Навалочный' },
    { value: CargoType.LIQUID, label: 'Жидкий' },
    { value: CargoType.CONTAINER, label: 'Контейнерный' },
    { value: CargoType.REFRIGERATED, label: 'Рефрижераторный' },
    { value: CargoType.DANGEROUS, label: 'Опасный' },
    { value: CargoType.OVERSIZED, label: 'Негабаритный' },
    { value: CargoType.HEAVY, label: 'Тяжеловесный' },
    { value: CargoType.LIVESTOCK, label: 'Животные' },
    { value: CargoType.PERISHABLE, label: 'Скоропортящийся' },
    { value: CargoType.VALUABLE, label: 'Ценный' },
    { value: CargoType.FRAGILE, label: 'Хрупкий' },
];

export function CargoForm({ initialData, id }: CargoFormProps) {
    const [activeTab, setActiveTab] = useState("basic");
    const { toast } = useToast();
    const navigate = useNavigate();

    const [createCargo, { isLoading: isCreating }] = useCreateCargoMutation();
    const [updateCargo, { isLoading: isUpdating }] = useUpdateCargoMutation();

    const isLoading = isCreating || isUpdating;
    const isEditMode = !!id;

    // Initialize form with default values or initial data
    const form = useForm<CargoFormValues>({
        resolver: zodResolver(cargoFormSchema),
        defaultValues: {
            name: '',
            description: '',
            weightKg: 0,
            cargoType: CargoType.GENERAL,
            isFragile: false,
            isPerishable: false,
            isDangerous: false,
            isOversized: false,
            requiresTemperatureControl: false,
            requiresCustomsClearance: false,
            ...initialData,
        },
    });

    const isDangerous = form.watch('isDangerous');
    const requiresTemperatureControl = form.watch('requiresTemperatureControl');

    async function onSubmit(values: CargoFormValues) {
        try {
            if (isEditMode && id) {
                await updateCargo({ id, data: values }).unwrap();
                toast({
                    title: "Груз обновлен",
                    description: `Груз "${values.name}" успешно обновлен`
                });
            } else {
                const result = await createCargo(values).unwrap();
                toast({
                    title: "Груз создан",
                    description: `Груз "${values.name}" успешно создан`
                });
                navigate(`/cargo/${result.id}`);
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить груз. Пожалуйста, попробуйте снова.",
                variant: "destructive"
            });
            console.error("Cargo save error:", error);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Редактирование груза' : 'Создание нового груза'}</CardTitle>
                <CardDescription>
                    Заполните информацию о грузе для создания записи в системе
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Основные данные</TabsTrigger>
                                <TabsTrigger value="dimensions">Габариты и вес</TabsTrigger>
                                <TabsTrigger value="special">Особые требования</TabsTrigger>
                            </TabsList>

                            {/* Основные данные */}
                            <TabsContent value="basic" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Название груза</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите название груза" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Описание</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Опишите груз и его особенности"
                                                    className="min-h-24"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cargoType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Тип груза</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип груза" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cargoTypeOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="declaredValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Объявленная стоимость</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Валюта</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value || 'RUB'}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Выберите валюту" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="RUB">Рубль (₽)</SelectItem>
                                                        <SelectItem value="USD">Доллар ($)</SelectItem>
                                                        <SelectItem value="EUR">Евро (€)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* Габариты и вес */}
                            <TabsContent value="dimensions" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="weightKg"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Вес (кг)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="volumeCubicMeters"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Объем (м³)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lengthCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Длина (см)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
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
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="heightCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Высота (см)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* Особые требования */}
                            <TabsContent value="special" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isFragile"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Хрупкий груз</FormLabel>
                                                    <FormDescription>
                                                        Требует бережной погрузки/разгрузки
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
                                        name="isPerishable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Скоропортящийся</FormLabel>
                                                    <FormDescription>
                                                        Имеет ограниченный срок годности
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

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isOversized"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Негабаритный груз</FormLabel>
                                                    <FormDescription>
                                                        Превышает стандартные размеры
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
                                        name="requiresCustomsClearance"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Таможенная очистка</FormLabel>
                                                    <FormDescription>
                                                        Требуется оформление на таможне
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

                                <Separator className="my-4" />

                                {/* Опасный груз */}
                                <FormField
                                    control={form.control}
                                    name="isDangerous"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Опасный груз</FormLabel>
                                                <FormDescription>
                                                    Требует специальной маркировки и обращения
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

                                {isDangerous && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="dangerousGoodsClass"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Класс опасности</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Выберите класс опасности" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1">Класс 1 - Взрывчатые вещества</SelectItem>
                                                            <SelectItem value="2">Класс 2 - Газы</SelectItem>
                                                            <SelectItem value="3">Класс 3 - Легковоспламеняющиеся жидкости</SelectItem>
                                                            <SelectItem value="4">Класс 4 - Легковоспламеняющиеся твердые вещества</SelectItem>
                                                            <SelectItem value="5">Класс 5 - Окисляющие вещества</SelectItem>
                                                            <SelectItem value="6">Класс 6 - Токсичные вещества</SelectItem>
                                                            <SelectItem value="7">Класс 7 - Радиоактивные материалы</SelectItem>
                                                            <SelectItem value="8">Класс 8 - Коррозионные вещества</SelectItem>
                                                            <SelectItem value="9">Класс 9 - Прочие опасные вещества</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="unNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Номер ООН</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Например: UN1203"
                                                            {...field}
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Идентификатор опасного груза по классификации ООН
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                <Separator className="my-4" />

                                {/* Температурный режим */}
                                <FormField
                                    control={form.control}
                                    name="requiresTemperatureControl"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Температурный режим</FormLabel>
                                                <FormDescription>
                                                    Требуется поддержание определенной температуры
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

                                {requiresTemperatureControl && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="minTemperatureCelsius"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Минимальная температура (°C)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="-18"
                                                            {...field}
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maxTemperatureCelsius"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Максимальная температура (°C)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="4"
                                                            {...field}
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
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
                                {isEditMode ? 'Обновить груз' : 'Создать груз'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}