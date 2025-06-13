import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { GeocodingInput } from "./geocoding-input";
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
} from "lucide-react";

const routeSchema = z.object({
	startAddress: z.string().min(1, "Укажите точку отправления"),
	endAddress: z.string().min(1, "Укажите точку назначения"),
	vehicleId: z.string().optional(),
	driverId: z.string().optional(),
	departureTime: z.string().optional(),
});

interface RouteFormProps {
	onSubmit: (data: any) => void;
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
	} = useForm<z.infer<typeof routeSchema>>({
		resolver: zodResolver(routeSchema),
	});

	const watchedValues = watch();

	// Погода для пункта назначения
	const { data: arrivalWeather, isLoading: isWeatherLoading } = useGetWeatherForArrivalQuery(
		{
			lat: endCoordinates?.lat || 0,
			lon: endCoordinates?.lon || 0,
			arrivalTime: estimatedArrivalTime?.toISOString() || new Date().toISOString(),
		},
		{
			skip: !endCoordinates || !estimatedArrivalTime,
		}
	);

	// Установка текущего местоположения
	useEffect(() => {
		if (currentLocation && !startCoordinates) {
			setStartCoordinates(currentLocation);
			setValue(
				"startAddress",
				`${currentLocation.lat.toFixed(6)}, ${currentLocation.lon.toFixed(6)}`
			);
		}
	}, [currentLocation, startCoordinates, setValue]);

	// Расчет примерного времени прибытия при изменении времени отправления
	useEffect(() => {
		if (watchedValues.departureTime && startCoordinates && endCoordinates) {
			const departureDate = new Date(watchedValues.departureTime);
			// Простой расчет времени в пути (можно улучшить)
			const estimatedDuration = calculateTravelTime(startCoordinates, endCoordinates);
			const arrivalDate = new Date(departureDate.getTime() + estimatedDuration * 60 * 1000);
			setEstimatedArrivalTime(arrivalDate);
		}
	}, [watchedValues.departureTime, startCoordinates, endCoordinates]);

	// Функция расчета примерного времени в пути (в минутах)
	const calculateTravelTime = (start: Coordinates, end: Coordinates): number => {
		const distance = calculateDistance(start.lat, start.lon, end.lat, end.lon);
		// Примерная скорость 60 км/ч
		return Math.round((distance / 60) * 60);
	};

	// Функция расчета расстояния между двумя точками (формула гаверсинуса)
	const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
		const R = 6371; // Радиус Земли в км
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
				Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const deg2rad = (deg: number): number => {
		return deg * (Math.PI / 180);
	};

	const handleFormSubmit = (data: z.infer<typeof routeSchema>) => {
		if (!startCoordinates || !endCoordinates) {
			return;
		}

		const submitData = {
			...data,
			startLat: startCoordinates.lat,
			startLon: startCoordinates.lon,
			endLat: endCoordinates.lat,
			endLon: endCoordinates.lon,
			estimatedArrivalTime: estimatedArrivalTime?.toISOString(),
		};

		onSubmit(submitData);
	};

	const handleStartAddressChange = (address: string, coordinates?: Coordinates) => {
		setValue("startAddress", address);
		if (coordinates) {
			setStartCoordinates(coordinates);
		}
	};

	const handleEndAddressChange = (address: string, coordinates?: Coordinates) => {
		setValue("endAddress", address);
		if (coordinates) {
			setEndCoordinates(coordinates);
		}
	};

	const handleVehicleSelect = (vehicleId: string) => {
		setSelectedVehicleId(vehicleId);
		setValue("vehicleId", vehicleId);
	};

	const handleDriverSelect = (driverId: string) => {
		setSelectedDriverId(driverId);
		setValue("driverId", driverId);
	};

	const getVehicleIcon = (type: string) => {
		return type === "truck" ? Truck : User;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "available":
				return "bg-green-500";
			case "busy":
				return "bg-red-500";
			case "maintenance":
				return "bg-yellow-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
			{/* Маршрут */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Navigation className="h-5 w-5 text-orange-500" />
					Маршрут
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<GeocodingInput
							label="Точка отправления"
							value={watchedValues.startAddress}
							onChange={handleStartAddressChange}
							error={errors.startAddress?.message}
							placeholder="Введите адрес или название места"
						/>
					</div>

					<div>
						<GeocodingInput
							label="Точка назначения"
							value={watchedValues.endAddress}
							onChange={handleEndAddressChange}
							error={errors.endAddress?.message}
							placeholder="Введите адрес или название места"
						/>
					</div>
				</div>

				<div>
					<Label className="flex items-center gap-2 mb-2">
						<CalendarIcon className="w-4 h-4 text-muted-foreground" />
						Время отправления
					</Label>
					<Input
						type="datetime-local"
						{...register("departureTime")}
						className="w-full"
						defaultValue={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} // +1 час от текущего времени
					/>
				</div>
			</div>

			{/* Транспортные средства */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Truck className="h-5 w-5 text-blue-500" />
					Транспортное средство
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{vehicles?.map((vehicle) => {
						const VehicleIcon = getVehicleIcon(vehicle.type || "truck");
						const isSelected = selectedVehicleId === vehicle.id.toString();
						const isAvailable = true; // Все ТС доступны пока что

						return (
							<Card
								key={vehicle.id}
								className={cn(
									"cursor-pointer transition-all duration-200 hover:shadow-lg",
									isSelected
										? "ring-2 ring-orange-500 bg-orange-50 border-orange-200"
										: "hover:border-orange-200"
								)}
								onClick={() => handleVehicleSelect(vehicle.id.toString())}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div className="relative">
											<Avatar className="w-12 h-12 border-2 border-background shadow-md">
												<AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
													<VehicleIcon className="h-6 w-6 text-blue-600" />
												</AvatarFallback>
											</Avatar>
											{isSelected && (
												<div className="absolute -bottom-1 -right-1">
													<CheckCircle2 className="h-4 w-4 text-green-600 bg-background rounded-full" />
												</div>
											)}
										</div>

										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold text-sm">
													{vehicle.registrationNumber}
												</h4>
												<Badge variant="secondary" className="text-xs">
													Доступен
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground">
												{vehicle.model}
											</p>
											<div className="flex gap-2 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Zap className="h-3 w-3" />
													{vehicle.grossWeightKg}кг
												</span>
												<span className="flex items-center gap-1">
													<Fuel className="h-3 w-3" />
													{vehicle.fuelConsumptionPer100km}л/100км
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Водители */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<User className="h-5 w-5 text-green-500" />
					Водитель
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{drivers?.map((driver) => {
						const isSelected = selectedDriverId === driver.id.toString();
						const isAvailable = true; // Все водители доступны пока что

						return (
							<Card
								key={driver.id}
								className={cn(
									"cursor-pointer transition-all duration-200 hover:shadow-lg",
									isSelected
										? "ring-2 ring-orange-500 bg-orange-50 border-orange-200"
										: "hover:border-orange-200"
								)}
								onClick={() => handleDriverSelect(driver.id.toString())}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div className="relative">
											<Avatar className="w-12 h-12 border-2 border-background shadow-md">
												<AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-semibold text-sm">
													{driver.firstName?.[0]}
													{driver.lastName?.[0]}
												</AvatarFallback>
											</Avatar>
											{isSelected && (
												<div className="absolute -bottom-1 -right-1">
													<CheckCircle2 className="h-4 w-4 text-green-600 bg-background rounded-full" />
												</div>
											)}
										</div>

										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold text-sm">
													{driver.firstName} {driver.lastName}
												</h4>
												<Badge variant="secondary" className="text-xs">
													Доступен
												</Badge>
											</div>
											<div className="flex items-center gap-1 text-xs">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={cn(
															"h-3 w-3",
															i < 4
																? "text-yellow-400 fill-current"
																: "text-gray-300"
														)}
													/>
												))}
												<span className="text-muted-foreground ml-1">
													4.8
												</span>
											</div>
											<div className="flex gap-2 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Clock className="h-3 w-3" />5 лет
												</span>
												<span>{driver.phoneNumber}</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Прогноз погоды */}
			{arrivalWeather && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<CloudIcon className="h-5 w-5 text-purple-500" />
						Погода в пункте назначения
					</h3>
					<Card className="border-purple-200 bg-purple-50">
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								<div className="text-2xl">
									{arrivalWeather.current?.temperature > 0 ? "☀️" : "❄️"}
								</div>
								<div>
									<p className="font-semibold">
										{arrivalWeather.current?.temperature}°C
									</p>
									<p className="text-sm text-muted-foreground">
										{arrivalWeather.current?.description}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			<Button
				type="submit"
				disabled={isLoading || !startCoordinates || !endCoordinates}
				className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
			>
				{isLoading ? "Расчет маршрута..." : "Рассчитать маршрут"}
			</Button>
		</form>
	);
}
