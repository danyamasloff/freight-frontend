import {
	YMaps,
	Map,
	RouteButton,
	TrafficControl,
	RouteEditor,
	Placemark,
	Polyline,
} from "@pbe/react-yandex-maps";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	MapPin,
	Navigation,
	Settings,
	Layers,
	CloudRain,
	AlertTriangle,
	Thermometer,
	Wind,
	Eye,
	Droplets,
	RefreshCw,
	Loader2,
} from "lucide-react";
import { useWeatherAnalytics } from "@/features/weather/hooks/use-weather-analytics";
import { formatDistance, formatDuration } from "@/shared/utils/format";

interface RoutePoint {
	coordinates: [number, number];
	address?: string;
	type: "start" | "end" | "waypoint";
	weatherData?: any;
}

interface MapSettings {
	showTraffic: boolean;
	showWeather: boolean;
	mapType: "map" | "satellite" | "hybrid";
	showWeatherOverlay: boolean;
}

interface RouteMapProps {
	routes?: RoutePoint[][];
	onRouteChange?: (route: RoutePoint[]) => void;
	showWeatherAnalytics?: boolean;
	className?: string;
}

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

export function RouteMap({
	routes = [],
	onRouteChange,
	showWeatherAnalytics = true,
	className,
}: RouteMapProps) {
	const [mapState, setMapState] = useState({
		center: [55.751574, 37.573856] as [number, number],
		zoom: 9,
	});

	const [settings, setSettings] = useState<MapSettings>({
		showTraffic: true,
		showWeather: true,
		mapType: "map",
		showWeatherOverlay: false,
	});

	const [selectedRoute, setSelectedRoute] = useState<RoutePoint[] | null>(null);
	const [isEditingRoute, setIsEditingRoute] = useState(false);
	const mapRef = useRef<any>(null);
	const routeEditorRef = useRef<any>(null);

	// Получаем погодную аналитику для выбранного маршрута
	const {
		weatherData,
		riskAssessment,
		isLoading: isLoadingWeather,
		error: weatherError,
		refetch: refetchWeather,
	} = useWeatherAnalytics({
		startPoint: selectedRoute?.[0]?.coordinates,
		endPoint: selectedRoute?.[selectedRoute.length - 1]?.coordinates,
		waypoints: selectedRoute?.slice(1, -1).map((p) => p.coordinates),
		enabled: showWeatherAnalytics && !!selectedRoute && selectedRoute.length >= 2,
	});

	// Обработчик изменения настроек карты
	const handleSettingChange = useCallback((key: keyof MapSettings, value: boolean | string) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	}, []);

	// Обработчик изменения типа карты
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setType(`yandex#${settings.mapType}`);
		}
	}, [settings.mapType]);

	// Обработчик готовности карты
	const handleMapReady = useCallback((map: any) => {
		mapRef.current = map;
	}, []);

	// Обработчик клика по карте для добавления точек маршрута
	const handleMapClick = useCallback(
		(event: any) => {
			if (!isEditingRoute) return;

			const coords = event.get("coords") as [number, number];
			const newPoint: RoutePoint = {
				coordinates: coords,
				type: selectedRoute?.length === 0 ? "start" : "waypoint",
			};

			if (selectedRoute) {
				const updatedRoute = [...selectedRoute, newPoint];
				setSelectedRoute(updatedRoute);
				onRouteChange?.(updatedRoute);
			} else {
				setSelectedRoute([newPoint]);
				onRouteChange?.([newPoint]);
			}
		},
		[isEditingRoute, selectedRoute, onRouteChange]
	);

	// Обработчик завершения маршрута
	const handleFinishRoute = useCallback(() => {
		if (selectedRoute && selectedRoute.length >= 2) {
			const updatedRoute = selectedRoute.map((point, index) => ({
				...point,
				type:
					index === 0
						? ("start" as const)
						: index === selectedRoute.length - 1
							? ("end" as const)
							: ("waypoint" as const),
			}));
			setSelectedRoute(updatedRoute);
			onRouteChange?.(updatedRoute);
		}
		setIsEditingRoute(false);
	}, [selectedRoute, onRouteChange]);

	// Обработчик очистки маршрута
	const handleClearRoute = useCallback(() => {
		setSelectedRoute(null);
		onRouteChange?.([]);
	}, [onRouteChange]);

	// Получение цвета маркера в зависимости от типа точки
	const getMarkerPreset = (type: RoutePoint["type"]) => {
		switch (type) {
			case "start":
				return "islands#greenDotIcon";
			case "end":
				return "islands#redDotIcon";
			default:
				return "islands#blueDotIcon";
		}
	};

	// Получение цвета риска
	const getRiskColor = (risk: number) => {
		if (risk < 25) return "text-green-600";
		if (risk < 50) return "text-yellow-600";
		if (risk < 75) return "text-orange-600";
		return "text-red-600";
	};

	// Получение варианта бейджа риска
	const getRiskVariant = (risk: number): "default" | "secondary" | "destructive" => {
		if (risk < 25) return "default";
		if (risk < 75) return "secondary";
		return "destructive";
	};

	if (!YANDEX_API_KEY) {
		return (
			<Alert>
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>
					Не найден API ключ Yandex Maps. Проверьте переменную окружения
					VITE_YANDEX_MAPS_API_KEY.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Панель управления */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Navigation className="h-5 w-5" />
							Интерактивная карта маршрутов
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={isEditingRoute ? "destructive" : "outline"}
								size="sm"
								onClick={() => setIsEditingRoute(!isEditingRoute)}
							>
								{isEditingRoute ? "Отменить" : "Редактировать"}
							</Button>
							{selectedRoute && selectedRoute.length > 0 && (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={handleFinishRoute}
										disabled={!isEditingRoute || selectedRoute.length < 2}
									>
										Завершить
									</Button>
									<Button variant="outline" size="sm" onClick={handleClearRoute}>
										Очистить
									</Button>
								</>
							)}
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="map" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="map">Карта</TabsTrigger>
							<TabsTrigger value="settings">Настройки</TabsTrigger>
							<TabsTrigger value="weather" disabled={!showWeatherAnalytics}>
								Погода
							</TabsTrigger>
						</TabsList>

						<TabsContent value="map" className="space-y-4">
							<div className="h-96 rounded-lg overflow-hidden border">
								<YMaps
									query={{
										apikey: YANDEX_API_KEY,
										lang: "ru_RU",
										load: "package.full",
									}}
								>
									<Map
										state={mapState}
										onLoad={handleMapReady}
										onClick={handleMapClick}
										width="100%"
										height="100%"
										options={{
											suppressMapOpenBlock: true,
											yandexMapDisablePoiInteractivity: true,
										}}
									>
										{settings.showTraffic && (
											<TrafficControl options={{ float: "right" }} />
										)}

										{/* Отображение всех маршрутов */}
										{routes.map((route, routeIndex) => (
											<React.Fragment key={routeIndex}>
												{/* Маркеры точек */}
												{route.map((point, pointIndex) => (
													<Placemark
														key={`${routeIndex}-${pointIndex}`}
														geometry={point.coordinates}
														properties={{
															balloonContent: `${point.type}: ${point.address || "Координаты"}`,
														}}
														options={{
															preset: getMarkerPreset(point.type),
														}}
													/>
												))}

												{/* Линия маршрута */}
												{route.length > 1 && (
													<Polyline
														geometry={route.map((p) => p.coordinates)}
														options={{
															strokeColor:
																routeIndex === 0
																	? "#0066cc"
																	: "#cc6600",
															strokeWidth: 4,
															strokeOpacity: 0.8,
														}}
													/>
												)}
											</React.Fragment>
										))}

										{/* Текущий редактируемый маршрут */}
										{selectedRoute && (
											<React.Fragment>
												{selectedRoute.map((point, index) => (
													<Placemark
														key={`selected-${index}`}
														geometry={point.coordinates}
														properties={{
															balloonContent: `${point.type}: ${point.address || "Координаты"}`,
														}}
														options={{
															preset: getMarkerPreset(point.type),
														}}
													/>
												))}

												{selectedRoute.length > 1 && (
													<Polyline
														geometry={selectedRoute.map(
															(p) => p.coordinates
														)}
														options={{
															strokeColor: "#ff0000",
															strokeWidth: 4,
															strokeOpacity: 0.8,
															strokeStyle: "dash",
														}}
													/>
												)}
											</React.Fragment>
										)}
									</Map>
								</YMaps>
							</div>

							{isEditingRoute && (
								<Alert>
									<MapPin className="h-4 w-4" />
									<AlertDescription>
										Кликните по карте для добавления точек маршрута.
										{selectedRoute &&
											selectedRoute.length > 0 &&
											` Добавлено точек: ${selectedRoute.length}`}
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="settings" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label htmlFor="traffic">Показать пробки</Label>
										<Switch
											id="traffic"
											checked={settings.showTraffic}
											onCheckedChange={(checked) =>
												handleSettingChange("showTraffic", checked)
											}
										/>
									</div>

									<div className="flex items-center justify-between">
										<Label htmlFor="weather">Показать погоду</Label>
										<Switch
											id="weather"
											checked={settings.showWeather}
											onCheckedChange={(checked) =>
												handleSettingChange("showWeather", checked)
											}
										/>
									</div>

									<div className="flex items-center justify-between">
										<Label htmlFor="weather-overlay">Погодный слой</Label>
										<Switch
											id="weather-overlay"
											checked={settings.showWeatherOverlay}
											onCheckedChange={(checked) =>
												handleSettingChange("showWeatherOverlay", checked)
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<Label>Тип карты</Label>
										<div className="flex gap-2 mt-2">
											{[
												{ value: "map", label: "Схема" },
												{ value: "satellite", label: "Спутник" },
												{ value: "hybrid", label: "Гибрид" },
											].map(({ value, label }) => (
												<Button
													key={value}
													variant={
														settings.mapType === value
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														handleSettingChange("mapType", value)
													}
												>
													{label}
												</Button>
											))}
										</div>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="weather" className="space-y-4">
							{showWeatherAnalytics && selectedRoute && selectedRoute.length >= 2 ? (
								<div className="space-y-4">
									{isLoadingWeather ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="h-6 w-6 animate-spin mr-2" />
											<span>Загрузка погодных данных...</span>
										</div>
									) : weatherError ? (
										<Alert>
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												Ошибка загрузки погодных данных:{" "}
												{weatherError.message}
												<Button
													variant="outline"
													size="sm"
													className="ml-2"
													onClick={() => refetchWeather()}
												>
													<RefreshCw className="h-3 w-3 mr-1" />
													Повторить
												</Button>
											</AlertDescription>
										</Alert>
									) : weatherData ? (
										<div className="space-y-4">
											{/* Текущие погодные условия */}
											<Card>
												<CardHeader>
													<CardTitle className="flex items-center gap-2">
														<CloudRain className="h-4 w-4" />
														Текущие условия
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
														<div className="flex items-center gap-2">
															<Thermometer className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="text-sm text-muted-foreground">
																	Температура
																</p>
																<p className="font-medium">
																	{
																		weatherData.current
																			?.temperature
																	}
																	°C
																</p>
															</div>
														</div>

														<div className="flex items-center gap-2">
															<Droplets className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="text-sm text-muted-foreground">
																	Влажность
																</p>
																<p className="font-medium">
																	{weatherData.current?.humidity}%
																</p>
															</div>
														</div>

														<div className="flex items-center gap-2">
															<Wind className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="text-sm text-muted-foreground">
																	Ветер
																</p>
																<p className="font-medium">
																	{weatherData.current?.windSpeed}{" "}
																	м/с
																</p>
															</div>
														</div>

														<div className="flex items-center gap-2">
															<Eye className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="text-sm text-muted-foreground">
																	Видимость
																</p>
																<p className="font-medium">
																	{
																		weatherData.current
																			?.visibility
																	}{" "}
																	км
																</p>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>

											{/* Оценка рисков */}
											{riskAssessment && (
												<Card>
													<CardHeader>
														<CardTitle className="flex items-center gap-2">
															<AlertTriangle className="h-4 w-4" />
															Оценка рисков
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between">
															<span className="font-medium">
																Общий риск маршрута
															</span>
															<Badge
																variant={getRiskVariant(
																	riskAssessment.overallRisk
																)}
															>
																{riskAssessment.overallRisk.toFixed(
																	0
																)}
																%
															</Badge>
														</div>

														<div className="space-y-2">
															{riskAssessment.factors.map(
																(factor, index) => (
																	<div
																		key={index}
																		className="flex items-center justify-between text-sm"
																	>
																		<span className="text-muted-foreground">
																			{factor.name}
																		</span>
																		<span
																			className={getRiskColor(
																				factor.impact
																			)}
																		>
																			{factor.impact.toFixed(
																				0
																			)}
																			%
																		</span>
																	</div>
																)
															)}
														</div>

														{riskAssessment.recommendations.length >
															0 && (
															<div>
																<h5 className="font-medium mb-2">
																	Рекомендации
																</h5>
																<ul className="text-sm text-muted-foreground space-y-1">
																	{riskAssessment.recommendations.map(
																		(rec, index) => (
																			<li
																				key={index}
																				className="flex items-start gap-2"
																			>
																				<span className="text-green-600">
																					•
																				</span>
																				{rec}
																			</li>
																		)
																	)}
																</ul>
															</div>
														)}
													</CardContent>
												</Card>
											)}
										</div>
									) : (
										<Alert>
											<CloudRain className="h-4 w-4" />
											<AlertDescription>
												Нет данных о погоде для выбранного маршрута
											</AlertDescription>
										</Alert>
									)}
								</div>
							) : (
								<Alert>
									<MapPin className="h-4 w-4" />
									<AlertDescription>
										Выберите маршрут с начальной и конечной точкой для просмотра
										погодных данных
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
