import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	YMaps,
	Map,
	Placemark,
	Polyline,
	GeolocationControl,
	TrafficControl,
	FullscreenControl,
	ZoomControl,
	withYMaps,
} from "@pbe/react-yandex-maps";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
	MapPin,
	Route,
	Fuel,
	Clock,
	CloudRain,
	DollarSign,
	Navigation,
	Coffee,
	AlertTriangle,
	Truck,
	Timer,
	Zap,
	TrendingUp,
	TrendingDown,
	Wind,
	Thermometer,
	Eye,
	Activity,
	Search,
	Plus,
	Trash2,
} from "lucide-react";
import {
	apiGet,
	apiPost,
	handleApiResponse,
	isAuthenticated,
	getUsername,
	logout,
} from "@/lib/api";
import { LoginForm } from "@/components/auth/login-form";

// Типы для нашего планировщика
interface RoutePoint {
	address: string;
	coordinates?: [number, number];
}

interface RouteRequest {
	startLat: number;
	startLon: number;
	endLat: number;
	endLon: number;
	startAddress?: string;
	endAddress?: string;
	vehicleId?: number | null;
	driverId?: number | null;
	cargoId?: number | null;
	departureTime?: string | null;
	profile?: string;
	calcPoints?: boolean;
	instructions?: boolean;
	pointsEncoded?: boolean;
	avoidTolls?: boolean;
	avoidHighways?: boolean;
	avoidUrbanAreas?: boolean;
	considerWeather?: boolean;
	considerTraffic?: boolean;
}

interface RouteResponse {
	distance: number;
	duration: number;
	coordinates: number[][];
	instructions: any[];
	weatherRiskScore?: number;
	roadQualityRiskScore?: number;
	trafficRiskScore?: number;
	overallRiskScore?: number;
	estimatedFuelConsumption?: number;
	estimatedFuelCost?: number;
	estimatedTollCost?: number;
	estimatedDriverCost?: number;
	estimatedTotalCost?: number;
}

interface Vehicle {
	id: number;
	licensePlate: string;
	brand: string;
	model: string;
	fuelConsumptionPer100km: number;
	status: string;
}

interface Driver {
	id: number;
	firstName: string;
	lastName: string;
	continuousDrivingMinutes: number;
	dailyDrivingMinutesToday: number;
	weeklyDrivingMinutes: number;
	currentDrivingStatus: string;
}

// Типы для погодных данных
interface WeatherForecast {
	cityName?: string;
	forecastTime: string;
	temperature: number;
	feelsLike: number;
	humidity: number;
	pressure: number;
	windSpeed: number;
	windDirection: number;
	windGust?: number;
	rainVolume1h?: number;
	rainVolume3h?: number;
	snowVolume1h?: number;
	snowVolume3h?: number;
	cloudiness: number;
	visibility: number;
	sunrise?: string;
	sunset?: string;
	weatherId: number;
	weatherMain: string;
	weatherDescription: string;
	weatherIcon: string;
	riskScore?: number;
	riskLevel?: string;
	riskDescription?: string;
}

interface WeatherResponse {
	cityName: string;
	cityCountry: string;
	forecasts: WeatherForecast[];
}

// Геокодирование с помощью Yandex Maps API
const geocodeWithYandex = async (ymaps: any, address: string): Promise<[number, number] | null> => {
	try {
		const result = await ymaps.geocode(address);
		const firstGeoObject = result.geoObjects.get(0);
		if (firstGeoObject) {
			const coords = firstGeoObject.geometry.getCoordinates();
			return [coords[0], coords[1]];
		}
		return null;
	} catch (error) {
		console.error("Ошибка геокодирования:", error);
		return null;
	}
};

const RoutePlannerMap = withYMaps(
	({ ymaps, startPoint, endPoint, routeData, onMapClick }: any) => {
		const mapRef = useRef<any>(null);
		const [routePolyline, setRoutePolyline] = useState<any>(null);

		// Создание линии маршрута
		useEffect(() => {
			if (ymaps && routeData?.coordinates && mapRef.current) {
				// Удаляем предыдущий маршрут
				if (routePolyline) {
					mapRef.current.geoObjects.remove(routePolyline);
				}

				const polyline = new ymaps.Polyline(
					routeData.coordinates,
					{
						hintContent: `Маршрут: ${routeData.distance}км, ${Math.round(routeData.duration)}мин`,
					},
					{
						strokeColor: "#2563eb",
						strokeWidth: 4,
						strokeOpacity: 0.8,
					}
				);

				setRoutePolyline(polyline);
				mapRef.current.geoObjects.add(polyline);

				// Центрируем карту по маршруту
				if (startPoint.coordinates && endPoint.coordinates) {
					const bounds = ymaps.util.bounds.fromPoints([
						startPoint.coordinates,
						endPoint.coordinates,
					]);
					mapRef.current.setBounds(bounds, {
						checkZoomRange: true,
						zoomMargin: 50,
					});
				}
			}

			return () => {
				if (mapRef.current && routePolyline) {
					mapRef.current.geoObjects.remove(routePolyline);
				}
			};
		}, [ymaps, routeData, startPoint.coordinates, endPoint.coordinates]);

		const handleMapClick = (e: any) => {
			if (onMapClick) {
				const coords = e.get("coords") as [number, number];
				onMapClick(coords);
			}
		};

		return (
			<Map
				instanceRef={mapRef}
				defaultState={{
					center: startPoint.coordinates || [55.751574, 37.573856],
					zoom: 10,
				}}
				width="100%"
				height="500px"
				onClick={handleMapClick}
			>
				{/* Стартовая точка */}
				{startPoint.coordinates && (
					<Placemark
						geometry={startPoint.coordinates}
						properties={{
							balloonContent: `
								<div style="padding: 8px;">
									<strong>Точка отправления</strong><br/>
									${startPoint.address || "Координаты: " + startPoint.coordinates.join(", ")}
								</div>
							`,
							iconCaption: "A",
						}}
						options={{
							preset: "islands#greenStretchyIcon",
							draggable: false,
						}}
					/>
				)}

				{/* Конечная точка */}
				{endPoint.coordinates && (
					<Placemark
						geometry={endPoint.coordinates}
						properties={{
							balloonContent: `
								<div style="padding: 8px;">
									<strong>Точка назначения</strong><br/>
									${endPoint.address || "Координаты: " + endPoint.coordinates.join(", ")}
								</div>
							`,
							iconCaption: "B",
						}}
						options={{
							preset: "islands#redStretchyIcon",
							draggable: false,
						}}
					/>
				)}
			</Map>
		);
	},
	true,
	["geocode", "route"]
);

export const RoutePlannerPage: React.FC = () => {
	const [mapState] = useState({
		center: [55.751574, 37.573856] as [number, number],
		zoom: 10,
	});

	const [startPoint, setStartPoint] = useState<RoutePoint>({ address: "" });
	const [endPoint, setEndPoint] = useState<RoutePoint>({ address: "" });
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
	const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
	const [routeData, setRouteData] = useState<RouteResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [geocoding, setGeocoding] = useState(false);
	const [authenticated, setAuthenticated] = useState(isAuthenticated());
	const [username, setUsername] = useState(getUsername());
	const [showLoginForm, setShowLoginForm] = useState(false);
	const [startWeather, setStartWeather] = useState<WeatherResponse | null>(null);
	const [endWeather, setEndWeather] = useState<WeatherResponse | null>(null);
	const [loadingWeather, setLoadingWeather] = useState(false);

	const { toast } = useToast();

	// Обработчик успешного входа
	const handleLoginSuccess = (token: string) => {
		setAuthenticated(true);
		setUsername(getUsername());
		setShowLoginForm(false);
		toast({
			title: "Вход выполнен успешно",
			description: "Добро пожаловать в планировщик маршрутов!",
		});
		// Загружаем данные после успешного входа
		loadData();
	};

	// Обработчик выхода
	const handleLogout = () => {
		logout();
		setAuthenticated(false);
		setUsername(null);
		setVehicles([]);
		setDrivers([]);
		setSelectedVehicle(null);
		setSelectedDriver(null);
		setRouteData(null);
		toast({
			title: "Выход выполнен",
			description: "До свидания!",
		});
	};

	// Загрузка данных при монтировании
	useEffect(() => {
		loadData();
	}, [authenticated]);

	const loadData = async () => {
		try {
			const [vehiclesData, driversData] = await Promise.all([
				apiGet("/vehicles").then(handleApiResponse<{ data: Vehicle[] }>),
				apiGet("/drivers").then(handleApiResponse<{ data: Driver[] }>),
			]);

			setVehicles(vehiclesData.data || []);
			setDrivers(driversData.data || []);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);

			if (error instanceof Error && error.message.includes("авторизация")) {
				// Сброс авторизации при ошибке токена
				setAuthenticated(false);
				setUsername(null);
				toast({
					title: "Ошибка авторизации",
					description: "Необходимо войти в систему заново",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Ошибка загрузки",
				description: "Не удалось загрузить данные транспорта и водителей",
				variant: "destructive",
			});
		}
	};

	// Функция для получения погодных данных
	const fetchWeatherForecast = useCallback(
		async (lat: number, lon: number): Promise<WeatherResponse | null> => {
			try {
				const data = await apiGet(`/weather/forecast?lat=${lat}&lon=${lon}`).then(
					handleApiResponse<WeatherResponse>
				);
				return data;
			} catch (error) {
				console.error("Ошибка получения погодных данных:", error);
				return null;
			}
		},
		[]
	);

	// Функция для загрузки погоды для точек маршрута
	const loadWeatherForPoints = useCallback(async () => {
		if (!startPoint.coordinates && !endPoint.coordinates) return;

		setLoadingWeather(true);

		try {
			const promises: Promise<WeatherResponse | null>[] = [];

			if (startPoint.coordinates) {
				promises.push(
					fetchWeatherForecast(startPoint.coordinates[0], startPoint.coordinates[1])
				);
			} else {
				promises.push(Promise.resolve(null));
			}

			if (endPoint.coordinates) {
				promises.push(
					fetchWeatherForecast(endPoint.coordinates[0], endPoint.coordinates[1])
				);
			} else {
				promises.push(Promise.resolve(null));
			}

			const [startWeatherData, endWeatherData] = await Promise.all(promises);

			setStartWeather(startWeatherData);
			setEndWeather(endWeatherData);

			if (startWeatherData || endWeatherData) {
				toast({
					title: "Погодные данные загружены",
					description: "Прогноз погоды для точек маршрута обновлен",
				});
			}
		} catch (error) {
			console.error("Ошибка загрузки погодных данных:", error);
			toast({
				title: "Ошибка погоды",
				description: "Не удалось загрузить погодные данные",
				variant: "destructive",
			});
		} finally {
			setLoadingWeather(false);
		}
	}, [startPoint.coordinates, endPoint.coordinates, fetchWeatherForecast, toast]);

	// Геокодирование адреса
	const handleGeocode = useCallback(
		async (address: string, isStart: boolean) => {
			if (!address.trim()) return;

			setGeocoding(true);
			try {
				// Используем поиск места через routes API (публичный эндпоинт)
				const data = await apiGet(
					`/routes/find-place?query=${encodeURIComponent(address)}`
				).then(handleApiResponse<any[]>);

				if (data && data.length > 0) {
					const location = data[0];
					const coords: [number, number] = [location.latitude, location.longitude];

					if (isStart) {
						setStartPoint({ address, coordinates: coords });
					} else {
						setEndPoint({ address, coordinates: coords });
					}

					toast({
						title: "Адрес найден",
						description: `${location.displayName || location.name || address}`,
					});
					return;
				}

				// Фолбэк - мок геокодирование
				const mockCoordinates: Record<string, [number, number]> = {
					москва: [55.751574, 37.573856],
					"санкт-петербург": [59.939095, 30.315868],
					новосибирск: [55.030204, 82.92043],
					екатеринбург: [56.838011, 60.597465],
					"нижний новгород": [56.296504, 44.007457],
					казань: [55.796127, 49.106414],
				};

				const normalizedAddress = address.toLowerCase().trim();

				for (const [city, coords] of Object.entries(mockCoordinates)) {
					if (normalizedAddress.includes(city)) {
						if (isStart) {
							setStartPoint({ address, coordinates: coords });
						} else {
							setEndPoint({ address, coordinates: coords });
						}

						toast({
							title: "Адрес найден",
							description: `${city.charAt(0).toUpperCase() + city.slice(1)}`,
						});
						return;
					}
				}

				toast({
					title: "Адрес не найден",
					description: "Попробуйте указать точнее или используйте координаты",
					variant: "destructive",
				});
			} catch (error) {
				toast({
					title: "Ошибка геокодирования",
					description: "Не удалось найти указанный адрес",
					variant: "destructive",
				});
			} finally {
				setGeocoding(false);
			}
		},
		[toast]
	);

	// Расчет маршрута
	const handleCalculateRoute = useCallback(async () => {
		if (!startPoint.coordinates || !endPoint.coordinates) {
			toast({
				title: "Недостаточно данных",
				description: "Укажите точки отправления и назначения",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);

		try {
			const routeRequest: RouteRequest = {
				startLat: startPoint.coordinates[0],
				startLon: startPoint.coordinates[1],
				endLat: endPoint.coordinates[0],
				endLon: endPoint.coordinates[1],
				startAddress: startPoint.address,
				endAddress: endPoint.address,
				vehicleId: selectedVehicle?.id || null,
				driverId: selectedDriver?.id || null,
				cargoId: null,
				departureTime: null,
				profile: "truck",
				calcPoints: true,
				instructions: true,
				pointsEncoded: false,
				avoidTolls: false,
				avoidHighways: false,
				avoidUrbanAreas: false,
				considerWeather: true,
				considerTraffic: true,
			};

			// Используем публичный эндпоинт планирования маршрутов
			const params = new URLSearchParams({
				fromLat: startPoint.coordinates[0].toString(),
				fromLon: startPoint.coordinates[1].toString(),
				toLat: endPoint.coordinates[0].toString(),
				toLon: endPoint.coordinates[1].toString(),
				vehicleType: "truck",
			});

			const data = await apiGet(`/routes/plan?${params.toString()}`).then(
				handleApiResponse<RouteResponse>
			);

			setRouteData(data);

			// Загружаем погодные данные для точек маршрута
			loadWeatherForPoints();

			toast({
				title: "Маршрут построен",
				description: `Расстояние: ${Math.round(data.distance)}км, время: ${Math.round(data.duration)}мин`,
			});
		} catch (error) {
			// Мок-данные для демонстрации
			const distance = calculateDistance(
				startPoint.coordinates[0],
				startPoint.coordinates[1],
				endPoint.coordinates[0],
				endPoint.coordinates[1]
			);

			const mockRoute: RouteResponse = {
				distance: Math.round(distance),
				duration: Math.round(distance * 1.2), // ~1.2 мин на км
				coordinates: [
					[startPoint.coordinates[1], startPoint.coordinates[0]],
					[endPoint.coordinates[1], endPoint.coordinates[0]],
				],
				instructions: [],
				overallRiskScore: 2.5,
				weatherRiskScore: 2.0,
				roadQualityRiskScore: 3.0,
				trafficRiskScore: 2.5,
				estimatedFuelConsumption: Math.round(distance * 0.35 * 10) / 10,
				estimatedFuelCost: Math.round(distance * 0.35 * 55),
				estimatedTollCost: Math.round(distance * 1.5),
				estimatedDriverCost: Math.round(distance * 1.2 * 2.5),
				estimatedTotalCost: Math.round(
					distance * 0.35 * 55 + distance * 1.5 + distance * 1.2 * 2.5 + distance * 0.5
				),
			};

			setRouteData(mockRoute);

			toast({
				title: "Маршрут построен (демо)",
				description: `Расстояние: ${Math.round(distance)}км, время: ${Math.round(distance * 1.2)}мин`,
			});
		} finally {
			setLoading(false);
		}
	}, [startPoint, endPoint, selectedVehicle, selectedDriver, toast]);

	// Функция расчета расстояния между координатами
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

	const handleMapClick = (coords: [number, number]) => {
		// Можно добавить логику для установки точек кликом по карте
		console.log("Clicked coordinates:", coords);
	};

	const formatTime = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}ч ${mins}мин`;
	};

	const getRiskColor = (risk?: number) => {
		if (!risk) return "bg-gray-500";
		if (risk < 2) return "bg-green-500";
		if (risk < 4) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getRiskText = (risk?: number) => {
		if (!risk) return "Неизвестно";
		if (risk < 2) return "Низкий";
		if (risk < 4) return "Средний";
		return "Высокий";
	};

	// Функция для получения текущей погоды (ближайший прогноз)
	const getCurrentWeather = (weather: WeatherResponse): WeatherForecast | null => {
		if (!weather.forecasts || weather.forecasts.length === 0) return null;
		return weather.forecasts[0]; // Первый прогноз - самый актуальный
	};

	// Функция для форматирования температуры
	const formatTemperature = (temp: number): string => {
		return `${Math.round(temp)}°C`;
	};

	// Функция для получения иконки погоды
	const getWeatherIcon = (weatherMain: string) => {
		switch (weatherMain.toLowerCase()) {
			case "clear":
				return "☀️";
			case "clouds":
				return "☁️";
			case "rain":
				return "🌧️";
			case "snow":
				return "❄️";
			case "thunderstorm":
				return "⛈️";
			case "drizzle":
				return "🌦️";
			case "mist":
			case "fog":
				return "🌫️";
			default:
				return "🌤️";
		}
	};

	// Если пользователь не авторизован, показываем уведомление
	if (!authenticated) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="claude-card max-w-md w-full p-8 text-center">
					<div className="claude-logo w-16 h-16 mx-auto mb-6 flex items-center justify-center">
						<Route className="h-8 w-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-4">
						Планировщик маршрутов
					</h1>
					<p className="text-muted-foreground mb-6">
						Для доступа к планированию маршрутов необходимо войти в систему через
						главное меню
					</p>
					<div className="p-4 bg-muted rounded-lg">
						<p className="text-sm text-muted-foreground">
							💡 Воспользуйтесь боковым меню для входа в систему
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto p-6 space-y-6">
				{/* Заголовок в стиле Claude */}
				<div className="claude-gradient-primary rounded-lg p-6 text-white shadow-lg">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Планирование маршрутов</h1>
							<p className="text-white/90">
								Построите оптимальный маршрут с учетом погоды, трафика и требований
								РТО
							</p>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-white/80">
								Добро пожаловать, {username}!
							</span>
							<Button
								variant="outline"
								onClick={handleLogout}
								size="sm"
								className="border-white/30 text-white hover:bg-white/20"
							>
								Выйти
							</Button>
						</div>
					</div>
				</div>

				{/* Основная сетка */}
				<div className="grid lg:grid-cols-3 gap-6">
					{/* Панель ввода */}
					<Card className="lg:col-span-1 claude-card">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Route className="h-5 w-5" />
								Параметры маршрута
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Точка отправления */}
							<div className="space-y-2">
								<Label htmlFor="startPoint">Откуда</Label>
								<div className="flex gap-2">
									<Input
										id="startPoint"
										value={startPoint.address}
										onChange={(e) =>
											setStartPoint({
												...startPoint,
												address: e.target.value,
											})
										}
										placeholder="Введите адрес или город"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleGeocode(startPoint.address, true);
											}
										}}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() => handleGeocode(startPoint.address, true)}
										disabled={geocoding || !startPoint.address.trim()}
									>
										<Search className="h-4 w-4" />
									</Button>
								</div>
								{startPoint.coordinates && (
									<div className="text-sm text-muted-foreground">
										📍 {startPoint.coordinates[0].toFixed(4)},{" "}
										{startPoint.coordinates[1].toFixed(4)}
									</div>
								)}
							</div>

							{/* Точка назначения */}
							<div className="space-y-2">
								<Label htmlFor="endPoint">Куда</Label>
								<div className="flex gap-2">
									<Input
										id="endPoint"
										value={endPoint.address}
										onChange={(e) =>
											setEndPoint({ ...endPoint, address: e.target.value })
										}
										placeholder="Введите адрес или город"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleGeocode(endPoint.address, false);
											}
										}}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() => handleGeocode(endPoint.address, false)}
										disabled={geocoding || !endPoint.address.trim()}
									>
										<Search className="h-4 w-4" />
									</Button>
								</div>
								{endPoint.coordinates && (
									<div className="text-sm text-muted-foreground">
										📍 {endPoint.coordinates[0].toFixed(4)},{" "}
										{endPoint.coordinates[1].toFixed(4)}
									</div>
								)}
							</div>

							<Separator />

							{/* Выбор транспорта */}
							<div className="space-y-2">
								<Label>Транспортное средство</Label>
								<Select
									value={selectedVehicle?.id.toString() || ""}
									onValueChange={(value) => {
										const vehicle = vehicles.find(
											(v) => v.id === parseInt(value)
										);
										setSelectedVehicle(vehicle || null);
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Выберите транспорт" />
									</SelectTrigger>
									<SelectContent>
										{vehicles.map((vehicle) => (
											<SelectItem
												key={vehicle.id}
												value={vehicle.id.toString()}
											>
												<div className="flex items-center gap-2">
													<Truck className="h-4 w-4" />
													<span>
														{vehicle.brand} {vehicle.model}
													</span>
													<Badge variant="outline">
														{vehicle.licensePlate}
													</Badge>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Выбор водителя */}
							<div className="space-y-2">
								<Label>Водитель</Label>
								<Select
									value={selectedDriver?.id.toString() || ""}
									onValueChange={(value) => {
										const driver = drivers.find(
											(d) => d.id === parseInt(value)
										);
										setSelectedDriver(driver || null);
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Выберите водителя" />
									</SelectTrigger>
									<SelectContent>
										{drivers.map((driver) => (
											<SelectItem
												key={driver.id}
												value={driver.id.toString()}
											>
												<div className="flex items-center justify-between w-full">
													<span>
														{driver.firstName} {driver.lastName}
													</span>
													<Badge
														variant={
															driver.currentDrivingStatus ===
															"AVAILABILITY"
																? "default"
																: "secondary"
														}
													>
														{driver.currentDrivingStatus ===
														"AVAILABILITY"
															? "Доступен"
															: "На отдыхе"}
													</Badge>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Separator />

							{/* Кнопка загрузки погоды */}
							<Button
								onClick={loadWeatherForPoints}
								disabled={
									loadingWeather ||
									(!startPoint.coordinates && !endPoint.coordinates)
								}
								variant="outline"
								className="w-full"
							>
								{loadingWeather ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
										Загрузка погоды...
									</>
								) : (
									<>
										<CloudRain className="mr-2 h-4 w-4" />
										Получить погоду
									</>
								)}
							</Button>

							{/* Кнопка расчета */}
							<Button
								onClick={handleCalculateRoute}
								disabled={
									loading || !startPoint.coordinates || !endPoint.coordinates
								}
								className="w-full interactive-button-claude"
							>
								{loading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
										Расчет маршрута...
									</>
								) : (
									<>
										<Navigation className="h-4 w-4 mr-2" />
										Построить маршрут
									</>
								)}
							</Button>

							{/* Результаты расчета */}
							{routeData && (
								<div className="space-y-3 pt-4">
									<div className="grid grid-cols-2 gap-2">
										<div className="claude-card p-3 text-center">
											<div className="flex items-center justify-center mb-1">
												<Route className="h-4 w-4 text-primary" />
											</div>
											<div className="text-xs text-muted-foreground">
												Расстояние
											</div>
											<div className="text-lg font-bold text-foreground">
												{routeData.distance}км
											</div>
										</div>
										<div className="claude-card p-3 text-center">
											<div className="flex items-center justify-center mb-1">
												<Clock className="h-4 w-4 text-primary" />
											</div>
											<div className="text-xs text-muted-foreground">
												Время
											</div>
											<div className="text-lg font-bold text-foreground">
												{formatTime(routeData.duration)}
											</div>
										</div>
									</div>

									{routeData.estimatedTotalCost && (
										<div className="claude-gradient-secondary rounded-lg p-4 text-white text-center">
											<div className="flex items-center justify-center mb-1">
												<DollarSign className="h-5 w-5" />
											</div>
											<div className="text-sm text-white/90">
												Общая стоимость
											</div>
											<div className="text-xl font-bold">
												{routeData.estimatedTotalCost.toLocaleString()}₽
											</div>
										</div>
									)}

									{routeData.overallRiskScore && (
										<div className="claude-card p-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<AlertTriangle className="h-4 w-4 text-destructive" />
													<span className="text-sm text-foreground">
														Общий риск:
													</span>
												</div>
												<Badge
													className={getRiskColor(
														routeData.overallRiskScore
													)}
												>
													{getRiskText(routeData.overallRiskScore)}
												</Badge>
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Погодные данные */}
					{(startWeather || endWeather) && (
						<Card className="claude-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CloudRain className="h-5 w-5 text-primary" />
									Погодные условия
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Погода в точке отправления */}
									{startWeather && startPoint.coordinates && (
										<div className="space-y-3">
											<h4 className="font-medium text-sm text-muted-foreground">
												📍 Откуда: {startPoint.address}
											</h4>
											{(() => {
												const currentWeather =
													getCurrentWeather(startWeather);
												if (!currentWeather) return null;

												return (
													<div className="claude-gradient-primary rounded-lg p-4 text-white">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<span className="text-2xl">
																	{getWeatherIcon(
																		currentWeather.weatherMain
																	)}
																</span>
																<div>
																	<div className="font-semibold">
																		{formatTemperature(
																			currentWeather.temperature
																		)}
																	</div>
																	<div className="text-sm text-white/80">
																		{
																			currentWeather.weatherDescription
																		}
																	</div>
																</div>
															</div>
															<div className="text-right text-sm">
																<div className="flex items-center gap-1">
																	<Wind className="h-3 w-3" />
																	{Math.round(
																		currentWeather.windSpeed
																	)}{" "}
																	м/с
																</div>
																<div className="flex items-center gap-1">
																	<Eye className="h-3 w-3" />
																	{Math.round(
																		currentWeather.humidity
																	)}
																	%
																</div>
															</div>
														</div>
													</div>
												);
											})()}
										</div>
									)}

									{/* Погода в точке назначения */}
									{endWeather && endPoint.coordinates && (
										<div className="space-y-3">
											<h4 className="font-medium text-sm text-muted-foreground">
												🎯 Куда: {endPoint.address}
											</h4>
											{(() => {
												const currentWeather =
													getCurrentWeather(endWeather);
												if (!currentWeather) return null;

												return (
													<div className="claude-gradient-secondary rounded-lg p-4 text-white">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<span className="text-2xl">
																	{getWeatherIcon(
																		currentWeather.weatherMain
																	)}
																</span>
																<div>
																	<div className="font-semibold">
																		{formatTemperature(
																			currentWeather.temperature
																		)}
																	</div>
																	<div className="text-sm text-white/80">
																		{
																			currentWeather.weatherDescription
																		}
																	</div>
																</div>
															</div>
															<div className="text-right text-sm">
																<div className="flex items-center gap-1">
																	<Wind className="h-3 w-3" />
																	{Math.round(
																		currentWeather.windSpeed
																	)}{" "}
																	м/с
																</div>
																<div className="flex items-center gap-1">
																	<Eye className="h-3 w-3" />
																	{Math.round(
																		currentWeather.humidity
																	)}
																	%
																</div>
															</div>
														</div>
													</div>
												);
											})()}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Карта */}
					<Card className="lg:col-span-2 claude-card">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Карта маршрута
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<YMaps
								query={{
									apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY || "",
									lang: "ru_RU",
									load: "package.standard",
								}}
							>
								<RoutePlannerMap
									startPoint={startPoint}
									endPoint={endPoint}
									routeData={routeData}
									onMapClick={handleMapClick}
								/>
							</YMaps>
						</CardContent>
					</Card>
				</div>

				{/* Детальная аналитика */}
				{routeData && (
					<Card className="claude-card">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5 text-primary" />
								Аналитика маршрута
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="economics" className="space-y-4">
								<TabsList>
									<TabsTrigger value="economics">Экономика</TabsTrigger>
									<TabsTrigger value="risks">Риски</TabsTrigger>
									<TabsTrigger value="weather">Погода</TabsTrigger>
									<TabsTrigger value="details">Детали</TabsTrigger>
								</TabsList>

								<TabsContent value="economics" className="space-y-4">
									<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
										{routeData.estimatedFuelCost && (
											<div className="claude-card p-4">
												<div className="flex items-center gap-2 mb-3">
													<Fuel className="h-4 w-4 text-primary" />
													<div className="font-semibold text-sm">
														Топливо
													</div>
												</div>
												<div className="text-lg font-bold text-foreground">
													{routeData.estimatedFuelCost.toLocaleString()}₽
												</div>
												<div className="text-xs text-muted-foreground">
													{routeData.estimatedFuelConsumption}л
												</div>
											</div>
										)}

										{routeData.estimatedTollCost && (
											<div className="claude-card p-4">
												<div className="flex items-center gap-2 mb-3">
													<DollarSign className="h-4 w-4 text-primary" />
													<div className="font-semibold text-sm">
														Платные дороги
													</div>
												</div>
												<div className="text-lg font-bold text-foreground">
													{routeData.estimatedTollCost.toLocaleString()}₽
												</div>
											</div>
										)}

										{routeData.estimatedDriverCost && (
											<div className="claude-card p-4">
												<div className="flex items-center gap-2 mb-3">
													<Timer className="h-4 w-4 text-primary" />
													<div className="font-semibold text-sm">
														Работа водителя
													</div>
												</div>
												<div className="text-lg font-bold text-foreground">
													{routeData.estimatedDriverCost.toLocaleString()}
													₽
												</div>
											</div>
										)}

										{routeData.estimatedTotalCost && (
											<div className="claude-gradient-primary rounded-lg p-4 text-white">
												<div className="flex items-center gap-2 mb-3">
													<TrendingUp className="h-5 w-5" />
													<div className="font-semibold">
														Общая стоимость
													</div>
												</div>
												<div className="text-xl font-bold">
													{routeData.estimatedTotalCost.toLocaleString()}₽
												</div>
											</div>
										)}
									</div>
								</TabsContent>

								<TabsContent value="risks" className="space-y-4">
									<div className="grid md:grid-cols-3 gap-4">
										{routeData.weatherRiskScore && (
											<div className="claude-card p-4">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<CloudRain className="h-4 w-4 text-primary" />
														<span className="font-semibold text-sm">
															Погодные условия
														</span>
													</div>
													<Badge
														className={getRiskColor(
															routeData.weatherRiskScore
														)}
													>
														{getRiskText(routeData.weatherRiskScore)}
													</Badge>
												</div>
												<Progress
													value={(routeData.weatherRiskScore / 5) * 100}
													className="mt-2"
												/>
											</div>
										)}

										{routeData.roadQualityRiskScore && (
											<div className="claude-card p-4">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<AlertTriangle className="h-4 w-4 text-primary" />
														<span className="font-semibold text-sm">
															Качество дорог
														</span>
													</div>
													<Badge
														className={getRiskColor(
															routeData.roadQualityRiskScore
														)}
													>
														{getRiskText(
															routeData.roadQualityRiskScore
														)}
													</Badge>
												</div>
												<Progress
													value={
														(routeData.roadQualityRiskScore / 5) * 100
													}
													className="mt-2"
												/>
											</div>
										)}

										{routeData.trafficRiskScore && (
											<div className="claude-card p-4">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<Zap className="h-4 w-4 text-primary" />
														<span className="font-semibold text-sm">
															Трафик
														</span>
													</div>
													<Badge
														className={getRiskColor(
															routeData.trafficRiskScore
														)}
													>
														{getRiskText(routeData.trafficRiskScore)}
													</Badge>
												</div>
												<Progress
													value={(routeData.trafficRiskScore / 5) * 100}
													className="mt-2"
												/>
											</div>
										)}
									</div>
								</TabsContent>

								<TabsContent value="weather" className="space-y-4">
									{startWeather || endWeather ? (
										<div className="grid md:grid-cols-2 gap-6">
											{/* Прогноз для точки отправления */}
											{startWeather && (
												<div>
													<h4 className="font-semibold mb-3 flex items-center gap-2">
														<MapPin className="h-4 w-4" />
														{startWeather.cityName} (откуда)
													</h4>
													<div className="space-y-2 max-h-64 overflow-y-auto">
														{startWeather.forecasts
															.slice(0, 8)
															.map((forecast, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
																>
																	<div className="flex items-center gap-2">
																		<span>
																			{getWeatherIcon(
																				forecast.weatherMain
																			)}
																		</span>
																		<div>
																			<div className="font-medium">
																				{new Date(
																					forecast.forecastTime
																				).toLocaleDateString(
																					"ru-RU",
																					{
																						month: "short",
																						day: "numeric",
																						hour: "2-digit",
																						minute: "2-digit",
																					}
																				)}
																			</div>
																			<div className="text-muted-foreground text-xs">
																				{
																					forecast.weatherDescription
																				}
																			</div>
																		</div>
																	</div>
																	<div className="text-right">
																		<div className="font-medium">
																			{formatTemperature(
																				forecast.temperature
																			)}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{Math.round(
																				forecast.windSpeed
																			)}{" "}
																			м/с
																		</div>
																	</div>
																</div>
															))}
													</div>
												</div>
											)}

											{/* Прогноз для точки назначения */}
											{endWeather && (
												<div>
													<h4 className="font-semibold mb-3 flex items-center gap-2">
														<MapPin className="h-4 w-4" />
														{endWeather.cityName} (куда)
													</h4>
													<div className="space-y-2 max-h-64 overflow-y-auto">
														{endWeather.forecasts
															.slice(0, 8)
															.map((forecast, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
																>
																	<div className="flex items-center gap-2">
																		<span>
																			{getWeatherIcon(
																				forecast.weatherMain
																			)}
																		</span>
																		<div>
																			<div className="font-medium">
																				{new Date(
																					forecast.forecastTime
																				).toLocaleDateString(
																					"ru-RU",
																					{
																						month: "short",
																						day: "numeric",
																						hour: "2-digit",
																						minute: "2-digit",
																					}
																				)}
																			</div>
																			<div className="text-muted-foreground text-xs">
																				{
																					forecast.weatherDescription
																				}
																			</div>
																		</div>
																	</div>
																	<div className="text-right">
																		<div className="font-medium">
																			{formatTemperature(
																				forecast.temperature
																			)}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{Math.round(
																				forecast.windSpeed
																			)}{" "}
																			м/с
																		</div>
																	</div>
																</div>
															))}
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="text-center py-8">
											<CloudRain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
											<p className="text-muted-foreground">
												Погодные данные не загружены
											</p>
											<p className="text-sm text-muted-foreground mt-2">
												Нажмите "Получить погоду" после указания точек
												маршрута
											</p>
										</div>
									)}
								</TabsContent>

								<TabsContent value="details" className="space-y-4">
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<h4 className="font-semibold mb-3">
												Информация о маршруте
											</h4>
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Откуда:
													</span>
													<span>{startPoint.address}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Куда:
													</span>
													<span>{endPoint.address}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Расстояние:
													</span>
													<span>{routeData.distance}км</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Время в пути:
													</span>
													<span>{formatTime(routeData.duration)}</span>
												</div>
											</div>
										</div>

										{selectedVehicle && (
											<div>
												<h4 className="font-semibold mb-3">
													Транспортное средство
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Модель:
														</span>
														<span>
															{selectedVehicle.brand}{" "}
															{selectedVehicle.model}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Номер:
														</span>
														<span>{selectedVehicle.licensePlate}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Расход:
														</span>
														<span>
															{
																selectedVehicle.fuelConsumptionPer100km
															}
															л/100км
														</span>
													</div>
												</div>
											</div>
										)}
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				)}

				{/* Диалог авторизации */}
				<Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Войти в систему</DialogTitle>
						</DialogHeader>
						<div className="py-4">
							<LoginForm onLoginSuccess={handleLoginSuccess} />
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};
