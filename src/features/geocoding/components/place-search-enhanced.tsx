import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	MapPin,
	Loader2,
	X,
	Navigation,
	Fuel,
	Coffee,
	Utensils,
	Car,
	Building,
	CreditCard,
	Cross,
	ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
	useLazySearchPlacesQuery,
	useLazyFindFuelStationsQuery,
	useLazyFindRestAreasQuery,
	useLazyFindFoodStopsQuery,
	useLazyFindParkingSpotsQuery,
	useLazyFindLodgingQuery,
	useLazyFindAtmsQuery,
	useLazyFindPharmaciesQuery,
	useLazyFindHospitalsQuery,
	type GeoLocationDto,
} from "@/shared/api/geocodingSlice";

interface PlaceSearchEnhancedProps {
	value: string;
	onChange: (value: string) => void;
	onPlaceSelect: (place: GeoLocationDto) => void;
	placeholder?: string;
	className?: string;
	showNearbyServices?: boolean;
	currentLocation?: { lat: number; lon: number };
}

const serviceTypes = [
	{ key: "fuel", label: "АЗС", icon: Fuel, color: "text-orange-600", bgColor: "bg-orange-50" },
	{
		key: "rest",
		label: "Отдых",
		icon: Coffee,
		color: "text-purple-600",
		bgColor: "bg-purple-50",
	},
	{ key: "food", label: "Еда", icon: Utensils, color: "text-green-600", bgColor: "bg-green-50" },
	{ key: "parking", label: "Парковка", icon: Car, color: "text-blue-600", bgColor: "bg-blue-50" },
	{
		key: "lodging",
		label: "Отели",
		icon: Building,
		color: "text-indigo-600",
		bgColor: "bg-indigo-50",
	},
	{
		key: "atms",
		label: "Банкоматы",
		icon: CreditCard,
		color: "text-yellow-600",
		bgColor: "bg-yellow-50",
	},
	{
		key: "pharmacies",
		label: "Аптеки",
		icon: Cross,
		color: "text-red-600",
		bgColor: "bg-red-50",
	},
	{
		key: "hospitals",
		label: "Больницы",
		icon: Cross,
		color: "text-red-700",
		bgColor: "bg-red-50",
	},
];

export function PlaceSearchEnhanced({
	value,
	onChange,
	onPlaceSelect,
	placeholder = "Поиск места...",
	className = "",
	showNearbyServices = false,
	currentLocation,
}: PlaceSearchEnhancedProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedService, setSelectedService] = useState<string | null>(null);
	const [places, setPlaces] = useState<GeoLocationDto[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(
		currentLocation || null
	);

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const debouncedValue = useDebounce(value, 300);

	// API hooks
	const [searchPlaces] = useLazySearchPlacesQuery();
	const [findFuelStations] = useLazyFindFuelStationsQuery();
	const [findRestAreas] = useLazyFindRestAreasQuery();
	const [findFoodStops] = useLazyFindFoodStopsQuery();
	const [findParkingSpots] = useLazyFindParkingSpotsQuery();
	const [findLodging] = useLazyFindLodgingQuery();
	const [findAtms] = useLazyFindAtmsQuery();
	const [findPharmacies] = useLazyFindPharmaciesQuery();
	const [findHospitals] = useLazyFindHospitalsQuery();

	// Функция для получения местоположения пользователя
	const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				// Fallback на центр Москвы
				resolve({ lat: 55.7558, lon: 37.6176 });
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lon: position.coords.longitude,
					};
					setUserLocation(location);
					resolve(location);
				},
				(error) => {
					console.warn("Не удалось получить местоположение:", error);
					// Fallback на центр Москвы
					const fallbackLocation = { lat: 55.7558, lon: 37.6176 };
					setUserLocation(fallbackLocation);
					resolve(fallbackLocation);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 300000, // 5 минут
				}
			);
		});
	};

	// Поиск мест при изменении значения
	useEffect(() => {
		if (debouncedValue.length >= 2 && !selectedService) {
			handleSearch(debouncedValue);
		}
	}, [debouncedValue, selectedService]);

	// Поиск сервисов рядом с текущим местоположением
	useEffect(() => {
		if (selectedService && userLocation) {
			handleServiceSearch(selectedService, userLocation);
		}
	}, [selectedService, userLocation]);

	// Закрытие dropdown при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!inputRef.current?.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = async (query: string) => {
		if (query.length < 2) return;

		setIsLoading(true);
		try {
			const result = await searchPlaces({
				query,
				limit: 8,
				...(currentLocation && { lat: currentLocation.lat, lon: currentLocation.lon }),
			}).unwrap();

			// Убеждаемся, что result является массивом
			setPlaces(Array.isArray(result) ? result : []);
			setIsOpen(true);
		} catch (error) {
			console.error("Search error:", error);
			setPlaces([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleServiceSearch = async (
		serviceType: string,
		location: { lat: number; lon: number }
	) => {
		setIsLoading(true);
		try {
			let result: GeoLocationDto[] = [];

			switch (serviceType) {
				case "fuel":
					result = await findFuelStations({
						lat: location.lat,
						lon: location.lon,
						radius: 10000,
					}).unwrap();
					break;
				case "rest":
					result = await findRestAreas({
						lat: location.lat,
						lon: location.lon,
						radius: 15000,
					}).unwrap();
					break;
				case "food":
					result = await findFoodStops({
						lat: location.lat,
						lon: location.lon,
						radius: 10000,
					}).unwrap();
					break;
				case "parking":
					result = await findParkingSpots({
						lat: location.lat,
						lon: location.lon,
						radius: 10000,
					}).unwrap();
					break;
				case "lodging":
					result = await findLodging({
						lat: location.lat,
						lon: location.lon,
						radius: 20000,
					}).unwrap();
					break;
				case "atms":
					result = await findAtms({
						lat: location.lat,
						lon: location.lon,
						radius: 5000,
					}).unwrap();
					break;
				case "pharmacies":
					result = await findPharmacies({
						lat: location.lat,
						lon: location.lon,
						radius: 5000,
					}).unwrap();
					break;
				case "hospitals":
					result = await findHospitals({
						lat: location.lat,
						lon: location.lon,
						radius: 10000,
					}).unwrap();
					break;
			}

			// Убеждаемся, что result является массивом
			setPlaces(Array.isArray(result) ? result : []);
			setIsOpen(true);
		} catch (error) {
			console.error("Service search error:", error);
			setPlaces([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlaceClick = (place: GeoLocationDto) => {
		onChange(place.displayName);
		onPlaceSelect(place);
		setIsOpen(false);
		setSelectedService(null);
	};

	const handleServiceClick = async (serviceKey: string) => {
		if (selectedService === serviceKey) {
			setSelectedService(null);
			setPlaces([]);
			setIsOpen(false);
		} else {
			setSelectedService(serviceKey);
			onChange("");
			setIsLoading(true);

			try {
				// Получаем местоположение пользователя
				const location = userLocation || (await getCurrentLocation());

				// Запускаем поиск сервисов
				await handleServiceSearch(serviceKey, location);
			} catch (error) {
				console.error("Ошибка получения местоположения:", error);
				setIsLoading(false);
			}
		}
	};

	const clearSearch = () => {
		onChange("");
		setPlaces([]);
		setIsOpen(false);
		setSelectedService(null);
		inputRef.current?.focus();
	};

	const getPlaceIcon = (place: GeoLocationDto) => {
		const category = place.category?.toLowerCase() || place.type?.toLowerCase() || "";
		const displayName = place.displayName?.toLowerCase() || "";

		// Проверяем по категории и типу
		if (
			category.includes("fuel") ||
			category.includes("gas") ||
			category.includes("petrol") ||
			displayName.includes("азс") ||
			displayName.includes("заправ") ||
			displayName.includes("лукойл") ||
			displayName.includes("роснефт") ||
			displayName.includes("газпром") ||
			displayName.includes("teboil")
		) {
			return Fuel;
		}

		if (
			category.includes("restaurant") ||
			category.includes("food") ||
			category.includes("cafe") ||
			displayName.includes("ресторан") ||
			displayName.includes("кафе") ||
			displayName.includes("макдональдс") ||
			displayName.includes("kfc") ||
			displayName.includes("бургер")
		) {
			return Utensils;
		}

		if (
			category.includes("hotel") ||
			category.includes("lodging") ||
			category.includes("accommodation") ||
			displayName.includes("отель") ||
			displayName.includes("гостиниц") ||
			displayName.includes("хостел")
		) {
			return Building;
		}

		if (category.includes("parking") || displayName.includes("парковк")) {
			return Car;
		}

		if (
			category.includes("hospital") ||
			category.includes("pharmacy") ||
			category.includes("medical") ||
			displayName.includes("больниц") ||
			displayName.includes("аптек") ||
			displayName.includes("медицин")
		) {
			return Cross;
		}

		if (
			category.includes("atm") ||
			category.includes("bank") ||
			displayName.includes("банкомат") ||
			displayName.includes("банк") ||
			displayName.includes("сбербанк")
		) {
			return CreditCard;
		}

		// Если ничего не подошло, возвращаем стандартную иконку
		return MapPin;
	};

	const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
		// Проверяем, что все координаты являются числами
		if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
			return "";
		}

		const R = 6371; // Radius of the Earth in kilometers
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in kilometers

		// Проверяем, что результат является числом
		if (isNaN(distance)) {
			return "";
		}

		return distance.toFixed(1) + " км";
	};

	return (
		<div className={`relative ${className}`}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
				<Input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setIsOpen(true)}
					placeholder={placeholder}
					className="pl-10 pr-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
				/>
				{value && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={clearSearch}
						className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
					>
						<X className="h-3 w-3" />
					</Button>
				)}
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-orange-500" />
				)}
			</div>

			{/* Service buttons */}
			{showNearbyServices && (
				<div className="flex flex-wrap gap-2 mt-3">
					{serviceTypes.map((service) => {
						const Icon = service.icon;
						const isActive = selectedService === service.key;
						const isLoadingThis = isLoading && isActive;

						return (
							<Button
								key={service.key}
								type="button"
								variant={isActive ? "default" : "outline"}
								size="sm"
								onClick={() => handleServiceClick(service.key)}
								disabled={isLoading}
								className={`
									flex items-center gap-2 text-xs transition-all duration-200 relative
									${
										isActive
											? `bg-orange-500 text-white hover:bg-orange-600`
											: `${service.bgColor} ${service.color} hover:scale-105 disabled:opacity-50`
									}
								`}
							>
								{isLoadingThis ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<Icon className="h-3 w-3" />
								)}
								{service.label}
								{isLoadingThis && (
									<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
										Получение местоположения...
									</span>
								)}
							</Button>
						);
					})}
				</div>
			)}

			{/* Results dropdown */}
			<AnimatePresence>
				{isOpen && places && places.length > 0 && (
					<motion.div
						ref={dropdownRef}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-80 overflow-y-auto place-search-dropdown"
						style={{ zIndex: 9999 }}
					>
						{/* Header for category search */}
						{selectedService && (
							<div className="p-3 bg-orange-50 border-b border-orange-200">
								<div className="flex items-center gap-2">
									{serviceTypes.find((s) => s.key === selectedService)?.icon &&
										React.createElement(
											serviceTypes.find((s) => s.key === selectedService)!
												.icon,
											{
												className: "h-4 w-4 text-orange-600",
											}
										)}
									<span className="text-sm font-medium text-orange-800">
										Найдено{" "}
										{serviceTypes
											.find((s) => s.key === selectedService)
											?.label.toLowerCase()}
										: {places?.length || 0}
									</span>
								</div>
							</div>
						)}

						{/* Header for text search */}
						{!selectedService && value.length >= 2 && (
							<div className="p-3 bg-blue-50 border-b border-blue-200">
								<div className="flex items-center gap-2">
									<Search className="h-4 w-4 text-blue-600" />
									<span className="text-sm font-medium text-blue-800">
										Найдено мест: {places?.length || 0}
									</span>
								</div>
							</div>
						)}

						{places?.map((place, index) => {
							const Icon = getPlaceIcon(place);

							// Безопасное формирование названия места
							let placeName = "Неизвестное место";

							if (place.displayName) {
								placeName = place.displayName;
							} else if (place.address) {
								if (typeof place.address === "string") {
									placeName = place.address;
								} else if (place.address.road) {
									const parts = [place.address.road];
									if (place.address.house_number) {
										parts.push(place.address.house_number);
									}
									placeName = parts.join(" ");
								}
							}

							// Безопасное формирование адреса
							let placeAddress = "";

							if (place.address && typeof place.address === "object") {
								const addressParts = [];
								if (place.address.road && place.address.road !== placeName) {
									addressParts.push(place.address.road);
								}
								if (place.address.city) {
									addressParts.push(place.address.city);
								}
								if (place.address.country) {
									addressParts.push(place.address.country);
								}
								placeAddress = addressParts.join(", ");
							} else if (
								typeof place.address === "string" &&
								place.address !== placeName
							) {
								placeAddress = place.address;
							}

							// Безопасный расчет расстояния
							let distance = "";
							const hasLocation =
								(userLocation && userLocation.lat && userLocation.lon) ||
								(currentLocation && currentLocation.lat && currentLocation.lon);

							if (hasLocation && place.lat && place.lon) {
								const refLocation = userLocation || currentLocation;
								if (
									refLocation &&
									!isNaN(refLocation.lat) &&
									!isNaN(refLocation.lon) &&
									!isNaN(place.lat) &&
									!isNaN(place.lon)
								) {
									distance = calculateDistance(
										refLocation.lat,
										refLocation.lon,
										place.lat,
										place.lon
									);
								}
							}

							return (
								<motion.div
									key={`${place.lat}-${place.lon}-${index}`}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05 }}
									onClick={() => {
										onPlaceSelect(place);
										setIsOpen(false);
										setSelectedService(null);
									}}
									className="flex items-start gap-3 p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
								>
									<div className="flex-shrink-0 mt-1">
										<Icon className="h-4 w-4 text-orange-500" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900 truncate">
											{placeName}
										</div>
										<div className="text-sm text-gray-500 truncate mt-1">
											{placeAddress && <span>{placeAddress}</span>}
											{distance && (
												<span className="text-orange-600 font-medium">
													{placeAddress ? " • " : ""}
													{distance}
												</span>
											)}
										</div>
									</div>
									<div className="flex-shrink-0">
										<Badge variant="secondary" className="text-xs">
											{place.type || place.category || "Место"}
										</Badge>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>

			{/* No results message */}
			{isOpen &&
				!isLoading &&
				(!places || places.length === 0) &&
				(value.length >= 2 || selectedService) && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg z-[9999] p-4 text-center text-gray-500"
					>
						<MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
						{selectedService ? (
							<>
								<p>
									Места типа "
									{serviceTypes.find((s) => s.key === selectedService)?.label}" не
									найдены
								</p>
								<p className="text-sm">Попробуйте увеличить радиус поиска</p>
							</>
						) : (
							<>
								<p>Места не найдены</p>
								<p className="text-sm">Попробуйте изменить запрос</p>
							</>
						)}
					</motion.div>
				)}
		</div>
	);
}

export default PlaceSearchEnhanced;
