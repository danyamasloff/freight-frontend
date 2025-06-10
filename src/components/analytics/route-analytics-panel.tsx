import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	RouteAnalytics,
	WeatherData,
	FuelPriceData,
	TollRoadData,
} from "@/lib/api/route-service";
import {
	Activity,
	CloudRain,
	DollarSign,
	Fuel,
	Clock,
	Wind,
	Thermometer,
	Eye,
	AlertTriangle,
	Coffee,
	TrendingUp,
	TrendingDown,
} from "lucide-react";

interface RouteAnalyticsPanelProps {
	analytics: RouteAnalytics;
	weatherData: WeatherData[];
	fuelPrices: FuelPriceData[];
	tollRoads: TollRoadData[];
}

export const RouteAnalyticsPanel: React.FC<RouteAnalyticsPanelProps> = ({
	analytics,
	weatherData,
	fuelPrices,
	tollRoads,
}) => {
	const getRiskBadgeVariant = (risk: number) => {
		if (risk > 70) return "destructive";
		if (risk > 40) return "secondary";
		return "default";
	};

	const getWeatherRiskColor = (riskLevel: string) => {
		switch (riskLevel) {
			case "HIGH":
				return "text-red-600";
			case "MEDIUM":
				return "text-yellow-600";
			default:
				return "text-green-600";
		}
	};

	const averageFuelPrice =
		fuelPrices.length > 0
			? fuelPrices.reduce((sum, station) => sum + station.pricePerLiter, 0) /
				fuelPrices.length
			: 0;

	const totalTollCost = tollRoads.reduce((sum, toll) => sum + toll.cost, 0);

	return (
		<Tabs defaultValue="summary" className="w-full">
			<TabsList className="grid w-full grid-cols-4">
				<TabsTrigger value="summary">Сводка</TabsTrigger>
				<TabsTrigger value="weather">Погода</TabsTrigger>
				<TabsTrigger value="costs">Расходы</TabsTrigger>
				<TabsTrigger value="risks">Риски</TabsTrigger>
			</TabsList>

			{/* Основная сводка */}
			<TabsContent value="summary" className="space-y-4">
				<Card className="claude-card">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Activity className="h-5 w-5 text-primary" />
							<span>Основные показатели</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">
									{analytics.distance}
								</div>
								<div className="text-sm text-muted-foreground">км</div>
							</div>
							<div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
								<div className="text-2xl font-bold text-green-600">
									{Math.floor(analytics.duration / 60)}ч {analytics.duration % 60}
									м
								</div>
								<div className="text-sm text-muted-foreground">время</div>
							</div>
						</div>

						{/* Индикаторы риска */}
						<div className="space-y-3">
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Общий риск</span>
									<Badge variant={getRiskBadgeVariant(analytics.overallRisk)}>
										{analytics.overallRisk}%
									</Badge>
								</div>
								<Progress value={analytics.overallRisk} className="h-2" />
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Погодный риск</span>
									<span className="text-sm">{analytics.weatherRisk}%</span>
								</div>
								<Progress value={analytics.weatherRisk} className="h-1" />
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Качество дорог</span>
									<span className="text-sm">{analytics.roadQualityRisk}%</span>
								</div>
								<Progress value={analytics.roadQualityRisk} className="h-1" />
							</div>
						</div>

						<Alert>
							<CloudRain className="h-4 w-4" />
							<AlertDescription>
								<strong>Погода:</strong> {analytics.weatherConditions}
							</AlertDescription>
						</Alert>

						{analytics.restStops.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<Coffee className="h-4 w-4 text-amber-500" />
									<span className="font-medium text-sm">
										Обязательные остановки
									</span>
								</div>
								{analytics.restStops.map((stop, index) => (
									<div key={index} className="p-3 bg-amber-500/10 rounded-lg">
										<div className="font-medium text-sm">{stop.location}</div>
										<div className="text-xs text-muted-foreground">
											{stop.time} • {stop.reason}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			{/* Погодные условия */}
			<TabsContent value="weather" className="space-y-4">
				<Card className="claude-card">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<CloudRain className="h-5 w-5 text-primary" />
							<span>Детальная погода</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{weatherData.length > 0 ? (
							<div className="space-y-3">
								{weatherData.map((weather, index) => (
									<div key={index} className="p-3 bg-muted/50 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<div className="flex items-center space-x-2">
												<Thermometer className="h-4 w-4" />
												<span className="font-medium">
													{weather.temperature}°C
												</span>
											</div>
											<Badge
												className={getWeatherRiskColor(weather.riskLevel)}
												variant={
													weather.riskLevel === "HIGH"
														? "destructive"
														: weather.riskLevel === "MEDIUM"
															? "secondary"
															: "default"
												}
											>
												{weather.riskLevel}
											</Badge>
										</div>

										<div className="grid grid-cols-2 gap-4 mt-2">
											<div className="flex items-center space-x-2 text-sm text-muted-foreground">
												<Wind className="h-3 w-3" />
												<span>Ветер: {weather.windSpeed} м/с</span>
											</div>
											<div className="flex items-center space-x-2 text-sm text-muted-foreground">
												<Eye className="h-3 w-3" />
												<span>Влажность: {weather.humidity}%</span>
											</div>
										</div>

										<p className="text-sm mt-2 text-muted-foreground">
											{weather.weatherDescription}
										</p>
									</div>
								))}

								{/* Сводка по погоде */}
								<div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
									<h4 className="font-medium text-sm mb-2">Сводка по маршруту</h4>
									<div className="text-sm text-muted-foreground">
										Средняя температура:{" "}
										{Math.round(
											weatherData.reduce((sum, w) => sum + w.temperature, 0) /
												weatherData.length
										)}
										°C
									</div>
									<div className="text-sm text-muted-foreground">
										Средняя скорость ветра:{" "}
										{Math.round(
											weatherData.reduce((sum, w) => sum + w.windSpeed, 0) /
												weatherData.length
										)}{" "}
										м/с
									</div>
								</div>
							</div>
						) : (
							<p className="text-center text-muted-foreground">
								Данные о погоде загружаются...
							</p>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			{/* Расходы и цены */}
			<TabsContent value="costs" className="space-y-4">
				<Card className="claude-card">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<DollarSign className="h-5 w-5 text-primary" />
							<span>Детальная стоимость</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Основные расходы */}
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium flex items-center">
									<Fuel className="h-4 w-4 mr-2 text-orange-500" />
									Топливо
								</span>
								<span className="font-bold text-orange-600">
									{analytics.costBreakdown.fuel}₽
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium flex items-center">
									<DollarSign className="h-4 w-4 mr-2 text-purple-500" />
									Платные дороги
								</span>
								<span className="font-bold text-purple-600">
									{analytics.costBreakdown.tolls}₽
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium flex items-center">
									<Clock className="h-4 w-4 mr-2 text-blue-500" />
									Оплата водителя
								</span>
								<span className="font-bold text-blue-600">
									{analytics.costBreakdown.driver}₽
								</span>
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<span className="font-medium">Общая стоимость</span>
								<span className="text-xl font-bold text-primary">
									{analytics.costBreakdown.total}₽
								</span>
							</div>
						</div>

						{/* Анализ цен на топливо */}
						{fuelPrices.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-sm">АЗС по маршруту</h4>
									<div className="text-xs text-muted-foreground">
										Средняя цена: {averageFuelPrice.toFixed(2)}₽/л
									</div>
								</div>
								{fuelPrices.slice(0, 4).map((station, index) => (
									<div key={index} className="p-2 bg-muted/50 rounded">
										<div className="flex justify-between">
											<span className="font-medium text-sm">
												{station.stationName}
											</span>
											<div className="flex items-center space-x-2">
												<span className="text-sm font-bold">
													{station.pricePerLiter}₽/л
												</span>
												{station.pricePerLiter < averageFuelPrice ? (
													<TrendingDown className="h-3 w-3 text-green-500" />
												) : (
													<TrendingUp className="h-3 w-3 text-red-500" />
												)}
											</div>
										</div>
										<div className="text-xs text-muted-foreground">
											{station.fuelType} • {station.distance}км от маршрута
										</div>
									</div>
								))}
							</div>
						)}

						{/* Платные дороги */}
						{tollRoads.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-sm">Платные участки</h4>
									<div className="text-xs text-muted-foreground">
										Общая стоимость: {totalTollCost}₽
									</div>
								</div>
								{tollRoads.map((toll, index) => (
									<div key={index} className="p-2 bg-muted/50 rounded">
										<div className="flex justify-between">
											<span className="font-medium text-sm">{toll.name}</span>
											<span className="text-sm font-bold">{toll.cost}₽</span>
										</div>
										<div className="text-xs text-muted-foreground">
											{toll.distance}км • {toll.segment.start} →{" "}
											{toll.segment.end}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			{/* Анализ рисков */}
			<TabsContent value="risks" className="space-y-4">
				<Card className="claude-card">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<AlertTriangle className="h-5 w-5 text-primary" />
							<span>Анализ рисков</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Общий уровень риска */}
						<div className="p-4 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-lg">
							<div className="flex items-center justify-between mb-2">
								<span className="font-medium">Общий уровень риска</span>
								<Badge variant={getRiskBadgeVariant(analytics.overallRisk)}>
									{analytics.overallRisk}%
								</Badge>
							</div>
							<Progress value={analytics.overallRisk} className="h-3" />
							<p className="text-sm text-muted-foreground mt-2">
								{analytics.overallRisk > 70
									? "Высокий риск. Рекомендуется пересмотреть маршрут или отложить поездку."
									: analytics.overallRisk > 40
										? "Средний риск. Требуется повышенное внимание."
										: "Низкий риск. Маршрут безопасен для движения."}
							</p>
						</div>

						{/* Детализация рисков */}
						<div className="space-y-3">
							<div className="p-3 bg-blue-500/10 rounded-lg">
								<div className="flex items-center justify-between mb-1">
									<span className="font-medium text-sm">Погодные условия</span>
									<span className="text-sm">{analytics.weatherRisk}%</span>
								</div>
								<Progress value={analytics.weatherRisk} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									Влияние погоды на безопасность движения
								</p>
							</div>

							<div className="p-3 bg-orange-500/10 rounded-lg">
								<div className="flex items-center justify-between mb-1">
									<span className="font-medium text-sm">
										Качество дорожного покрытия
									</span>
									<span className="text-sm">{analytics.roadQualityRisk}%</span>
								</div>
								<Progress value={analytics.roadQualityRisk} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									Состояние дорог и инфраструктуры
								</p>
							</div>
						</div>

						{/* Рекомендации */}
						<div className="p-3 bg-green-500/10 rounded-lg">
							<h4 className="font-medium text-sm mb-2">Рекомендации</h4>
							<ul className="text-xs text-muted-foreground space-y-1">
								<li>• Следите за погодными условиями в пути</li>
								<li>• Соблюдайте режим труда и отдыха водителя</li>
								<li>• Проверьте техническое состояние транспорта</li>
								{analytics.weatherRisk > 50 && (
									<li>• Снизьте скорость из-за неблагоприятной погоды</li>
								)}
								{analytics.roadQualityRisk > 50 && (
									<li>• Будьте осторожны на участках с плохим покрытием</li>
								)}
							</ul>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
};
