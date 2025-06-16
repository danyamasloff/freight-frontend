import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	ArrowLeft,
	Save,
	MapPin,
	Truck,
	User,
	Package,
	Calendar,
	Route as RouteIcon,
	Navigation,
	AlertCircle,
	CheckCircle2,
	Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// API hooks
import {
	useCreateRouteMutation,
	usePlanRouteByNameQuery,
	useLazyPlanRouteByNameQuery,
} from "@/shared/api/routesSlice";
import { useGetVehiclesQuery } from "@/shared/api/vehiclesApiSlice";
import { useGetDriversQuery } from "@/shared/api/driversSlice";
import { useGetCargosQuery } from "@/shared/api/cargoSlice";

// Валидация формы с расширенными полями
const routeSchema = z.object({
	name: z.string().min(1, "Название маршрута обязательно"),
	startAddress: z.string().min(1, "Укажите адрес отправления"),
	endAddress: z.string().min(1, "Укажите адрес назначения"),
	vehicleId: z.string().min(1, "Выберите транспортное средство"),
	driverId: z.string().optional(),
	cargoId: z.string().optional(),
	departureTime: z.date().optional(),
	description: z.string().optional(),
	avoidTolls: z.boolean(),
	considerWeather: z.boolean(),
	considerTraffic: z.boolean(),
});

type RouteFormData = z.infer<typeof routeSchema>;

export function CreateRoutePage() {
	const navigate = useNavigate();
	const [step, setStep] = useState<"form" | "preview" | "calculating">("form");
	const [calculatedRoute, setCalculatedRoute] = useState<any>(null);

	// API hooks
	const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation();
	const [planRouteByName, { isLoading: isCalculating }] = useLazyPlanRouteByNameQuery();

	const { data: vehicles = [], isLoading: vehiclesLoading } = useGetVehiclesQuery();
	const { data: drivers = [], isLoading: driversLoading } = useGetDriversQuery();
	const { data: cargo = [], isLoading: cargoLoading } = useGetCargosQuery();

	const form = useForm<RouteFormData>({
		resolver: zodResolver(routeSchema),
		defaultValues: {
			name: "",
			startAddress: "",
			endAddress: "",
			vehicleId: "",
			driverId: "",
			cargoId: "",
			description: "",
			avoidTolls: false,
			considerWeather: true,
			considerTraffic: true,
		},
	});

	const handleCalculateRoute = async (data: RouteFormData) => {
		try {
			setStep("calculating");

			// Используем endpoint для планирования маршрута по названиям мест
			const result = await planRouteByName({
				fromPlace: data.startAddress,
				toPlace: data.endAddress,
				vehicleType: "truck", // По умолчанию грузовик
			}).unwrap();

			// Дополняем результат данными из формы
			const enrichedResult = {
				...result,
				name: data.name,
				startAddress: data.startAddress,
				endAddress: data.endAddress,
				vehicleId: data.vehicleId ? parseInt(data.vehicleId) : undefined,
				driverId: data.driverId ? parseInt(data.driverId) : undefined,
				cargoId: data.cargoId ? parseInt(data.cargoId) : undefined,
				departureTime: data.departureTime?.toISOString(),
				avoidTolls: data.avoidTolls,
				considerWeather: data.considerWeather,
				considerTraffic: data.considerTraffic,
			};

			setCalculatedRoute(enrichedResult);
			setStep("preview");
		} catch (error) {
			console.error("Ошибка при расчете маршрута:", error);
			setStep("form");
		}
	};

	const handleCreateRoute = async () => {
		try {
			const formData = form.getValues();

			const routeData = {
				name: formData.name,
				startAddress: formData.startAddress,
				endAddress: formData.endAddress,
				startLat: calculatedRoute?.startLat || 0,
				startLon: calculatedRoute?.startLon || 0,
				endLat: calculatedRoute?.endLat || 0,
				endLon: calculatedRoute?.endLon || 0,
				vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
				driverId: formData.driverId ? parseInt(formData.driverId) : undefined,
				cargoId: formData.cargoId ? parseInt(formData.cargoId) : undefined,
				departureTime: formData.departureTime?.toISOString(),
				waypoints: calculatedRoute?.waypoints || [],
			};

			await createRoute(routeData).unwrap();
			navigate("/routes", {
				state: {
					message: "Маршрут успешно создан!",
					type: "success",
				},
			});
		} catch (error) {
			console.error("Ошибка при создании маршрута:", error);
		}
	};

	const getSelectedVehicleName = () => {
		const vehicle = vehicles.find((v) => v.id.toString() === form.watch("vehicleId"));
		return vehicle ? `${vehicle.model} (${vehicle.registrationNumber})` : "";
	};

	const getSelectedDriverName = () => {
		const driver = drivers.find((d) => d.id.toString() === form.watch("driverId"));
		return driver ? `${driver.lastName} ${driver.firstName}` : "";
	};

	const getSelectedCargoName = () => {
		const cargoItem = cargo.find((c) => c.id.toString() === form.watch("cargoId"));
		return cargoItem ? cargoItem.name : "";
	};

	if (step === "calculating") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50">
				<Card className="max-w-md w-full mx-4 border-0 shadow-2xl">
					<CardContent className="p-8 text-center">
						<div className="mb-6">
							<div className="relative mx-auto w-16 h-16 mb-4">
								<Loader2 className="w-16 h-16 text-orange-600 animate-spin" />
								<RouteIcon className="absolute inset-0 w-8 h-8 m-4 text-orange-800" />
							</div>
						</div>
						<h2 className="text-xl font-semibold mb-2">Расчет маршрута</h2>
						<p className="text-muted-foreground mb-4">
							Анализируем оптимальный путь с учетом ваших параметров...
						</p>
						<div className="space-y-2 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="w-4 h-4 text-green-600" />
								Геокодирование адресов
							</div>
							<div className="flex items-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
								Построение маршрута
							</div>
							<div className="flex items-center gap-2 opacity-50">
								<div className="w-4 h-4 rounded-full border-2 border-muted" />
								Анализ рисков
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (step === "preview" && calculatedRoute) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setStep("form")}
							className="border-orange-200 hover:bg-orange-50"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-orange-800 bg-clip-text text-transparent">
							Предварительный просмотр маршрута
						</h1>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Детали маршрута */}
						<Card className="border-0 shadow-xl">
							<CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50 rounded-t-lg">
								<CardTitle className="flex items-center gap-2">
									<RouteIcon className="h-5 w-5 text-orange-600" />
									Детали маршрута
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Название
									</Label>
									<p className="text-lg font-semibold">
										{form.getValues("name")}
									</p>
								</div>

								<Separator />

								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Отправление
											</Label>
											<p>{form.getValues("startAddress")}</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Назначение
											</Label>
											<p>{form.getValues("endAddress")}</p>
										</div>
									</div>
								</div>

								<Separator />

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="text-sm font-medium text-muted-foreground">
											Расстояние
										</Label>
										<p className="text-lg font-semibold text-orange-600">
											{calculatedRoute.distance} км
										</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-muted-foreground">
											Время в пути
										</Label>
										<p className="text-lg font-semibold text-orange-600">
											{Math.round(calculatedRoute.duration / 60)} ч
										</p>
									</div>
								</div>

								{calculatedRoute.estimatedTotalCost && (
									<div>
										<Label className="text-sm font-medium text-muted-foreground">
											Примерная стоимость
										</Label>
										<p className="text-lg font-semibold text-green-600">
											{calculatedRoute.estimatedTotalCost} ₽
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Назначенные ресурсы */}
						<Card className="border-0 shadow-xl">
							<CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50 rounded-t-lg">
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5 text-orange-600" />
									Назначенные ресурсы
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-4">
								{getSelectedVehicleName() && (
									<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
										<Truck className="h-5 w-5 text-blue-600" />
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Транспорт
											</Label>
											<p className="font-medium">
												{getSelectedVehicleName()}
											</p>
										</div>
									</div>
								)}

								{getSelectedDriverName() && (
									<div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
										<User className="h-5 w-5 text-purple-600" />
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Водитель
											</Label>
											<p className="font-medium">{getSelectedDriverName()}</p>
										</div>
									</div>
								)}

								{getSelectedCargoName() && (
									<div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
										<Package className="h-5 w-5 text-orange-600" />
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Груз
											</Label>
											<p className="font-medium">{getSelectedCargoName()}</p>
										</div>
									</div>
								)}

								{form.getValues("departureTime") && (
									<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
										<Calendar className="h-5 w-5 text-green-600" />
										<div>
											<Label className="text-sm font-medium text-muted-foreground">
												Время отправления
											</Label>
											<p className="font-medium">
												{form
													.getValues("departureTime")
													?.toLocaleString("ru-RU")}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Анализ рисков */}
					{(calculatedRoute.overallRiskScore ||
						calculatedRoute.rtoWarnings?.length > 0) && (
						<Card className="border-0 shadow-xl">
							<CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50 rounded-t-lg">
								<CardTitle className="flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-orange-600" />
									Анализ рисков
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								{calculatedRoute.overallRiskScore && (
									<div className="mb-4">
										<Label className="text-sm font-medium text-muted-foreground">
											Общий уровень риска
										</Label>
										<div className="flex items-center gap-2 mt-1">
											<div className="flex-1 bg-gray-200 rounded-full h-2">
												<div
													className={`h-2 rounded-full ${
														calculatedRoute.overallRiskScore < 30
															? "bg-green-500"
															: calculatedRoute.overallRiskScore < 70
																? "bg-yellow-500"
																: "bg-red-500"
													}`}
													style={{
														width: `${calculatedRoute.overallRiskScore}%`,
													}}
												/>
											</div>
											<span className="text-sm font-medium">
												{calculatedRoute.overallRiskScore}%
											</span>
										</div>
									</div>
								)}

								{calculatedRoute.rtoWarnings?.length > 0 && (
									<Alert className="border-yellow-200 bg-yellow-50">
										<AlertCircle className="h-4 w-4 text-yellow-600" />
										<AlertDescription className="text-yellow-800">
											<strong>Предупреждения РТО:</strong>
											<ul className="mt-1 list-disc list-inside space-y-1">
												{calculatedRoute.rtoWarnings.map(
													(warning: string, index: number) => (
														<li key={index}>{warning}</li>
													)
												)}
											</ul>
										</AlertDescription>
									</Alert>
								)}
							</CardContent>
						</Card>
					)}

					{/* Кнопки действий */}
					<div className="flex gap-4 justify-end">
						<Button
							variant="outline"
							onClick={() => setStep("form")}
							className="border-orange-200 hover:bg-orange-50"
						>
							Назад к редактированию
						</Button>
						<Button
							onClick={handleCreateRoute}
							disabled={isCreating}
							className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
						>
							{isCreating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Создание...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Создать маршрут
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => navigate("/routes")}
						className="border-orange-200 hover:bg-orange-50"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-orange-800 bg-clip-text text-transparent">
						Создание маршрута
					</h1>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleCalculateRoute)} className="space-y-6">
						{/* Основная информация о маршруте */}
						<Card className="border-0 shadow-xl overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50">
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5 text-orange-600" />
									Основная информация
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base font-medium">
												Название маршрута
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Например: Москва - Санкт-Петербург"
													className="h-12 text-base border-slate-200 focus:border-orange-400 focus:ring-orange-400"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Укажите понятное название для идентификации маршрута
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="startAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<div className="w-3 h-3 rounded-full bg-green-500"></div>
													Адрес отправления
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Откуда"
														className="h-12 text-base border-slate-200 focus:border-orange-400 focus:ring-orange-400"
														{...field}
													/>
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
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<div className="w-3 h-3 rounded-full bg-red-500"></div>
													Адрес назначения
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Куда"
														className="h-12 text-base border-slate-200 focus:border-orange-400 focus:ring-orange-400"
														{...field}
													/>
												</FormControl>
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
											<FormLabel className="text-base font-medium">
												Описание (опционально)
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Дополнительная информация о маршруте..."
													className="min-h-[80px] border-slate-200 focus:border-orange-400 focus:ring-orange-400"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Назначение ресурсов */}
						<Card className="border-0 shadow-xl overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5 text-blue-600" />
									Назначение ресурсов
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="vehicleId"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<Truck className="h-4 w-4 text-blue-600" />
													Транспортное средство
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-12 text-base border-slate-200 focus:border-orange-400">
															<SelectValue placeholder="Выберите ТС" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{vehiclesLoading ? (
															<SelectItem value="loading" disabled>
																<Loader2 className="h-4 w-4 animate-spin mr-2" />
																Загрузка...
															</SelectItem>
														) : (
															vehicles.map((vehicle) => (
																<SelectItem
																	key={vehicle.id}
																	value={vehicle.id.toString()}
																>
																	<div className="flex items-center gap-2">
																		<Truck className="h-4 w-4" />
																		{vehicle.model} (
																		{vehicle.registrationNumber}
																		)
																	</div>
																</SelectItem>
															))
														)}
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
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<User className="h-4 w-4 text-purple-600" />
													Водитель (опционально)
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-12 text-base border-slate-200 focus:border-orange-400">
															<SelectValue placeholder="Выберите водителя" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{driversLoading ? (
															<SelectItem value="loading" disabled>
																<Loader2 className="h-4 w-4 animate-spin mr-2" />
																Загрузка...
															</SelectItem>
														) : (
															drivers.map((driver) => (
																<SelectItem
																	key={driver.id}
																	value={driver.id.toString()}
																>
																	<div className="flex items-center gap-2">
																		<User className="h-4 w-4" />
																		{driver.lastName}{" "}
																		{driver.firstName}
																	</div>
																</SelectItem>
															))
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="cargoId"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<Package className="h-4 w-4 text-orange-600" />
													Груз (опционально)
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-12 text-base border-slate-200 focus:border-orange-400">
															<SelectValue placeholder="Выберите груз" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{cargoLoading ? (
															<SelectItem value="loading" disabled>
																<Loader2 className="h-4 w-4 animate-spin mr-2" />
																Загрузка...
															</SelectItem>
														) : (
															cargo.map((cargoItem) => (
																<SelectItem
																	key={cargoItem.id}
																	value={cargoItem.id.toString()}
																>
																	<div className="flex items-center gap-2">
																		<Package className="h-4 w-4" />
																		{cargoItem.name}
																	</div>
																</SelectItem>
															))
														)}
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
												<FormLabel className="text-base font-medium flex items-center gap-2">
													<Calendar className="h-4 w-4 text-green-600" />
													Время отправления
												</FormLabel>
												<FormControl>
													<DateTimePicker
														date={field.value}
														setDate={field.onChange}
													/>
												</FormControl>
												<FormDescription>
													Если не указано, будет использовано текущее
													время
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Параметры маршрута */}
						<Card className="border-0 shadow-xl overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
								<CardTitle className="flex items-center gap-2">
									<Navigation className="h-5 w-5 text-purple-600" />
									Параметры маршрута
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<FormField
										control={form.control}
										name="avoidTolls"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-white">
												<div className="space-y-0.5">
													<FormLabel className="text-base font-medium">
														Избегать платных дорог
													</FormLabel>
													<FormDescription>
														Строить маршрут в обход платных участков
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
										name="considerWeather"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-white">
												<div className="space-y-0.5">
													<FormLabel className="text-base font-medium">
														Учитывать погоду
													</FormLabel>
													<FormDescription>
														Анализ погодных условий по маршруту
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
										name="considerTraffic"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-white">
												<div className="space-y-0.5">
													<FormLabel className="text-base font-medium">
														Учитывать трафик
													</FormLabel>
													<FormDescription>
														Оптимизация с учетом загруженности дорог
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
							</CardContent>
						</Card>

						{/* Кнопки действий */}
						<div className="flex gap-4 justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/routes")}
								className="border-orange-200 hover:bg-orange-50"
							>
								Отмена
							</Button>
							<Button
								type="submit"
								disabled={isCalculating}
								className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8"
							>
								{isCalculating ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Расчет...
									</>
								) : (
									<>
										<Navigation className="h-4 w-4 mr-2" />
										Рассчитать маршрут
									</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}

export default CreateRoutePage;
