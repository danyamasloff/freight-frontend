import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Cloud,
	CloudRain,
	Sun,
	Wind,
	Snowflake,
	MapPin,
	RefreshCw,
	Navigation,
	AlertTriangle,
	Eye,
} from "lucide-react";
import {
	useGetCurrentWeatherQuery,
	useGetRouteWeatherForecastMutation,
	useGetHazardWarningsMutation,
} from "@/shared/api/weatherSlice";
import type {
	WeatherData,
	RouteResponse,
	WeatherHazardWarning,
	RouteWeatherForecast,
} from "@/shared/types/api";

interface WeatherMapIntegrationProps {
	route?: RouteResponse;
	departureTime?: string;
	onLocationSelect?: (lat: number, lon: number) => void;
	onWeatherDataUpdate?: (weather: WeatherData) => void;
	className?: string;
}

interface WeatherPoint {
	id: string;
	lat: number;
	lon: number;
	weather?: WeatherData;
	type: "start" | "waypoint" | "end" | "warning";
	severity?: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
}

const WEATHER_ICONS = {
	Clear: Sun,
	Rain: CloudRain,
	Clouds: Cloud,
	Snow: Snowflake,
	Wind: Wind,
	RAIN: CloudRain,
	SNOW: Snowflake,
	ICE: Snowflake,
	FOG: Cloud,
	STORM: Wind,
};

export function WeatherMapIntegration({
	route,
	departureTime,
	onLocationSelect,
	onWeatherDataUpdate,
	className,
}: WeatherMapIntegrationProps) {
	const [selectedPoint, setSelectedPoint] = useState<WeatherPoint | null>(null);
	const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
	const [showWeatherLayer, setShowWeatherLayer] = useState(true);
	const [activeWarnings, setActiveWarnings] = useState<WeatherHazardWarning[]>([]);

	const [getRouteWeatherForecast, { isLoading: isLoadingForecast }] =
		useGetRouteWeatherForecastMutation();
	const [getHazardWarnings, { isLoading: isLoadingWarnings }] = useGetHazardWarningsMutation();

	// Получаем погоду для выбранной точки
	const { data: pointWeather, refetch: refetchPointWeather } = useGetCurrentWeatherQuery(
		{ lat: selectedPoint?.lat || 0, lon: selectedPoint?.lon || 0 },
		{ skip: !selectedPoint }
	);

	// Загружаем погодные данные для маршрута
	useEffect(() => {
		if (route && departureTime) {
			loadRouteWeatherData();
		}
	}, [route, departureTime]);

	// Обновляем точки на основе маршрута
	useEffect(() => {
		if (route?.coordinates && route.coordinates.length > 0) {
			generateWeatherPoints();
		}
	}, [route]);

	const loadRouteWeatherData = async () => {
		if (!route || !departureTime) return;

		try {
			const [forecast, warnings] = await Promise.all([
				getRouteWeatherForecast({ route, departureTime }).unwrap(),
				getHazardWarnings({ route, departureTime }).unwrap(),
			]);

			setActiveWarnings(warnings);
			updateWeatherPointsWithForecast(forecast);
		} catch (error) {
			console.error("Ошибка загрузки погодных данных:", error);
		}
	};

	const generateWeatherPoints = () => {
		if (!route?.coordinates) return;

		const points: WeatherPoint[] = [];
		const coords = route.coordinates;

		// Начальная точка
		if (coords.length > 0) {
			points.push({
				id: "start",
				lat: coords[0][1],
				lon: coords[0][0],
				type: "start",
			});
		}

		// Промежуточные точки (каждая 10-я точка для производительности)
		const step = Math.max(1, Math.floor(coords.length / 10));
		for (let i = step; i < coords.length - step; i += step) {
			points.push({
				id: `waypoint-${i}`,
				lat: coords[i][1],
				lon: coords[i][0],
				type: "waypoint",
			});
		}

		// Конечная точка
		if (coords.length > 1) {
			const lastIndex = coords.length - 1;
			points.push({
				id: "end",
				lat: coords[lastIndex][1],
				lon: coords[lastIndex][0],
				type: "end",
			});
		}

		setWeatherPoints(points);
	};

	const updateWeatherPointsWithForecast = (forecast: RouteWeatherForecast) => {
		setWeatherPoints((prevPoints) =>
			prevPoints.map((point) => {
				// Находим ближайший прогноз для точки
				const closestForecast = forecast.pointForecasts?.find(
					(pf) => Math.abs(pf.distanceFromStart) < 50 // в пределах 50 км
				);

				return {
					...point,
					weather: closestForecast?.weatherData,
				};
			})
		);
	};

	const handlePointClick = (point: WeatherPoint) => {
		setSelectedPoint(point);
		onLocationSelect?.(point.lat, point.lon);
	};

	const getWeatherIcon = (weatherMain: string, size: "sm" | "md" | "lg" = "md") => {
		const IconComponent = WEATHER_ICONS[weatherMain as keyof typeof WEATHER_ICONS] || Cloud;
		const sizeClass = {
			sm: "h-4 w-4",
			md: "h-5 w-5",
			lg: "h-6 w-6",
		}[size];
		return <IconComponent className={sizeClass} />;
	};

	const getPointTypeLabel = (type: string) => {
		const labels = {
			start: "Начало маршрута",
			waypoint: "Промежуточная точка",
			end: "Конец маршрута",
			warning: "Погодное предупреждение",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const getSeverityColor = (severity?: string) => {
		const colors = {
			LOW: "bg-blue-500",
			MEDIUM: "bg-yellow-500",
			HIGH: "bg-orange-500",
			EXTREME: "bg-red-500",
		};
		return colors[severity as keyof typeof colors] || "bg-gray-500";
	};

	const formatTemperature = (temp: number) => `${Math.round(temp)}°C`;

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Заголовок и управление */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<MapPin className="h-5 w-5" />
					Погода на карте
				</h3>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowWeatherLayer(!showWeatherLayer)}
					>
						<Eye className="h-4 w-4 mr-2" />
						{showWeatherLayer ? "Скрыть" : "Показать"} погоду
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={loadRouteWeatherData}
						disabled={isLoadingForecast || isLoadingWarnings}
					>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${isLoadingForecast || isLoadingWarnings ? "animate-spin" : ""}`}
						/>
						Обновить
					</Button>
				</div>
			</div>

			{/* Список точек маршрута с погодой */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{weatherPoints.map((point) => (
					<Card
						key={point.id}
						className={`cursor-pointer transition-all hover:shadow-md ${
							selectedPoint?.id === point.id ? "ring-2 ring-blue-500" : ""
						}`}
						onClick={() => handlePointClick(point)}
					>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className={`w-3 h-3 rounded-full ${
											point.type === "start"
												? "bg-green-500"
												: point.type === "end"
													? "bg-red-500"
													: "bg-blue-500"
										}`}
									/>
									<span className="text-sm font-medium">
										{getPointTypeLabel(point.type)}
									</span>
								</div>
								{point.weather && (
									<div className="flex items-center gap-1">
										{getWeatherIcon(point.weather.weatherMain, "sm")}
										<span className="text-sm">
											{formatTemperature(point.weather.temperature)}
										</span>
									</div>
								)}
							</div>

							{point.weather && (
								<div className="mt-2 text-xs text-muted-foreground">
									<p>{point.weather.weatherDescription}</p>
									{point.weather.riskScore && (
										<Badge
											variant={
												point.weather.riskScore > 50
													? "destructive"
													: "secondary"
											}
											className="mt-1"
										>
											Риск: {point.weather.riskScore}%
										</Badge>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Детали выбранной точки */}
			{selectedPoint && pointWeather && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Navigation className="h-4 w-4" />
							{getPointTypeLabel(selectedPoint.type)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center gap-2">
								{getWeatherIcon(pointWeather.weatherMain)}
								<div>
									<p className="text-sm font-medium">
										{pointWeather.weatherDescription}
									</p>
									<p className="text-xs text-muted-foreground">Условия</p>
								</div>
							</div>
							<div>
								<p className="text-lg font-bold">
									{formatTemperature(pointWeather.temperature)}
								</p>
								<p className="text-xs text-muted-foreground">Температура</p>
							</div>
							<div>
								<p className="text-sm font-medium">
									{Math.round(pointWeather.windSpeed)} м/с
								</p>
								<p className="text-xs text-muted-foreground">Ветер</p>
							</div>
							<div>
								<p className="text-sm font-medium">{pointWeather.humidity}%</p>
								<p className="text-xs text-muted-foreground">Влажность</p>
							</div>
						</div>

						{pointWeather.riskScore && pointWeather.riskScore > 30 && (
							<Alert className="mt-4">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Погодный риск:</strong> {pointWeather.riskScore}%
									{pointWeather.riskDescription && (
										<>
											<br />
											{pointWeather.riskDescription}
										</>
									)}
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			)}

			{/* Активные предупреждения */}
			{activeWarnings.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-orange-500" />
							Активные предупреждения ({activeWarnings.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{activeWarnings.map((warning, index) => (
								<Alert key={index} className="border-l-4 border-orange-500">
									<AlertDescription>
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">{warning.description}</p>
												<p className="text-sm text-muted-foreground">
													Расстояние:{" "}
													{warning.distanceFromStart.toFixed(1)} км
												</p>
											</div>
											<Badge
												variant="destructive"
												className={getSeverityColor(warning.severity)}
											>
												{warning.severity}
											</Badge>
										</div>
									</AlertDescription>
								</Alert>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Информация о статусе */}
			{!route && (
				<Alert>
					<MapPin className="h-4 w-4" />
					<AlertDescription>
						Выберите маршрут для отображения погодных данных на карте.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
