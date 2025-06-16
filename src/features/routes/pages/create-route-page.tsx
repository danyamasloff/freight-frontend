// src/features/routes/pages/create-route-page.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCreateRouteMutation } from "@/shared/api/routesSlice";
import { useGetVehiclesQuery } from "@/shared/api/vehiclesApiSlice";
import { useGetDriversQuery } from "@/shared/api/driversSlice";
import { useGetCargosQuery } from "@/shared/api/cargoSlice";
import { YMaps, Map, Placemark, Polyline } from "@pbe/react-yandex-maps";
import { PlaceSearchEnhanced } from "@/features/geocoding/components/place-search-enhanced";
import {
	MapPin,
	Navigation,
	Calendar,
	Clock,
	Truck,
	User,
	Package,
	Plus,
	X,
	AlertCircle,
	CheckCircle2,
	Loader2,
	Route as RouteIcon,
	MapPinned,
	Zap,
	Fuel,
	Coffee,
	PackageCheck,
	Settings,
	Save,
	ArrowRight,
	Target,
	Timer,
	Weight,
	DollarSign,
	Trash2,
	UserCheck,
	TruckIcon,
	Utensils,
	Car,
	Building,
	CreditCard,
	Cross,
} from "lucide-react";
import type { RouteCreateUpdate } from "@/shared/api/routesSlice";
import type { GeoLocationDto } from "@/shared/api/geocodingSlice";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useFindFuelStationsQuery,
	useFindRestAreasQuery,
	useFindFoodStopsQuery,
	useFindParkingSpotsQuery,
	useFindLodgingQuery,
	useFindAtmsQuery,
	useFindPharmaciesQuery,
	useFindHospitalsQuery,
	useLazyReverseGeocodeQuery,
} from "@/shared/api/geocodingSlice";

interface Waypoint {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	waypointType:
		| "PICKUP"
		| "DELIVERY"
		| "REST"
		| "FUEL"
		| "FOOD"
		| "PARKING"
		| "LODGING"
		| "ATMS"
		| "PHARMACIES"
		| "HOSPITALS";
	stayDurationMinutes?: number;
}

const waypointTypeConfig = {
	PICKUP: {
		label: "Загрузка",
		icon: Package,
		color: "text-blue-500",
		bgColor: "bg-blue-50",
		borderColor: "border-blue-200",
		gradient: "from-blue-500 to-blue-600",
	},
	DELIVERY: {
		label: "Выгрузка",
		icon: Truck,
		color: "text-green-500",
		bgColor: "bg-green-50",
		borderColor: "border-green-200",
		gradient: "from-green-500 to-green-600",
	},
	REST: {
		label: "Отдых",
		icon: Coffee,
		color: "text-purple-500",
		bgColor: "bg-purple-50",
		borderColor: "border-purple-200",
		gradient: "from-purple-500 to-purple-600",
	},
	FUEL: {
		label: "АЗС",
		icon: Fuel,
		color: "text-orange-500",
		bgColor: "bg-orange-50",
		borderColor: "border-orange-200",
		gradient: "from-orange-500 to-orange-600",
	},
	FOOD: {
		label: "Еда",
		icon: Utensils,
		color: "text-green-600",
		bgColor: "bg-green-50",
		borderColor: "border-green-200",
		gradient: "from-green-500 to-green-600",
	},
	PARKING: {
		label: "Парковка",
		icon: Car,
		color: "text-blue-600",
		bgColor: "bg-blue-50",
		borderColor: "border-blue-200",
		gradient: "from-blue-500 to-blue-600",
	},
	LODGING: {
		label: "Отели",
		icon: Building,
		color: "text-indigo-600",
		bgColor: "bg-indigo-50",
		borderColor: "border-indigo-200",
		gradient: "from-indigo-500 to-indigo-600",
	},
	ATMS: {
		label: "Банкоматы",
		icon: CreditCard,
		color: "text-yellow-600",
		bgColor: "bg-yellow-50",
		borderColor: "border-yellow-200",
		gradient: "from-yellow-500 to-yellow-600",
	},
	PHARMACIES: {
		label: "Аптеки",
		icon: Cross,
		color: "text-red-600",
		bgColor: "bg-red-50",
		borderColor: "border-red-200",
		gradient: "from-red-500 to-red-600",
	},
	HOSPITALS: {
		label: "Больницы",
		icon: Cross,
		color: "text-red-700",
		bgColor: "bg-red-50",
		borderColor: "border-red-200",
		gradient: "from-red-600 to-red-700",
	},
};

const getDriverStatusIcon = (status: string) => {
	switch (status) {
		case "ON_DUTY":
			return <UserCheck className="h-4 w-4 text-green-500" />;
		case "DRIVING":
			return <Navigation className="h-4 w-4 text-blue-500" />;
		case "OFF_DUTY":
			return <User className="h-4 w-4 text-gray-500" />;
		default:
			return <User className="h-4 w-4 text-gray-400" />;
	}
};

const getVehicleIcon = (vehicle: any) => {
	if (vehicle.hasRefrigerator) {
		return <TruckIcon className="h-4 w-4 text-blue-500" />;
	}
	if (vehicle.hasDangerousGoodsPermission) {
		return <AlertCircle className="h-4 w-4 text-red-500" />;
	}
	return <Truck className="h-4 w-4 text-gray-600" />;
};

const getCargoIcon = (cargo: any) => {
	if (cargo.isDangerous) {
		return <AlertCircle className="h-4 w-4 text-red-500" />;
	}
	if (cargo.requiresRefrigeration) {
		return <PackageCheck className="h-4 w-4 text-blue-500" />;
	}
	return <Package className="h-4 w-4 text-gray-600" />;
};

// Компонент для отображения автоматических предложений мест по категориям
interface CategoryPlaceSelectorProps {
	waypointIndex: number;
	categoryType: string;
	currentLocation: { type: string; lat?: number; lon?: number };
	onPlaceSelect: (place: GeoLocationDto) => void;
	onCancel: () => void;
}

function CategoryPlaceSelector({
	waypointIndex,
	categoryType,
	currentLocation,
	onPlaceSelect,
	onCancel,
}: CategoryPlaceSelectorProps) {
	const { lat = 55.7558, lon = 37.6176 } = currentLocation;

	// Выбираем правильный хук в зависимости от типа категории
	const fuelQuery = useFindFuelStationsQuery(
		{ lat, lon, radius: 10000 },
		{ skip: categoryType !== "FUEL" }
	);
	const restQuery = useFindRestAreasQuery(
		{ lat, lon, radius: 15000 },
		{ skip: categoryType !== "REST" }
	);
	const foodQuery = useFindFoodStopsQuery(
		{ lat, lon, radius: 10000 },
		{ skip: categoryType !== "FOOD" }
	);
	const parkingQuery = useFindParkingSpotsQuery(
		{ lat, lon, radius: 10000 },
		{ skip: categoryType !== "PARKING" }
	);
	const lodgingQuery = useFindLodgingQuery(
		{ lat, lon, radius: 20000 },
		{ skip: categoryType !== "LODGING" }
	);
	const atmsQuery = useFindAtmsQuery(
		{ lat, lon, radius: 5000 },
		{ skip: categoryType !== "ATMS" }
	);
	const pharmaciesQuery = useFindPharmaciesQuery(
		{ lat, lon, radius: 5000 },
		{ skip: categoryType !== "PHARMACIES" }
	);
	const hospitalsQuery = useFindHospitalsQuery(
		{ lat, lon, radius: 10000 },
		{ skip: categoryType !== "HOSPITALS" }
	);

	// Получаем данные в зависимости от типа
	const getCurrentQuery = () => {
		switch (categoryType) {
			case "FUEL":
				return fuelQuery;
			case "REST":
				return restQuery;
			case "FOOD":
				return foodQuery;
			case "PARKING":
				return parkingQuery;
			case "LODGING":
				return lodgingQuery;
			case "ATMS":
				return atmsQuery;
			case "PHARMACIES":
				return pharmaciesQuery;
			case "HOSPITALS":
				return hospitalsQuery;
			default:
				return { data: [], isLoading: false, error: null };
		}
	};

	const { data: places = [], isLoading, error } = getCurrentQuery();
	const config = waypointTypeConfig[categoryType as keyof typeof waypointTypeConfig];
	const Icon = config?.icon || MapPin;

	if (isLoading) {
		return (
			<div className="p-4 border border-border rounded-lg bg-card">
				<div className="flex items-center justify-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin text-orange-500" />
					<span className="text-card-foreground">
						Поиск {config?.label.toLowerCase()}...
					</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 border border-border rounded-lg bg-card">
				<div className="flex items-center justify-between">
					<span className="text-red-500">Ошибка поиска мест</span>
					<Button variant="ghost" size="sm" onClick={onCancel}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="h-4 w-4 text-orange-500" />
					<span className="text-sm font-medium text-card-foreground">
						Найдено {config?.label.toLowerCase()}: {places.length}
					</span>
				</div>
				<Button variant="ghost" size="sm" onClick={onCancel}>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{places.length > 0 ? (
				<div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg bg-card p-2">
					{places.map((place, index) => (
						<button
							key={index}
							onClick={() => onPlaceSelect(place)}
							className="w-full p-3 text-left border border-border rounded-lg hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-200 bg-input"
						>
							<div className="flex items-start gap-3">
								<Icon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<div className="font-medium text-card-foreground truncate">
										{place.displayName || place.name || "Без названия"}
									</div>
									{place.description && (
										<div className="text-xs text-muted-foreground mt-1">
											{place.description}
										</div>
									)}
								</div>
							</div>
						</button>
					))}
				</div>
			) : (
				<div className="p-4 border border-border rounded-lg bg-card text-center">
					<Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
					<p className="text-muted-foreground text-sm">
						{config?.label} не найдены поблизости
					</p>
					<Button variant="ghost" size="sm" onClick={onCancel} className="mt-2">
						Ввести адрес вручную
					</Button>
				</div>
			)}
		</div>
	);
}

export function CreateRoutePage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation();
	const { data: vehicles = [], isLoading: vehiclesLoading } = useGetVehiclesQuery();
	const { data: drivers = [], isLoading: driversLoading } = useGetDriversQuery();
	const { data: cargos = [], isLoading: cargosLoading } = useGetCargosQuery();
	const [reverseGeocode] = useLazyReverseGeocodeQuery();

	// Form state
	const [formData, setFormData] = useState<RouteCreateUpdate>({
		name: "",
		startLat: 55.7558,
		startLon: 37.6176,
		endLat: 59.9311,
		endLon: 30.3609,
		startAddress: "",
		endAddress: "",
		vehicleId: undefined,
		driverId: undefined,
		cargoId: undefined,
		departureTime: new Date().toISOString().slice(0, 16),
		waypoints: [],
		considerWeather: true,
	});

	const [mapCenter, setMapCenter] = useState([55.7558, 37.6176]);
	const [isCalculating, setIsCalculating] = useState(false);
	const [routePoints, setRoutePoints] = useState<number[][]>([]);
	const [currentStep, setCurrentStep] = useState(0);
	const [startSearch, setStartSearch] = useState("");
	const [endSearch, setEndSearch] = useState("");
	const [isGettingLocation, setIsGettingLocation] = useState(false);

	// Состояние для автоматического поиска мест по категориям
	const [categorySearches, setCategorySearches] = useState<
		Record<number, { type: string; lat?: number; lon?: number }>
	>({});

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.3,
				ease: "easeOut",
			},
		},
		hover: {
			scale: 1.02,
			transition: {
				duration: 0.2,
			},
		},
	};

	// Handlers
	const handleAddWaypoint = () => {
		const newWaypoint: Waypoint = {
			name: "",
			address: "",
			latitude: 0,
			longitude: 0,
			waypointType: "PICKUP",
			stayDurationMinutes: 15,
		};

		setFormData((prev) => ({
			...prev,
			waypoints: [...(prev.waypoints || []), newWaypoint],
		}));
	};

	const handleRemoveWaypoint = (index: number) => {
		setFormData((prev) => ({
			...prev,
			waypoints: prev.waypoints?.filter((_, i) => i !== index),
		}));
	};

	// Функция для получения текущего местоположения пользователя
	const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error("Геолокация не поддерживается"));
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lon: position.coords.longitude,
					});
				},
				(error) => {
					// Если не удалось получить местоположение, используем центр Москвы
					resolve({ lat: 55.7558, lon: 37.6176 });
				}
			);
		});
	};

	// Функция для получения адреса по координатам и установки как точка отправления
	const handleGetCurrentLocationForStart = async () => {
		setIsGettingLocation(true);
		try {
			const location = await getCurrentLocation();
			const addressResult = await reverseGeocode({
				lat: location.lat,
				lon: location.lon,
			}).unwrap();

			setFormData((prev) => ({
				...prev,
				startLat: location.lat,
				startLon: location.lon,
				startAddress: addressResult.displayName,
			}));
			setStartSearch(addressResult.displayName);
			setMapCenter([location.lat, location.lon]);

			toast({
				title: "Местоположение определено",
				description: "Ваше текущее местоположение установлено как точка отправления",
			});
		} catch (error) {
			console.error("Ошибка получения местоположения:", error);
			toast({
				title: "Ошибка",
				description: "Не удалось определить ваше местоположение",
				variant: "destructive",
			});
		} finally {
			setIsGettingLocation(false);
		}
	};

	// Обновленная функция для обновления waypoint с автоматическим поиском
	const handleUpdateWaypoint = async (index: number, field: keyof Waypoint, value: any) => {
		const updatedWaypoints = [...(formData.waypoints || [])];
		updatedWaypoints[index] = { ...updatedWaypoints[index], [field]: value };

		// Если изменился тип точки, запускаем автоматический поиск
		if (
			field === "waypointType" &&
			[
				"FUEL",
				"FOOD",
				"PARKING",
				"LODGING",
				"ATMS",
				"PHARMACIES",
				"HOSPITALS",
				"REST",
			].includes(value)
		) {
			try {
				const location = await getCurrentLocation();
				setCategorySearches((prev) => ({
					...prev,
					[index]: { type: value, lat: location.lat, lon: location.lon },
				}));
			} catch (error) {
				console.error("Ошибка получения местоположения:", error);
			}
		}

		setFormData({ ...formData, waypoints: updatedWaypoints });
	};

	const handleStartPlaceSelect = (place: GeoLocationDto) => {
		setFormData((prev) => ({
			...prev,
			startLat: place.lat,
			startLon: place.lon,
			startAddress: place.displayName,
		}));
		setMapCenter([place.lat, place.lon]);
	};

	const handleEndPlaceSelect = (place: GeoLocationDto) => {
		setFormData((prev) => ({
			...prev,
			endLat: place.lat,
			endLon: place.lon,
			endAddress: place.displayName,
		}));
	};

	const handleWaypointPlaceSelect = (index: number, place: GeoLocationDto) => {
		handleUpdateWaypoint(index, "latitude", place.lat);
		handleUpdateWaypoint(index, "longitude", place.lon);
		handleUpdateWaypoint(index, "address", place.displayName);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createRoute(formData).unwrap();
			toast({
				title: "Маршрут создан",
				description: "Маршрут успешно создан и сохранен",
			});
			navigate("/routes");
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось создать маршрут",
				variant: "destructive",
			});
		}
	};

	const calculateRoute = async () => {
		setIsCalculating(true);
		// Simulate route calculation
		setTimeout(() => {
			const points = [
				[formData.startLat, formData.startLon],
				[formData.endLat, formData.endLon],
			];
			setRoutePoints(points);
			setIsCalculating(false);
		}, 2000);
	};

	const steps = [
		{ id: 0, title: "Основная информация", icon: MapPin },
		{ id: 1, title: "Точки маршрута", icon: Navigation },
		{ id: 2, title: "Ресурсы", icon: Truck },
		{ id: 3, title: "Настройки", icon: Settings },
	];

	return (
		<div className="container mx-auto py-6 space-y-6 bg-grid-pattern min-h-screen">
			<motion.div
				initial="hidden"
				animate="visible"
				variants={containerVariants}
				className="max-w-7xl mx-auto"
			>
				{/* Header */}
				<motion.div variants={itemVariants} className="mb-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Создание маршрута
							</h1>
							<p className="text-muted-foreground mt-2">
								Спланируйте оптимальный маршрут для вашего груза
							</p>
						</div>

						{/* Progress Steps */}
						<div className="flex items-center gap-2">
							{steps.map((step, index) => {
								const Icon = step.icon;
								const isActive = currentStep === step.id;
								const isCompleted = currentStep > step.id;

								return (
									<motion.div
										key={step.id}
										className="flex items-center"
										whileHover={{ scale: 1.05 }}
									>
										<div
											className={`
												flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
												${
													isActive
														? "bg-primary border-primary text-primary-foreground shadow-lg"
														: isCompleted
															? "bg-green-500 border-green-500 text-white"
															: "bg-muted border-muted-foreground/30 text-muted-foreground"
												}
											`}
										>
											{isCompleted ? (
												<CheckCircle2 className="w-5 h-5" />
											) : (
												<Icon className="w-5 h-5" />
											)}
										</div>
										{index < steps.length - 1 && (
											<div
												className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
													isCompleted ? "bg-green-500" : "bg-muted"
												}`}
											/>
										)}
									</motion.div>
								);
							})}
						</div>
					</div>
				</motion.div>

				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Form */}
						<div className="lg:col-span-2 space-y-6">
							<Tabs
								value={currentStep.toString()}
								onValueChange={(value) => setCurrentStep(parseInt(value))}
							>
								<TabsList className="grid w-full grid-cols-4">
									{steps.map((step) => {
										const Icon = step.icon;
										return (
											<TabsTrigger
												key={step.id}
												value={step.id.toString()}
												className="flex items-center gap-2"
											>
												<Icon className="w-4 h-4" />
												<span className="hidden sm:inline">
													{step.title}
												</span>
											</TabsTrigger>
										);
									})}
								</TabsList>

								{/* Step 0: Basic Info */}
								<TabsContent value="0" className="space-y-6">
									<motion.div
										variants={cardVariants}
										initial="hidden"
										animate="visible"
									>
										<Card className="bg-card border-border hover:shadow-xl hover:border-orange-500/30 transition-all duration-300">
											<CardHeader>
												<CardTitle className="flex items-center gap-2 text-card-foreground">
													<MapPin className="w-5 h-5 text-orange-500" />
													Основная информация
												</CardTitle>
												<CardDescription className="text-muted-foreground">
													Укажите название маршрута и основные точки
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<div className="space-y-2">
													<Label
														htmlFor="routeName"
														className="text-card-foreground font-medium"
													>
														Название маршрута
													</Label>
													<Input
														id="routeName"
														value={formData.name}
														onChange={(e) =>
															setFormData({
																...formData,
																name: e.target.value,
															})
														}
														placeholder="Например: Москва - Санкт-Петербург"
														className="bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
													/>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label className="text-card-foreground font-medium">
															Точка отправления
														</Label>
														<div className="flex gap-2">
															<div className="flex-1">
																<PlaceSearchEnhanced
																	value={startSearch}
																	onChange={setStartSearch}
																	onPlaceSelect={
																		handleStartPlaceSelect
																	}
																	placeholder="Откуда отправляемся..."
																	showNearbyServices={true}
																	currentLocation={
																		formData.startLat &&
																		formData.startLon
																			? {
																					lat: formData.startLat,
																					lon: formData.startLon,
																				}
																			: undefined
																	}
																/>
															</div>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={
																	handleGetCurrentLocationForStart
																}
																disabled={isGettingLocation}
																className="px-3 py-2 border-orange-500/30 hover:border-orange-500 hover:bg-orange-50 transition-colors"
																title="Определить мое местоположение"
															>
																{isGettingLocation ? (
																	<Loader2 className="h-4 w-4 animate-spin text-orange-500" />
																) : (
																	<Target className="h-4 w-4 text-orange-500" />
																)}
															</Button>
														</div>
													</div>

													<div className="space-y-2">
														<Label className="text-card-foreground font-medium">
															Точка назначения
														</Label>
														<PlaceSearchEnhanced
															value={endSearch}
															onChange={setEndSearch}
															onPlaceSelect={handleEndPlaceSelect}
															placeholder="Куда едем..."
															showNearbyServices={true}
															currentLocation={
																formData.startLat &&
																formData.startLon
																	? {
																			lat: formData.startLat,
																			lon: formData.startLon,
																		}
																	: undefined
															}
														/>
													</div>
												</div>

												<div className="space-y-2">
													<Label
														htmlFor="departureTime"
														className="text-card-foreground font-medium"
													>
														Время отправления
													</Label>
													<Input
														id="departureTime"
														type="datetime-local"
														value={formData.departureTime}
														onChange={(e) =>
															setFormData({
																...formData,
																departureTime: e.target.value,
															})
														}
														className="bg-input border-border text-card-foreground focus:border-orange-500 focus:ring-orange-500/20"
													/>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								</TabsContent>

								{/* Step 1: Waypoints */}
								<TabsContent value="1" className="space-y-6">
									<motion.div
										variants={cardVariants}
										initial="hidden"
										animate="visible"
									>
										<Card className="bg-card border-border hover:shadow-xl hover:border-orange-500/30 transition-all duration-300">
											<CardHeader>
												<div className="flex items-center justify-between">
													<div>
														<CardTitle className="flex items-center gap-2 text-card-foreground">
															<Navigation className="w-5 h-5 text-orange-500" />
															Промежуточные точки
														</CardTitle>
														<CardDescription className="text-muted-foreground">
															Добавьте точки загрузки, выгрузки или
															отдыха
														</CardDescription>
													</div>
													<motion.div
														whileHover={{ scale: 1.05 }}
														whileTap={{ scale: 0.95 }}
													>
														<Button
															type="button"
															onClick={handleAddWaypoint}
															className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
														>
															<Plus className="w-4 h-4 mr-2" />
															Добавить точку
														</Button>
													</motion.div>
												</div>
											</CardHeader>
											<CardContent>
												<AnimatePresence>
													{formData.waypoints &&
													formData.waypoints.length > 0 ? (
														<div className="space-y-4">
															{formData.waypoints.map(
																(waypoint, index) => {
																	const config =
																		waypointTypeConfig[
																			waypoint.waypointType as keyof typeof waypointTypeConfig
																		];
																	const Icon = config.icon;

																	return (
																		<motion.div
																			key={index}
																			initial={{
																				opacity: 0,
																				y: 20,
																			}}
																			animate={{
																				opacity: 1,
																				y: 0,
																			}}
																			exit={{
																				opacity: 0,
																				y: -20,
																			}}
																			className="p-6 bg-card border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30"
																		>
																			<div className="flex items-center justify-between mb-4">
																				<div className="flex items-center gap-3">
																					<div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30 shadow-sm">
																						<Icon className="w-5 h-5 text-orange-400" />
																					</div>
																					<div>
																						<h4 className="font-medium text-sm text-card-foreground">
																							{
																								config.label
																							}{" "}
																							#
																							{index +
																								1}
																						</h4>
																						<p className="text-xs text-muted-foreground">
																							Промежуточная
																							точка
																							маршрута
																						</p>
																					</div>
																				</div>
																				<motion.div
																					whileHover={{
																						scale: 1.1,
																					}}
																					whileTap={{
																						scale: 0.9,
																					}}
																				>
																					<Button
																						type="button"
																						variant="ghost"
																						size="sm"
																						onClick={() =>
																							handleRemoveWaypoint(
																								index
																							)
																						}
																						className="text-red-500 hover:text-red-700 hover:bg-red-50"
																					>
																						<X className="w-4 h-4" />
																					</Button>
																				</motion.div>
																			</div>

																			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																				<div className="space-y-2">
																					<Label className="text-card-foreground font-medium">
																						Название
																						точки
																					</Label>
																					<Input
																						value={
																							waypoint.name
																						}
																						onChange={(
																							e
																						) =>
																							handleUpdateWaypoint(
																								index,
																								"name",
																								e
																									.target
																									.value
																							)
																						}
																						placeholder="Название точки"
																						className="bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
																					/>
																				</div>

																				<div className="space-y-2">
																					<Label className="text-card-foreground font-medium">
																						Тип точки
																					</Label>
																					<select
																						value={
																							waypoint.waypointType
																						}
																						onChange={(
																							e
																						) =>
																							handleUpdateWaypoint(
																								index,
																								"waypointType",
																								e
																									.target
																									.value as any
																							)
																						}
																						className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200"
																					>
																						<option value="PICKUP">
																							Загрузка
																						</option>
																						<option value="DELIVERY">
																							Выгрузка
																						</option>
																						<option value="REST">
																							Отдых
																						</option>
																						<option value="FUEL">
																							АЗС
																						</option>
																						<option value="FOOD">
																							Еда
																						</option>
																						<option value="PARKING">
																							Парковка
																						</option>
																						<option value="LODGING">
																							Отели
																						</option>
																						<option value="ATMS">
																							Банкоматы
																						</option>
																						<option value="PHARMACIES">
																							Аптеки
																						</option>
																						<option value="HOSPITALS">
																							Больницы
																						</option>
																					</select>
																				</div>

																				<div className="md:col-span-2 space-y-2">
																					<Label className="text-card-foreground font-medium">
																						Адрес
																					</Label>
																					{/* Показываем автоматические предложения для категорий */}
																					{categorySearches[
																						index
																					] &&
																					[
																						"FUEL",
																						"FOOD",
																						"PARKING",
																						"LODGING",
																						"ATMS",
																						"PHARMACIES",
																						"HOSPITALS",
																						"REST",
																					].includes(
																						waypoint.waypointType
																					) ? (
																						<CategoryPlaceSelector
																							waypointIndex={
																								index
																							}
																							categoryType={
																								waypoint.waypointType
																							}
																							currentLocation={
																								categorySearches[
																									index
																								]
																							}
																							onPlaceSelect={(
																								place
																							) => {
																								handleWaypointPlaceSelect(
																									index,
																									place
																								);
																								// Убираем автоматический поиск после выбора
																								setCategorySearches(
																									(
																										prev
																									) => {
																										const newState =
																											{
																												...prev,
																											};
																										delete newState[
																											index
																										];
																										return newState;
																									}
																								);
																							}}
																							onCancel={() => {
																								setCategorySearches(
																									(
																										prev
																									) => {
																										const newState =
																											{
																												...prev,
																											};
																										delete newState[
																											index
																										];
																										return newState;
																									}
																								);
																							}}
																						/>
																					) : (
																						<PlaceSearchEnhanced
																							value={
																								waypoint.address ||
																								""
																							}
																							onChange={(
																								value
																							) =>
																								handleUpdateWaypoint(
																									index,
																									"address",
																									value
																								)
																							}
																							onPlaceSelect={(
																								place
																							) =>
																								handleWaypointPlaceSelect(
																									index,
																									place
																								)
																							}
																							placeholder="Поиск адреса..."
																							showNearbyServices={
																								true
																							}
																							currentLocation={
																								formData.startLat &&
																								formData.startLon
																									? {
																											lat: formData.startLat,
																											lon: formData.startLon,
																										}
																									: undefined
																							}
																						/>
																					)}
																				</div>

																				<div className="space-y-2">
																					<Label className="text-card-foreground font-medium">
																						Время
																						стоянки
																						(мин)
																					</Label>
																					<Input
																						type="number"
																						value={
																							waypoint.stayDurationMinutes ||
																							15
																						}
																						onChange={(
																							e
																						) =>
																							handleUpdateWaypoint(
																								index,
																								"stayDurationMinutes",
																								parseInt(
																									e
																										.target
																										.value
																								) ||
																									15
																							)
																						}
																						placeholder="15"
																						className="bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
																					/>
																				</div>
																			</div>
																		</motion.div>
																	);
																}
															)}
														</div>
													) : (
														<div className="text-center py-12">
															<Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
															<h3 className="text-lg font-medium text-card-foreground mb-2">
																Нет промежуточных точек
															</h3>
															<p className="text-muted-foreground mb-4">
																Добавьте точки для создания
																детального маршрута
															</p>
														</div>
													)}
												</AnimatePresence>
											</CardContent>
										</Card>
									</motion.div>
								</TabsContent>

								{/* Step 2: Resources */}
								<TabsContent value="2" className="space-y-6">
									<motion.div
										variants={cardVariants}
										initial="hidden"
										animate="visible"
									>
										<Card className="bg-card border-border hover:shadow-xl hover:border-orange-500/30 transition-all duration-300">
											<CardHeader>
												<CardTitle className="flex items-center gap-2 text-card-foreground">
													<Truck className="w-5 h-5 text-orange-500" />
													Ресурсы
												</CardTitle>
												<CardDescription className="text-muted-foreground">
													Выберите транспорт, водителя и груз для маршрута
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<div className="space-y-6">
													{/* Vehicle Selection */}
													<div>
														<Label className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
															<Truck className="h-5 w-5 text-orange-500" />
															Выбор транспорта
														</Label>
														{vehiclesLoading ? (
															<div className="flex items-center justify-center p-8">
																<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
																<span className="ml-2 text-muted-foreground">
																	Загрузка транспорта...
																</span>
															</div>
														) : (
															<Select
																value={
																	formData.vehicleId?.toString() ||
																	""
																}
																onValueChange={(value) =>
																	setFormData((prev) => ({
																		...prev,
																		vehicleId: parseInt(value),
																	}))
																}
															>
																<SelectTrigger className="bg-input border-border text-card-foreground focus:border-orange-500 focus:ring-orange-500/20">
																	<SelectValue placeholder="Выберите транспорт" />
																</SelectTrigger>
																<SelectContent>
																	{vehicles.map((vehicle) => (
																		<SelectItem
																			key={vehicle.id}
																			value={vehicle.id.toString()}
																		>
																			<div className="flex items-center gap-3 py-1">
																				{getVehicleIcon(
																					vehicle
																				)}
																				<div className="flex-1">
																					<div className="font-medium">
																						{
																							vehicle.brand
																						}{" "}
																						{
																							vehicle.model
																						}{" "}
																						•{" "}
																						{
																							vehicle.licensePlate
																						}
																					</div>
																					<div className="text-sm text-gray-500">
																						Топливо:{" "}
																						{
																							vehicle.currentFuelL
																						}
																						л • Пробег:{" "}
																						{
																							vehicle.currentOdometerKm
																						}
																						км
																					</div>
																				</div>
																			</div>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														)}
													</div>

													{/* Driver Selection */}
													<div>
														<Label className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
															<User className="h-5 w-5 text-orange-500" />
															Выбор водителя
														</Label>
														{driversLoading ? (
															<div className="flex items-center justify-center p-8">
																<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
																<span className="ml-2 text-muted-foreground">
																	Загрузка водителей...
																</span>
															</div>
														) : (
															<Select
																value={
																	formData.driverId?.toString() ||
																	""
																}
																onValueChange={(value) =>
																	setFormData((prev) => ({
																		...prev,
																		driverId: parseInt(value),
																	}))
																}
															>
																<SelectTrigger className="bg-input border-border text-card-foreground focus:border-orange-500 focus:ring-orange-500/20">
																	<SelectValue placeholder="Выберите водителя" />
																</SelectTrigger>
																<SelectContent>
																	{drivers.map((driver) => (
																		<SelectItem
																			key={driver.id}
																			value={driver.id.toString()}
																		>
																			<div className="flex items-center gap-3 py-1">
																				{getDriverStatusIcon(
																					driver.currentDrivingStatus
																				)}
																				<div className="flex-1">
																					<div className="font-medium">
																						{
																							driver.firstName
																						}{" "}
																						{
																							driver.lastName
																						}
																					</div>
																					<div className="text-sm text-gray-500">
																						Опыт:{" "}
																						{
																							driver.drivingExperienceYears
																						}{" "}
																						лет •{" "}
																						{
																							driver.phoneNumber
																						}
																					</div>
																				</div>
																			</div>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														)}
													</div>

													{/* Cargo Selection */}
													<div>
														<Label className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
															<Package className="h-5 w-5 text-orange-500" />
															Выбор груза
														</Label>
														{cargosLoading ? (
															<div className="flex items-center justify-center p-8">
																<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
																<span className="ml-2 text-muted-foreground">
																	Загрузка грузов...
																</span>
															</div>
														) : (
															<Select
																value={
																	formData.cargoId?.toString() ||
																	""
																}
																onValueChange={(value) =>
																	setFormData((prev) => ({
																		...prev,
																		cargoId: parseInt(value),
																	}))
																}
															>
																<SelectTrigger className="bg-input border-border text-card-foreground focus:border-orange-500 focus:ring-orange-500/20">
																	<SelectValue placeholder="Выберите груз" />
																</SelectTrigger>
																<SelectContent>
																	{cargos.map((item: any) => (
																		<SelectItem
																			key={item.id}
																			value={item.id.toString()}
																		>
																			<div className="flex items-center gap-3 py-1">
																				{getCargoIcon(item)}
																				<div className="flex-1">
																					<div className="font-medium">
																						{item.name ||
																							item.description}
																					</div>
																					<div className="text-sm text-gray-500">
																						Вес:{" "}
																						{
																							item.weightKg
																						}
																						кг • Объем:{" "}
																						{
																							item.volumeM3
																						}
																						м³
																					</div>
																				</div>
																			</div>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								</TabsContent>

								{/* Step 3: Settings */}
								<TabsContent value="3" className="space-y-6">
									<motion.div
										variants={cardVariants}
										initial="hidden"
										animate="visible"
									>
										<Card className="bg-card border-border hover:shadow-xl hover:border-orange-500/30 transition-all duration-300">
											<CardHeader>
												<CardTitle className="flex items-center gap-2 text-card-foreground">
													<Settings className="w-5 h-5 text-orange-500" />
													Настройки маршрута
												</CardTitle>
												<CardDescription className="text-muted-foreground">
													Дополнительные параметры для оптимизации
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<motion.div
														whileHover={{ scale: 1.02 }}
														className="p-4 border border-muted rounded-xl hover:border-primary/30 transition-all duration-300"
													>
														<label className="flex items-center gap-3 cursor-pointer">
															<input
																type="checkbox"
																checked={formData.considerWeather}
																onChange={(e) =>
																	setFormData({
																		...formData,
																		considerWeather:
																			e.target.checked,
																	})
																}
																className="w-5 h-5 text-primary border-2 border-muted-foreground rounded focus:ring-primary/20"
															/>
															<div>
																<div className="font-medium flex items-center gap-2">
																	<AlertCircle className="w-4 h-4 text-blue-600" />
																	Учитывать погоду
																</div>
																<div className="text-sm text-muted-foreground">
																	Анализ погодных условий на
																	маршруте
																</div>
															</div>
														</label>
													</motion.div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								</TabsContent>

								{/* Navigation Buttons */}
								<div className="flex items-center justify-between pt-6">
									<Button
										type="button"
										variant="outline"
										onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
										disabled={currentStep === 0}
										className="flex items-center gap-2"
									>
										Назад
									</Button>

									{currentStep < steps.length - 1 ? (
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												type="button"
												onClick={() =>
													setCurrentStep(
														Math.min(steps.length - 1, currentStep + 1)
													)
												}
												className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg flex items-center gap-2"
											>
												Далее
												<ArrowRight className="w-4 h-4" />
											</Button>
										</motion.div>
									) : (
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												type="submit"
												disabled={isCreating || !formData.name}
												className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg flex items-center gap-2"
											>
												{isCreating ? (
													<>
														<Loader2 className="w-4 h-4 animate-spin" />
														Создание...
													</>
												) : (
													<>
														<Save className="w-4 h-4" />
														Создать маршрут
													</>
												)}
											</Button>
										</motion.div>
									)}
								</div>
							</Tabs>
						</div>

						{/* Right Column - Map */}
						<motion.div variants={itemVariants} className="space-y-6">
							<Card className="sticky top-6 bg-card border-border hover:shadow-xl hover:border-orange-500/30 transition-all duration-300">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-card-foreground">
										<Navigation className="w-5 h-5 text-orange-500" />
										Предпросмотр маршрута
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="relative">
										<div className="h-[400px] rounded-xl overflow-hidden border-2 border-muted shadow-inner">
											<YMaps>
												<Map
													defaultState={{
														center: mapCenter,
														zoom: 7,
													}}
													width="100%"
													height="100%"
												>
													{/* Start point */}
													<Placemark
														geometry={[
															formData.startLat,
															formData.startLon,
														]}
														properties={{
															hintContent: "Точка отправления",
															balloonContent:
																formData.startAddress ||
																"Начало маршрута",
														}}
														options={{
															preset: "islands#greenCircleDotIcon",
															iconColor: "#10b981",
														}}
													/>

													{/* End point */}
													<Placemark
														geometry={[
															formData.endLat,
															formData.endLon,
														]}
														properties={{
															hintContent: "Точка назначения",
															balloonContent:
																formData.endAddress ||
																"Конец маршрута",
														}}
														options={{
															preset: "islands#redCircleDotIcon",
															iconColor: "#ef4444",
														}}
													/>

													{/* Waypoints */}
													{formData.waypoints?.map((wp, index) => (
														<Placemark
															key={index}
															geometry={[wp.latitude, wp.longitude]}
															properties={{
																hintContent: wp.name,
																balloonContent: wp.address,
															}}
															options={{
																preset: "islands#blueCircleDotIcon",
																iconColor: "#3b82f6",
															}}
														/>
													))}

													{/* Route line */}
													{routePoints.length > 0 && (
														<Polyline
															geometry={routePoints}
															options={{
																strokeColor: "hsl(var(--primary))",
																strokeWidth: 4,
																strokeOpacity: 0.8,
															}}
														/>
													)}
												</Map>
											</YMaps>
										</div>

										<div className="mt-4 space-y-3">
											<motion.div
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<Button
													type="button"
													variant="outline"
													className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
													onClick={calculateRoute}
													disabled={isCalculating}
												>
													{isCalculating ? (
														<>
															<Loader2 className="w-4 h-4 mr-2 animate-spin" />
															Расчет маршрута...
														</>
													) : (
														<>
															<Zap className="w-4 h-4 mr-2" />
															Рассчитать маршрут
														</>
													)}
												</Button>
											</motion.div>

											<AnimatePresence>
												{routePoints.length > 0 && (
													<motion.div
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -20 }}
														className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
													>
														<div className="flex items-center gap-2 text-green-700 mb-3">
															<CheckCircle2 className="w-5 h-5" />
															<span className="font-medium">
																Маршрут рассчитан
															</span>
														</div>
														<div className="grid grid-cols-2 gap-4 text-sm">
															<div className="flex items-center gap-2">
																<Target className="w-4 h-4 text-green-600" />
																<span>~650 км</span>
															</div>
															<div className="flex items-center gap-2">
																<Clock className="w-4 h-4 text-green-600" />
																<span>~8 ч 30 мин</span>
															</div>
															<div className="flex items-center gap-2">
																<Fuel className="w-4 h-4 text-green-600" />
																<span>~78 л</span>
															</div>
															<div className="flex items-center gap-2">
																<DollarSign className="w-4 h-4 text-green-600" />
																<span>~12 500 ₽</span>
															</div>
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</form>
			</motion.div>
		</div>
	);
}

export default CreateRoutePage;
