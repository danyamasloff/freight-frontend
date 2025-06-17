// freight-frontend/src/features/routes/components/route-planner/route-form.tsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { cn } from "@/lib/utils";
import { PlaceSearchEnhanced } from "@/features/geocoding/components/place-search-enhanced";
import { useGetVehiclesQuery } from "@/shared/api/vehiclesApiSlice";
import { useGetDriversQuery } from "@/shared/api/driversSlice";
import { useGetWeatherForArrivalQuery } from "@/shared/api/weatherSlice";
import {
	CalendarIcon,
	Truck,
	User,
	CloudIcon,
	Star,
	Zap,
	Fuel,
	MapPin,
	Clock,
	CheckCircle2,
	Navigation,
	Car,
	Users,
	Package,
	TrendingUp,
	RefreshCw,
	Phone,
	Award,
	Gauge,
	Battery,
	Wrench,
	AlertTriangle,
} from "lucide-react";
import type { RouteFormData } from "../../types";
import type { GeoLocationDto } from "@/shared/api/geocodingSlice";

const routeSchema = z.object({
	startAddress: z.string().min(1, "Укажите точку отправления"),
	endAddress: z.string().min(1, "Укажите точку назначения"),
	vehicleId: z.string().optional(),
	driverId: z.string().optional(),
	departureTime: z.string().optional(),
});

interface RouteFormProps {
	onSubmit: (data: RouteFormData) => void;
	isLoading: boolean;
	currentLocation?: { lat: number; lon: number } | null;
}

interface Coordinates {
	lat: number;
	lon: number;
}

export function RouteForm({ onSubmit, isLoading, currentLocation }: RouteFormProps) {
	const [startCoordinates, setStartCoordinates] = useState<Coordinates | null>(null);
	const [endCoordinates, setEndCoordinates] = useState<Coordinates | null>(null);
	const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<Date | null>(null);
	const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
	const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

	const { data: vehicles } = useGetVehiclesQuery();
	const { data: drivers } = useGetDriversQuery();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
		getValues,
	} = useForm<z.infer<typeof routeSchema>>({
		resolver: zodResolver(routeSchema),
		defaultValues: {
			departureTime: new Date().toISOString().slice(0, 16),
		},
	});

	const watchedValues = watch();

	// Погода для пункта назначения
	const { data: arrivalWeather } = useGetWeatherForArrivalQuery(
		{
			lat: endCoordinates?.lat || 0,
			lon: endCoordinates?.lon || 0,
			arrivalTime: estimatedArrivalTime?.toISOString() || new Date().toISOString(),
		},
		{
			skip: !endCoordinates || !estimatedArrivalTime,
		}
	);

	// Использование текущего местоположения
	useEffect(() => {
		if (currentLocation && !startCoordinates) {
			setStartCoordinates(currentLocation);
		}
	}, [currentLocation, startCoordinates]);

	// Расчет примерного времени прибытия
	useEffect(() => {
		if (watchedValues.departureTime && endCoordinates) {
			const departureDate = new Date(watchedValues.departureTime);
			const estimatedDuration = 6; // часов (заглушка)
			const arrivalDate = new Date(
				departureDate.getTime() + estimatedDuration * 60 * 60 * 1000
			);
			setEstimatedArrivalTime(arrivalDate);
		}
	}, [watchedValues.departureTime, endCoordinates]);

	const handleFormSubmit = (data: z.infer<typeof routeSchema>) => {
		if (!startCoordinates || !endCoordinates) {
			return;
		}

		onSubmit({
			...data,
			startLat: startCoordinates.lat,
			startLon: startCoordinates.lon,
			endLat: endCoordinates.lat,
			endLon: endCoordinates.lon,
		});
	};

	const handleVehicleSelect = (vehicleId: string) => {
		setSelectedVehicleId(vehicleId);
		setValue("vehicleId", vehicleId);
	};

	const handleDriverSelect = (driverId: string) => {
		setSelectedDriverId(driverId);
		setValue("driverId", driverId);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
			{/* Точки маршрута */}
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
						<MapPin className="h-5 w-5 text-orange-500" />
					</div>
					<h3 className="text-xl font-bold">Маршрут</h3>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-3">
						<Label className="font-medium flex items-center gap-2">
							<MapPin className="h-4 w-4 text-green-500" />
							Точка отправления
						</Label>
						<div className="relative">
							<PlaceSearchEnhanced
								value={watchedValues.startAddress || ""}
								onChange={(value) => setValue("startAddress", value)}
								onPlaceSelect={(place: GeoLocationDto) => {
									const lat = place.latitude || place.lat || 0;
									const lon = place.longitude || place.lon || 0;
									setStartCoordinates({ lat, lon });
									setValue("startAddress", place.displayName || place.name || "");
								}}
								placeholder="Введите адрес отправления"
								currentLocation={currentLocation || undefined}
								showNearbyServices={true}
							/>
							{currentLocation && (
								<Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-500 text-xs">
									GPS
								</Badge>
							)}
						</div>
						{errors.startAddress && (
							<p className="text-sm text-red-400 mt-1">
								{errors.startAddress.message}
							</p>
						)}
					</div>

					<div className="space-y-3">
						<Label className="font-medium flex items-center gap-2">
							<MapPin className="h-4 w-4 text-red-500" />
							Точка назначения
						</Label>
						<div className="relative">
							<PlaceSearchEnhanced
								value={watchedValues.endAddress || ""}
								onChange={(value) => setValue("endAddress", value)}
								onPlaceSelect={(place: GeoLocationDto) => {
									const lat = place.latitude || place.lat || 0;
									const lon = place.longitude || place.lon || 0;
									setEndCoordinates({ lat, lon });
									setValue("endAddress", place.displayName || place.name || "");
								}}
								placeholder="Введите адрес назначения"
								currentLocation={currentLocation || undefined}
								showNearbyServices={true}
							/>
						</div>
						{errors.endAddress && (
							<p className="text-sm text-red-400 mt-1">{errors.endAddress.message}</p>
						)}
					</div>
				</div>

				{/* Время отправления */}
				<div className="space-y-3">
					<Label htmlFor="departureTime" className="font-medium flex items-center gap-2">
						<Clock className="h-4 w-4 text-orange-500" />
						Время отправления
					</Label>
					<DateTimePicker
						value={watchedValues.departureTime}
						onChange={(value) => setValue("departureTime", value)}
						placeholder="Выберите дату и время отправления"
						className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
					/>
				</div>
			</div>

			{/* Выбор транспортного средства */}
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
						<Truck className="h-5 w-5 text-orange-500" />
					</div>
					<h3 className="text-xl font-bold">Транспортное средство</h3>
					<Badge
						variant="outline"
						className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-300"
					>
						{vehicles?.length || 0} доступно
					</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{vehicles?.map((vehicle: any) => {
						const isSelected = selectedVehicleId === vehicle.id.toString();
						return (
							<Card
								key={vehicle.id}
								className={cn(
									"cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden",
									isSelected
										? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 shadow-lg shadow-orange-500/20"
										: "hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10"
								)}
								onClick={() => handleVehicleSelect(vehicle.id.toString())}
							>
								<CardContent className="p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"p-2 rounded-lg transition-all duration-300",
													isSelected
														? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
														: "bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20"
												)}
											>
												<Truck className="h-4 w-4" />
											</div>
											<div>
												<h4
													className={cn(
														"font-semibold text-sm transition-colors",
														isSelected
															? "text-orange-900 dark:text-orange-100"
															: ""
													)}
												>
													{vehicle.brand} {vehicle.model}
												</h4>
												<p className="text-xs text-muted-foreground">
													{vehicle.plateNumber}
												</p>
											</div>
										</div>
										{isSelected && (
											<div className="p-1 rounded-full bg-orange-500 shadow-lg">
												<CheckCircle2 className="h-4 w-4 text-white" />
											</div>
										)}
									</div>

									{/* Основные характеристики */}
									<div className="space-y-2 mb-3">
										<div className="grid grid-cols-2 gap-2 text-xs">
											<div className="flex items-center gap-1">
												<Package className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{vehicle.loadCapacity || 0} т
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Gauge className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{vehicle.fuelConsumptionLper100km ||
														vehicle.fuelConsumption ||
														0}{" "}
													л/100км
												</span>
											</div>
											<div className="flex items-center gap-1 relative">
												<Battery className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{vehicle.currentFuelL || vehicle.fuelLevel || 0}
													{vehicle.currentFuelL ? " л" : "%"}
												</span>
												{(vehicle.currentFuelL || vehicle.fuelLevel || 0) <
													20 && (
													<AlertTriangle className="h-2 w-2 text-red-500 ml-1" />
												)}
											</div>
											<div className="flex items-center gap-1">
												<Navigation className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{(vehicle.odometer || 0).toLocaleString()} км
												</span>
											</div>
										</div>
									</div>

									{/* Дополнительная информация */}
									<div className="space-y-1 text-xs">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Текущий груз:
											</span>
											<span className="font-medium">
												{vehicle.currentLoad
													? `${vehicle.currentLoad} т`
													: "Пустой"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Последнее ТО:
											</span>
											<span
												className={cn(
													"font-medium",
													vehicle.maintenanceStatus === "OVERDUE"
														? "text-red-500"
														: vehicle.maintenanceStatus === "DUE_SOON"
															? "text-orange-500"
															: ""
												)}
											>
												{vehicle.lastMaintenanceDate
													? new Date(
															vehicle.lastMaintenanceDate
														).toLocaleDateString("ru-RU")
													: "Н/Д"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Местоположение:
											</span>
											<span
												className="font-medium truncate max-w-[120px]"
												title={vehicle.lastKnownLocation || "Неизвестно"}
											>
												{vehicle.lastKnownLocation ||
													vehicle.currentCity ||
													"Неизвестно"}
											</span>
										</div>
									</div>

									{/* Статус и доступность */}
									<div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-500/20">
										<div className="flex items-center justify-between">
											<Badge
												variant={
													vehicle.status === "AVAILABLE"
														? "default"
														: "secondary"
												}
												className={cn(
													"text-xs font-medium",
													vehicle.status === "AVAILABLE"
														? "bg-green-500 hover:bg-green-500 text-white"
														: ""
												)}
											>
												{vehicle.status === "AVAILABLE"
													? "Доступен"
													: vehicle.status === "IN_USE"
														? "В работе"
														: vehicle.status === "MAINTENANCE"
															? "ТО"
															: "Недоступен"}
											</Badge>
											<div className="flex items-center gap-1">
												<div
													className={cn(
														"w-2 h-2 rounded-full",
														vehicle.status === "AVAILABLE"
															? "bg-green-500"
															: vehicle.status === "IN_USE"
																? "bg-orange-500"
																: "bg-red-500"
													)}
												/>
												<span className="text-xs text-muted-foreground">
													{vehicle.lastUpdated ? "Обновлено" : "Статус"}
												</span>
											</div>
										</div>
									</div>

									{/* Особенности и возможности */}
									{(vehicle.features || vehicle.specialEquipment) && (
										<div className="flex flex-wrap gap-1 mt-3">
											{vehicle.features
												?.slice(0, 2)
												.map((feature: string, index: number) => (
													<Badge
														key={index}
														variant="outline"
														className="text-xs px-2 py-0 border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-300"
													>
														{feature}
													</Badge>
												))}
											{vehicle.specialEquipment
												?.slice(0, 1)
												.map((equipment: string, index: number) => (
													<Badge
														key={`eq-${index}`}
														variant="secondary"
														className="text-xs px-2 py-0 bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200"
													>
														{equipment}
													</Badge>
												))}
										</div>
									)}

									{/* Decorative element */}
									<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Выбор водителя */}
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<User className="h-5 w-5 text-primary" />
					<h3 className="text-xl font-bold">Водитель</h3>
					<Badge variant="outline">{drivers?.length || 0} доступно</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{drivers?.map((driver: any) => {
						const isSelected = selectedDriverId === driver.id.toString();
						return (
							<Card
								key={driver.id}
								className={cn(
									"cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden",
									isSelected
										? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 shadow-lg shadow-orange-500/20"
										: "hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10"
								)}
								onClick={() => handleDriverSelect(driver.id.toString())}
							>
								<CardContent className="p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"p-2 rounded-lg transition-all duration-300",
													isSelected
														? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
														: "bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20"
												)}
											>
												<User className="h-4 w-4" />
											</div>
											<div>
												<h4
													className={cn(
														"font-semibold text-sm transition-colors",
														isSelected
															? "text-orange-900 dark:text-orange-100"
															: ""
													)}
												>
													{driver.firstName} {driver.lastName}
												</h4>
												<p className="text-xs text-muted-foreground">
													{driver.licenseNumber}
												</p>
											</div>
										</div>
										{isSelected && (
											<div className="p-1 rounded-full bg-orange-500 shadow-lg">
												<CheckCircle2 className="h-4 w-4 text-white" />
											</div>
										)}
									</div>

									{/* Основные характеристики */}
									<div className="space-y-2 mb-3">
										<div className="grid grid-cols-2 gap-2 text-xs">
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{driver.rating || 4.8}/5
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Award className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{driver.drivingExperienceYears ||
														driver.experienceYears ||
														5}{" "}
													лет
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Phone className="h-3 w-3 text-orange-500" />
												<span className="font-medium truncate max-w-[80px]">
													{driver.phone || "Не указан"}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Gauge className="h-3 w-3 text-orange-500" />
												<span className="font-medium">
													{driver.averageFuelConsumption || "25"} л/100км
												</span>
											</div>
										</div>
									</div>

									{/* Дополнительная информация */}
									<div className="space-y-1 text-xs">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Текущий статус:
											</span>
											<div className="flex items-center gap-1">
												<div
													className={cn(
														"w-2 h-2 rounded-full",
														driver.status === "AVAILABLE" ||
															driver.status === "ON_DUTY"
															? "bg-green-500"
															: driver.status === "DRIVING"
																? "bg-orange-500"
																: "bg-red-500"
													)}
												/>
												<span className="font-medium">
													{driver.status === "AVAILABLE" ||
													driver.status === "ON_DUTY"
														? "Доступен"
														: driver.status === "DRIVING"
															? "В рейсе"
															: "Недоступен"}
												</span>
											</div>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Часы работы:
											</span>
											<span className="font-medium">
												{driver.workingHours ||
													driver.currentWorkingHours ||
													"8"}
												/12 ч
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Пробег:</span>
											<span className="font-medium">
												{(
													driver.totalKm ||
													driver.totalMileage ||
													0
												).toLocaleString()}{" "}
												км
											</span>
										</div>
									</div>

									{/* Статус и доступность */}
									<div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-500/20">
										<div className="flex items-center justify-between">
											<Badge
												variant={
													driver.status === "AVAILABLE" ||
													driver.status === "ON_DUTY"
														? "default"
														: "secondary"
												}
												className={cn(
													"text-xs font-medium",
													driver.status === "AVAILABLE" ||
														driver.status === "ON_DUTY"
														? "bg-green-500 hover:bg-green-500 text-white"
														: driver.status === "DRIVING"
															? "bg-orange-500 hover:bg-orange-500 text-white"
															: ""
												)}
											>
												{driver.status === "AVAILABLE" ||
												driver.status === "ON_DUTY"
													? "Доступен"
													: driver.status === "DRIVING"
														? "В рейсе"
														: driver.status === "REST"
															? "Отдыхает"
															: "Недоступен"}
											</Badge>
											<div className="flex items-center gap-1">
												<div
													className={cn(
														"w-2 h-2 rounded-full animate-pulse",
														driver.status === "AVAILABLE" ||
															driver.status === "ON_DUTY"
															? "bg-green-500"
															: driver.status === "DRIVING"
																? "bg-orange-500"
																: "bg-red-500"
													)}
												/>
												<span className="text-xs text-muted-foreground">
													{driver.lastActivity || driver.lastActiveTime
														? new Date(
																driver.lastActivity ||
																	driver.lastActiveTime
															).toLocaleTimeString("ru-RU", {
																hour: "2-digit",
																minute: "2-digit",
															})
														: "Н/Д"}
												</span>
											</div>
										</div>
									</div>

									{/* Особенности и квалификации */}
									{(driver.categories || driver.specializations) && (
										<div className="flex flex-wrap gap-1 mt-3">
											{driver.categories
												?.slice(0, 2)
												.map((category: string, index: number) => (
													<Badge
														key={index}
														variant="outline"
														className="text-xs px-2 py-0 border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-300"
													>
														{category}
													</Badge>
												))}
											{driver.specializations
												?.slice(0, 1)
												.map((spec: string, index: number) => (
													<Badge
														key={`spec-${index}`}
														variant="secondary"
														className="text-xs px-2 py-0 bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200"
													>
														{spec}
													</Badge>
												))}
										</div>
									)}

									{/* Decorative element */}
									<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Погодные условия в пункте назначения */}
			{arrivalWeather && (
				<Card className="bg-slate-900 border-slate-800 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-white">
							<div className="p-2 rounded-lg bg-blue-500/20">
								<CloudIcon className="h-5 w-5 text-blue-400" />
							</div>
							Погода в пункте назначения
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<div className="text-3xl font-bold text-white">
								{Math.round(arrivalWeather.temperature)}°C
							</div>
							<div className="flex-1">
								<p className="text-slate-300 font-medium">
									{arrivalWeather.weatherDescription ||
										arrivalWeather.weatherMain ||
										"Данные недоступны"}
								</p>
								<p className="text-sm text-slate-400 mt-1">
									Прибытие:{" "}
									{estimatedArrivalTime?.toLocaleDateString("ru-RU", {
										day: "2-digit",
										month: "2-digit",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Кнопка расчета */}
			<div className="pt-6">
				<Button
					type="submit"
					disabled={!startCoordinates || !endCoordinates || isLoading}
					className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
				>
					{isLoading ? (
						<div className="flex items-center gap-3">
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Расчет маршрута...
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Zap className="h-5 w-5" />
							Рассчитать маршрут
						</div>
					)}
				</Button>
			</div>
		</form>
	);
}
