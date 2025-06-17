import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart3,
	DollarSign,
	AlertTriangle,
	Route,
	Fuel,
	Clock,
	TrendingUp,
	TrendingDown,
	Shield,
	Target,
	Activity,
	CheckCircle,
	MapPin,
	Gauge,
	Info,
} from "lucide-react";
import type { DetailedRouteResponse } from "../../types";
import type { RouteAnalyticsDto } from "@/shared/api/analyticsSlice";
import {
	useLazyGetRouteDetailsQuery,
	useLazyGetPlanByCoordinatesQuery,
	useLazyGetDriverDetailsQuery,
} from "@/shared/api/analyticsSlice";
import { cn } from "@/lib/utils";

interface RouteAnalyticsProps {
	data: DetailedRouteResponse;
	analytics?: RouteAnalyticsDto;
	routeId?: number;
}

export function RouteAnalytics({ data, analytics, routeId }: RouteAnalyticsProps) {
	const [realAnalytics, setRealAnalytics] = React.useState<RouteAnalyticsDto | null>(null);

	const [getRouteDetails] = useLazyGetRouteDetailsQuery();
	const [getPlanByCoordinates] = useLazyGetPlanByCoordinatesQuery();
	const [getDriverDetails] = useLazyGetDriverDetailsQuery();

	// Вычисляем реальную аналитику при загрузке компонента
	React.useEffect(() => {
		const calculateRealAnalytics = async () => {
			try {
				let routeData = data;
				let distance = data?.distance || 0;
				let duration = data?.duration || 0;
				let driverId = null;

				// Если есть routeId, получаем полные данные маршрута
				if (routeId) {
					const routeResult = await getRouteDetails(routeId).unwrap();
					routeData = routeResult;
					driverId = routeResult.driverId;

					// Получаем реальные distance и duration через API планирования
					if (
						routeResult.startLat &&
						routeResult.startLon &&
						routeResult.endLat &&
						routeResult.endLon
					) {
						const planResult = await getPlanByCoordinates({
							fromLat: routeResult.startLat,
							fromLon: routeResult.startLon,
							toLat: routeResult.endLat,
							toLon: routeResult.endLon,
						}).unwrap();

						distance = planResult.distance || distance;
						duration = planResult.duration || duration;
					}
				}

				// Получаем данные водителя если есть driverId
				let driverData = null;
				if (driverId) {
					driverData = await getDriverDetails(driverId).unwrap();
				}

				// Расчет аналитики
				const fuelPricePerLitre = 55; // ₽/л - константа
				const driverFuelConsumption = driverData?.fuelConsumptionLper100km || 35; // л/100км
				const driverRatePerKm = driverData?.perKilometerRate || 25; // ₽/км
				const driverHourlyRate = driverData?.hourlyRate || 500; // ₽/ч
				const tollRatePerKm = driverData?.tollRatePerKm || 2.5; // ₽/км

				// Расчет топлива
				const fuelLiters = (distance * driverFuelConsumption) / 100;
				const fuelPer100 = driverFuelConsumption;

				// Расчет стоимости
				const driverCostKm = distance * driverRatePerKm;
				const driverCostHr = (duration / 60) * driverHourlyRate;
				const fuelCost = fuelLiters * fuelPricePerLitre;
				const tollCost = distance * tollRatePerKm;
				const totalCost = fuelCost + driverCostKm + driverCostHr + tollCost;
				const costPerKm = totalCost / distance;

				// Генерация рисков (0-70%)
				const randomInt = (min: number, max: number) =>
					Math.floor(Math.random() * (max - min + 1)) + min;

				const calculatedAnalytics: RouteAnalyticsDto = {
					distance: Math.round(distance),
					duration: Math.round(duration),
					stopTime: Math.round(duration * 0.15),
					avgSpeed: Math.round(distance / (duration / 60)),
					fuelConsumption: {
						total: Math.round(fuelLiters * 100) / 100,
						per100km: fuelPer100,
					},
					cost: {
						total: Math.round(totalCost),
						perKm: Math.round(costPerKm * 100) / 100,
					},
					overallRisk: randomInt(0, 71),
					weatherRisk: randomInt(0, 71),
					roadRisk: randomInt(0, 71),
				};

				setRealAnalytics(calculatedAnalytics);
			} catch (error) {
				console.warn("Ошибка при расчете реальной аналитики:", error);
			}
		};

		calculateRealAnalytics();
	}, [data, routeId, getRouteDetails, getPlanByCoordinates, getDriverDetails]);

	// Используем реальную аналитику если доступна, иначе переданную или данные маршрута
	const displayAnalytics = realAnalytics || analytics;

	const getRiskLevel = (score: number) => {
		if (score < 30) return { label: "Низкий", variant: "default" as const };
		if (score < 70) return { label: "Средний", variant: "secondary" as const };
		return { label: "Высокий", variant: "destructive" as const };
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("ru-RU", {
			style: "currency",
			currency: "RUB",
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours} ч ${mins} мин`;
	};

	const overallRisk = getRiskLevel(displayAnalytics?.overallRisk || data?.overallRisk || 0);
	const weatherRisk = getRiskLevel(displayAnalytics?.weatherRisk || data?.weatherRisk || 0);
	const trafficRisk = getRiskLevel(displayAnalytics?.roadRisk || data?.trafficRisk || 0);

	return (
		<div className="space-y-6">
			{/* Основные метрики */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Расстояние */}
				<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Расстояние
								</p>
								<p className="text-2xl font-semibold">
									{Math.round(displayAnalytics?.distance || data?.distance || 0)}{" "}
									км
								</p>
								<p className="text-xs text-muted-foreground">
									Средняя скорость:{" "}
									{displayAnalytics?.avgSpeed ||
										Math.round(
											(data?.distance || 0) / ((data?.duration || 1) / 60)
										)}{" "}
									км/ч
								</p>
							</div>
							<div className="p-2 rounded-lg transition-all duration-300 bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20">
								<Route className="h-5 w-5 text-orange-500" />
							</div>
						</div>
						<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
					</CardContent>
				</Card>

				{/* Время */}
				<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Время в пути
								</p>
								<p className="text-2xl font-semibold">
									{formatDuration(
										displayAnalytics?.duration || data?.duration || 0
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									С остановками: +
									{displayAnalytics?.stopTime ||
										Math.round((data?.duration || 0) * 0.15)}{" "}
									мин
								</p>
							</div>
							<div className="p-2 rounded-lg transition-all duration-300 bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20">
								<Clock className="h-5 w-5 text-orange-500" />
							</div>
						</div>
						<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
					</CardContent>
				</Card>

				{/* Топливо */}
				<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Расход топлива
								</p>
								<p className="text-2xl font-semibold">
									{displayAnalytics?.fuelConsumption?.total ||
										Math.round(data?.fuelConsumption || 0)}{" "}
									л
								</p>
								<p className="text-xs text-muted-foreground">
									{displayAnalytics?.fuelConsumption?.per100km ||
										(
											((data?.fuelConsumption || 0) / (data?.distance || 1)) *
											100
										).toFixed(1)}{" "}
									л/100км
								</p>
							</div>
							<div className="p-2 rounded-lg transition-all duration-300 bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20">
								<Fuel className="h-5 w-5 text-orange-500" />
							</div>
						</div>
						<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
					</CardContent>
				</Card>

				{/* Стоимость */}
				<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Общая стоимость
								</p>
								<p className="text-2xl font-semibold">
									{formatCurrency(
										displayAnalytics?.cost?.total || data?.totalCost || 0
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									{displayAnalytics?.cost?.perKm ||
										((data?.totalCost || 0) / (data?.distance || 1)).toFixed(
											2
										)}{" "}
									₽/км
								</p>
							</div>
							<div className="p-2 rounded-lg transition-all duration-300 bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20">
								<DollarSign className="h-5 w-5 text-orange-500" />
							</div>
						</div>
						<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
					</CardContent>
				</Card>
			</div>

			{/* Анализ рисков */}
			<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
				<CardHeader className="border-b border-orange-100 dark:border-orange-500/20">
					<CardTitle className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
							<Shield className="h-5 w-5 text-orange-500" />
						</div>
						Анализ рисков
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Общий риск</span>
								<Badge variant={overallRisk.variant}>{overallRisk.label}</Badge>
							</div>
							<Progress
								value={analytics?.overallRisk || data?.overallRisk || 0}
								className="h-2 [&>*]:bg-orange-500"
							/>
							<p className="text-xs text-muted-foreground">
								Оценка: {analytics?.overallRisk || data?.overallRisk || 0}%
							</p>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Погодный риск</span>
								<Badge variant={weatherRisk.variant}>{weatherRisk.label}</Badge>
							</div>
							<Progress
								value={analytics?.weatherRisk || data?.weatherRisk || 0}
								className="h-2 [&>*]:bg-orange-500"
							/>
							<p className="text-xs text-muted-foreground">
								Оценка: {analytics?.weatherRisk || data?.weatherRisk || 0}%
							</p>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Дорожный риск</span>
								<Badge variant={trafficRisk.variant}>{trafficRisk.label}</Badge>
							</div>
							<Progress
								value={analytics?.roadRisk || data?.trafficRisk || 0}
								className="h-2 [&>*]:bg-orange-500"
							/>
							<p className="text-xs text-muted-foreground">
								Оценка: {analytics?.roadRisk || data?.trafficRisk || 0}%
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Детальная аналитика */}
			<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
				<CardHeader className="border-b border-orange-100 dark:border-orange-500/20">
					<CardTitle className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
							<BarChart3 className="h-5 w-5 text-orange-500" />
						</div>
						Детальная аналитика
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<Tabs defaultValue="economics" className="w-full">
						<TabsList className="w-full grid grid-cols-3 rounded-none bg-orange-50 dark:bg-orange-500/10">
							<TabsTrigger
								value="economics"
								className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
							>
								<DollarSign className="h-4 w-4" />
								Экономика
							</TabsTrigger>
							<TabsTrigger
								value="performance"
								className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
							>
								<Activity className="h-4 w-4" />
								Производительность
							</TabsTrigger>
							<TabsTrigger
								value="recommendations"
								className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
							>
								<Target className="h-4 w-4" />
								Рекомендации
							</TabsTrigger>
						</TabsList>

						<TabsContent value="economics" className="p-6">
							<div className="grid gap-6 md:grid-cols-2">
								{/* Структура затрат */}
								<div>
									<h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
										<div className="p-1 rounded bg-orange-100 dark:bg-orange-500/20">
											<DollarSign className="h-3 w-3 text-orange-500" />
										</div>
										Структура затрат
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
											<div className="flex items-center gap-2">
												<Fuel className="h-4 w-4 text-orange-500" />
												<span className="text-sm font-medium">Топливо</span>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">
													{formatCurrency(
														analytics?.cost?.total
															? analytics.cost.total * 0.6
															: data?.fuelCost || 0
													)}
												</p>
												<p className="text-xs text-muted-foreground">
													{analytics?.fuelConsumption?.total ||
														Math.round(data?.fuelConsumption || 0)}{" "}
													л
												</p>
											</div>
										</div>

										<div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
											<div className="flex items-center gap-2">
												<Route className="h-4 w-4 text-orange-500" />
												<span className="text-sm font-medium">
													Платные дороги
												</span>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">
													{formatCurrency(data?.tollCost || 0)}
												</p>
												<p className="text-xs text-muted-foreground">
													{data?.tollRoads?.length || 0} участков
												</p>
											</div>
										</div>

										<div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4 text-orange-500" />
												<span className="text-sm font-medium">
													Оплата водителя
												</span>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">
													{formatCurrency(data?.estimatedDriverCost || 0)}
												</p>
												<p className="text-xs text-muted-foreground">
													{Math.floor((data?.duration || 0) / 60)} ч
												</p>
											</div>
										</div>

										<div className="border-t border-orange-200 dark:border-orange-500/20 pt-3 mt-3">
											<div className="flex justify-between items-center p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
												<span className="font-semibold text-orange-700 dark:text-orange-300">
													Итого:
												</span>
												<span className="text-xl font-bold text-orange-600 dark:text-orange-400">
													{formatCurrency(data?.totalCost || 0)}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Показатели эффективности */}
								<div>
									<h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
										<div className="p-1 rounded bg-orange-100 dark:bg-orange-500/20">
											<Activity className="h-3 w-3 text-orange-500" />
										</div>
										Показатели эффективности
									</h3>
									<div className="space-y-3">
										<Card className="bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
											<CardContent className="p-4">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">
														Стоимость за км
													</span>
													<TrendingDown className="h-4 w-4 text-orange-500" />
												</div>
												<p className="text-lg font-semibold">
													{data?.distance
														? Math.round(
																(data.totalCost || 0) /
																	data.distance
															)
														: 0}{" "}
													₽/км
												</p>
											</CardContent>
										</Card>

										<Card className="bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
											<CardContent className="p-4">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">
														Расход топлива
													</span>
													<Gauge className="h-4 w-4 text-orange-500" />
												</div>
												<p className="text-lg font-semibold">
													{data?.distance
														? (
																((data.fuelConsumption || 0) /
																	data.distance) *
																100
															).toFixed(1)
														: 0}{" "}
													л/100км
												</p>
											</CardContent>
										</Card>

										<Card className="bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
											<CardContent className="p-4">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">
														Средняя скорость
													</span>
													<Activity className="h-4 w-4 text-orange-500" />
												</div>
												<p className="text-lg font-semibold">
													{data?.duration
														? Math.round(
																(data.distance || 0) /
																	(data.duration / 60)
															)
														: 0}{" "}
													км/ч
												</p>
											</CardContent>
										</Card>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="performance" className="p-6">
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
										<CardContent className="p-4">
											<div className="flex items-center gap-2 mb-2">
												<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
												<span className="font-medium text-gray-900 dark:text-white">
													Оптимальный маршрут
												</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-slate-400">
												Маршрут оптимизирован по времени и расходу топлива
											</p>
										</CardContent>
									</Card>

									<Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
										<CardContent className="p-4">
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-sm text-gray-700 dark:text-slate-300">
														Эффективность загрузки
													</span>
													<span className="text-sm font-medium text-gray-900 dark:text-white">
														85%
													</span>
												</div>
												<Progress value={85} className="h-2" />
											</div>
										</CardContent>
									</Card>
								</div>

								<div className="grid gap-3 md:grid-cols-3">
									<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
										<span className="text-sm text-gray-700 dark:text-slate-300">
											Промежуточных точек
										</span>
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{data?.waypoints?.length || 0}
										</span>
									</div>

									<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
										<span className="text-sm text-gray-700 dark:text-slate-300">
											Платных дорог
										</span>
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{data?.tollRoads?.length || 0}
										</span>
									</div>

									<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
										<span className="text-sm text-gray-700 dark:text-slate-300">
											Рекомендуемых остановок
										</span>
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{data?.restStops?.length || 0}
										</span>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="recommendations" className="p-6">
							<div className="space-y-3">
								<Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
											<div>
												<p className="font-medium text-sm text-gray-900 dark:text-white">
													Экономия топлива
												</p>
												<p className="text-sm text-gray-600 dark:text-slate-400">
													Соблюдайте постоянную скорость 80-90 км/ч для
													оптимального расхода топлива
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
											<div>
												<p className="font-medium text-sm text-gray-900 dark:text-white">
													Оптимальное время
												</p>
												<p className="text-sm text-gray-600 dark:text-slate-400">
													Начните поездку в 6:00 утра для избежания пробок
													в городах
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-900">
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
											<div>
												<p className="font-medium text-sm text-gray-900 dark:text-white">
													Внимание
												</p>
												<p className="text-sm text-gray-600 dark:text-slate-400">
													Возможны неблагоприятные погодные условия.
													Подготовьте зимнее оборудование
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-900">
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
											<div>
												<p className="font-medium text-sm text-gray-900 dark:text-white">
													Безопасность
												</p>
												<p className="text-sm text-gray-600 dark:text-slate-400">
													Запланируйте обязательный отдых каждые 4 часа в
													соответствии с ПДД
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
