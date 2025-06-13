import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	CloudIcon,
	DropletIcon,
	EyeIcon,
	ThermometerIcon,
	WindIcon,
	AlertTriangleIcon,
	ClockIcon,
} from "lucide-react";
import { WeatherDataDto, WeatherHazardWarningDto } from "@/shared/api/weatherSlice";

interface WeatherWidgetProps {
	departureWeather?: WeatherDataDto;
	arrivalWeather?: WeatherDataDto;
	hazards?: WeatherHazardWarningDto[];
	departureTime?: string;
	arrivalTime?: string;
	isLoading?: boolean;
}

export function WeatherWidget({
	departureWeather,
	arrivalWeather,
	hazards,
	departureTime,
	arrivalTime,
	isLoading,
}: WeatherWidgetProps) {
	if (isLoading) {
		return (
			<Card className="claude-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CloudIcon className="w-5 h-5" />
						Прогноз погоды
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-32">
						<div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
						<span className="ml-2 text-muted-foreground">Загрузка прогноза...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	const formatTime = (timeString?: string) => {
		if (!timeString) return "";
		return new Date(timeString).toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getWeatherIcon = (condition?: string) => {
		switch (condition?.toLowerCase()) {
			case "clear":
				return "☀️";
			case "clouds":
				return "☁️";
			case "rain":
				return "🌧️";
			case "snow":
				return "❄️";
			case "drizzle":
				return "🌦️";
			case "thunderstorm":
				return "⛈️";
			default:
				return "🌤️";
		}
	};

	const getRiskBadgeVariant = (riskScore?: number) => {
		if (!riskScore) return "secondary";
		if (riskScore >= 70) return "destructive";
		if (riskScore >= 40) return "secondary";
		return "secondary";
	};

	const getSeverityBadgeVariant = (severity: string) => {
		switch (severity.toLowerCase()) {
			case "severe":
				return "destructive";
			case "high":
				return "destructive";
			case "moderate":
				return "secondary";
			default:
				return "outline";
		}
	};

	return (
		<Card className="claude-card">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CloudIcon className="w-5 h-5" />
					Прогноз погоды на маршруте
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Погода в точке отправления */}
				{departureWeather && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="text-2xl">
								{getWeatherIcon(departureWeather.weatherMain)}
							</div>
							<div>
								<h4 className="font-medium">Точка отправления</h4>
								{departureTime && (
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<ClockIcon className="w-3 h-3" />
										{formatTime(departureTime)}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<ThermometerIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">
									{Math.round(departureWeather.temperature)}°C
								</span>
							</div>
							<div className="flex items-center gap-2">
								<WindIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{departureWeather.windSpeed} м/с</span>
							</div>
							<div className="flex items-center gap-2">
								<DropletIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{departureWeather.humidity}%</span>
							</div>
							<div className="flex items-center gap-2">
								<EyeIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">
									{departureWeather.visibility
										? `${Math.round(departureWeather.visibility / 1000)} км`
										: "Н/Д"}
								</span>
							</div>
						</div>

						{departureWeather.weatherDescription && (
							<p className="text-sm text-muted-foreground">
								{departureWeather.weatherDescription}
							</p>
						)}

						{departureWeather.riskScore && (
							<Badge
								variant={getRiskBadgeVariant(departureWeather.riskScore)}
								className="text-xs"
							>
								Риск: {departureWeather.riskScore}/100
							</Badge>
						)}
					</div>
				)}

				{/* Погода в точке прибытия */}
				{arrivalWeather && (
					<div className="space-y-3 border-t pt-4">
						<div className="flex items-center gap-2">
							<div className="text-2xl">
								{getWeatherIcon(arrivalWeather.weatherMain)}
							</div>
							<div>
								<h4 className="font-medium">Точка прибытия</h4>
								{arrivalTime && (
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<ClockIcon className="w-3 h-3" />
										{formatTime(arrivalTime)}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<ThermometerIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">
									{Math.round(arrivalWeather.temperature)}°C
								</span>
							</div>
							<div className="flex items-center gap-2">
								<WindIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{arrivalWeather.windSpeed} м/с</span>
							</div>
							<div className="flex items-center gap-2">
								<DropletIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{arrivalWeather.humidity}%</span>
							</div>
							<div className="flex items-center gap-2">
								<EyeIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">
									{arrivalWeather.visibility
										? `${Math.round(arrivalWeather.visibility / 1000)} км`
										: "Н/Д"}
								</span>
							</div>
						</div>

						{arrivalWeather.weatherDescription && (
							<p className="text-sm text-muted-foreground">
								{arrivalWeather.weatherDescription}
							</p>
						)}

						{arrivalWeather.riskScore && (
							<Badge
								variant={getRiskBadgeVariant(arrivalWeather.riskScore)}
								className="text-xs"
							>
								Риск: {arrivalWeather.riskScore}/100
							</Badge>
						)}
					</div>
				)}

				{/* Предупреждения о погодных опасностях */}
				{hazards && hazards.length > 0 && (
					<div className="space-y-3 border-t pt-4">
						<div className="flex items-center gap-2">
							<AlertTriangleIcon className="w-4 h-4 text-destructive" />
							<h4 className="font-medium text-destructive">
								Погодные предупреждения
							</h4>
						</div>

						<div className="space-y-2">
							{hazards.map((hazard, index) => (
								<div
									key={index}
									className="p-3 bg-destructive/10 rounded-lg border border-destructive/20"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<Badge
													variant={getSeverityBadgeVariant(
														hazard.severity
													)}
													className="text-xs"
												>
													{hazard.severity}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{formatTime(hazard.expectedTime)}
												</span>
											</div>
											<p className="text-sm font-medium">
												{hazard.description}
											</p>
											{hazard.recommendation && (
												<p className="text-xs text-muted-foreground mt-1">
													💡 {hazard.recommendation}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{!departureWeather && !arrivalWeather && !hazards && (
					<div className="text-center py-8">
						<CloudIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
						<p className="text-muted-foreground">
							Укажите точки маршрута и время отправления для получения прогноза погоды
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
