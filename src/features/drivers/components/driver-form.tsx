import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDriverMutation, useUpdateDriverMutation } from "@/shared/api/driversSlice";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	CalendarDays,
	CreditCard,
	Phone,
	Mail,
	User,
	Truck,
	AlertTriangle,
	Loader2,
	X,
} from "lucide-react";

import {
	driverFormSchema,
	LICENSE_CATEGORIES,
	type DriverFormValues,
	type DriverDetail,
} from "../types";

interface DriverFormProps {
	initialData?: Partial<DriverDetail>;
	id?: number;
}

export function DriverForm({ initialData, id }: DriverFormProps) {
	const [activeTab, setActiveTab] = useState("personal");
	const { toast } = useToast();
	const navigate = useNavigate();
	const { addNotification } = useNotifications();

	const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
	const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();

	const isLoading = isCreating || isUpdating;
	const isEditMode = !!id;

	const form = useForm<DriverFormValues>({
		resolver: zodResolver(driverFormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			licenseNumber: "",
			licenseCategory: [],
			phone: "",
			email: "",
			experience: 0,
			dangerousGoodsPermit: false,
			hourlyRate: 0,
			kmRate: 0,
			notes: "",
			...initialData,
		},
	});

	const isDangerousGoodsPermit = form.watch("dangerousGoodsPermit");
	const selectedCategories = form.watch("licenseCategory");

	async function onSubmit(values: DriverFormValues) {
		try {
			const driverData = {
				firstName: values.firstName,
				lastName: values.lastName,
				licenseNumber: values.licenseNumber,
				phoneNumber: values.phone,
				email: values.email || undefined,
				drivingExperienceYears: values.experience,
				licenseIssueDate: values.licenseIssueDate || undefined,
				licenseExpiryDate: values.licenseExpiryDate || undefined,
				licenseCategories: values.licenseCategory.join(","),
				hasDangerousGoodsCertificate: values.dangerousGoodsPermit,
				dangerousGoodsCertificateExpiry: values.dangerousGoodsPermitExpiryDate || undefined,
				hourlyRate: values.hourlyRate || undefined,
				perKilometerRate: values.kmRate || undefined,
				fuelConsumptionLper100km: values.fuelConsumptionLper100km || undefined,
				tollRatePerKm: values.tollRatePerKm || undefined,
			};

			if (isEditMode && id) {
				await updateDriver({ id, data: driverData }).unwrap();
				toast({
					title: "Водитель обновлен",
					description: `Данные водителя "${values.firstName} ${values.lastName}" успешно обновлены`,
				});
			} else {
				const result = await createDriver(driverData).unwrap();

				// Добавляем уведомление о создании водителя
				addNotification({
					type: "driver_assigned",
					title: "Новый водитель добавлен",
					message: `Водитель ${values.firstName} ${values.lastName} успешно зарегистрирован в системе`,
					priority: "medium",
				});

				toast({
					title: "Водитель создан",
					description: `Водитель "${values.firstName} ${values.lastName}" успешно добавлен в систему`,
				});
				navigate(`/drivers/${result.id}`);
			}
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось сохранить данные водителя. Пожалуйста, попробуйте снова.",
				variant: "destructive",
			});
			console.error("Driver save error:", error);
		}
	}

	const addLicenseCategory = (category: string) => {
		const currentCategories = form.getValues("licenseCategory");
		if (!currentCategories.includes(category)) {
			form.setValue("licenseCategory", [...currentCategories, category]);
		}
	};

	const removeLicenseCategory = (category: string) => {
		const currentCategories = form.getValues("licenseCategory");
		form.setValue(
			"licenseCategory",
			currentCategories.filter((c) => c !== category)
		);
	};

	const isLicenseExpiringSoon = (expiryDate?: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const now = new Date();
		const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
		return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
	};

	const isLicenseExpired = (expiryDate?: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const now = new Date();
		return expiry < now;
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					{isEditMode ? "Редактирование водителя" : "Добавление нового водителя"}
				</CardTitle>
				<CardDescription>
					Заполните информацию о водителе для добавления в систему управления автопарком
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="personal">Личные данные</TabsTrigger>
								<TabsTrigger value="license">Права и разрешения</TabsTrigger>
								<TabsTrigger value="rates">Тарифы</TabsTrigger>
								<TabsTrigger value="additional">Дополнительно</TabsTrigger>
							</TabsList>

							{/* Personal Information */}
							<TabsContent value="personal" className="space-y-4 pt-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Имя</FormLabel>
												<FormControl>
													<Input placeholder="Иван" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Фамилия</FormLabel>
												<FormControl>
													<Input placeholder="Иванов" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Телефон</FormLabel>
												<FormControl>
													<div className="relative">
														<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															placeholder="+79001234567"
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
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email (необязательно)</FormLabel>
												<FormControl>
													<div className="relative">
														<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															placeholder="ivan@example.com"
															type="email"
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

								<FormField
									control={form.control}
									name="experience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Стаж вождения (лет)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="10"
													min="0"
													max="50"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Общий стаж вождения транспортных средств
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabsContent>

							{/* License and Permits */}
							<TabsContent value="license" className="space-y-4 pt-4">
								<FormField
									control={form.control}
									name="licenseNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Номер водительского удостоверения</FormLabel>
											<FormControl>
												<div className="relative">
													<CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="7799123456"
														className="pl-10"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div>
									<FormLabel>Категории водительского удостоверения</FormLabel>
									<div className="mt-2 space-y-2">
										<Select onValueChange={addLicenseCategory}>
											<SelectTrigger>
												<SelectValue placeholder="Добавить категорию" />
											</SelectTrigger>
											<SelectContent>
												{LICENSE_CATEGORIES.map((category) => (
													<SelectItem
														key={category.value}
														value={category.value}
														disabled={selectedCategories.includes(
															category.value
														)}
													>
														{category.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										{selectedCategories.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{selectedCategories.map((category) => {
													const categoryInfo = LICENSE_CATEGORIES.find(
														(c) => c.value === category
													);
													return (
														<Badge
															key={category}
															variant="secondary"
															className="gap-1"
														>
															{categoryInfo?.label || category}
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-auto p-0 text-muted-foreground hover:text-foreground"
																onClick={() =>
																	removeLicenseCategory(category)
																}
															>
																<X className="h-3 w-3" />
															</Button>
														</Badge>
													);
												})}
											</div>
										)}
									</div>
									<FormMessage />
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="licenseIssueDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Дата выдачи прав</FormLabel>
												<FormControl>
													<div className="relative">
														<CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															type="date"
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
										name="licenseExpiryDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Срок действия прав</FormLabel>
												<FormControl>
													<div className="relative">
														<CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															type="date"
															className="pl-10"
															{...field}
														/>
													</div>
												</FormControl>
												{field.value && isLicenseExpired(field.value) && (
													<Alert variant="destructive" className="mt-2">
														<AlertTriangle className="h-4 w-4" />
														<AlertDescription>
															Водительское удостоверение просрочено
														</AlertDescription>
													</Alert>
												)}
												{field.value &&
													isLicenseExpiringSoon(field.value) &&
													!isLicenseExpired(field.value) && (
														<Alert className="mt-2">
															<AlertTriangle className="h-4 w-4" />
															<AlertDescription>
																Водительское удостоверение истекает
																в течение 3 месяцев
															</AlertDescription>
														</Alert>
													)}
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="medicalCertificateExpiryDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Срок действия медицинской справки</FormLabel>
											<FormControl>
												<div className="relative">
													<CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														type="date"
														className="pl-10"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator />

								<FormField
									control={form.control}
									name="dangerousGoodsPermit"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Разрешение на перевозку опасных грузов
												</FormLabel>
												<FormDescription>
													Имеет ли водитель действующее разрешение ДОПОГ
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

								{isDangerousGoodsPermit && (
									<FormField
										control={form.control}
										name="dangerousGoodsPermitExpiryDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Срок действия разрешения ДОПОГ
												</FormLabel>
												<FormControl>
													<div className="relative">
														<CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															type="date"
															className="pl-10"
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</TabsContent>

							{/* Rates */}
							<TabsContent value="rates" className="space-y-4 pt-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="hourlyRate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Почасовая ставка (₽/час)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="500"
														min="0"
														step="10"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Стоимость работы водителя за час
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="kmRate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ставка за километр (₽/км)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="25"
														min="0"
														step="1"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Стоимость работы водителя за километр пути
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="fuelConsumptionLper100km"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Расход топлива (л/100км)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="35"
														min="0"
														step="0.1"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Средний расход топлива водителя на 100 км
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="tollRatePerKm"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ставка платных дорог (₽/км)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="2.5"
														min="0"
														step="0.1"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Средняя стоимость платных дорог за километр
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</TabsContent>

							{/* Additional Information */}
							<TabsContent value="additional" className="space-y-4 pt-4">
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Дополнительные заметки</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Дополнительная информация о водителе..."
													className="min-h-24"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Любая дополнительная информация, которая может быть
												полезна
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
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isEditMode ? "Обновить водителя" : "Добавить водителя"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
