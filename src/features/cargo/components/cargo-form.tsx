import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Package, AlertTriangle, Thermometer, Scale, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCreateCargoMutation, useUpdateCargoMutation } from "@/shared/api/cargoSlice";
import { CargoType } from "@/shared/types/cargo";
import { useToast } from "@/hooks/use-toast";

// Схема валидации формы
const cargoFormSchema = z.object({
	name: z.string().min(2, "Название груза должно содержать минимум 2 символа").max(100),
	description: z.string().optional(),

	// Основные характеристики
	weightKg: z.coerce.number().min(1, "Вес должен быть больше 0"),
	volumeCubicMeters: z.coerce.number().min(0).optional(),
	lengthCm: z.coerce.number().min(0).optional(),
	widthCm: z.coerce.number().min(0).optional(),
	heightCm: z.coerce.number().min(0).optional(),

	// Тип груза
	cargoType: z.nativeEnum(CargoType),

	// Специальные требования
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

	// Стоимость
	declaredValue: z.coerce.number().min(0).optional(),
	currency: z.string().optional(),
});

type CargoFormValues = z.infer<typeof cargoFormSchema>;

interface CargoFormProps {
	initialData?: Partial<CargoFormValues>;
	id?: number;
}

export function CargoForm({ initialData, id }: CargoFormProps) {
	const navigate = useNavigate();
	const { toast } = useToast();
	const isEditMode = Boolean(id);

	const [createCargo, { isLoading: isCreating }] = useCreateCargoMutation();
	const [updateCargo, { isLoading: isUpdating }] = useUpdateCargoMutation();

	const isLoading = isCreating || isUpdating;

	const form = useForm<CargoFormValues>({
		resolver: zodResolver(cargoFormSchema),
		defaultValues: {
			name: "",
			description: "",
			weightKg: 0,
			volumeCubicMeters: 0,
			lengthCm: 0,
			widthCm: 0,
			heightCm: 0,
			cargoType: CargoType.GENERAL,
			isFragile: false,
			isPerishable: false,
			isDangerous: false,
			dangerousGoodsClass: "",
			unNumber: "",
			isOversized: false,
			requiresTemperatureControl: false,
			minTemperatureCelsius: 0,
			maxTemperatureCelsius: 0,
			requiresCustomsClearance: false,
			declaredValue: 0,
			currency: "RUB",
			...initialData,
		},
	});

	// Отслеживание изменений для условного отображения полей
	const isDangerous = form.watch("isDangerous");
	const requiresTemperatureControl = form.watch("requiresTemperatureControl");

	useEffect(() => {
		if (initialData) {
			form.reset(initialData);
		}
	}, [initialData, form]);

	async function onSubmit(values: CargoFormValues) {
		try {
			if (isEditMode && id) {
				await updateCargo({ id, data: values }).unwrap();
				toast({
					title: "Груз обновлен",
					description: "Информация о грузе успешно обновлена.",
				});
			} else {
				await createCargo(values).unwrap();
				toast({
					title: "Груз создан",
					description: "Новый груз успешно добавлен в систему.",
				});
			}
			navigate("/cargo");
		} catch (error) {
			toast({
				title: "Ошибка",
				description: isEditMode
					? "Не удалось обновить груз. Попробуйте еще раз."
					: "Не удалось создать груз. Попробуйте еще раз.",
				variant: "destructive",
			});
			console.error("Error saving cargo:", error);
		}
	}

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Package className="h-5 w-5" />
					{isEditMode ? "Редактирование груза" : "Создание нового груза"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Tabs defaultValue="basic" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="basic">Основная информация</TabsTrigger>
								<TabsTrigger value="dimensions">Габариты и вес</TabsTrigger>
								<TabsTrigger value="special">Особые требования</TabsTrigger>
							</TabsList>

							<TabsContent value="basic" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Название груза *</FormLabel>
												<FormControl>
													<Input
														placeholder="Например: Металлические изделия"
														{...field}
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
												<FormLabel>Тип груза *</FormLabel>
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
														<SelectItem value={CargoType.GENERAL}>
															Генеральный
														</SelectItem>
														<SelectItem value={CargoType.BULK}>
															Навалочный
														</SelectItem>
														<SelectItem value={CargoType.LIQUID}>
															Жидкий
														</SelectItem>
														<SelectItem value={CargoType.CONTAINER}>
															Контейнерный
														</SelectItem>
														<SelectItem value={CargoType.REFRIGERATED}>
															Рефрижераторный
														</SelectItem>
														<SelectItem value={CargoType.DANGEROUS}>
															Опасный
														</SelectItem>
														<SelectItem value={CargoType.OVERSIZED}>
															Негабаритный
														</SelectItem>
														<SelectItem value={CargoType.HEAVY}>
															Тяжеловесный
														</SelectItem>
														<SelectItem value={CargoType.LIVESTOCK}>
															Животные
														</SelectItem>
														<SelectItem value={CargoType.PERISHABLE}>
															Скоропортящийся
														</SelectItem>
														<SelectItem value={CargoType.VALUABLE}>
															Ценный
														</SelectItem>
														<SelectItem value={CargoType.FRAGILE}>
															Хрупкий
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Описание</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Подробное описание груза, особенности упаковки, дополнительные требования..."
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Укажите дополнительную информацию о грузе
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="declaredValue"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Заявленная стоимость</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="0"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormDescription>
													Стоимость груза для страхования
												</FormDescription>
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
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Выберите валюту" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="RUB">
															Рубли (₽)
														</SelectItem>
														<SelectItem value="USD">
															Доллары ($)
														</SelectItem>
														<SelectItem value="EUR">
															Евро (€)
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</TabsContent>

							<TabsContent value="dimensions" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="weightKg"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Вес (кг) *</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="1000"
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
														step="0.01"
														placeholder="1.5"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								<div className="space-y-2">
									<h3 className="text-lg font-medium">Габариты</h3>
									<p className="text-sm text-muted-foreground">
										Укажите размеры груза в сантиметрах
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="lengthCm"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Длина (см)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="200"
														{...field}
														value={field.value || ""}
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
														placeholder="150"
														{...field}
														value={field.value || ""}
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
														placeholder="100"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</TabsContent>

							<TabsContent value="special" className="space-y-4">
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="isFragile"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
												<div className="space-y-0.5">
													<FormLabel>Хрупкий груз</FormLabel>
													<FormDescription>
														Требует осторожного обращения
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
													<FormLabel>Скоропортящийся груз</FormLabel>
													<FormDescription>
														Имеет ограниченный срок хранения
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
															<SelectItem value="1">
																Класс 1 - Взрывчатые вещества
															</SelectItem>
															<SelectItem value="2">
																Класс 2 - Газы
															</SelectItem>
															<SelectItem value="3">
																Класс 3 - Легковоспламеняющиеся
																жидкости
															</SelectItem>
															<SelectItem value="4">
																Класс 4 - Легковоспламеняющиеся
																твердые вещества
															</SelectItem>
															<SelectItem value="5">
																Класс 5 - Окисляющие вещества
															</SelectItem>
															<SelectItem value="6">
																Класс 6 - Токсичные вещества
															</SelectItem>
															<SelectItem value="7">
																Класс 7 - Радиоактивные материалы
															</SelectItem>
															<SelectItem value="8">
																Класс 8 - Коррозионные вещества
															</SelectItem>
															<SelectItem value="9">
																Класс 9 - Прочие опасные вещества
															</SelectItem>
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
															value={field.value || ""}
														/>
													</FormControl>
													<FormDescription>
														Идентификатор опасного груза по
														классификации ООН
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
													<FormLabel>
														Минимальная температура (°C)
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="-18"
															{...field}
															value={field.value || ""}
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
													<FormLabel>
														Максимальная температура (°C)
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="4"
															{...field}
															value={field.value || ""}
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
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isEditMode ? "Обновить груз" : "Создать груз"}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default CargoForm;
