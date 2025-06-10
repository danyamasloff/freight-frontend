import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
	Navigation,
	MapPin,
	Clock,
	Fuel,
	DollarSign,
	AlertTriangle,
	Cloud,
	Sun,
	CloudRain,
	Wind,
	Thermometer,
	Eye,
	Car,
	Truck,
	RefreshCw,
	TrendingUp,
	Shield,
	Zap,
} from "lucide-react";

import {
	useGetRouteWeatherForecastMutation,
	useGetHazardWarningsMutation,
} from "@/shared/api/weatherSlice";
import {
	formatDistance,
	formatDuration,
	formatCurrency,
	formatDateTime,
} from "@/shared/utils/format";
import { WeatherWidget } from "@/features/weather/components/weather-widget";
import { RouteWeatherAnalytics } from "@/features/weather/components/route-weather-analytics";
import type { RouteDetail, RouteResponse } from "@/shared/types/api";

interface RouteDetailAnalyticsProps {
	route: RouteDetail | RouteResponse;
	departureTime?: string;
	onRefresh?: () => void;
}

export function RouteDetailAnalytics({
	route,
	departureTime,
	onRefresh,
}: RouteDetailAnalyticsProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

	const [
		getWeatherForecast,
		{ data: weatherForecast, isLoading: isLoadingWeather, error: weatherError },
	] = useGetRouteWeatherForecastMutation();

	const [
		getHazardWarnings,
		{ data: weatherHazards, isLoading: isLoadingHazards, error: hazardsError },
	] = useGetHazardWarningsMutation();

	useEffect(() => {
		// Автоматически загружаем погодную информацию при изменении маршрута
		if (route && route.coordinates && route.coordinates.length > 0) {
			const routeData = {
				...route,
				distance: route.distance || 0,
				duration: route.duration || 0,
			};

			getWeatherForecast({
				route: routeData as RouteResponse,
				departureTime: departureTime || new Date().toISOString(),
			});

			getHazardWarnings({
				route: routeData as RouteResponse,
				departureTime: departureTime || new Date().toISOString(),
			});
		}
	}, [route, departureTime, getWeatherForecast, getHazardWarnings]);

	const handleRefresh = () => {
		setLastUpdate(new Date());
		onRefresh?.();

		// Перезагружаем погодные данные
		if (route && route.coordinates && route.coordinates.length > 0) {
			const routeData = {
				...route,
				distance: route.distance || 0,
				duration: route.duration || 0,
			};

			getWeatherForecast({
				route: routeData as RouteResponse,
				departureTime: departureTime || new Date().toISOString(),
			});

			getHazardWarnings({
				route: routeData as RouteResponse,
				departureTime: departureTime || new Date().toISOString(),
			});
		}
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

	const getWeatherIcon = (condition: string) => {
		switch (condition?.toLowerCase()) {
			case "clear":
			case "sunny":
				return <Sun className="h-4 w-4 text-yellow-500" />;
			case "clouds":
			case "cloudy":
				return <Cloud className="h-4 w-4 text-gray-500" />;
			case "rain":
			case "drizzle":
				return <CloudRain className="h-4 w-4 text-blue-500" />;
			case "snow":
				return <Wind className="h-4 w-4 text-blue-200" />;
			default:
				return <Sun className="h-4 w-4 text-yellow-500" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Заголовок с обновлением */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Анализ маршрута</h2>
					<p className="text-muted-foreground">
						Детальная информация о дорожных условиях и погоде
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Обновлено: {formatDateTime(lastUpdate)}
					</span>
					<Button variant="outline" size="sm" onClick={handleRefresh}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Обновить
					</Button>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Обзор</TabsTrigger>
					<TabsTrigger value="economics">Экономика</TabsTrigger>
					<TabsTrigger value="weather">Погода</TabsTrigger>
					<TabsTrigger value="risks">Риски</TabsTrigger>
				</TabsList>

				{/* Обзор маршрута */}
				<TabsContent value="overview" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Основные параметры */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Navigation className="h-4 w-4" />
									Основные параметры
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">
										Расстояние:
									</span>
									<span className="font-medium">
										{formatDistance(
											route.distance ||
												((route as RouteDetail).distanceKm
													? (route as RouteDetail).distanceKm * 1000
													: 0)
										)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">
										Время в пути:
									</span>
									<span className="font-medium">
										{formatDuration(
											route.duration ||
												((route as RouteDetail).estimatedDurationMinutes
													? (route as RouteDetail)
															.estimatedDurationMinutes * 60
													: 0)
										)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">
										Отправление:
									</span>
									<span className="font-medium">
										{(route as RouteDetail).startAddress || "Начальная точка"}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">
										Назначение:
									</span>
									<span className="font-medium">
										{(route as RouteDetail).endAddress || "Конечная точка"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Текущие условия */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Eye className="h-4 w-4" />
									Текущие условия
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{weatherForecast?.pointForecasts?.[0] && (
									<>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												Погода:
											</span>
											<div className="flex items-center gap-2">
												{getWeatherIcon(
													weatherForecast.pointForecasts[0].weatherData
														.weatherMain
												)}
												<span className="font-medium">
													{
														weatherForecast.pointForecasts[0]
															.weatherData.weatherDescription
													}
												</span>
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												Температура:
											</span>
											<span className="font-medium">
												{Math.round(
													weatherForecast.pointForecasts[0].weatherData
														.temperature
												)}
												°C
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												Видимость:
											</span>
											<span className="font-medium">
												{weatherForecast.pointForecasts[0].weatherData
													.visibility
													? `${(weatherForecast.pointForecasts[0].weatherData.visibility / 1000).toFixed(1)} км`
													: "Хорошая"}
											</span>
										</div>
									</>
								)}
								{!weatherForecast && !isLoadingWeather && (
									<div className="text-sm text-muted-foreground">
										Погодные данные недоступны
									</div>
								)}
								{isLoadingWeather && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<RefreshCw className="h-4 w-4 animate-spin" />
										Загрузка погодных данных...
									</div>
								)}
							</CardContent>
						</Card>

						{/* Общий риск */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Shield className="h-4 w-4" />
									Общий риск
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{route.overallRiskScore ? (
									<>
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Уровень риска:
												</span>
												<Badge
													variant={
														getRiskLevel(route.overallRiskScore).variant
													}
												>
													{getRiskLevel(route.overallRiskScore).level}
												</Badge>
											</div>
											<Progress
												value={route.overallRiskScore}
												className="h-2"
											/>
										</div>
										{route.weatherRiskScore && (
											<div className="flex justify-between items-center text-sm">
												<span className="text-muted-foreground">
													Погодный риск:
												</span>
												<span>{Math.round(route.weatherRiskScore)}%</span>
											</div>
										)}
										{route.trafficRiskScore && (
											<div className="flex justify-between items-center text-sm">
												<span className="text-muted-foreground">
													Дорожный риск:
												</span>
												<span>{Math.round(route.trafficRiskScore)}%</span>
											</div>
										)}
									</>
								) : (
									<div className="text-sm text-muted-foreground">
										Анализ рисков недоступен
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Предупреждения */}
					{weatherHazards && weatherHazards.length > 0 && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<div className="font-medium">
										Обнаружены погодные опасности на маршруте:
									</div>
									<ul className="list-disc list-inside text-sm space-y-1">
										{weatherHazards.slice(0, 3).map((hazard, index) => (
											<li key={index}>
												{hazard.severity}: {hazard.description}
											</li>
										))}
									</ul>
									{weatherHazards.length > 3 && (
										<div className="text-sm">
											И еще {weatherHazards.length - 3} предупреждений...
										</div>
									)}
								</div>
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				{/* Экономические показатели */}
				<TabsContent value="economics" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Стоимость топлива */}
						{route.estimatedFuelCost && route.estimatedFuelCost > 0 && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-base flex items-center gap-2">
										<Fuel className="h-4 w-4 text-orange-600" />
										Расходы на топливо
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="text-2xl font-bold text-orange-600">
										{formatCurrency(route.estimatedFuelCost)}
									</div>
									{route.estimatedFuelConsumption && (
										<div className="text-sm text-muted-foreground">
											Расход: {route.estimatedFuelConsumption.toFixed(1)} л
										</div>
									)}
									<div className="text-sm text-muted-foreground">
										Основная статья расходов на маршрут
									</div>
								</CardContent>
							</Card>
						)}

						{/* Общая стоимость */}
						{route.estimatedTotalCost && route.estimatedTotalCost > 0 && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-base flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-green-600" />
										Общая стоимость
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="text-2xl font-bold text-green-600">
										{formatCurrency(route.estimatedTotalCost)}
									</div>
									<div className="text-sm text-muted-foreground">
										Включает все расходы на перевозку
									</div>
								</CardContent>
							</Card>
						)}

						{/* Детализация расходов */}
						<Card className="md:col-span-2">
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									Структура расходов
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{route.estimatedFuelCost && route.estimatedFuelCost > 0 && (
										<div className="text-center">
											<div className="text-sm font-medium">Топливо</div>
											<div className="text-lg font-bold text-orange-600">
												{formatCurrency(route.estimatedFuelCost)}
											</div>
										</div>
									)}
									{route.estimatedDriverCost && route.estimatedDriverCost > 0 && (
										<div className="text-center">
											<div className="text-sm font-medium">Водитель</div>
											<div className="text-lg font-bold text-blue-600">
												{formatCurrency(route.estimatedDriverCost)}
											</div>
										</div>
									)}
									{route.estimatedTollCost && route.estimatedTollCost > 0 && (
										<div className="text-center">
											<div className="text-sm font-medium">
												Платные дороги
											</div>
											<div className="text-lg font-bold text-purple-600">
												{formatCurrency(route.estimatedTollCost)}
											</div>
										</div>
									)}
									<div className="text-center border-l border-border pl-4">
										<div className="text-sm font-medium">Итого</div>
										<div className="text-lg font-bold">
											{formatCurrency(route.estimatedTotalCost || 0)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Погода */}
				<TabsContent value="weather" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-1">
							<WeatherWidget
								route={route as RouteResponse}
								compact={false}
								departureTime={departureTime}
							/>
						</div>
						<div className="lg:col-span-2">
							<RouteWeatherAnalytics
								route={route as RouteResponse}
								departureTime={departureTime || new Date().toISOString()}
							/>
						</div>
					</div>
				</TabsContent>

				{/* Риски */}
				<TabsContent value="risks" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Погодные риски */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Cloud className="h-4 w-4" />
									Погодные риски
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{route.weatherRiskScore && route.weatherRiskScore > 0 ? (
									<>
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Уровень:
												</span>
												<Badge
													variant={
														getRiskLevel(route.weatherRiskScore).variant
													}
												>
													{Math.round(route.weatherRiskScore)}%
												</Badge>
											</div>
											<Progress
												value={route.weatherRiskScore}
												className="h-2"
											/>
										</div>
										{weatherHazards && weatherHazards.length > 0 && (
											<div className="space-y-2">
												<div className="text-sm font-medium">
													Активные предупреждения:
												</div>
												<div className="space-y-1">
													{weatherHazards
														.slice(0, 3)
														.map((hazard, index) => (
															<div
																key={index}
																className="text-xs p-2 bg-muted rounded"
															>
																<span className="font-medium">
																	{hazard.severity}:
																</span>{" "}
																{hazard.description}
															</div>
														))}
												</div>
											</div>
										)}
									</>
								) : (
									<div className="text-sm text-muted-foreground">
										Погодные риски не обнаружены
									</div>
								)}
							</CardContent>
						</Card>

						{/* Дорожные риски */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Navigation className="h-4 w-4" />
									Дорожные риски
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{route.trafficRiskScore && route.trafficRiskScore > 0 ? (
									<>
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Уровень:
												</span>
												<Badge
													variant={
														getRiskLevel(route.trafficRiskScore).variant
													}
												>
													{Math.round(route.trafficRiskScore)}%
												</Badge>
											</div>
											<Progress
												value={route.trafficRiskScore}
												className="h-2"
											/>
										</div>
										<div className="text-sm text-muted-foreground">
											Учитывает плотность трафика, качество дорог и
											ограничения для грузового транспорта
										</div>
									</>
								) : (
									<div className="text-sm text-muted-foreground">
										Дорожные риски минимальны
									</div>
								)}
							</CardContent>
						</Card>

						{/* Общие рекомендации */}
						<Card className="md:col-span-2">
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<Zap className="h-4 w-4" />
									Рекомендации
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{route.overallRiskScore && route.overallRiskScore > 50 && (
										<Alert>
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												Маршрут имеет повышенный уровень риска.
												Рекомендуется дополнительная подготовка.
											</AlertDescription>
										</Alert>
									)}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<div className="font-medium mb-2">Перед выездом:</div>
											<ul className="list-disc list-inside space-y-1 text-muted-foreground">
												<li>Проверьте актуальную погоду</li>
												<li>Убедитесь в исправности ТС</li>
												<li>Запланируйте остановки</li>
											</ul>
										</div>
										<div>
											<div className="font-medium mb-2">В пути:</div>
											<ul className="list-disc list-inside space-y-1 text-muted-foreground">
												<li>Соблюдайте скоростной режим</li>
												<li>Следите за дорожной обстановкой</li>
												<li>Делайте регулярные перерывы</li>
											</ul>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
