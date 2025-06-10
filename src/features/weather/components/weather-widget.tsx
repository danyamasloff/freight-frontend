import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	CloudRain,
	Wind,
	Thermometer,
	Eye,
	AlertTriangle,
	MapPin,
	Snowflake,
	Sun,
	Cloud,
	CloudSnow,
	Zap,
	RefreshCw,
	ChevronDown,
	ChevronUp,
	Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCurrentWeatherQuery, useGetHazardWarningsMutation } from "@/shared/api/weatherSlice";
import type { RouteResponse, WeatherHazardWarning, WeatherData } from "@/shared/types/api";

interface WeatherWidgetProps {
	currentLocation?: { lat: number; lon: number };
	route?: RouteResponse;
	departureTime?: string;
	className?: string;
	compact?: boolean;
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
	DRIZZLE: CloudRain,
	MIST: Cloud,
};

const SEVERITY_COLORS = {
	LOW: "text-blue-600",
	MEDIUM: "text-yellow-600",
	HIGH: "text-orange-600",
	EXTREME: "text-red-600",
};

export function WeatherWidget({
	currentLocation,
	route,
	departureTime,
	className,
	compact = false,
}: WeatherWidgetProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [nearbyWarnings, setNearbyWarnings] = useState<WeatherHazardWarning[]>([]);

	// Текущая погода
	const {
		data: currentWeather,
		refetch: refetchWeather,
		isLoading: isLoadingWeather,
	} = useGetCurrentWeatherQuery(
		currentLocation
			? { lat: currentLocation.lat, lon: currentLocation.lon }
			: { lat: 0, lon: 0 },
		{
			skip: !currentLocation,
			refetchOnMountOrArgChange: true,
			pollingInterval: 5 * 60 * 1000, // Обновление каждые 5 минут
		}
	);

	// Предупреждения для маршрута
	const [getHazardWarnings] = useGetHazardWarningsMutation();

	// Загрузка предупреждений для маршрута
	const loadWarnings = async () => {
		if (route && departureTime) {
			try {
				const warnings = await getHazardWarnings({
					route,
					departureTime,
				}).unwrap();

				// Фильтруем только ближайшие предупреждения (следующие 2 часа)
				const now = new Date();
				const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

				const nearby = warnings.filter((warning) => {
					// Используем expectedTime для фильтрации
					const warningTime = new Date(warning.expectedTime);
					return warningTime >= now && warningTime <= twoHoursLater;
				});

				setNearbyWarnings(nearby);
			} catch (error) {
				console.error("Ошибка при загрузке предупреждений:", error);
			}
		}
	};

	useEffect(() => {
		loadWarnings();
	}, [route, departureTime]);

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
			STRONG_WIND: "Сильный ветер",
			ICE_RISK: "Риск гололеда",
			LOW_VISIBILITY: "Плохая видимость",
			HEAVY_RAIN: "Сильный дождь",
			HEAVY_SNOW: "Сильный снег",
			FOG: "Туман",
			STORM: "Шторм",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const getMostCriticalWarning = (): WeatherHazardWarning | null => {
		if (nearbyWarnings.length === 0) return null;

		// Сортируем по серьезности (EXTREME > HIGH > MEDIUM > LOW)
		const severityOrder = { EXTREME: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
		return nearbyWarnings.sort(
			(a, b) =>
				(severityOrder[b.severity as keyof typeof severityOrder] || 0) -
				(severityOrder[a.severity as keyof typeof severityOrder] || 0)
		)[0];
	};

	const criticalWarning = getMostCriticalWarning();

	if (compact) {
		return (
			<div className={cn("p-3 bg-white border rounded-lg shadow-sm", className)}>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<MapPin className="h-4 w-4 text-gray-500" />
						{currentWeather ? (
							<>
								{getWeatherIcon(currentWeather.weatherMain || "CLEAR", "sm")}
								<span className="text-sm font-medium">
									{formatTemperature(currentWeather.temperature)}
								</span>
								{currentWeather.riskScore && (
									<Badge
										variant={
											currentWeather.riskScore > 50
												? "destructive"
												: "secondary"
										}
										className="text-xs"
									>
										Риск: {currentWeather.riskScore}%
									</Badge>
								)}
							</>
						) : (
							<span className="text-sm text-gray-500">Загрузка...</span>
						)}
					</div>

					{criticalWarning && (
						<div className="flex items-center space-x-1">
							<AlertTriangle className="h-4 w-4 text-orange-500" />
							<Badge
								variant="outline"
								className={cn(
									"text-xs",
									SEVERITY_COLORS[
										criticalWarning.severity as keyof typeof SEVERITY_COLORS
									]
								)}
							>
								{getWeatherTypeLabel(criticalWarning.hazardType)}
							</Badge>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<Card className={cn("", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg flex items-center">
						<MapPin className="h-5 w-5 mr-2 text-blue-600" />
						Погода
					</CardTitle>
					<div className="flex items-center space-x-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => refetchWeather()}
							disabled={isLoadingWeather}
						>
							<RefreshCw
								className={cn("h-4 w-4", isLoadingWeather && "animate-spin")}
							/>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Основная информация о погоде */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							{currentWeather &&
								getWeatherIcon(currentWeather.weatherMain || "CLEAR")}
							<div>
								<p className="font-medium">
									{currentWeather
										? formatTemperature(currentWeather.temperature)
										: "—"}
								</p>
								<p className="text-sm text-gray-600">
									{currentWeather?.weatherDescription || "Загрузка..."}
								</p>
							</div>
						</div>
					</div>

					{currentWeather?.riskScore && (
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<Shield className="h-4 w-4 text-gray-500" />
								<div>
									<p className="font-medium">Риск: {currentWeather.riskScore}%</p>
									<p className="text-sm text-gray-600">
										{currentWeather.riskLevel ||
											(currentWeather.riskScore > 70
												? "Высокий"
												: currentWeather.riskScore > 50
													? "Средний"
													: "Низкий")}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Детальная информация при развертывании */}
				{isExpanded && (
					<div className="space-y-4 pt-4 border-t">
						{currentWeather && (
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center space-x-2">
									<Wind className="h-4 w-4 text-gray-500" />
									<span>Ветер: {formatWindSpeed(currentWeather.windSpeed)}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Eye className="h-4 w-4 text-gray-500" />
									<span>
										Видимость:{" "}
										{currentWeather.visibility
											? `${(currentWeather.visibility / 1000).toFixed(1)} км`
											: "Хорошая"}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Thermometer className="h-4 w-4 text-gray-500" />
									<span>Влажность: {currentWeather.humidity}%</span>
								</div>
								<div className="flex items-center space-x-2">
									<span className="text-gray-500">📊</span>
									<span>Давление: {Math.round(currentWeather.pressure)} гПа</span>
								</div>
							</div>
						)}

						{/* Описание рисков из бэкенда */}
						{currentWeather?.riskDescription && (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									{currentWeather.riskDescription}
								</AlertDescription>
							</Alert>
						)}

						{/* Предупреждения о погодных опасностях */}
						{nearbyWarnings.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-medium text-sm">Предупреждения:</h4>
								{nearbyWarnings.map((warning, index) => (
									<Alert key={index} variant="destructive">
										<AlertTriangle className="h-4 w-4" />
										<AlertDescription>
											<div className="space-y-1">
												<div className="font-medium">
													{getWeatherTypeLabel(warning.hazardType)}
												</div>
												<div className="text-sm">{warning.description}</div>
												{warning.recommendation && (
													<div className="text-sm text-blue-600">
														💡 {warning.recommendation}
													</div>
												)}
											</div>
										</AlertDescription>
									</Alert>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
