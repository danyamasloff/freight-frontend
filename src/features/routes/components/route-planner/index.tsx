import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RouteForm } from "./route-form";
import { RouteMap } from "./route-map";
import { RouteAnalytics } from "./route-analytics";
import { PlanningGuide } from "./planning-guide";
import { WeatherWidget } from "./weather-widget";
import { useCalculateRouteMutation } from "@/shared/api/routesSlice";
import { toast } from "sonner";
import { MapPin, Route, BarChart3, Cloud, Navigation, Sparkles } from "lucide-react";

export function RoutePlanner() {
	const [routeData, setRouteData] = useState<any>(null);
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(
		null
	);
	const [calculateRoute, { isLoading }] = useCalculateRouteMutation();

	const handleCalculateRoute = async (formData: any) => {
		try {
			const response = await calculateRoute({
				startLat: formData.startLat,
				startLon: formData.startLon,
				endLat: formData.endLat,
				endLon: formData.endLon,
				vehicleId: formData.vehicleId,
				driverId: formData.driverId,
				departureTime: formData.departureTime,
				considerWeather: true,
				considerTraffic: true,
			}).unwrap();

			setRouteData(response);
			toast.success("Маршрут успешно рассчитан");
		} catch (error) {
			toast.error("Ошибка при расчете маршрута");
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
					toast.success("Местоположение определено");
				},
				(error) => {
					toast.error("Не удалось определить местоположение");
					console.error("Geolocation error:", error);
				}
			);
		} else {
			toast.error("Геолокация не поддерживается браузером");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
			<div className="container mx-auto p-6 space-y-8">
				{/* Заголовок с улучшенным дизайном */}
				<div className="text-center space-y-4">
					<div className="flex items-center justify-center gap-3 mb-4">
						<div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
							<Route className="h-6 w-6" />
						</div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
							Планировщик маршрутов
						</h1>
						<Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Интеллектуальное планирование маршрутов с анализом погоды, дорожных условий
						и экономической эффективности
					</p>

					{/* Кнопка определения местоположения */}
					<div className="flex justify-center">
						<Button
							onClick={getCurrentLocation}
							variant="outline"
							className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-200 transition-colors"
						>
							<Navigation className="h-4 w-4" />
							Определить местоположение
							{currentLocation && (
								<Badge variant="secondary" className="ml-2">
									<MapPin className="h-3 w-3 mr-1" />
									Найдено
								</Badge>
							)}
						</Button>
					</div>
				</div>

				<PlanningGuide />

				{/* Главный контент с вкладками */}
				<Tabs defaultValue="planning" className="w-full">
					<TabsList className="grid w-full grid-cols-4 mb-8">
						<TabsTrigger value="planning" className="flex items-center gap-2">
							<Route className="h-4 w-4" />
							Планирование
						</TabsTrigger>
						<TabsTrigger value="map" className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Карта
						</TabsTrigger>
						<TabsTrigger
							value="analytics"
							className="flex items-center gap-2"
							disabled={!routeData}
						>
							<BarChart3 className="h-4 w-4" />
							Аналитика
						</TabsTrigger>
						<TabsTrigger
							value="weather"
							className="flex items-center gap-2"
							disabled={!routeData}
						>
							<Cloud className="h-4 w-4" />
							Погода
						</TabsTrigger>
					</TabsList>

					<TabsContent value="planning" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<Card className="claude-card border-2 border-orange-100 shadow-lg">
									<CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
										<CardTitle className="flex items-center gap-2 text-orange-900">
											<Route className="h-5 w-5" />
											Параметры маршрута
										</CardTitle>
									</CardHeader>
									<CardContent className="p-6">
										<RouteForm
											onSubmit={handleCalculateRoute}
											isLoading={isLoading}
											currentLocation={currentLocation}
										/>
									</CardContent>
								</Card>
							</div>

							<div className="space-y-6">
								{routeData && (
									<Card className="claude-card border-2 border-green-100 shadow-lg">
										<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
											<CardTitle className="flex items-center gap-2 text-green-900">
												<BarChart3 className="h-5 w-5" />
												Результат
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<div className="space-y-3">
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Расстояние:
													</span>
													<Badge variant="secondary">
														{Math.round(routeData.distance || 0)} км
													</Badge>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Время:
													</span>
													<Badge variant="secondary">
														{Math.floor((routeData.duration || 0) / 60)}{" "}
														ч {(routeData.duration || 0) % 60} мин
													</Badge>
												</div>
												{routeData.estimatedFuelCost && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Топливо:
														</span>
														<Badge variant="outline">
															{routeData.estimatedFuelCost} ₽
														</Badge>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="map" className="space-y-6">
						<Card className="claude-card border-2 border-blue-100 shadow-lg">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
								<CardTitle className="flex items-center gap-2 text-blue-900">
									<MapPin className="h-5 w-5" />
									Интерактивная карта маршрута
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<RouteMap routeData={routeData} currentLocation={currentLocation} />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="analytics" className="space-y-6">
						{routeData && <RouteAnalytics data={routeData} />}
					</TabsContent>

					<TabsContent value="weather" className="space-y-6">
						{routeData && (
							<Card className="claude-card border-2 border-purple-100 shadow-lg">
								<CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
									<CardTitle className="flex items-center gap-2 text-purple-900">
										<Cloud className="h-5 w-5" />
										Прогноз погоды по маршруту
									</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									<WeatherWidget routeData={routeData} />
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
