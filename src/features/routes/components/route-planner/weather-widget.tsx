// freight-frontend/src/features/routes/components/route-planner/weather-widget.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	CloudIcon,
	SunIcon,
	CloudRainIcon,
	ThermometerIcon,
	WindIcon,
	DropletIcon,
	ClockIcon,
} from "lucide-react";

interface WeatherWidgetProps {
	startCoordinates: { lat: number; lon: number };
	endCoordinates: { lat: number; lon: number };
	departureTime: Date;
	estimatedArrivalTime: Date;
}

export function WeatherWidget({
	startCoordinates,
	endCoordinates,
	departureTime,
	estimatedArrivalTime,
}: WeatherWidgetProps) {
	const formatTime = (date: Date) => {
		return date.toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Мок-данные для демонстрации
	const startWeather = {
		temperature: 15,
		condition: "partly-cloudy",
		humidity: 65,
		windSpeed: 5,
		description: "Переменная облачность",
	};

	const endWeather = {
		temperature: 12,
		condition: "light-rain",
		humidity: 80,
		windSpeed: 8,
		description: "Небольшой дождь",
	};

	const getWeatherIcon = (condition: string) => {
		switch (condition) {
			case "sunny":
				return <SunIcon className="h-8 w-8 text-orange-400" />;
			case "partly-cloudy":
				return <CloudIcon className="h-8 w-8 text-orange-500" />;
			case "light-rain":
				return <CloudRainIcon className="h-8 w-8 text-orange-600" />;
			default:
				return <CloudIcon className="h-8 w-8 text-orange-500" />;
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{/* Погода в точке отправления */}
			<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
				<CardHeader className="border-b border-orange-100 dark:border-orange-500/20">
					<CardTitle className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
							{getWeatherIcon(startWeather.condition)}
						</div>
						Точка отправления
					</CardTitle>
					<p className="text-sm text-muted-foreground flex items-center gap-2">
						<ClockIcon className="h-3 w-3 text-orange-500" />
						{formatTime(departureTime)}
					</p>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<ThermometerIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Температура</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{startWeather.temperature}°C
						</Badge>
					</div>
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<DropletIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Влажность</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{startWeather.humidity}%
						</Badge>
					</div>
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<WindIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Ветер</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{startWeather.windSpeed} м/с
						</Badge>
					</div>
					<div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-500/20">
						<p className="text-sm text-muted-foreground text-center font-medium">
							{startWeather.description}
						</p>
					</div>
					<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
				</CardContent>
			</Card>

			{/* Погода в точке назначения */}
			<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
				<CardHeader className="border-b border-orange-100 dark:border-orange-500/20">
					<CardTitle className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
							{getWeatherIcon(endWeather.condition)}
						</div>
						Точка назначения
					</CardTitle>
					<p className="text-sm text-muted-foreground flex items-center gap-2">
						<ClockIcon className="h-3 w-3 text-orange-500" />
						{formatTime(estimatedArrivalTime)}
					</p>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<ThermometerIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Температура</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{endWeather.temperature}°C
						</Badge>
					</div>
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<DropletIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Влажность</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{endWeather.humidity}%
						</Badge>
					</div>
					<div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
						<div className="flex items-center gap-2">
							<WindIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium">Ветер</span>
						</div>
						<Badge
							variant="secondary"
							className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
						>
							{endWeather.windSpeed} м/с
						</Badge>
					</div>
					<div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-500/20">
						<p className="text-sm text-muted-foreground text-center font-medium">
							{endWeather.description}
						</p>
					</div>
					<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
				</CardContent>
			</Card>
		</div>
	);
}
