import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	CloudRain,
	Wind,
	Thermometer,
	Eye,
	AlertTriangle,
	Navigation,
	MapPin,
	Clock,
	Snowflake,
	Sun,
	Cloud,
	CloudSnow,
	Zap,
	RefreshCw,
	TrendingUp,
	TrendingDown,
	Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
	useGetRouteWeatherForecastMutation,
	useGetHazardWarningsMutation,
	useGetCurrentWeatherQuery,
} from "@/shared/api/weatherSlice";
import type {
	RouteResponse,
	RouteWeatherForecast,
	WeatherHazardWarning,
	WeatherData,
} from "@/shared/types/api";

interface WeatherDashboardProps {
	route: RouteResponse;
	departureTime: string;
	currentLocation?: { lat: number; lon: number };
	className?: string;
}

interface WeatherAlert {
	id: string;
	type: "warning" | "info" | "danger";
	title: string;
	message: string;
	time?: string;
	distance?: number;
}

const WEATHER_ICONS = {
	RAIN: CloudRain,
	SNOW: Snowflake,
	ICE: CloudSnow,
	FOG: Cloud,
	WIND: Wind,
	STORM: Zap,
	CLEAR: Sun,
	CLOUDS: Cloud,
	THUNDERSTORM: Zap,
};

const SEVERITY_CONFIG = {
	LOW: { color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" },
	MEDIUM: { color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
	HIGH: { color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50" },
	EXTREME: { color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
};

export function WeatherDashboard({
	route,
	departureTime,
	currentLocation,
	className,
}: WeatherDashboardProps) {
	const [routeWeatherForecast, setRouteWeatherForecast] = useState<RouteWeatherForecast | null>(
		null
	);
	const [hazardWarnings, setHazardWarnings] = useState<WeatherHazardWarning[]>([]);
	const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
	const [selectedPoint, setSelectedPoint] = useState<number>(0);
	const [autoRefresh, setAutoRefresh] = useState(false);

	// Мутации для получения данных о погоде
	const [getRouteWeatherForecast, { isLoading: isLoadingForecast }] =
		useGetRouteWeatherForecastMutation();
	const [getHazardWarnings, { isLoading: isLoadingWarnings }] = useGetHazardWarningsMutation();

	// Текущая погода для текущего местоположения
	const { data: currentWeather, refetch: refetchCurrentWeather } = useGetCurrentWeatherQuery(
		currentLocation
			? { lat: currentLocation.lat, lon: currentLocation.lon }
			: { lat: 0, lon: 0 },
		{ skip: !currentLocation }
	);

	// Загрузка прогноза погоды для маршрута
	const loadWeatherData = async () => {
		try {
			const forecastResult = await getRouteWeatherForecast({
				route,
				departureTime,
			}).unwrap();
			setRouteWeatherForecast(forecastResult);

			const warningsResult = await getHazardWarnings({
				route,
				departureTime,
			}).unwrap();
			setHazardWarnings(warningsResult);

			// Генерируем алерты на основе предупреждений
			const alerts: WeatherAlert[] = warningsResult.map((warning, index) => ({
				id: `warning-${index}`,
				type:
					warning.severity === "EXTREME" || warning.severity === "HIGH"
						? "danger"
						: "warning",
				title: getWeatherTypeLabel(warning.type),
				message: warning.description,
				time: warning.timeStart,
				distance: calculateDistanceToWarning(warning, route),
			}));
			setWeatherAlerts(alerts);
		} catch (error) {
			console.error("Ошибка при загрузке погодных данных:", error);
		}
	};

	useEffect(() => {
		if (route && departureTime) {
			loadWeatherData();
		}
	}, [route, departureTime]);

	// Автообновление каждые 10 минут
	useEffect(() => {
		if (autoRefresh) {
			const interval = setInterval(
				() => {
					loadWeatherData();
					if (currentLocation) {
						refetchCurrentWeather();
					}
				},
				10 * 60 * 1000
			); // 10 минут

			return () => clearInterval(interval);
		}
	}, [autoRefresh, currentLocation]);

	const getWeatherTypeLabel = (type: string): string => {
		const labels = {
			RAIN: "Дождь",
			SNOW: "Снег",
			ICE: "Гололед",
			FOG: "Туман",
			WIND: "Сильный ветер",
			STORM: "Шторм",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const calculateDistanceToWarning = (
		warning: WeatherHazardWarning,
		route: RouteResponse
	): number => {
		// Простая оценка расстояния до предупреждения
		// В реальной реализации нужно вычислить точное расстояние по маршруту
		return Math.random() * route.distance; // Временная заглушка
	};

	const getWeatherIcon = (type: string) => {
		const IconComponent = WEATHER_ICONS[type as keyof typeof WEATHER_ICONS] || Cloud;
		return <IconComponent className="h-5 w-5" />;
	};

	const formatTemperature = (temp: number): string => {
		return `${Math.round(temp)}°C`;
	};

	const formatWindSpeed = (speed: number): string => {
		return `${Math.round(speed)} м/с`;
	};

	const formatVisibility = (visibility: number): string => {
		if (visibility >= 1000) {
			return `${Math.round(visibility / 1000)} км`;
		}
		return `${visibility} м`;
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок с текущей погодой */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Navigation className="h-6 w-6 text-blue-600" />
					<div>
						<h2 className="text-2xl font-bold">Погода на маршруте</h2>
						<p className="text-sm text-muted-foreground">
							Аналитика и предупреждения для безопасной поездки
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setAutoRefresh(!autoRefresh)}
						className={cn(autoRefresh && "bg-blue-50 border-blue-200")}
					>
						<RefreshCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
						Автообновление
					</Button>
					<Button variant="outline" size="sm" onClick={loadWeatherData}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Обновить
					</Button>
				</div>
			</div>

			{/* Алерты и предупреждения */}
			{weatherAlerts.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-lg font-semibold flex items-center">
						<AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
						Погодные предупреждения
					</h3>
					<div className="grid gap-3">
						{weatherAlerts.map((alert) => (
							<Alert
								key={alert.id}
								variant={alert.type === "danger" ? "destructive" : "default"}
							>
								<AlertTriangle className="h-4 w-4" />
								<AlertTitle className="flex items-center justify-between">
									{alert.title}
									{alert.distance && (
										<Badge variant="outline">
											{Math.round(alert.distance / 1000)} км
										</Badge>
									)}
								</AlertTitle>
								<AlertDescription>{alert.message}</AlertDescription>
							</Alert>
						))}
					</div>
				</div>
			)}

			{/* Текущая погода */}
			{currentWeather && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<MapPin className="h-5 w-5 mr-2" />
							Текущие условия
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center space-x-2">
								<Thermometer className="h-5 w-5 text-red-500" />
								<div>
									<p className="text-sm text-muted-foreground">Температура</p>
									<p className="font-semibold">
										{formatTemperature(currentWeather.temperature)}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Wind className="h-5 w-5 text-blue-500" />
								<div>
									<p className="text-sm text-muted-foreground">Ветер</p>
									<p className="font-semibold">
										{formatWindSpeed(currentWeather.windSpeed)}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Eye className="h-5 w-5 text-gray-500" />
								<div>
									<p className="text-sm text-muted-foreground">Видимость</p>
									<p className="font-semibold">
										{currentWeather.visibility
											? formatVisibility(currentWeather.visibility)
											: "Хорошая"}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{getWeatherIcon(currentWeather.weatherMain || "CLEAR")}
								<div>
									<p className="text-sm text-muted-foreground">Состояние</p>
									<p className="font-semibold">
										{currentWeather.weatherDescription || "Ясно"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Основные вкладки */}
			<Tabs defaultValue="forecast" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="forecast">Прогноз по маршруту</TabsTrigger>
					<TabsTrigger value="warnings">Предупреждения</TabsTrigger>
					<TabsTrigger value="analytics">Аналитика рисков</TabsTrigger>
				</TabsList>

				<TabsContent value="forecast" className="space-y-4">
					{routeWeatherForecast ? (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Прогноз погоды по точкам маршрута</CardTitle>
									<CardDescription>
										Выберите точку для просмотра подробного прогноза
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-96">
										<div className="space-y-3">
											{routeWeatherForecast.weatherPoints?.map(
												(point, index) => (
													<div
														key={index}
														className={cn(
															"p-4 border rounded-lg cursor-pointer transition-colors",
															selectedPoint === index
																? "border-blue-500 bg-blue-50"
																: "hover:bg-gray-50"
														)}
														onClick={() => setSelectedPoint(index)}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-3">
																{getWeatherIcon(
																	point.weather.weatherMain ||
																		"CLEAR"
																)}
																<div>
																	<p className="font-medium">
																		Точка {index + 1}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{new Date(
																			point.time
																		).toLocaleString("ru-RU")}
																	</p>
																</div>
															</div>
															<div className="text-right">
																<p className="font-semibold text-lg">
																	{formatTemperature(
																		point.weather.temperature
																	)}
																</p>
																<p className="text-sm text-muted-foreground">
																	{
																		point.weather
																			.weatherDescription
																	}
																</p>
															</div>
														</div>
														<div className="mt-3 grid grid-cols-3 gap-4 text-sm">
															<div>
																<span className="text-muted-foreground">
																	Ветер:{" "}
																</span>
																{formatWindSpeed(
																	point.weather.windSpeed
																)}
															</div>
															<div>
																<span className="text-muted-foreground">
																	Влажность:{" "}
																</span>
																{point.weather.humidity}%
															</div>
															<div>
																<span className="text-muted-foreground">
																	Давление:{" "}
																</span>
																{Math.round(point.weather.pressure)}{" "}
																гПа
															</div>
														</div>
													</div>
												)
											)}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="text-center py-8">
							<Cloud className="h-12 w-12 mx-auto text-gray-400 mb-4" />
							<p className="text-muted-foreground">Загрузка прогноза погоды...</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="warnings" className="space-y-4">
					{hazardWarnings.length > 0 ? (
						<div className="space-y-4">
							{hazardWarnings.map((warning, index) => (
								<Card key={index}>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="flex items-center">
												{getWeatherIcon(warning.type)}
												<span className="ml-2">
													{getWeatherTypeLabel(warning.type)}
												</span>
											</CardTitle>
											<Badge
												variant={
													warning.severity === "EXTREME"
														? "destructive"
														: "secondary"
												}
												className={cn(
													SEVERITY_CONFIG[
														warning.severity as keyof typeof SEVERITY_CONFIG
													]?.bgColor,
													SEVERITY_CONFIG[
														warning.severity as keyof typeof SEVERITY_CONFIG
													]?.textColor
												)}
											>
												{warning.severity}
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<p>{warning.description}</p>
											{warning.recommendations &&
												warning.recommendations.length > 0 && (
													<div>
														<p className="font-semibold text-sm mb-2">
															Рекомендации:
														</p>
														<ul className="text-sm space-y-1">
															{warning.recommendations.map(
																(rec, idx) => (
																	<li
																		key={idx}
																		className="flex items-start"
																	>
																		<span className="text-blue-500 mr-2">
																			•
																		</span>
																		{rec}
																	</li>
																)
															)}
														</ul>
													</div>
												)}
											<div className="flex items-center justify-between text-sm text-muted-foreground">
												<span>
													Время:{" "}
													{new Date(warning.timeStart).toLocaleString(
														"ru-RU"
													)}
												</span>
												<span>
													Координаты: {warning.location.lat.toFixed(4)},{" "}
													{warning.location.lng.toFixed(4)}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Sun className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
							<p className="text-muted-foreground">Погодных предупреждений нет</p>
							<p className="text-sm text-muted-foreground">
								Условия благоприятны для поездки
							</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					{routeWeatherForecast && (
						<div className="grid gap-4">
							<Card>
								<CardHeader>
									<CardTitle>Общий риск погодных условий</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span>Уровень риска:</span>
											<Badge
												variant={
													routeWeatherForecast.overallRisk === "HIGH"
														? "destructive"
														: "secondary"
												}
												className={cn(
													SEVERITY_CONFIG[
														routeWeatherForecast.overallRisk as keyof typeof SEVERITY_CONFIG
													]?.bgColor,
													SEVERITY_CONFIG[
														routeWeatherForecast.overallRisk as keyof typeof SEVERITY_CONFIG
													]?.textColor
												)}
											>
												{routeWeatherForecast.overallRisk}
											</Badge>
										</div>
										<Progress
											value={
												routeWeatherForecast.overallRisk === "LOW"
													? 25
													: routeWeatherForecast.overallRisk === "MEDIUM"
														? 50
														: routeWeatherForecast.overallRisk ===
															  "HIGH"
															? 75
															: 100
											}
											className="h-2"
										/>
									</div>
								</CardContent>
							</Card>

							{routeWeatherForecast.recommendations &&
								routeWeatherForecast.recommendations.length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center">
												<Info className="h-5 w-5 mr-2" />
												Рекомендации
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="space-y-2">
												{routeWeatherForecast.recommendations.map(
													(rec, index) => (
														<li
															key={index}
															className="flex items-start"
														>
															<span className="text-blue-500 mr-2 mt-1">
																•
															</span>
															{rec}
														</li>
													)
												)}
											</ul>
										</CardContent>
									</Card>
								)}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
