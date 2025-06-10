import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Cloud,
	CloudRain,
	Sun,
	Wind,
	AlertTriangle,
	RefreshCw,
	MapPin,
	Thermometer,
	Eye,
	Navigation,
	Shield,
	CheckCircle2,
	Droplets,
	Loader2,
} from "lucide-react";
import {
	useGetCurrentWeatherQuery,
	useGetRouteWeatherForecastMutation,
	useGetHazardWarningsMutation,
} from "@/shared/api/weatherSlice";
import type {
	RouteResponse,
	RouteDetail,
	WeatherData,
	RouteWeatherForecast,
	WeatherHazardWarning,
} from "@/shared/types/api";
import { useWeatherAnalytics, type RiskAssessment } from "../hooks/use-weather-analytics";
import { Separator } from "@/components/ui/separator";

interface RouteWeatherIntegrationProps {
	route: RouteResponse | RouteDetail;
	userLocation?: { lat: number; lon: number };
	departureTime?: string;
	onWeatherRiskUpdate?: (riskScore: number) => void;
	startPoint?: [number, number];
	endPoint?: [number, number];
	waypoints?: [number, number][];
}

const WEATHER_ICONS = {
	CLEAR: Sun,
	CLOUDS: Cloud,
	RAIN: CloudRain,
	SNOW: Wind,
	DRIZZLE: CloudRain,
	THUNDERSTORM: CloudRain,
	MIST: Cloud,
	FOG: Cloud,
};

export function RouteWeatherIntegration({
	route,
	userLocation,
	departureTime,
	onWeatherRiskUpdate,
	startPoint,
	endPoint,
	waypoints = [],
}: RouteWeatherIntegrationProps) {
	const [activeTab, setActiveTab] = useState("current");
	const [weatherRisks, setWeatherRisks] = useState<string[]>([]);

	// Определяем координаты для текущей погоды (местоположение пользователя или начало маршрута)
	const currentLocation = userLocation || {
		lat: route.coordinates?.[0]?.[1] || 0,
		lon: route.coordinates?.[0]?.[0] || 0,
	};

	// Получаем текущую погоду
	const {
		data: currentWeather,
		isLoading: isLoadingCurrent,
		refetch: refetchCurrent,
	} = useGetCurrentWeatherQuery(currentLocation);

	// Получаем прогноз погоды для маршрута
	const [getRouteWeatherForecast, { data: routeForecast, isLoading: isLoadingRoute }] =
		useGetRouteWeatherForecastMutation();

	// Получаем предупреждения о погодных опасностях
	const [getHazardWarnings, { data: hazardWarnings, isLoading: isLoadingHazards }] =
		useGetHazardWarningsMutation();

	// Загружаем данные о погоде для маршрута
	useEffect(() => {
		if (route && route.coordinates && route.coordinates.length > 0) {
			const routeData: RouteResponse = {
				distance: route.distance || 0,
				duration: route.duration || 0,
				coordinates: route.coordinates,
				instructions: route.instructions || [],
				departureTime: departureTime || new Date().toISOString(),
			};

			getRouteWeatherForecast({
				route: routeData,
				departureTime: departureTime || new Date().toISOString(),
			});

			getHazardWarnings({
				route: routeData,
				departureTime: departureTime || new Date().toISOString(),
			});
		}
	}, [route, departureTime, getRouteWeatherForecast, getHazardWarnings]);

	// Анализируем погодные риски
	useEffect(() => {
		const risks: string[] = [];
		let totalRiskScore = 0;

		if (currentWeather) {
			// Используем готовый riskScore из бэкенда
			if (currentWeather.riskScore) {
				totalRiskScore += currentWeather.riskScore;
			}

			// Анализ текущей погоды
			if (currentWeather.weatherMain === "RAIN" || currentWeather.weatherMain === "DRIZZLE") {
				risks.push("Дождь может ухудшить видимость и сцепление с дорогой");
			}
			if (currentWeather.weatherMain === "SNOW") {
				risks.push("Снег создает опасные условия для движения");
			}
			if (currentWeather.windSpeed > 15) {
				risks.push("Сильный ветер может затруднить управление транспортом");
			}
			if (currentWeather.visibility && currentWeather.visibility < 5000) {
				risks.push("Ограниченная видимость");
			}
			if (currentWeather.temperature < -10) {
				risks.push("Экстремально низкая температура");
			}

			// Добавляем описание рисков из бэкенда
			if (currentWeather.riskDescription) {
				risks.push(currentWeather.riskDescription);
			}
		}

		if (hazardWarnings && hazardWarnings.length > 0) {
			hazardWarnings.forEach((warning) => {
				switch (warning.severity) {
					case "EXTREME":
						totalRiskScore += 60;
						break;
					case "HIGH":
						totalRiskScore += 40;
						break;
					case "MEDIUM":
						totalRiskScore += 25;
						break;
					case "LOW":
						totalRiskScore += 10;
						break;
				}
			});
		}

		setWeatherRisks(risks);
		onWeatherRiskUpdate?.(Math.min(totalRiskScore, 100));
	}, [currentWeather, hazardWarnings, onWeatherRiskUpdate]);

	const getWeatherIcon = (weatherMain: string, size: "sm" | "md" | "lg" = "md") => {
		const IconComponent = WEATHER_ICONS[weatherMain as keyof typeof WEATHER_ICONS] || Sun;
		const sizeClass = {
			sm: "h-4 w-4",
			md: "h-6 w-6",
			lg: "h-8 w-8",
		}[size];
		return <IconComponent className={sizeClass} />;
	};

	const getRiskLevel = (score: number) => {
		if (score < 25)
			return { level: "Низкий", color: "bg-green-500", variant: "default" as const };
		if (score < 50)
			return { level: "Средний", color: "bg-yellow-500", variant: "secondary" as const };
		if (score < 75)
			return { level: "Высокий", color: "bg-orange-500", variant: "destructive" as const };
		return { level: "Критический", color: "bg-red-500", variant: "destructive" as const };
	};

	const formatTemperature = (temp: number) => `${Math.round(temp)}°C`;
	const formatWindSpeed = (speed: number) => `${Math.round(speed)} м/с`;
	const formatVisibility = (visibility: number) => `${Math.round(visibility / 1000)} км`;

	const handleRefresh = () => {
		refetchCurrent();
		if (route && route.coordinates && route.coordinates.length > 0) {
			const routeData: RouteResponse = {
				distance: route.distance || 0,
				duration: route.duration || 0,
				coordinates: route.coordinates,
				instructions: route.instructions || [],
				departureTime: departureTime || new Date().toISOString(),
			};

			getRouteWeatherForecast({
				route: routeData,
				departureTime: departureTime || new Date().toISOString(),
			});

			getHazardWarnings({
				route: routeData,
				departureTime: departureTime || new Date().toISOString(),
			});
		}
	};

	const { weatherData, riskAssessment, isLoading, error, refetch } = useWeatherAnalytics({
		startPoint,
		endPoint,
		waypoints,
		enabled: !!startPoint && !!endPoint,
	});

	// Уведомляем родительский компонент об изменении риска
	useEffect(() => {
		if (riskAssessment && onWeatherRiskUpdate) {
			onWeatherRiskUpdate(riskAssessment.overallRisk);
		}
	}, [riskAssessment, onWeatherRiskUpdate]);

	if (!startPoint || !endPoint) {
		return (
			<Card className="space-y-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CloudRain className="h-5 w-5" />
						Погодная аналитика
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Укажите начальную и конечную точки маршрута для получения погодной
							аналитики
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card className="space-y-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CloudRain className="h-5 w-5" />
						Погодная аналитика
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin mr-2" />
						<span>Анализ погодных условий...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="space-y-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CloudRain className="h-5 w-5" />
						Погодная аналитика
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription className="flex items-center justify-between">
							<span>Ошибка загрузки погодных данных: {error.message}</span>
							<Button variant="outline" size="sm" onClick={refetch}>
								<RefreshCw className="h-3 w-3 mr-1" />
								Повторить
							</Button>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (!weatherData || !riskAssessment) {
		return (
			<Card className="space-y-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CloudRain className="h-5 w-5" />
						Погодная аналитика
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<CloudRain className="h-4 w-4" />
						<AlertDescription>
							Нет данных о погоде для выбранного маршрута
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Погодные условия маршрута</h3>
					<p className="text-sm text-muted-foreground">
						Анализ погодных рисков относительно вашего местоположения
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleRefresh}
					disabled={isLoadingCurrent || isLoadingRoute || isLoadingHazards}
				>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${isLoadingCurrent || isLoadingRoute || isLoadingHazards ? "animate-spin" : ""}`}
					/>
					Обновить
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="current">Текущая погода</TabsTrigger>
					<TabsTrigger value="route">Прогноз по маршруту</TabsTrigger>
					<TabsTrigger value="risks">Риски и предупреждения</TabsTrigger>
				</TabsList>

				{/* Текущая погода */}
				<TabsContent value="current" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Ваше местоположение
								</CardTitle>
							</CardHeader>
							<CardContent>
								{currentWeather ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{getWeatherIcon(currentWeather.weatherMain)}
												<span className="font-medium">
													{currentWeather.weatherDescription}
												</span>
											</div>
											<span className="text-2xl font-bold">
												{formatTemperature(currentWeather.temperature)}
											</span>
										</div>
										<div className="grid grid-cols-2 gap-2 text-sm">
											<div>
												Ветер: {formatWindSpeed(currentWeather.windSpeed)}
											</div>
											<div>Влажность: {currentWeather.humidity}%</div>
											<div>
												Давление: {Math.round(currentWeather.pressure)} гПа
											</div>
											<div>
												Видимость:{" "}
												{currentWeather.visibility
													? formatVisibility(currentWeather.visibility)
													: "Хорошая"}
											</div>
										</div>
										{/* Показываем расчетные риски из бэкенда */}
										{currentWeather.riskScore && (
											<div className="pt-2 border-t">
												<div className="flex items-center justify-between text-sm">
													<span>Уровень риска:</span>
													<Badge
														variant={
															getRiskLevel(currentWeather.riskScore)
																.variant
														}
													>
														{currentWeather.riskLevel ||
															getRiskLevel(currentWeather.riskScore)
																.level}
													</Badge>
												</div>
												{currentWeather.riskDescription && (
													<p className="text-xs text-muted-foreground mt-2">
														{currentWeather.riskDescription}
													</p>
												)}
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-4">
										{isLoadingCurrent ? (
											<div className="flex items-center justify-center gap-2">
												<RefreshCw className="h-4 w-4 animate-spin" />
												Загрузка...
											</div>
										) : (
											<div className="text-muted-foreground">
												Данные о погоде недоступны
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Navigation className="h-4 w-4" />
									Начало маршрута
								</CardTitle>
							</CardHeader>
							<CardContent>
								{routeForecast?.pointForecasts?.[0] ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{getWeatherIcon(
													routeForecast.pointForecasts[0].weatherData
														.weatherMain
												)}
												<span className="font-medium">
													{
														routeForecast.pointForecasts[0].weatherData
															.weatherDescription
													}
												</span>
											</div>
											<span className="text-2xl font-bold">
												{formatTemperature(
													routeForecast.pointForecasts[0].weatherData
														.temperature
												)}
											</span>
										</div>
										<div className="text-sm text-muted-foreground">
											Прогноз на время отправления
										</div>
									</div>
								) : (
									<div className="text-center py-4">
										{isLoadingRoute ? (
											<div className="flex items-center justify-center gap-2">
												<RefreshCw className="h-4 w-4 animate-spin" />
												Загрузка прогноза...
											</div>
										) : (
											<div className="text-muted-foreground">
												Прогноз недоступен
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Прогноз по маршруту */}
				<TabsContent value="route" className="space-y-4">
					{routeForecast ? (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										Погодные условия по маршруту
									</CardTitle>
									{routeForecast.summary && (
										<p className="text-sm text-muted-foreground">
											{routeForecast.summary}
										</p>
									)}
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{routeForecast.pointForecasts?.map((point, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 border rounded-lg"
											>
												<div className="flex items-center gap-3">
													{getWeatherIcon(
														point.weatherData.weatherMain,
														"sm"
													)}
													<div>
														<div className="font-medium">
															Точка {point.pointIndex + 1} (
															{point.distanceFromStart.toFixed(1)} км)
														</div>
														<div className="text-sm text-muted-foreground">
															{new Date(
																point.estimatedTime
															).toLocaleTimeString("ru-RU", {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="font-medium">
														{formatTemperature(
															point.weatherData.temperature
														)}
													</div>
													<div className="text-sm text-muted-foreground">
														{point.weatherData.weatherDescription}
													</div>
													{point.weatherData.riskScore && (
														<Badge
															variant={
																getRiskLevel(
																	point.weatherData.riskScore
																).variant
															}
															className="mt-1"
														>
															Риск: {point.weatherData.riskScore}%
														</Badge>
													)}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					) : (
						<Card>
							<CardContent className="text-center py-8">
								{isLoadingRoute ? (
									<div className="flex items-center justify-center gap-2">
										<RefreshCw className="h-4 w-4 animate-spin" />
										Анализ погоды по маршруту...
									</div>
								) : (
									<div className="text-muted-foreground">
										Прогноз по маршруту недоступен
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Риски и предупреждения */}
				<TabsContent value="risks" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Shield className="h-4 w-4" />
									Общий уровень риска
								</CardTitle>
							</CardHeader>
							<CardContent>
								{routeForecast?.hasHazardousConditions !== undefined ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span>Уровень риска:</span>
											<Badge
												variant={
													routeForecast.hasHazardousConditions
														? "destructive"
														: "default"
												}
											>
												{routeForecast.hasHazardousConditions
													? "Высокий"
													: "Низкий"}
											</Badge>
										</div>
										<Progress
											value={routeForecast.hasHazardousConditions ? 75 : 25}
											className="h-2"
										/>
									</div>
								) : (
									<div className="text-muted-foreground">
										Анализ рисков недоступен
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<AlertTriangle className="h-4 w-4" />
									Рекомендации
								</CardTitle>
							</CardHeader>
							<CardContent>
								{routeForecast?.summary ? (
									<div className="text-sm">{routeForecast.summary}</div>
								) : (
									<div className="text-muted-foreground">
										Рекомендации отсутствуют
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Предупреждения о погодных опасностях */}
					{hazardWarnings && hazardWarnings.length > 0 && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<div className="font-medium">
										Обнаружены погодные опасности на маршруте:
									</div>
									<ul className="space-y-1">
										{hazardWarnings.map((warning, index) => (
											<li key={index} className="text-sm">
												<strong>{warning.hazardType}:</strong>{" "}
												{warning.description}
												<div className="text-xs text-muted-foreground">
													Расстояние:{" "}
													{warning.distanceFromStart.toFixed(1)} км
													{warning.recommendation && (
														<div className="mt-1 text-blue-600">
															💡 {warning.recommendation}
														</div>
													)}
												</div>
											</li>
										))}
									</ul>
								</div>
							</AlertDescription>
						</Alert>
					)}

					{/* Выявленные риски */}
					{weatherRisks.length > 0 && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">
									Выявленные погодные риски
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{weatherRisks.map((risk, index) => (
										<li key={index} className="flex items-start gap-2 text-sm">
											<AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
											{risk}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			<Card className="mt-4">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CloudRain className="h-5 w-5" />
							Погодная аналитика маршрута
						</div>
						<Badge variant={getRiskLevel(riskAssessment.overallRisk).variant}>
							Риск: {getRiskLevel(riskAssessment.overallRisk).level} (
							{riskAssessment.overallRisk.toFixed(0)}%)
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Текущие погодные условия */}
					{weatherData.current && (
						<div>
							<h4 className="font-medium mb-3">Текущие условия</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="flex items-center gap-2">
									<Thermometer className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Температура</p>
										<p className="font-medium">
											{weatherData.current.temperature}°C
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Droplets className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Влажность</p>
										<p className="font-medium">
											{weatherData.current.humidity}%
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Wind className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Ветер</p>
										<p className="font-medium">
											{weatherData.current.windSpeed} м/с
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Eye className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Видимость</p>
										<p className="font-medium">
											{weatherData.current.visibility} км
										</p>
									</div>
								</div>
							</div>

							<div className="mt-3 p-3 bg-muted rounded-lg">
								<p className="text-sm">
									<strong>Условия:</strong> {weatherData.current.description}
								</p>
							</div>
						</div>
					)}

					<Separator />

					{/* Анализ рисков */}
					<div>
						<h4 className="font-medium mb-3">Анализ рисков</h4>

						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
								<span className="font-medium">Общий уровень риска</span>
								<div className="flex items-center gap-2">
									<span
										className={`font-medium ${getRiskLevel(riskAssessment.overallRisk).color}`}
									>
										{getRiskLevel(riskAssessment.overallRisk).level}
									</span>
									<Badge
										variant={getRiskLevel(riskAssessment.overallRisk).variant}
									>
										{riskAssessment.overallRisk.toFixed(0)}%
									</Badge>
								</div>
							</div>

							{riskAssessment.factors.length > 0 && (
								<div>
									<h5 className="text-sm font-medium mb-2">Факторы риска:</h5>
									<div className="space-y-2">
										{riskAssessment.factors.map((factor, index) => (
											<div
												key={index}
												className="flex items-center justify-between text-sm p-2 border rounded"
											>
												<div>
													<span className="font-medium">
														{factor.name}
													</span>
													<p className="text-muted-foreground text-xs">
														{factor.description}
													</p>
												</div>
												<span
													className={`font-medium ${getRiskLevel(factor.impact).color}`}
												>
													{factor.impact.toFixed(0)}%
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Рекомендации */}
					{riskAssessment.recommendations.length > 0 && (
						<>
							<Separator />
							<div>
								<h4 className="font-medium mb-3">Рекомендации</h4>
								<div className="space-y-2">
									{riskAssessment.recommendations.map((recommendation, index) => (
										<div key={index} className="flex items-start gap-2 text-sm">
											<CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
											<span>{recommendation}</span>
										</div>
									))}
								</div>
							</div>
						</>
					)}

					{/* Прогноз погоды */}
					{weatherData.forecast && weatherData.forecast.length > 0 && (
						<>
							<Separator />
							<div>
								<h4 className="font-medium mb-3">Прогноз на ближайшие дни</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{weatherData.forecast.slice(0, 3).map((day, index) => (
										<div key={index} className="p-3 border rounded-lg">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium">
													{new Date(day.date).toLocaleDateString(
														"ru-RU",
														{
															weekday: "short",
															day: "numeric",
															month: "short",
														}
													)}
												</span>
												<span className="text-xs text-muted-foreground">
													{day.description}
												</span>
											</div>
											<div className="space-y-1 text-xs">
												<div className="flex justify-between">
													<span>Температура:</span>
													<span>
														{day.temperature.min}°...
														{day.temperature.max}°C
													</span>
												</div>
												<div className="flex justify-between">
													<span>Влажность:</span>
													<span>{day.humidity}%</span>
												</div>
												<div className="flex justify-between">
													<span>Ветер:</span>
													<span>{day.windSpeed} м/с</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</>
					)}

					{/* Кнопка обновления */}
					<div className="flex justify-center pt-2">
						<Button
							variant="outline"
							size="sm"
							onClick={refetch}
							className="flex items-center gap-2"
						>
							<RefreshCw className="h-3 w-3" />
							Обновить данные
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
