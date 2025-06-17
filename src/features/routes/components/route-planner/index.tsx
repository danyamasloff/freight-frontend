// freight-frontend/src/features/routes/components/route-planner/index.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RouteForm } from "./route-form";
import { RouteMap } from "./route-map";
import { RouteAnalytics } from "./route-analytics";
import { WeatherWidget } from "./weather-widget";
import { useCalculateRouteMutation } from "@/shared/api/routesSlice";
import { useLazyGetRouteAnalyticsQuery, type RouteAnalyticsDto } from "@/shared/api/analyticsSlice";
import { useToast } from "@/hooks/use-toast";
import {
	MapPin,
	Route,
	BarChart3,
	Cloud,
	Navigation,
	Zap,
	TrendingUp,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import type { DetailedRouteResponse, RouteFormData } from "../../types";

// Animation variants with AceTernity UI inspired effects
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.6,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
	hover: {
		scale: 1.02,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

const tabContentVariants = {
	hidden: { opacity: 0, x: 20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

export function RoutePlanner() {
	const [routeData, setRouteData] = useState<DetailedRouteResponse | null>(null);
	const [routeAnalytics, setRouteAnalytics] = useState<RouteAnalyticsDto | null>(null);
	const [activeTab, setActiveTab] = useState("planning");
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(
		null
	);

	const [calculateRoute, { isLoading }] = useCalculateRouteMutation();
	const [getRouteAnalytics] = useLazyGetRouteAnalyticsQuery();
	const { toast } = useToast();

	const calculateRouteAnalytics = async (
		response: any,
		formData: RouteFormData
	): Promise<RouteAnalyticsDto> => {
		// Mock analytics calculation (replace with real API call)
		const distance = response.distance || 100;
		const duration = response.duration || 240;

		const avgSpeed = distance / (duration / 60);
		const fuelConsumption = 35;
		const fuelPer100 = (fuelConsumption / distance) * 100;
		const fuelCost = fuelConsumption * 55;
		const tollCost = distance * 2.5;
		const totalCost = fuelCost + tollCost + 5000;
		const costPerKm = totalCost / distance;

		const overallRisk = 2.5;
		const weatherRisk = 2.0;
		const roadRisk = 3.0;

		return {
			distance,
			duration,
			stopTime: Math.round(duration * 0.15),
			avgSpeed: Math.round(avgSpeed),
			fuelConsumption: {
				total: Math.round(fuelConsumption * 100) / 100,
				per100km: fuelPer100,
			},
			cost: {
				total: Math.round(totalCost),
				perKm: Math.round(costPerKm * 100) / 100,
			},
			overallRisk,
			weatherRisk,
			roadRisk,
		};
	};

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

			const processedResponse = {
				...response,
				distance: response.distance ? Math.round(response.distance) : response.distance,
				startLat: formData.startLat,
				startLon: formData.startLon,
				endLat: formData.endLat,
				endLon: formData.endLon,
			};

			setRouteData(processedResponse as unknown as DetailedRouteResponse);

			try {
				const analyticsData = await calculateRouteAnalytics(processedResponse, formData);
				setRouteAnalytics(analyticsData);
			} catch (error) {
				console.warn("Ошибка при расчете аналитики:", error);
			}

			setActiveTab("map");

			toast({
				title: "Маршрут рассчитан!",
				description: `Расстояние: ${Math.round(response.distance)} км, время в пути: ${Math.round(response.duration / 60)} ч`,
			});
		} catch (error: any) {
			toast({
				title: "Ошибка расчета маршрута",
				description: error?.data?.message || "Не удалось рассчитать маршрут",
				variant: "destructive",
			});
		}
	};

	return (
		<motion.div
			className="min-h-screen bg-background"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<div className="container mx-auto py-8 px-4 space-y-8">
				{/* Header with gradient text */}
				<motion.div className="text-center space-y-4" variants={itemVariants}>
					<div className="relative">
						<h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
							Планировщик маршрутов
						</h1>
						<div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-orange-500/20 to-amber-500/20 blur-xl -z-10 opacity-30" />
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Создание оптимальных маршрутов с учетом погодных условий, трафика и
						комплексной аналитикой
					</p>
					{routeData && (
						<motion.div
							className="flex items-center justify-center gap-4 flex-wrap"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Badge
								variant="outline"
								className="bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10"
							>
								<CheckCircle2 className="h-3 w-3 mr-1" />
								Маршрут готов
							</Badge>
							<Badge
								variant="outline"
								className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10"
							>
								{Math.round(routeData.distance || 0)} км
							</Badge>
							<Badge
								variant="outline"
								className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10"
							>
								{Math.round((routeData.duration || 0) / 60)} ч
							</Badge>
						</motion.div>
					)}
				</motion.div>

				{/* Main Content */}
				<motion.div variants={itemVariants}>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-4 h-12 claude-card bg-card border shadow-md">
							<TabsTrigger
								value="planning"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2 font-medium"
							>
								<Route className="h-4 w-4" />
								<span className="hidden sm:inline">Планирование</span>
							</TabsTrigger>
							<TabsTrigger
								value="map"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2 font-medium"
							>
								<MapPin className="h-4 w-4" />
								<span className="hidden sm:inline">Карта</span>
							</TabsTrigger>
							<TabsTrigger
								value="analytics"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2 font-medium"
							>
								<BarChart3 className="h-4 w-4" />
								<span className="hidden sm:inline">Аналитика</span>
							</TabsTrigger>
							<TabsTrigger
								value="weather"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2 font-medium"
							>
								<Cloud className="h-4 w-4" />
								<span className="hidden sm:inline">Погода</span>
							</TabsTrigger>
						</TabsList>

						<AnimatePresence mode="wait">
							{/* Planning Tab */}
							<TabsContent value="planning" className="mt-8">
								<motion.div
									key="planning"
									variants={tabContentVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
								>
									<Card className="claude-card hover-lift">
										<CardHeader className="pb-6">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
													<Route className="h-6 w-6 text-primary" />
												</div>
												<div>
													<CardTitle className="text-xl font-semibold">
														Параметры маршрута
													</CardTitle>
													<p className="text-muted-foreground mt-1">
														Укажите точки отправления и назначения для
														расчета оптимального маршрута
													</p>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<RouteForm
												onSubmit={handleCalculateRoute}
												isLoading={isLoading}
												currentLocation={currentLocation}
											/>
										</CardContent>
									</Card>
								</motion.div>
							</TabsContent>

							{/* Map Tab */}
							<TabsContent value="map" className="mt-8">
								<motion.div
									key="map"
									variants={tabContentVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
								>
									{routeData ? (
										<Card className="claude-card overflow-hidden">
											<CardHeader className="pb-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
															<MapPin className="h-6 w-6 text-blue-500" />
														</div>
														<div>
															<CardTitle className="text-xl font-semibold">
																Карта маршрута
															</CardTitle>
															<p className="text-muted-foreground">
																Интерактивная карта с детализацией
																маршрута
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2">
														<Badge
															variant="outline"
															className="bg-green-50 border-green-200 text-green-700"
														>
															<Navigation className="h-3 w-3 mr-1" />
															{Math.round(routeData.distance || 0)} км
														</Badge>
													</div>
												</div>
											</CardHeader>
											<CardContent className="p-0">
												<RouteMap
													routeData={routeData}
													currentLocation={currentLocation}
												/>
											</CardContent>
										</Card>
									) : (
										<Card className="claude-card hover-lift">
											<CardContent className="flex flex-col items-center justify-center py-20">
												<motion.div
													className="p-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/10 dark:to-cyan-500/10 mb-6"
													animate={{
														rotate: [0, 5, -5, 0],
														scale: [1, 1.05, 1],
													}}
													transition={{
														duration: 3,
														repeat: Infinity,
														ease: "easeInOut",
													}}
												>
													<MapPin className="h-12 w-12 text-blue-500" />
												</motion.div>
												<h3 className="text-2xl font-semibold mb-3">
													Карта маршрута
												</h3>
												<p className="text-muted-foreground text-center max-w-md mb-6">
													Сначала создайте маршрут на вкладке
													"Планирование" для отображения на карте
												</p>
												<Button
													variant="outline"
													onClick={() => setActiveTab("planning")}
													className="hover-lift"
												>
													<Route className="h-4 w-4 mr-2" />
													Создать маршрут
												</Button>
											</CardContent>
										</Card>
									)}
								</motion.div>
							</TabsContent>

							{/* Analytics Tab */}
							<TabsContent value="analytics" className="mt-8">
								<motion.div
									key="analytics"
									variants={tabContentVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
								>
									{routeData && routeAnalytics ? (
										<Card className="claude-card">
											<CardHeader className="pb-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
														<BarChart3 className="h-6 w-6 text-green-500" />
													</div>
													<div>
														<CardTitle className="text-xl font-semibold">
															Аналитика маршрута
														</CardTitle>
														<p className="text-muted-foreground">
															Детальный анализ экономических
															показателей и рисков
														</p>
													</div>
												</div>
											</CardHeader>
											<CardContent>
												<RouteAnalytics
													data={routeData}
													analytics={routeAnalytics}
												/>
											</CardContent>
										</Card>
									) : (
										<Card className="claude-card hover-lift">
											<CardContent className="flex flex-col items-center justify-center py-20">
												<motion.div
													className="p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/10 dark:to-emerald-500/10 mb-6"
													animate={{
														rotate: [0, 360],
														scale: [1, 1.1, 1],
													}}
													transition={{
														duration: 4,
														repeat: Infinity,
														ease: "easeInOut",
													}}
												>
													<TrendingUp className="h-12 w-12 text-green-500" />
												</motion.div>
												<h3 className="text-2xl font-semibold mb-3">
													Аналитика маршрута
												</h3>
												<p className="text-muted-foreground text-center max-w-md mb-6">
													Рассчитайте маршрут для получения детальной
													аналитики по расходам, времени и рискам
												</p>
												<Button
													variant="outline"
													onClick={() => setActiveTab("planning")}
													className="hover-lift"
												>
													<Zap className="h-4 w-4 mr-2" />
													Рассчитать маршрут
												</Button>
											</CardContent>
										</Card>
									)}
								</motion.div>
							</TabsContent>

							{/* Weather Tab */}
							<TabsContent value="weather" className="mt-8">
								<motion.div
									key="weather"
									variants={tabContentVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
								>
									{routeData ? (
										<Card className="claude-card">
											<CardHeader className="pb-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20">
														<Cloud className="h-6 w-6 text-sky-500" />
													</div>
													<div>
														<CardTitle className="text-xl font-semibold">
															Прогноз погоды
														</CardTitle>
														<p className="text-muted-foreground">
															Погодные условия по маршруту и
															рекомендации
														</p>
													</div>
												</div>
											</CardHeader>
											<CardContent>
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
														new Date(
															Date.now() +
																(routeData.duration || 0) * 60000
														)
													}
												/>
											</CardContent>
										</Card>
									) : (
										<Card className="claude-card hover-lift">
											<CardContent className="flex flex-col items-center justify-center py-20">
												<motion.div
													className="p-6 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-500/10 dark:to-blue-500/10 mb-6"
													animate={{
														y: [0, -10, 0],
														rotate: [0, 5, -5, 0],
													}}
													transition={{
														duration: 3,
														repeat: Infinity,
														ease: "easeInOut",
													}}
												>
													<Cloud className="h-12 w-12 text-sky-500" />
												</motion.div>
												<h3 className="text-2xl font-semibold mb-3">
													Прогноз погоды
												</h3>
												<p className="text-muted-foreground text-center max-w-md mb-6">
													Создайте маршрут для получения прогноза погоды и
													рекомендаций по безопасности
												</p>
												<Button
													variant="outline"
													onClick={() => setActiveTab("planning")}
													className="hover-lift"
												>
													<Route className="h-4 w-4 mr-2" />
													Создать маршрут
												</Button>
											</CardContent>
										</Card>
									)}
								</motion.div>
							</TabsContent>
						</AnimatePresence>
					</Tabs>
				</motion.div>

				{/* Quick Stats */}
				{routeData && (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-3 gap-6"
						variants={itemVariants}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<Card className="claude-card hover-lift glass-effect">
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
										<Navigation className="h-5 w-5 text-blue-500" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Расстояние</p>
										<p className="text-2xl font-bold">
											{Math.round(routeData.distance || 0)} км
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="claude-card hover-lift glass-effect">
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
										<Route className="h-5 w-5 text-orange-500" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Время в пути
										</p>
										<p className="text-2xl font-bold">
											{Math.round((routeData.duration || 0) / 60)} ч
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="claude-card hover-lift glass-effect">
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
										<TrendingUp className="h-5 w-5 text-green-500" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Топливо</p>
										<p className="text-2xl font-bold">
											{Math.round((routeData.fuelConsumption || 0) * 10) / 10}{" "}
											л
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}
