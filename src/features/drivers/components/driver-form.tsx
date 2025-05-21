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

import { useCreateDriverMutation, useUpdateDriverMutation } from '@/shared/api/driversApiSlice';
import { DrivingStatus, DriverDetailDto } from '@/shared/types/driver';
import { useToast } from '@/hooks/use-toast';

// Схема валидации формы
const driverFormSchema = z.object({
    firstName: z.string().min(2, {
        message: "Имя должно содержать минимум 2 символа",
    }),
    lastName: z.string().min(2, {
        message: "Фамилия должна содержать минимум 2 символа",
    }),
    middleName: z.string().optional(),
    licenseNumber: z.string().min(3, {
        message: "Номер лицензии должен содержать минимум 3 символа",
    }),
    licenseCategories: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email({
        message: "Введите корректный email",
    }).optional().or(z.literal('')),
    birthDate: z.date().optional(),
    licenseIssueDate: z.date().optional(),
    licenseExpiryDate: z.date().optional(),
    drivingExperienceYears: z.coerce.number().min(0).optional(),
    hasDangerousGoodsCertificate: z.boolean().default(false),
    dangerousGoodsCertificateExpiry: z.date().optional(),
    hasInternationalTransportationPermit: z.boolean().default(false),
    hourlyRate: z.coerce.number().min(0).optional(),
    perKilometerRate: z.coerce.number().min(0).optional(),
    currentDrivingStatus: z.nativeEnum(DrivingStatus).optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
    initialData?: Partial<DriverDetailDto>;
    id?: number;
}

export function DriverForm({ initialData, id }: DriverFormProps) {
    const [activeTab, setActiveTab] = useState("basic");
    const { toast } = useToast();
    const navigate = useNavigate();

    const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
    const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();

    const isLoading = isCreating || isUpdating;
    const isEditMode = !!id;

    // Преобразование дат из строк в объекты Date для формы
    const formattedInitialData = initialData ? {
        ...initialData,
        birthDate: initialData.birthDate ? new Date(initialData.birthDate) : undefined,
        licenseIssueDate: initialData.licenseIssueDate ? new Date(initialData.licenseIssueDate) : undefined,
        licenseExpiryDate: initialData.licenseExpiryDate ? new Date(initialData.licenseExpiryDate) : undefined,
        dangerousGoodsCertificateExpiry: initialData.dangerousGoodsCertificateExpiry
            ? new Date(initialData.dangerousGoodsCertificateExpiry)
            : undefined,
    } : {};

    // Инициализация формы
    const form = useForm<DriverFormValues>({
        resolver: zodResolver(driverFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            middleName: '',
            licenseNumber: '',
            licenseCategories: '',
            phoneNumber: '',
            email: '',
            drivingExperienceYears: 0,
            hasDangerousGoodsCertificate: false,
            hasInternationalTransportationPermit: false,
            currentDrivingStatus: DrivingStatus.AVAILABILITY,
            ...formattedInitialData,
        },
    });

    const hasDangerousGoods = form.watch('hasDangerousGoodsCertificate');

    async function onSubmit(values: DriverFormValues) {
        try {
            // Подготовка данных для API (преобразование дат в ISO строки)
            const driverData = {
                ...values,
                birthDate: values.birthDate?.toISOString().split('T')[0],
                licenseIssueDate: values.licenseIssueDate?.toISOString().split('T')[0],
                licenseExpiryDate: values.licenseExpiryDate?.toISOString().split('T')[0],
                dangerousGoodsCertificateExpiry: values.dangerousGoodsCertificateExpiry?.toISOString().split('T')[0],
                currentStatusStartTime: new Date().toISOString(),
            };

            if (isEditMode && id) {
                await updateDriver({ id, data: driverData }).unwrap();
                toast({
                    title: "Водитель обновлен",
                    description: `Водитель "${values.lastName} ${values.firstName}" успешно обновлен`
                });
                navigate(`/drivers/${id}`);
            } else {
                const result = await createDriver(driverData).unwrap();
                toast({
                    title: "Водитель создан",
                    description: `Водитель "${values.lastName} ${values.firstName}" успешно создан`
                });
                navigate(`/drivers/${result.id}`);
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить данные водителя. Пожалуйста, попробуйте снова.",
                variant: "destructive"
            });
            console.error("Driver save error:", error);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Редактирование водителя' : 'Создание нового водителя'}</CardTitle>
                <CardDescription>
                    {isEditMode
                        ? 'Редактирование информации о водителе'
                        : 'Заполните информацию о водителе для создания записи в системе'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Основные данные</TabsTrigger>
                                <TabsTrigger value="docs">Документы</TabsTrigger>
                                <TabsTrigger value="work">Работа и оплата</TabsTrigger>
                            </TabsList>

                            {/* Основные данные */}
                            <TabsContent value="basic" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Фамилия</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Введите фамилию" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Имя</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Введите имя" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Отчество</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите отчество" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата рождения</FormLabel>
                                            <DatePicker
                                                date={field.value}
                                                setDate={field.onChange}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Телефон</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+7 (999) 123-45-67" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="user@example.com" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="drivingExperienceYears"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Опыт вождения (лет)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentDrivingStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Текущий статус</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите статус" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={DrivingStatus.AVAILABILITY}>Доступен</SelectItem>
                                                    <SelectItem value={DrivingStatus.DRIVING}>За рулем</SelectItem>
                                                    <SelectItem value={DrivingStatus.REST_BREAK}>Короткий отдых</SelectItem>
                                                    <SelectItem value={DrivingStatus.DAILY_REST}>Дневной отдых</SelectItem>
                                                    <SelectItem value={DrivingStatus.WEEKLY_REST}>Недельный отдых</SelectItem>
                                                    <SelectItem value={DrivingStatus.OTHER_WORK}>Другая работа</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Документы */}
                            <TabsContent value="docs" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="licenseNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Номер водительского удостоверения</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите номер ВУ" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="licenseIssueDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Дата выдачи ВУ</FormLabel>
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
                                        name="licenseExpiryDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок действия ВУ</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="licenseCategories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Категории ВУ</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Например: B, C, CE" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormDescription>
                                                Укажите категории через запятую, например: B, C, CE
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-4" />

                                <FormField
                                    control={form.control}
                                    name="hasDangerousGoodsCertificate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Свидетельство ДОПОГ</FormLabel>
                                                <FormDescription>
                                                    Разрешение на перевозку опасных грузов
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

                                {hasDangerousGoods && (
                                    <FormField
                                        control={form.control}
                                        name="dangerousGoodsCertificateExpiry"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок действия ДОПОГ</FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="hasInternationalTransportationPermit"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Международные перевозки</FormLabel>
                                                <FormDescription>
                                                    Разрешение на международные перевозки
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

                            {/* Работа и оплата */}
                            <TabsContent value="work" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hourlyRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Почасовая ставка (₽/час)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="perKilometerRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ставка за км (₽/км)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                {isEditMode ? 'Обновить водителя' : 'Создать водителя'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}