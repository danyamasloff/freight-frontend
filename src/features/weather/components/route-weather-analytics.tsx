import React, { useState, useEffect, useMemo } from "react";
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
	Route as RouteIcon,
	Calendar,
	ArrowRight,
	Download,
	Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
	useGetRouteWeatherForecastMutation,
	useGetHazardWarningsMutation,
} from "@/shared/api/weatherSlice";
import { formatDistance, formatDuration } from "@/shared/utils/format";
import type {
	RouteResponse,
	RouteWeatherForecast,
	WeatherHazardWarning,
	WeatherData,
} from "@/shared/types/api";

interface RouteWeatherAnalyticsProps {
	route: RouteResponse;
	departureTime: string;
	className?: string;
	onBack?: () => void;
}

interface TimelinePoint {
	time: string;
	weather: WeatherData;
	location: { lat: number; lon: number };
	distance: number;
	warnings: WeatherHazardWarning[];
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
	LOW: {
		color: "bg-blue-500",
		textColor: "text-blue-700",
		bgColor: "bg-blue-50",
		label: "Низкий",
	},
	MEDIUM: {
		color: "bg-yellow-500",
		textColor: "text-yellow-700",
		bgColor: "bg-yellow-50",
		label: "Средний",
	},
	HIGH: {
		color: "bg-orange-500",
		textColor: "text-orange-700",
		bgColor: "bg-orange-50",
		label: "Высокий",
	},
	EXTREME: {
		color: "bg-red-500",
		textColor: "text-red-700",
		bgColor: "bg-red-50",
		label: "Критический",
	},
};

export function RouteWeatherAnalytics({
	route,
	departureTime,
	className,
	onBack,
}: RouteWeatherAnalyticsProps) {
	const [routeWeatherForecast, setRouteWeatherForecast] = useState<RouteWeatherForecast | null>(
		null
	);
	const [hazardWarnings, setHazardWarnings] = useState<WeatherHazardWarning[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTimePoint, setSelectedTimePoint] = useState<number>(0);
	const [showOnlyWarnings, setShowOnlyWarnings] = useState(false);

	const [getRouteWeatherForecast] = useGetRouteWeatherForecastMutation();
	const [getHazardWarnings] = useGetHazardWarningsMutation();

	// Загрузка данных о погоде
	const loadWeatherData = async () => {
		setIsLoading(true);
		try {
			const [forecastResult, warningsResult] = await Promise.all([
				getRouteWeatherForecast({ route, departureTime }).unwrap(),
				getHazardWarnings({ route, departureTime }).unwrap(),
			]);

			setRouteWeatherForecast(forecastResult);
			setHazardWarnings(warningsResult);
		} catch (error) {
			console.error("Ошибка при загрузке погодных данных:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadWeatherData();
	}, [route, departureTime]);

	// Создаем временную линию
	const timeline = useMemo<TimelinePoint[]>(() => {
		if (!routeWeatherForecast?.weatherPoints) return [];

		return routeWeatherForecast.weatherPoints.map((point, index) => {
			// Находим предупреждения для этой точки
			const pointWarnings = hazardWarnings.filter((warning) => {
				const warningTime = new Date(warning.timeStart);
				const pointTime = new Date(point.time);
				const timeDiff = Math.abs(warningTime.getTime() - pointTime.getTime());
				return timeDiff <= 30 * 60 * 1000; // В пределах 30 минут
			});

			return {
				time: point.time,
				weather: point.weather,
				location: { lat: point.coordinate[1], lon: point.coordinate[0] },
				distance: (route.distance / routeWeatherForecast.weatherPoints.length) * index,
				warnings: pointWarnings,
			};
		});
	}, [routeWeatherForecast, hazardWarnings, route]);

	// Фильтрованная временная линия
	const filteredTimeline = useMemo(() => {
		if (!showOnlyWarnings) return timeline;
		return timeline.filter((point) => point.warnings.length > 0);
	}, [timeline, showOnlyWarnings]);

	const getWeatherIcon = (type: string, size: "sm" | "md" | "lg" = "md") => {
		const IconComponent = WEATHER_ICONS[type as keyof typeof WEATHER_ICONS] || Cloud;
		const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
		return <IconComponent className={sizeClass} />;
	};

	const formatTemperature = (temp: number): string => {
		return `${Math.round(temp)}°C`;
	};

	const formatWindSpeed = (speed: number): string => {
		return `${Math.round(speed)} м/с`;
	};

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

	const getRiskLevel = (): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" => {
		if (!routeWeatherForecast) return "LOW";

		const criticalWarnings = hazardWarnings.filter(
			(w) => w.severity === "EXTREME" || w.severity === "HIGH"
		);
		if (criticalWarnings.length > 2) return "EXTREME";
		if (criticalWarnings.length > 0) return "HIGH";

		const moderateWarnings = hazardWarnings.filter((w) => w.severity === "MEDIUM");
		if (moderateWarnings.length > 3) return "HIGH";
		if (moderateWarnings.length > 0) return "MEDIUM";

		return "LOW";
	};

	const riskLevel = getRiskLevel();

	const exportWeatherReport = () => {
		// Реализация экспорта отчета
		console.log("Экспорт погодного отчета");
	};

	const shareWeatherData = () => {
		// Реализация функции поделиться
		console.log("Поделиться погодными данными");
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-96">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-lg font-medium">Анализ погодных условий</p>
					<p className="text-sm text-muted-foreground">
						Загрузка данных о погоде для маршрута...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					{onBack && (
						<Button variant="ghost" size="sm" onClick={onBack}>
							<ArrowRight className="h-4 w-4 rotate-180 mr-2" />
							Назад
						</Button>
					)}
					<div>
						<h1 className="text-3xl font-bold flex items-center">
							<Navigation className="h-8 w-8 mr-3 text-blue-600" />
							Погодная аналитика маршрута
						</h1>
						<p className="text-muted-foreground mt-1">
							Детальный анализ погодных условий и рисков для безопасной поездки
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={exportWeatherReport}>
						<Download className="h-4 w-4 mr-2" />
						Экспорт
					</Button>
					<Button variant="outline" size="sm" onClick={shareWeatherData}>
						<Share2 className="h-4 w-4 mr-2" />
						Поделиться
					</Button>
					<Button variant="outline" size="sm" onClick={loadWeatherData}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Обновить
					</Button>
				</div>
			</div>

			{/* Общий обзор маршрута */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<RouteIcon className="h-5 w-5 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Расстояние</p>
								<p className="font-semibold">{formatDistance(route.distance)}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Clock className="h-5 w-5 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Время в пути</p>
								<p className="font-semibold">
									{formatDuration(route.duration * 60)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Calendar className="h-5 w-5 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Отправление</p>
								<p className="font-semibold">
									{new Date(departureTime).toLocaleDateString("ru-RU")}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<AlertTriangle
								className={cn("h-5 w-5", {
									"text-blue-600": riskLevel === "LOW",
									"text-yellow-600": riskLevel === "MEDIUM",
									"text-orange-600": riskLevel === "HIGH",
									"text-red-600": riskLevel === "EXTREME",
								})}
							/>
							<div>
								<p className="text-sm text-muted-foreground">Погодный риск</p>
								<p className="font-semibold">{SEVERITY_CONFIG[riskLevel].label}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Основной контент */}
			<Tabs defaultValue="timeline" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="timeline">Временная линия</TabsTrigger>
					<TabsTrigger value="warnings">Предупреждения</TabsTrigger>
					<TabsTrigger value="analysis">Анализ рисков</TabsTrigger>
					<TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
				</TabsList>

				<TabsContent value="timeline" className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Погода по времени</h3>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowOnlyWarnings(!showOnlyWarnings)}
						>
							{showOnlyWarnings ? "Показать все" : "Только с предупреждениями"}
						</Button>
					</div>

					<ScrollArea className="h-96">
						<div className="space-y-4">
							{filteredTimeline.map((point, index) => (
								<Card
									key={index}
									className={cn(
										"cursor-pointer transition-colors",
										selectedTimePoint === index && "ring-2 ring-blue-500"
									)}
									onClick={() => setSelectedTimePoint(index)}
								>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{getWeatherIcon(
													point.weather.main || "CLEAR",
													"lg"
												)}
												<div>
													<p className="font-semibold">
														{new Date(point.time).toLocaleTimeString(
															"ru-RU",
															{
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</p>
													<p className="text-sm text-muted-foreground">
														{formatDistance(point.distance)} от начала
													</p>
												</div>
												<div className="text-center">
													<p className="text-2xl font-bold">
														{formatTemperature(
															point.weather.temperature
														)}
													</p>
													<p className="text-sm text-muted-foreground">
														{point.weather.description}
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<div className="text-right text-sm">
													<p>
														Ветер:{" "}
														{formatWindSpeed(point.weather.windSpeed)}
													</p>
													<p>Влажность: {point.weather.humidity}%</p>
												</div>
												{point.warnings.length > 0 && (
													<div className="flex flex-col space-y-1">
														{point.warnings
															.slice(0, 2)
															.map((warning, wIndex) => (
																<Badge
																	key={wIndex}
																	variant={
																		warning.severity ===
																			"EXTREME" ||
																		warning.severity === "HIGH"
																			? "destructive"
																			: "secondary"
																	}
																	className="text-xs"
																>
																	{getWeatherTypeLabel(
																		warning.type
																	)}
																</Badge>
															))}
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="warnings" className="space-y-4">
					{hazardWarnings.length > 0 ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">
									Предупреждения о погодных опасностях ({hazardWarnings.length})
								</h3>
								<div className="flex items-center space-x-2">
									{Object.entries(SEVERITY_CONFIG).map(([severity, config]) => {
										const count = hazardWarnings.filter(
											(w) => w.severity === severity
										).length;
										return count > 0 ? (
											<Badge
												key={severity}
												variant="outline"
												className={config.bgColor}
											>
												{config.label}: {count}
											</Badge>
										) : null;
									})}
								</div>
							</div>

							{hazardWarnings.map((warning, index) => (
								<Alert
									key={index}
									variant={
										warning.severity === "EXTREME" ||
										warning.severity === "HIGH"
											? "destructive"
											: "default"
									}
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<AlertTriangle className="h-5 w-5 mt-0.5" />
											<div className="flex-1">
												<AlertTitle className="flex items-center space-x-2">
													{getWeatherIcon(warning.type, "sm")}
													<span>{getWeatherTypeLabel(warning.type)}</span>
													<Badge
														variant="outline"
														className={
															SEVERITY_CONFIG[
																warning.severity as keyof typeof SEVERITY_CONFIG
															]?.bgColor
														}
													>
														{
															SEVERITY_CONFIG[
																warning.severity as keyof typeof SEVERITY_CONFIG
															]?.label
														}
													</Badge>
												</AlertTitle>
												<AlertDescription className="mt-2">
													<p className="mb-2">{warning.description}</p>
													<div className="text-sm space-y-1">
														<p>
															<strong>Время:</strong>{" "}
															{new Date(
																warning.timeStart
															).toLocaleString("ru-RU")}
														</p>
														<p>
															<strong>Координаты:</strong>{" "}
															{warning.location.lat.toFixed(4)},{" "}
															{warning.location.lon.toFixed(4)}
														</p>
													</div>
													{warning.recommendations &&
														warning.recommendations.length > 0 && (
															<div className="mt-3">
																<p className="font-semibold text-sm mb-1">
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
												</AlertDescription>
											</div>
										</div>
									</div>
								</Alert>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Sun className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
							<h3 className="text-lg font-semibold mb-2">Предупреждений нет</h3>
							<p className="text-muted-foreground">
								Погодные условия благоприятны для поездки по всему маршруту
							</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="analysis" className="space-y-4">
					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Анализ рисков</CardTitle>
								<CardDescription>
									Оценка общего уровня риска на основе погодных условий
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="font-medium">Общий уровень риска:</span>
										<Badge
											variant={
												riskLevel === "EXTREME" || riskLevel === "HIGH"
													? "destructive"
													: "secondary"
											}
											className={SEVERITY_CONFIG[riskLevel].bgColor}
										>
											{SEVERITY_CONFIG[riskLevel].label}
										</Badge>
									</div>
									<Progress
										value={
											riskLevel === "LOW"
												? 25
												: riskLevel === "MEDIUM"
													? 50
													: riskLevel === "HIGH"
														? 75
														: 100
										}
										className="h-3"
									/>

									{routeWeatherForecast && (
										<div className="grid grid-cols-2 gap-4 mt-6">
											<div>
												<p className="text-sm font-medium mb-2">
													Статистика предупреждений:
												</p>
												<div className="space-y-1 text-sm">
													<div className="flex justify-between">
														<span>Критические:</span>
														<span className="font-medium text-red-600">
															{
																hazardWarnings.filter(
																	(w) => w.severity === "EXTREME"
																).length
															}
														</span>
													</div>
													<div className="flex justify-between">
														<span>Высокие:</span>
														<span className="font-medium text-orange-600">
															{
																hazardWarnings.filter(
																	(w) => w.severity === "HIGH"
																).length
															}
														</span>
													</div>
													<div className="flex justify-between">
														<span>Средние:</span>
														<span className="font-medium text-yellow-600">
															{
																hazardWarnings.filter(
																	(w) => w.severity === "MEDIUM"
																).length
															}
														</span>
													</div>
												</div>
											</div>
											<div>
												<p className="text-sm font-medium mb-2">
													Типы опасностей:
												</p>
												<div className="space-y-1 text-sm">
													{Array.from(
														new Set(hazardWarnings.map((w) => w.type))
													).map((type) => (
														<div
															key={type}
															className="flex justify-between"
														>
															<span>
																{getWeatherTypeLabel(type)}:
															</span>
															<span className="font-medium">
																{
																	hazardWarnings.filter(
																		(w) => w.type === type
																	).length
																}
															</span>
														</div>
													))}
												</div>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="recommendations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Info className="h-5 w-5 mr-2" />
								Рекомендации для безопасной поездки
							</CardTitle>
						</CardHeader>
						<CardContent>
							{routeWeatherForecast?.recommendations &&
							routeWeatherForecast.recommendations.length > 0 ? (
								<ul className="space-y-3">
									{routeWeatherForecast.recommendations.map((rec, index) => (
										<li key={index} className="flex items-start">
											<span className="text-blue-500 mr-3 mt-1">•</span>
											<span>{rec}</span>
										</li>
									))}
								</ul>
							) : (
								<div className="text-center py-8">
									<Info className="h-12 w-12 mx-auto text-blue-400 mb-4" />
									<p className="text-muted-foreground">
										Специальных рекомендаций нет
									</p>
									<p className="text-sm text-muted-foreground">
										Соблюдайте обычные меры безопасности во время поездки
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
