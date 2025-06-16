import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Map,
	Route as RouteIcon,
	ChevronRight,
	Navigation,
	Maximize2,
	Minimize2,
	CloudRain,
} from "lucide-react";

interface RouteInfo {
	distance: number;
	duration: number;
	fuelCost?: number;
	tollCost?: number;
	riskScore?: number;
}

export function RouteMapPage() {
	const [searchParams] = useSearchParams();
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [routeData, setRouteData] = useState<RouteInfo | null>(null);

	// Получаем параметры из URL
	const startAddress = searchParams.get("startAddress") || undefined;
	const endAddress = searchParams.get("endAddress") || undefined;
	const startLat = searchParams.get("startLat");
	const startLon = searchParams.get("startLon");
	const endLat = searchParams.get("endLat");
	const endLon = searchParams.get("endLon");
	const vehicleType = (searchParams.get("vehicleType") as "car" | "truck") || "truck";

	// Получаем предварительно рассчитанные данные маршрута
	const preCalculatedDistance = searchParams.get("distance");
	const preCalculatedDuration = searchParams.get("duration");
	const preCalculatedTotalCost = searchParams.get("totalCost");
	const preCalculatedRiskScore = searchParams.get("riskScore");

	const startCoords: [number, number] | undefined =
		startLat && startLon ? [parseFloat(startLon), parseFloat(startLat)] : undefined;
	const endCoords: [number, number] | undefined =
		endLat && endLon ? [parseFloat(endLon), parseFloat(endLat)] : undefined;

	// Устанавливаем предварительно рассчитанные данные при загрузке
	useEffect(() => {
		if (preCalculatedDistance && preCalculatedDuration) {
			const preCalculatedData: RouteInfo = {
				distance: parseFloat(preCalculatedDistance) * 1000, // конвертируем км в метры для совместимости
				duration: parseFloat(preCalculatedDuration) * 60, // конвертируем минуты в секунды
				...(preCalculatedTotalCost && {
					fuelCost: parseFloat(preCalculatedTotalCost),
				}),
				...(preCalculatedRiskScore && {
					riskScore: parseFloat(preCalculatedRiskScore),
				}),
			};
			setRouteData(preCalculatedData);
		}
	}, [
		preCalculatedDistance,
		preCalculatedDuration,
		preCalculatedTotalCost,
		preCalculatedRiskScore,
	]);

	const handleRouteCalculated = (data: RouteInfo) => {
		setRouteData(data);
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const formatDistance = (meters: number) => {
		if (meters < 1000) return `${Math.round(meters)} м`;
		return `${(meters / 1000).toFixed(1)} км`;
	};

	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) return `${hours}ч ${minutes}м`;
		return `${minutes}м`;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("ru-RU", {
			style: "currency",
			currency: "RUB",
		}).format(amount);
	};

	const getRiskColor = (risk: number) => {
		if (risk < 25) return "text-green-600";
		if (risk < 50) return "text-yellow-600";
		if (risk < 75) return "text-orange-600";
		return "text-red-600";
	};

	const getRiskVariant = (risk: number): "default" | "secondary" | "destructive" => {
		if (risk < 25) return "default";
		if (risk < 75) return "secondary";
		return "destructive";
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Хлебные крошки */}
			{!isFullscreen && (
				<div className="container py-4">
					<div className="flex items-center text-muted-foreground">
						<Button variant="link" asChild className="p-0 h-auto">
							<Link to="/routes" className="flex items-center gap-1">
								<ArrowLeft className="h-4 w-4" />
								Маршруты
							</Link>
						</Button>
						<ChevronRight className="h-4 w-4 mx-2" />
						<span className="text-foreground font-medium">Карта маршрутов</span>
					</div>
				</div>
			)}

			{/* Заголовок */}
			{!isFullscreen && (
				<div className="container mb-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
								<Map className="h-8 w-8" />
								Карта маршрутов с погодной аналитикой
							</h1>
							<p className="text-muted-foreground mt-1">
								Планирование маршрутов с учетом погодных условий
							</p>
						</div>
						<Button onClick={toggleFullscreen} variant="outline">
							<Maximize2 className="h-4 w-4 mr-2" />
							Полный экран
						</Button>
					</div>
				</div>
			)}

			<div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : "container"}`}>
				<div
					className={`grid gap-6 ${isFullscreen ? "h-full" : "grid-cols-1 lg:grid-cols-4"}`}
				>
					{/* Боковая панель */}
					{!isFullscreen && (
						<div className="lg:col-span-1 space-y-4">
							{/* Параметры маршрута */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Navigation className="h-5 w-5" />
										Параметры маршрута
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{startAddress && (
										<div>
											<div className="text-sm text-muted-foreground">
												Откуда
											</div>
											<div className="font-medium">{startAddress}</div>
										</div>
									)}

									{endAddress && (
										<div>
											<div className="text-sm text-muted-foreground">
												Куда
											</div>
											<div className="font-medium">{endAddress}</div>
										</div>
									)}

									<div>
										<div className="text-sm text-muted-foreground">
											Тип транспорта
										</div>
										<Badge variant="outline">
											{vehicleType === "truck"
												? "Грузовик"
												: "Легковой автомобиль"}
										</Badge>
									</div>

									{startCoords && endCoords && (
										<div>
											<div className="text-sm text-muted-foreground">
												Координаты
											</div>
											<div className="text-xs space-y-1">
												<div>
													Начало: {startCoords[1].toFixed(4)},{" "}
													{startCoords[0].toFixed(4)}
												</div>
												<div>
													Конец: {endCoords[1].toFixed(4)},{" "}
													{endCoords[0].toFixed(4)}
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Результат расчета */}
							{routeData && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<RouteIcon className="h-5 w-5" />
											Результат расчета
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-2 gap-3">
											<div className="text-center p-3 border rounded-lg">
												<div className="text-lg font-bold text-primary">
													{formatDistance(routeData.distance)}
												</div>
												<div className="text-xs text-muted-foreground">
													Расстояние
												</div>
											</div>
											<div className="text-center p-3 border rounded-lg">
												<div className="text-lg font-bold text-primary">
													{formatDuration(routeData.duration)}
												</div>
												<div className="text-xs text-muted-foreground">
													Время в пути
												</div>
											</div>
										</div>

										{routeData.fuelCost && (
											<div className="text-center p-3 border rounded-lg">
												<div className="text-lg font-bold text-primary">
													{formatCurrency(routeData.fuelCost)}
												</div>
												<div className="text-xs text-muted-foreground">
													Примерная стоимость топлива
												</div>
											</div>
										)}

										{routeData.riskScore !== undefined && (
											<div className="text-center p-3 border rounded-lg">
												<div className="flex items-center justify-center gap-2">
													<CloudRain className="h-4 w-4" />
													<Badge
														variant={getRiskVariant(
															routeData.riskScore
														)}
													>
														Риск: {routeData.riskScore.toFixed(0)}%
													</Badge>
												</div>
												<div className="text-xs text-muted-foreground mt-1">
													Погодный риск
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Инструкции */}
							<Card>
								<CardHeader>
									<CardTitle>Инструкция</CardTitle>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground space-y-2">
									<p>• Используйте панель маршрутов на карте</p>
									<p>• Введите адреса начала и конца</p>
									<p>• Нажмите "Построить маршрут"</p>
									<p>• Просматривайте погодную аналитику</p>
									<p>• Учитывайте риски при планировании</p>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Карта */}
					<div className={`${isFullscreen ? "h-full" : "lg:col-span-3"}`}>
						{isFullscreen && (
							<div className="absolute top-4 right-4 z-10">
								<Button onClick={toggleFullscreen} variant="outline" size="sm">
									<Minimize2 className="h-4 w-4" />
								</Button>
							</div>
						)}

						<Card className="h-full">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Map className="h-5 w-5 text-primary" />
									Карта маршрута
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div
									className={isFullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]"}
								>
									{/* Здесь будет интегрирована карта */}
									<div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
										<div className="text-center text-muted-foreground">
											<Map className="h-12 w-12 mx-auto mb-4" />
											<p>Карта в разработке</p>
											<p className="text-sm mt-2">
												{startAddress && endAddress
													? `Маршрут: ${startAddress} → ${endAddress}`
													: "Добавьте начальную и конечную точки"}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RouteMapPage;
