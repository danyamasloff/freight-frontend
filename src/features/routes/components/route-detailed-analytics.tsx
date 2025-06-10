import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	DollarSign,
	AlertTriangle,
	Cloud,
	Coffee,
	Timer,
	Target,
	TrendingUp,
	Star,
	Clock,
	CreditCard,
	MapPin,
} from "lucide-react";

interface LocalWeatherCondition {
	location: string;
	coordinates: [number, number];
	temperature: number;
	condition: string;
	precipitation: number;
	visibility: number;
	windSpeed: number;
	humidity: number;
	pressure: number;
	timestamp: string;
}

interface LocalRestStop {
	id: string;
	location: string;
	coordinates: [number, number];
	type: "mandatory" | "recommended";
	timeFromStart: number;
	reason: string;
	facilityType: "gas_station" | "truck_stop" | "rest_area" | "cafe" | "hotel";
	amenities: string[];
	rating?: number;
	workingHours?: string;
}

interface LocalTollRoad {
	id: string;
	name: string;
	cost: number;
	distance: number;
	currency: string;
	paymentMethods: string[];
	coordinates: {
		start: [number, number];
		end: [number, number];
	};
}

interface LocalRiskLevel {
	score: number;
	label: "Низкий" | "Средний" | "Высокий";
	color: string;
}

interface LocalRiskAnalysis {
	overall: LocalRiskLevel;
	weather: {
		level: LocalRiskLevel;
		factors: string[];
		recommendations: string[];
	};
	road: {
		level: LocalRiskLevel;
		factors: string[];
		recommendations: string[];
	};
	traffic: {
		level: LocalRiskLevel;
		factors: string[];
		recommendations: string[];
	};
	cargo?: {
		level: LocalRiskLevel;
		factors: string[];
		recommendations: string[];
	};
}

interface RouteData {
	id?: string;
	startPoint: string;
	endPoint: string;
	distance: number;
	duration: number;
	fuelConsumption: number;
	fuelCost: number;
	tollCost: number;
	estimatedDriverCost: number;
	totalCost: number;
	overallRisk: number;
	weatherRisk: number;
	roadQualityRisk: number;
	trafficRisk: number;
	weatherConditions: LocalWeatherCondition[];
	restStops: LocalRestStop[];
	tollRoads: LocalTollRoad[];
	riskAnalysis: LocalRiskAnalysis;
}

interface RouteDetailedAnalyticsProps {
	routeData: RouteData;
}

export const RouteDetailedAnalytics: React.FC<RouteDetailedAnalyticsProps> = ({ routeData }) => {
	const getRiskColor = (risk: number) => {
		if (risk <= 2) return "bg-green-100 text-green-800";
		if (risk <= 3.5) return "bg-yellow-100 text-yellow-800";
		return "bg-red-100 text-red-800";
	};

	const getRiskLabel = (risk: number) => {
		if (risk <= 2) return "Низкий";
		if (risk <= 3.5) return "Средний";
		return "Высокий";
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}ч ${mins}м`;
	};

	const getWeatherIcon = (condition: string) => {
		switch (condition.toLowerCase()) {
			case "снег":
				return "❄️";
			case "дождь":
				return "🌧️";
			case "облачно":
				return "☁️";
			case "ясно":
				return "☀️";
			default:
				return "🌤️";
		}
	};

	const getFacilityIcon = (type: string) => {
		switch (type) {
			case "gas_station":
				return "⛽";
			case "truck_stop":
				return "🚛";
			case "rest_area":
				return "🅿️";
			case "cafe":
				return "☕";
			case "hotel":
				return "🏨";
			default:
				return "📍";
		}
	};

	return (
		<div className="space-y-6">
			{/* Общая информация */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Общая информация о маршруте
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{routeData.distance} км
							</div>
							<div className="text-sm text-gray-600">Расстояние</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{formatDuration(routeData.duration)}
							</div>
							<div className="text-sm text-gray-600">Время в пути</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">
								{routeData.fuelConsumption} л
							</div>
							<div className="text-sm text-gray-600">Расход топлива</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{routeData.totalCost.toLocaleString()} ₽
							</div>
							<div className="text-sm text-gray-600">Общая стоимость</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Экономический анализ */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Экономический анализ
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600">Топливо:</span>
								<span className="font-medium">
									{routeData.fuelCost.toLocaleString()} ₽
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Платные дороги:</span>
								<span className="font-medium">
									{routeData.tollCost.toLocaleString()} ₽
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Водитель:</span>
								<span className="font-medium">
									{routeData.estimatedDriverCost.toLocaleString()} ₽
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Прочие расходы:</span>
								<span className="font-medium">
									{(
										routeData.totalCost -
										routeData.fuelCost -
										routeData.tollCost -
										routeData.estimatedDriverCost
									).toLocaleString()}{" "}
									₽
								</span>
							</div>
							<Separator />
							<div className="flex justify-between font-bold">
								<span>Итого:</span>
								<span>{routeData.totalCost.toLocaleString()} ₽</span>
							</div>
						</div>
						<div className="space-y-3">
							<div className="text-sm text-gray-600">Структура затрат:</div>
							<div className="space-y-2">
								<div>
									<div className="flex justify-between text-sm">
										<span>Топливо</span>
										<span>
											{Math.round(
												(routeData.fuelCost / routeData.totalCost) * 100
											)}
											%
										</span>
									</div>
									<Progress
										value={(routeData.fuelCost / routeData.totalCost) * 100}
										className="h-2"
									/>
								</div>
								<div>
									<div className="flex justify-between text-sm">
										<span>Платные дороги</span>
										<span>
											{Math.round(
												(routeData.tollCost / routeData.totalCost) * 100
											)}
											%
										</span>
									</div>
									<Progress
										value={(routeData.tollCost / routeData.totalCost) * 100}
										className="h-2"
									/>
								</div>
								<div>
									<div className="flex justify-between text-sm">
										<span>Водитель</span>
										<span>
											{Math.round(
												(routeData.estimatedDriverCost /
													routeData.totalCost) *
													100
											)}
											%
										</span>
									</div>
									<Progress
										value={
											(routeData.estimatedDriverCost / routeData.totalCost) *
											100
										}
										className="h-2"
									/>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Платные дороги */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Платные участки дорог
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{routeData.tollRoads?.map((toll, index) => (
							<div
								key={toll.id}
								className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex-1">
									<div className="font-medium">{toll.name}</div>
									<div className="text-sm text-gray-600">{toll.distance} км</div>
									<div className="flex items-center gap-2 mt-1">
										<CreditCard className="h-3 w-3" />
										<span className="text-xs text-gray-500">
											{toll.paymentMethods.join(", ")}
										</span>
									</div>
								</div>
								<div className="text-right">
									<div className="font-bold">
										{toll.cost} {toll.currency}
									</div>
									<div className="text-sm text-gray-600">
										{Math.round(toll.cost / toll.distance)} ₽/км
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Погодные условия */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Cloud className="h-5 w-5" />
						Погодные условия на маршруте
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{routeData.weatherConditions?.map((weather, index) => (
							<div key={index} className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-2xl">
										{getWeatherIcon(weather.condition)}
									</span>
									<div>
										<div className="font-medium">{weather.location}</div>
										<div className="text-sm text-gray-600">
											{weather.condition}
										</div>
									</div>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span>Температура:</span>
										<span>{weather.temperature}°C</span>
									</div>
									<div className="flex justify-between">
										<span>Осадки:</span>
										<span>{weather.precipitation}%</span>
									</div>
									<div className="flex justify-between">
										<span>Видимость:</span>
										<span>{weather.visibility} км</span>
									</div>
									<div className="flex justify-between">
										<span>Ветер:</span>
										<span>{weather.windSpeed} км/ч</span>
									</div>
									<div className="flex justify-between">
										<span>Влажность:</span>
										<span>{weather.humidity}%</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Режим труда и отдыха */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Coffee className="h-5 w-5" />
						Режим труда и отдыха (РТО)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Alert className="bg-blue-50 border-blue-200">
							<Timer className="h-4 w-4" />
							<AlertDescription>
								Согласно требованиям безопасности дорожного движения, максимальное
								время непрерывного вождения составляет 4 часа. После этого необходим
								отдых минимум 45 минут.
							</AlertDescription>
						</Alert>

						<div className="space-y-3">
							{routeData.restStops?.map((stop, index) => (
								<div
									key={stop.id}
									className={`p-4 rounded-lg border-l-4 ${
										stop.type === "mandatory"
											? "bg-red-50 border-red-400"
											: "bg-yellow-50 border-yellow-400"
									}`}
								>
									<div className="flex items-start gap-3">
										<div className="flex items-center gap-1">
											<Coffee
												className={`h-5 w-5 mt-1 ${
													stop.type === "mandatory"
														? "text-red-600"
														: "text-yellow-600"
												}`}
											/>
											<span className="text-lg">
												{getFacilityIcon(stop.facilityType)}
											</span>
										</div>
										<div className="flex-1">
											<div className="font-medium">{stop.location}</div>
											<div className="text-sm text-gray-600 mt-1">
												{stop.reason}
											</div>
											<div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
												<span className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Время от начала:{" "}
													{formatDuration(stop.timeFromStart)}
												</span>
												{stop.rating && (
													<span className="flex items-center gap-1">
														<Star className="h-3 w-3" />
														{stop.rating}
													</span>
												)}
												{stop.workingHours && (
													<span className="text-xs">
														Режим: {stop.workingHours}
													</span>
												)}
											</div>
											<div className="flex items-center gap-2 mt-2">
												<Badge
													variant={
														stop.type === "mandatory"
															? "destructive"
															: "default"
													}
													className="text-xs"
												>
													{stop.type === "mandatory"
														? "Обязательная"
														: "Рекомендуемая"}
												</Badge>
												{stop.amenities.length > 0 && (
													<div className="text-xs text-gray-500">
														Услуги:{" "}
														{stop.amenities.slice(0, 3).join(", ")}
														{stop.amenities.length > 3 &&
															` +${stop.amenities.length - 3}`}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Расширенный анализ рисков */}
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Комплексный анализ рисков
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Общий риск:</span>
								<Badge className={getRiskColor(routeData.overallRisk)}>
									{getRiskLabel(routeData.overallRisk)} ({routeData.overallRisk})
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600 flex items-center gap-1">
									<Cloud className="h-4 w-4" />
									Погодный риск:
								</span>
								<Badge className={getRiskColor(routeData.weatherRisk)}>
									{getRiskLabel(routeData.weatherRisk)} ({routeData.weatherRisk})
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Состояние дорог:</span>
								<Badge className={getRiskColor(routeData.roadQualityRisk)}>
									{getRiskLabel(routeData.roadQualityRisk)} (
									{routeData.roadQualityRisk})
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Плотность трафика:</span>
								<Badge className={getRiskColor(routeData.trafficRisk)}>
									{getRiskLabel(routeData.trafficRisk)} ({routeData.trafficRisk})
								</Badge>
							</div>
						</div>
						<div className="space-y-3">
							<div className="text-sm font-medium text-gray-700">
								Распределение рисков:
							</div>
							<div className="space-y-2">
								<div>
									<div className="flex justify-between text-sm">
										<span>Погода</span>
										<span>{routeData.weatherRisk}/5</span>
									</div>
									<Progress value={routeData.weatherRisk * 20} className="h-2" />
								</div>
								<div>
									<div className="flex justify-between text-sm">
										<span>Дороги</span>
										<span>{routeData.roadQualityRisk}/5</span>
									</div>
									<Progress
										value={routeData.roadQualityRisk * 20}
										className="h-2"
									/>
								</div>
								<div>
									<div className="flex justify-between text-sm">
										<span>Трафик</span>
										<span>{routeData.trafficRisk}/5</span>
									</div>
									<Progress value={routeData.trafficRisk * 20} className="h-2" />
								</div>
							</div>
						</div>
					</div>

					{/* Детальные рекомендации */}
					<Separator />
					<div className="space-y-4">
						<h4 className="font-medium">Рекомендации по безопасности:</h4>

						{routeData.riskAnalysis.weather.factors.length > 0 && (
							<div className="space-y-2">
								<div className="text-sm font-medium text-orange-600">
									Погодные факторы:
								</div>
								<ul className="text-sm space-y-1">
									{routeData.riskAnalysis.weather.factors.map((factor, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="text-orange-500 mt-1">•</span>
											{factor}
										</li>
									))}
								</ul>
								<div className="text-sm">
									<strong>Рекомендации:</strong>
									<ul className="mt-1 space-y-1">
										{routeData.riskAnalysis.weather.recommendations.map(
											(rec, index) => (
												<li key={index} className="flex items-start gap-2">
													<span className="text-green-500 mt-1">✓</span>
													{rec}
												</li>
											)
										)}
									</ul>
								</div>
							</div>
						)}

						{routeData.riskAnalysis.road.factors.length > 0 && (
							<div className="space-y-2">
								<div className="text-sm font-medium text-red-600">
									Дорожные факторы:
								</div>
								<ul className="text-sm space-y-1">
									{routeData.riskAnalysis.road.factors.map((factor, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="text-red-500 mt-1">•</span>
											{factor}
										</li>
									))}
								</ul>
								<div className="text-sm">
									<strong>Рекомендации:</strong>
									<ul className="mt-1 space-y-1">
										{routeData.riskAnalysis.road.recommendations.map(
											(rec, index) => (
												<li key={index} className="flex items-start gap-2">
													<span className="text-green-500 mt-1">✓</span>
													{rec}
												</li>
											)
										)}
									</ul>
								</div>
							</div>
						)}

						{routeData.riskAnalysis.traffic.factors.length > 0 && (
							<div className="space-y-2">
								<div className="text-sm font-medium text-yellow-600">
									Транспортные факторы:
								</div>
								<ul className="text-sm space-y-1">
									{routeData.riskAnalysis.traffic.factors.map((factor, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="text-yellow-500 mt-1">•</span>
											{factor}
										</li>
									))}
								</ul>
								<div className="text-sm">
									<strong>Рекомендации:</strong>
									<ul className="mt-1 space-y-1">
										{routeData.riskAnalysis.traffic.recommendations.map(
											(rec, index) => (
												<li key={index} className="flex items-start gap-2">
													<span className="text-green-500 mt-1">✓</span>
													{rec}
												</li>
											)
										)}
									</ul>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
