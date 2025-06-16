// freight-frontend/src/features/routes/components/route-planner/index.tsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteForm } from "./route-form";
import { RouteMap } from "./route-map";
import { RouteAnalytics } from "./route-analytics";
import { WeatherWidget } from "./weather-widget";
import { useCalculateRouteMutation } from "@/shared/api/routesSlice";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Route, BarChart3, Cloud, Navigation } from "lucide-react";
import type { DetailedRouteResponse, RouteFormData } from "../../types";

export function RoutePlanner() {
	const [routeData, setRouteData] = useState<DetailedRouteResponse | null>(null);
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(
		null
	);
	const [activeTab, setActiveTab] = useState("planning");
	const { toast } = useToast();

	const [calculateRoute, { isLoading }] = useCalculateRouteMutation();

	const handleCalculateRoute = async (formData: RouteFormData) => {
		try {
			const response = await calculateRoute({
				startLat: formData.startLat || 0,
				startLon: formData.startLon || 0,
				endLat: formData.endLat || 0,
				endLon: formData.endLon || 0,
				vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
				driverId: formData.driverId ? parseInt(formData.driverId) : undefined,
				departureTime: formData.departureTime,
				considerWeather: true,
				considerTraffic: true,
			}).unwrap();

			// Создаем копию объекта и округляем расстояние до целого числа
			const processedResponse = {
				...response,
				distance: response.distance ? Math.round(response.distance) : response.distance,
				// Добавляем координаты для корректного отображения карты
				startLat: formData.startLat,
				startLon: formData.startLon,
				endLat: formData.endLat,
				endLon: formData.endLon,
			};

			setRouteData(processedResponse as DetailedRouteResponse);

			// Автоматически переключаемся на карту после успешного расчета
			setActiveTab("map");

			toast({
				title: "Маршрут рассчитан",
				description: `Расстояние: ${processedResponse.distance} км, время: ${Math.floor((processedResponse.duration || 0) / 60)} ч. Посмотрите на карте!`,
				duration: 5000,
			});
		} catch (error: any) {
			const errorMessage =
				error?.data?.message || error?.message || "Не удалось рассчитать маршрут";
			toast({
				title: "Ошибка расчета маршрута",
				description: errorMessage,
				variant: "destructive",
				duration: 7000,
			});
			console.error("Route calculation error:", error);
		}
	};

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lon: position.coords.longitude,
					};
					setCurrentLocation(location);
					toast({
						title: "Местоположение определено",
						description: `Широта: ${location.lat.toFixed(4)}, Долгота: ${location.lon.toFixed(4)}`,
					});
				},
				(error) => {
					toast({
						title: "Ошибка",
						description: "Не удалось определить местоположение",
						variant: "destructive",
					});
					console.error("Geolocation error:", error);
				}
			);
		} else {
			toast({
				title: "Ошибка",
				description: "Геолокация не поддерживается браузером",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="container py-8">
			<div className="space-y-6">
				{/* Заголовок */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Планировщик маршрутов</h1>
						<p className="text-muted-foreground">
							Создание оптимальных маршрутов с учетом погодных условий и аналитикой
						</p>
					</div>
				</div>

				{/* Основной контент */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4 bg-orange-50 dark:bg-orange-500/10">
						<TabsTrigger
							value="planning"
							className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
						>
							<Route className="h-4 w-4 mr-2" />
							Планирование
						</TabsTrigger>
						<TabsTrigger
							value="map"
							className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
						>
							<MapPin className="h-4 w-4 mr-2" />
							Карта
						</TabsTrigger>
						<TabsTrigger
							value="analytics"
							className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
						>
							<BarChart3 className="h-4 w-4 mr-2" />
							Аналитика
						</TabsTrigger>
						<TabsTrigger
							value="weather"
							className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
						>
							<Cloud className="h-4 w-4 mr-2" />
							Погода
						</TabsTrigger>
					</TabsList>

					{/* Планирование */}
					<TabsContent value="planning" className="space-y-6">
						<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
							<CardHeader className="border-b border-orange-100 dark:border-orange-500/20">
								<CardTitle className="flex items-center gap-2">
									<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
										<Route className="h-5 w-5 text-orange-500" />
									</div>
									Параметры маршрута
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-6">
								<RouteForm
									onSubmit={handleCalculateRoute}
									isLoading={isLoading}
									currentLocation={currentLocation}
								/>
								<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Карта */}
					<TabsContent value="map" className="space-y-6">
						<RouteMap routeData={routeData} currentLocation={currentLocation} />
					</TabsContent>

					{/* Аналитика */}
					<TabsContent value="analytics" className="space-y-6">
						{routeData ? (
							<RouteAnalytics data={routeData} />
						) : (
							<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
								<CardContent className="flex flex-col items-center justify-center py-20">
									<div className="p-4 rounded-full bg-orange-100 dark:bg-orange-500/20 mb-4">
										<BarChart3 className="h-16 w-16 text-orange-500" />
									</div>
									<h3 className="text-xl font-semibold mb-2">
										Аналитика маршрута
									</h3>
									<p className="text-muted-foreground text-center max-w-md">
										Рассчитайте маршрут для получения детальной аналитики
									</p>
									<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Погода */}
					<TabsContent value="weather" className="space-y-6">
						{routeData ? (
							<WeatherWidget
								startCoordinates={{
									lat: routeData.startLat || 0,
									lon: routeData.startLon || 0,
								}}
								endCoordinates={{
									lat: routeData.endLat || 0,
									lon: routeData.endLon || 0,
								}}
								departureTime={new Date()}
								estimatedArrivalTime={
									new Date(Date.now() + (routeData.duration || 0) * 60000)
								}
							/>
						) : (
							<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
								<CardContent className="flex flex-col items-center justify-center py-20">
									<div className="p-4 rounded-full bg-orange-100 dark:bg-orange-500/20 mb-4">
										<Cloud className="h-16 w-16 text-orange-500" />
									</div>
									<h3 className="text-xl font-semibold mb-2">Прогноз погоды</h3>
									<p className="text-muted-foreground text-center max-w-md">
										Создайте маршрут для получения прогноза погоды
									</p>
									<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
