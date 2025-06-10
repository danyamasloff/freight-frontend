import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Save,
	Calculator,
	MapPin,
	Navigation,
	Truck,
	User,
	Package,
	Clock,
	DollarSign,
	AlertTriangle,
	CheckCircle2,
	Map,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { usePlanRouteByNamesQuery, useCreateRouteMutation } from "@/shared/api/routesSlice";
import { useGetDriversQuery } from "@/shared/api/driversSlice";
import { useGetVehiclesQuery } from "@/shared/api/vehiclesApiSlice";
import { useGetCargosQuery } from "@/shared/api/cargoSlice";
import { useToast } from "@/hooks/use-toast";
import { formatDistance, formatDuration, formatCurrency } from "@/shared/utils/format";
import type { RouteResponse } from "@/shared/types/api";

// Схема валидации для быстрого создания маршрута
const quickRouteSchema = z.object({
	name: z.string().min(1, "Название маршрута обязательно"),
	fromPlace: z.string().min(1, "Укажите начальную точку"),
	toPlace: z.string().min(1, "Укажите конечную точку"),
	vehicleType: z.enum(["car", "truck"]),
	driverId: z.coerce.number().min(1, "Выберите водителя"),
	vehicleId: z.coerce.number().min(1, "Выберите транспорт"),
	cargoId: z.coerce.number().optional(),
	departureTime: z.string().optional(),
	description: z.string().optional(),
});

type QuickRouteFormData = z.infer<typeof quickRouteSchema>;

export function CreateRoutePage() {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [calculatedRoute, setCalculatedRoute] = useState<RouteResponse | null>(null);
	const [shouldCalculate, setShouldCalculate] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// API hooks
	const [createRoute] = useCreateRouteMutation();
	const { data: drivers = [], isLoading: driversLoading } = useGetDriversQuery();
	const { data: vehicles = [], isLoading: vehiclesLoading } = useGetVehiclesQuery();
	const { data: cargos = [], isLoading: cargosLoading } = useGetCargosQuery();

	const form = useForm<QuickRouteFormData>({
		resolver: zodResolver(quickRouteSchema),
		defaultValues: {
			name: "",
			fromPlace: "",
			toPlace: "",
			vehicleType: "truck",
			driverId: 0,
			vehicleId: 0,
			cargoId: 0,
			departureTime: "",
			description: "",
		},
	});

	const watchedValues = form.watch();

	// Используем usePlanRouteByNamesQuery для расчета маршрута
	const {
		data: routeData,
		isLoading: isCalculating,
		error: routeError,
	} = usePlanRouteByNamesQuery(
		{
			fromPlace: watchedValues.fromPlace,
			toPlace: watchedValues.toPlace,
			vehicleType: watchedValues.vehicleType,
		},
		{
			skip: !shouldCalculate || !watchedValues.fromPlace || !watchedValues.toPlace,
		}
	);

	// Обновляем calculatedRoute когда получаем данные
	useEffect(() => {
		if (routeData && shouldCalculate) {
			setCalculatedRoute(routeData);
			setShouldCalculate(false);

			toast({
				title: "Маршрут рассчитан",
				description: `${formatDistance(routeData.distance)} • ${formatDuration(routeData.duration)}`,
			});
		}
	}, [routeData, shouldCalculate, toast]);

	// Обработка ошибок расчета
	useEffect(() => {
		if (routeError && shouldCalculate) {
			setShouldCalculate(false);
			toast({
				title: "Ошибка расчета",
				description: "Не удалось рассчитать маршрут. Проверьте правильность адресов.",
				variant: "destructive",
			});
		}
	}, [routeError, shouldCalculate, toast]);

	// Функция запуска расчета маршрута
	const handleCalculateRoute = () => {
		const values = form.getValues();

		if (!values.fromPlace?.trim() || !values.toPlace?.trim()) {
			toast({
				title: "Ошибка",
				description: "Укажите начальную и конечную точки",
				variant: "destructive",
			});
			return;
		}

		setCalculatedRoute(null);
		setShouldCalculate(true);
	};

	// Функция сохранения маршрута
	const handleSaveRoute = async (values: QuickRouteFormData) => {
		if (!calculatedRoute) {
			toast({
				title: "Ошибка",
				description: "Сначала рассчитайте маршрут",
				variant: "destructive",
			});
			return;
		}

		setIsSaving(true);
		try {
			const routeData = {
				name: values.name,
				startAddress: values.fromPlace,
				endAddress: values.toPlace,
				startLat: 0,
				startLon: 0,
				endLat: 0,
				endLon: 0,
				distance: calculatedRoute.distance,
				duration: calculatedRoute.duration,
				vehicleId: values.vehicleId,
				driverId: values.driverId,
				cargoId: values.cargoId || undefined,
				departureTime: values.departureTime || undefined,
				description: values.description || undefined,
				estimatedCost: calculatedRoute.estimatedTotalCost,
				estimatedFuelCost: calculatedRoute.estimatedFuelCost,
				estimatedDriverCost: calculatedRoute.estimatedDriverCost,
				estimatedTollCost: calculatedRoute.estimatedTollCost,
				coordinates: calculatedRoute.coordinates,
				instructions: calculatedRoute.instructions,
			};

			await createRoute(routeData).unwrap();

			toast({
				title: "Маршрут создан",
				description: "Маршрут успешно сохранен в системе",
			});

			navigate("/routes");
		} catch (error: any) {
			toast({
				title: "Ошибка сохранения",
				description: error?.data?.message || "Не удалось сохранить маршрут",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const getRiskBadge = (riskScore?: number) => {
		if (!riskScore) return null;

		let variant: "default" | "destructive" | "secondary" = "default";
		let label = "Низкий";
		let color = "text-green-600";

		if (riskScore > 70) {
			variant = "destructive";
			label = "Высокий";
			color = "text-red-600";
		} else if (riskScore > 40) {
			variant = "secondary";
			label = "Средний";
			color = "text-yellow-600";
		}

		return (
			<Badge variant={variant} className={color}>
				{label} риск ({riskScore}%)
			</Badge>
		);
	};

	const handleViewOnMap = () => {
		if (!calculatedRoute) return;

		const watchedValues = form.getValues();

		// Создаем параметры для карты
		const mapParams = new URLSearchParams({
			startAddress: watchedValues.fromPlace,
			endAddress: watchedValues.toPlace,
			vehicleType: watchedValues.vehicleType,
			// Передаем координаты, если они есть в ответе
			...(calculatedRoute.coordinates &&
				calculatedRoute.coordinates.length > 0 && {
					startLat: calculatedRoute.coordinates[0][1]?.toString() || "",
					startLon: calculatedRoute.coordinates[0][0]?.toString() || "",
					endLat:
						calculatedRoute.coordinates[
							calculatedRoute.coordinates.length - 1
						][1]?.toString() || "",
					endLon:
						calculatedRoute.coordinates[
							calculatedRoute.coordinates.length - 1
						][0]?.toString() || "",
				}),
			// Передаем данные о маршруте
			distance: calculatedRoute.distance?.toString() || "0",
			duration: calculatedRoute.duration?.toString() || "0",
			...(calculatedRoute.estimatedTotalCost && {
				totalCost: calculatedRoute.estimatedTotalCost.toString(),
			}),
			...(calculatedRoute.overallRiskScore && {
				riskScore: calculatedRoute.overallRiskScore.toString(),
			}),
		});

		navigate(`/routes/map?${mapParams.toString()}`);
	};

	return (
		<div className="container py-8 max-w-4xl">
			{/* Заголовок */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" onClick={() => navigate("/routes")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Назад к списку
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Создать маршрут</h1>
						<p className="text-muted-foreground">
							Быстрое создание нового маршрута доставки
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSaveRoute)} className="space-y-6">
					{/* Основная информация */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Navigation className="h-5 w-5" />
								Основная информация
							</CardTitle>
							<CardDescription>Укажите название и маршрут доставки</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Название маршрута</FormLabel>
										<FormControl>
											<Input
												placeholder="Москва - Санкт-Петербург"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="fromPlace"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Откуда</FormLabel>
											<FormControl>
												<div className="relative">
													<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
													<Input
														placeholder="Москва"
														className="pl-9"
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
									name="toPlace"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Куда</FormLabel>
											<FormControl>
												<div className="relative">
													<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
													<Input
														placeholder="Санкт-Петербург"
														className="pl-9"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="vehicleType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Тип транспорта</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="truck">
														<div className="flex items-center gap-2">
															<Truck className="h-4 w-4" />
															Грузовой автомобиль
														</div>
													</SelectItem>
													<SelectItem value="car">
														<div className="flex items-center gap-2">
															<Navigation className="h-4 w-4" />
															Легковой автомобиль
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="departureTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Время отправления (опционально)</FormLabel>
											<FormControl>
												<div className="relative">
													<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
													<Input
														type="datetime-local"
														className="pl-9"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-center pt-4">
								<Button
									type="button"
									onClick={handleCalculateRoute}
									disabled={isCalculating}
									size="lg"
								>
									{isCalculating ? (
										<>
											<Calculator className="mr-2 h-4 w-4 animate-spin" />
											Расчет маршрута...
										</>
									) : (
										<>
											<Calculator className="mr-2 h-4 w-4" />
											Рассчитать маршрут
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Результат расчета */}
					{calculatedRoute && (
						<Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
									<CheckCircle2 className="h-5 w-5" />
									Маршрут рассчитан
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Основные параметры */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
										<div className="text-sm text-muted-foreground mb-1">
											Расстояние
										</div>
										<div className="text-lg font-bold">
											{formatDistance(calculatedRoute.distance || 0)}
										</div>
									</div>
									<div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
										<div className="text-sm text-muted-foreground mb-1">
											Время
										</div>
										<div className="text-lg font-bold">
											{formatDuration(calculatedRoute.duration || 0)}
										</div>
									</div>
									<div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
										<div className="text-sm text-muted-foreground mb-1">
											Стоимость
										</div>
										<div className="text-lg font-bold">
											{formatCurrency(
												calculatedRoute.estimatedTotalCost || 0
											)}
										</div>
									</div>
									<div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
										<div className="text-sm text-muted-foreground mb-1">
											Риск
										</div>
										<div className="flex justify-center">
											{getRiskBadge(calculatedRoute.overallRiskScore)}
										</div>
									</div>
								</div>

								{/* Детали стоимости */}
								{(calculatedRoute.estimatedFuelCost ||
									calculatedRoute.estimatedDriverCost ||
									calculatedRoute.estimatedTollCost) && (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
										{calculatedRoute.estimatedFuelCost &&
											calculatedRoute.estimatedFuelCost > 0 && (
												<div className="text-center">
													<div className="text-xs text-muted-foreground">
														Топливо
													</div>
													<div className="font-medium">
														{formatCurrency(
															calculatedRoute.estimatedFuelCost
														)}
													</div>
												</div>
											)}
										{calculatedRoute.estimatedDriverCost &&
											calculatedRoute.estimatedDriverCost > 0 && (
												<div className="text-center">
													<div className="text-xs text-muted-foreground">
														Водитель
													</div>
													<div className="font-medium">
														{formatCurrency(
															calculatedRoute.estimatedDriverCost
														)}
													</div>
												</div>
											)}
										{calculatedRoute.estimatedTollCost &&
											calculatedRoute.estimatedTollCost > 0 && (
												<div className="text-center">
													<div className="text-xs text-muted-foreground">
														Платные дороги
													</div>
													<div className="font-medium">
														{formatCurrency(
															calculatedRoute.estimatedTollCost
														)}
													</div>
												</div>
											)}
									</div>
								)}

								{/* Предупреждения */}
								{calculatedRoute.rtoWarnings &&
									calculatedRoute.rtoWarnings.length > 0 && (
										<Alert variant="destructive">
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												<div className="font-medium mb-1">
													Предупреждения РТО:
												</div>
												<ul className="list-disc list-inside text-sm">
													{calculatedRoute.rtoWarnings.map(
														(warning, index) => (
															<li key={index}>{warning}</li>
														)
													)}
												</ul>
											</AlertDescription>
										</Alert>
									)}

								<div className="flex justify-center pt-4">
									<Button type="button" onClick={handleViewOnMap} size="lg">
										<Map className="mr-2 h-4 w-4" />
										Посмотреть на карте
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Назначения */}
					{calculatedRoute && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Назначения
								</CardTitle>
								<CardDescription>
									Выберите водителя, транспорт и груз для маршрута
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="driverId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Водитель</FormLabel>
												<Select
													value={field.value?.toString()}
													onValueChange={(value) =>
														field.onChange(parseInt(value))
													}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Выберите водителя" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{drivers.map((driver) => (
															<SelectItem
																key={driver.id}
																value={driver.id.toString()}
															>
																<div className="flex items-center gap-2">
																	<User className="h-4 w-4" />
																	{driver.firstName}{" "}
																	{driver.lastName}
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
										name="vehicleId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Транспорт</FormLabel>
												<Select
													value={field.value?.toString()}
													onValueChange={(value) =>
														field.onChange(parseInt(value))
													}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Выберите транспорт" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{vehicles.map((vehicle) => (
															<SelectItem
																key={vehicle.id}
																value={vehicle.id.toString()}
															>
																<div className="flex items-center gap-2">
																	<Truck className="h-4 w-4" />
																	{vehicle.brand} {vehicle.model}{" "}
																	({vehicle.licensePlate})
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="cargoId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Груз (опционально)</FormLabel>
											<Select
												value={field.value?.toString() || ""}
												onValueChange={(value) =>
													field.onChange(
														value ? parseInt(value) : undefined
													)
												}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Выберите груз" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="">Без груза</SelectItem>
													{cargos.map((cargo) => (
														<SelectItem
															key={cargo.id}
															value={cargo.id.toString()}
														>
															<div className="flex items-center gap-2">
																<Package className="h-4 w-4" />
																{cargo.name} ({cargo.weightKg} кг)
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
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Описание (опционально)</FormLabel>
											<FormControl>
												<Input
													placeholder="Дополнительная информация о маршруте"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					)}

					{/* Кнопки действий */}
					{calculatedRoute && (
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/routes")}
							>
								Отмена
							</Button>
							<Button type="submit" disabled={isSaving} size="lg">
								{isSaving ? (
									<>
										<Save className="mr-2 h-4 w-4 animate-spin" />
										Сохранение...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Создать маршрут
									</>
								)}
							</Button>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
}
