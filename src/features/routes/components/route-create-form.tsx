import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, MapPin, Save, Truck, Clock, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

import { RouteRequestDto, WaypointDto } from "@/shared/types/backend-sync";

// Схема валидации
const routeFormSchema = z.object({
	name: z.string().min(1, "Название маршрута обязательно"),
	startAddress: z.string().min(1, "Укажите адрес отправления"),
	endAddress: z.string().min(1, "Укажите адрес назначения"),
	vehicleId: z.string().min(1, "Выберите транспортное средство"),
	driverId: z.string().optional(),
	cargoId: z.string().optional(),
	departureTime: z.string().optional(),
	avoidTolls: z.boolean(),
	considerWeather: z.boolean(),
	considerTraffic: z.boolean(),
});

export type RouteFormData = z.infer<typeof routeFormSchema>;

interface Waypoint {
	id: string;
	name: string;
	address: string;
	latitude?: number;
	longitude?: number;
	waypointType: string;
	stayDurationMinutes?: number;
}

const WAYPOINT_TYPES = [
	{ value: "PICKUP", label: "Загрузка" },
	{ value: "DELIVERY", label: "Выгрузка" },
	{ value: "REST", label: "Отдых" },
	{ value: "FUEL", label: "Заправка" },
	{ value: "CUSTOMS", label: "Таможня" },
	{ value: "SERVICE", label: "Сервис" },
	{ value: "OTHER", label: "Другое" },
];

interface RouteCreateFormProps {
	vehicles: any[];
	drivers: any[];
	isCalculating: boolean;
	isCreating: boolean;
	isGeocodingStart: boolean;
	isGeocodingEnd: boolean;
	onCalculate: (data: RouteFormData, waypoints: Waypoint[]) => Promise<void>;
	onSave: (data: RouteFormData, waypoints: Waypoint[]) => Promise<void>;
}

export function RouteCreateForm({
	vehicles,
	drivers,
	isCalculating,
	isCreating,
	isGeocodingStart,
	isGeocodingEnd,
	onCalculate,
	onSave,
}: RouteCreateFormProps) {
	const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

	const form = useForm<RouteFormData>({
		resolver: zodResolver(routeFormSchema),
		defaultValues: {
			name: "",
			startAddress: "",
			endAddress: "",
			vehicleId: "",
			driverId: "",
			cargoId: "",
			departureTime: "",
			avoidTolls: false,
			considerWeather: true,
			considerTraffic: true,
		},
	});

	const addWaypoint = () => {
		const newWaypoint: Waypoint = {
			id: `wp_${Date.now()}`,
			name: "",
			address: "",
			waypointType: "OTHER",
			stayDurationMinutes: 30,
		};
		setWaypoints((prev) => [...prev, newWaypoint]);
	};

	const removeWaypoint = (id: string) => {
		setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
	};

	const updateWaypoint = (id: string, field: keyof Waypoint, value: any) => {
		setWaypoints((prev) => prev.map((wp) => (wp.id === id ? { ...wp, [field]: value } : wp)));
	};

	const handleCalculate = async (data: RouteFormData) => {
		await onCalculate(data, waypoints);
	};

	const handleSave = async (data: RouteFormData) => {
		await onSave(data, waypoints);
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form className="space-y-6">
					{/* Основная информация */}
					<Card className="border-gray-200">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-medium text-gray-900">
								Основная информация
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700">
											Название маршрута
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Введите название маршрута"
												className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Маршрут */}
					<Card className="border-gray-200">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
								<MapPin className="h-5 w-5 text-orange-500" />
								Маршрут
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="startAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												Адрес отправления
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														placeholder="Введите адрес отправления"
														className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
													/>
													{isGeocodingStart && (
														<Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-orange-500" />
													)}
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Адрес назначения
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														placeholder="Введите адрес назначения"
														className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
													/>
													{isGeocodingEnd && (
														<Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-orange-500" />
													)}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Промежуточные точки */}
							{waypoints.length > 0 && (
								<div className="space-y-3">
									<Label className="text-sm font-medium text-gray-700">
										Промежуточные точки
									</Label>
									{waypoints.map((waypoint) => (
										<div
											key={waypoint.id}
											className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
										>
											<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
												<Input
													placeholder="Название точки"
													value={waypoint.name}
													onChange={(e) =>
														updateWaypoint(
															waypoint.id,
															"name",
															e.target.value
														)
													}
													className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
												/>
												<Input
													placeholder="Адрес"
													value={waypoint.address}
													onChange={(e) =>
														updateWaypoint(
															waypoint.id,
															"address",
															e.target.value
														)
													}
													className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
												/>
												<Select
													value={waypoint.waypointType}
													onValueChange={(value) =>
														updateWaypoint(
															waypoint.id,
															"waypointType",
															value
														)
													}
												>
													<SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{WAYPOINT_TYPES.map((type) => (
															<SelectItem
																key={type.value}
																value={type.value}
															>
																{type.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeWaypoint(waypoint.id)}
												className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							<Button
								type="button"
								variant="outline"
								onClick={addWaypoint}
								className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
							>
								<Plus className="h-4 w-4 mr-2" />
								Добавить промежуточную точку
							</Button>
						</CardContent>
					</Card>

					{/* Параметры */}
					<Card className="border-gray-200">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
								<Truck className="h-5 w-5 text-orange-500" />
								Параметры
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="vehicleId"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												Транспортное средство
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
														<SelectValue placeholder="Выберите ТС" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{vehicles.map((vehicle: any) => (
														<SelectItem
															key={vehicle.id}
															value={vehicle.id.toString()}
														>
															{vehicle.registrationNumber} -{" "}
															{vehicle.manufacturer} {vehicle.model}
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Водитель (опционально)
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value || ""}
											>
												<FormControl>
													<SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
														<SelectValue placeholder="Выберите водителя" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="">Не выбран</SelectItem>
													{drivers.map((driver: any) => (
														<SelectItem
															key={driver.id}
															value={driver.id.toString()}
														>
															{driver.firstName} {driver.lastName}
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
								name="departureTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
											<Clock className="h-4 w-4" />
											Время отправления (опционально)
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="datetime-local"
												className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Настройки маршрута */}
							<div className="space-y-3">
								<Label className="text-sm font-medium text-gray-700">
									Настройки маршрута
								</Label>
								<div className="space-y-3">
									<FormField
										control={form.control}
										name="avoidTolls"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
												<div>
													<FormLabel className="text-sm font-medium text-gray-700">
														Избегать платных дорог
													</FormLabel>
													<p className="text-xs text-gray-500">
														Прокладывать маршрут без платных участков
													</p>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
														className="data-[state=checked]:bg-orange-500"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="considerWeather"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
												<div>
													<FormLabel className="text-sm font-medium text-gray-700">
														Учитывать погоду
													</FormLabel>
													<p className="text-xs text-gray-500">
														Анализировать погодные условия
													</p>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
														className="data-[state=checked]:bg-orange-500"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="considerTraffic"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
												<div>
													<FormLabel className="text-sm font-medium text-gray-700">
														Учитывать трафик
													</FormLabel>
													<p className="text-xs text-gray-500">
														Прогнозировать пробки
													</p>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
														className="data-[state=checked]:bg-orange-500"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Кнопки управления */}
					<div className="flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={form.handleSubmit(handleCalculate)}
							disabled={isCalculating || isGeocodingStart || isGeocodingEnd}
							className="border-orange-500 text-orange-600 hover:bg-orange-50"
						>
							{isCalculating ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Calculator className="h-4 w-4 mr-2" />
							)}
							Рассчитать
						</Button>
						<Button
							type="button"
							onClick={form.handleSubmit(handleSave)}
							disabled={isCreating}
							className="bg-orange-500 hover:bg-orange-600 text-white"
						>
							{isCreating ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Сохранить
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
