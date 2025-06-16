// freight-frontend/src/features/routes/components/route-planner/route-map.tsx

import React, { useState } from "react";
import {
	Map,
	Placemark,
	Polyline,
	withYMaps,
	ZoomControl,
	TypeSelector,
	TrafficControl,
	GeolocationControl,
	RoutePanel,
} from "@pbe/react-yandex-maps";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Maximize2, Minimize2, Route } from "lucide-react";
import type { DetailedRouteResponse } from "../../types";

interface RouteMapProps {
	routeData: DetailedRouteResponse | null;
	currentLocation?: { lat: number; lon: number } | null;
	ymaps?: any;
}

const RouteMapComponent: React.FC<RouteMapProps> = ({ routeData, currentLocation, ymaps }) => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Определяем центр карты
	const getMapCenter = (): [number, number] => {
		if (routeData?.geometry && routeData.geometry.length > 0) {
			return routeData.geometry[0] as [number, number];
		}
		if (routeData?.startLat && routeData?.startLon) {
			return [routeData.startLat, routeData.startLon];
		}
		if (currentLocation) {
			return [currentLocation.lat, currentLocation.lon];
		}
		// Москва по умолчанию
		return [55.7558, 37.6176];
	};

	// Определяем границы карты для автоматического масштабирования
	const getMapBounds = (): [number, number][] | undefined => {
		if (!routeData) return undefined;

		const bounds: [number, number][] = [];

		if (routeData.geometry && routeData.geometry.length > 0) {
			routeData.geometry.forEach((coord) => {
				bounds.push(coord as [number, number]);
			});
		} else if (
			routeData.startLat &&
			routeData.startLon &&
			routeData.endLat &&
			routeData.endLon
		) {
			bounds.push([routeData.startLat, routeData.startLon]);
			bounds.push([routeData.endLat, routeData.endLon]);
		}

		return bounds.length > 0 ? bounds : undefined;
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
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

	return (
		<div
			className={`relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700 ${
				isFullscreen ? "fixed inset-0 z-50" : "h-[500px]"
			}`}
		>
			{/* Map Container */}
			<Map
				defaultState={{
					center: getMapCenter(),
					zoom: routeData ? 10 : 9,
				}}
				options={{
					suppressMapOpenBlock: true,
					copyrightLogoVisible: false,
					copyrightProvidersVisible: false,
					copyrightUaVisible: false,
				}}
				width="100%"
				height="100%"
				style={{
					minHeight: isFullscreen ? "100vh" : "500px",
				}}
			>
				{/* Встроенные контролы Yandex Maps */}
				<ZoomControl />
				<TypeSelector />
				<TrafficControl />
				<GeolocationControl />
				<RoutePanel />

				{/* Маршрут - линия */}
				{routeData?.geometry && routeData.geometry.length > 0 && (
					<Polyline
						geometry={routeData.geometry}
						options={{
							strokeColor: "#f97316",
							strokeWidth: 6,
							strokeOpacity: 0.9,
							strokeStyle: "solid",
						}}
						properties={{
							hintContent: "Маршрут",
							balloonContent: `
								<div style="color: #1e293b; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
									<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
										<strong style="color: #0f172a; font-size: 16px;">Информация о маршруте</strong>
									</div>
									<div style="display: grid; gap: 6px;">
										<div style="display: flex; justify-content: space-between;">
											<span style="color: #64748b;">Расстояние:</span>
											<strong style="color: #0f172a;">${routeData.distance} км</strong>
										</div>
										<div style="display: flex; justify-content: space-between;">
											<span style="color: #64748b;">Время:</span>
											<strong style="color: #0f172a;">${formatDuration(routeData.duration || 0)}</strong>
										</div>
										<div style="display: flex; justify-content: space-between;">
											<span style="color: #64748b;">Топливо:</span>
											<strong style="color: #0f172a;">${(routeData.fuelConsumption || 0).toFixed(1)} л</strong>
										</div>
										<div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
											<span style="color: #64748b;">Стоимость:</span>
											<strong style="color: #f97316; font-size: 16px;">${formatCurrency(routeData.totalCost || 0)}</strong>
										</div>
									</div>
								</div>
							`,
						}}
					/>
				)}

				{/* Начальная точка */}
				{routeData?.startLat && routeData?.startLon && (
					<Placemark
						geometry={[routeData.startLat, routeData.startLon]}
						options={{
							preset: "islands#greenDotIconWithCaption",
						}}
						properties={{
							iconCaption: "А",
							hintContent: "Начало маршрута",
							balloonContent: `
								<div style="color: #1e293b; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
									<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
										<strong style="color: #059669; font-size: 16px;">🚀 Точка отправления</strong>
									</div>
									<div style="color: #0f172a;">${routeData.startPoint || "Не указано"}</div>
								</div>
							`,
						}}
					/>
				)}

				{/* Конечная точка */}
				{routeData?.endLat && routeData?.endLon && (
					<Placemark
						geometry={[routeData.endLat, routeData.endLon]}
						options={{
							preset: "islands#redDotIconWithCaption",
						}}
						properties={{
							iconCaption: "Б",
							hintContent: "Конец маршрута",
							balloonContent: `
								<div style="color: #1e293b; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
									<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
										<strong style="color: #dc2626; font-size: 16px;">🏁 Точка назначения</strong>
									</div>
									<div style="color: #0f172a;">${routeData.endPoint || "Не указано"}</div>
								</div>
							`,
						}}
					/>
				)}

				{/* Промежуточные точки */}
				{routeData?.waypoints?.map((waypoint, index) => (
					<Placemark
						key={`waypoint-${index}`}
						geometry={[waypoint.lat, waypoint.lon]}
						options={{
							preset: "islands#blueDotIcon",
						}}
						properties={{
							hintContent: `Промежуточная точка ${index + 1}`,
							balloonContent: `
								<div style="color: #1e293b; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
									<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
										<strong style="color: #2563eb; font-size: 16px;">📍 Промежуточная точка ${index + 1}</strong>
									</div>
									<div style="margin-bottom: 6px;">
										<strong style="color: #0f172a;">${waypoint.address || `Координаты: ${waypoint.lat}, ${waypoint.lon}`}</strong>
									</div>
									${waypoint.stopType ? `<div style="color: #64748b;">Тип остановки: ${waypoint.stopType}</div>` : ""}
									${waypoint.duration ? `<div style="color: #64748b;">Время стоянки: ${waypoint.duration} мин</div>` : ""}
								</div>
							`,
						}}
					/>
				))}

				{/* Остановки для отдыха */}
				{routeData?.restStops?.map((restStop, index) => (
					<Placemark
						key={`rest-stop-${index}`}
						geometry={restStop.coordinates}
						options={{
							preset: "islands#violetIcon",
						}}
						properties={{
							hintContent: `Остановка для отдыха: ${restStop.location}`,
							balloonContent: `
								<div style="color: #1e293b; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
									<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
										<strong style="color: #7c3aed; font-size: 16px;">🛑 ${restStop.location}</strong>
									</div>
									<div style="margin-bottom: 8px;">
										<div style="color: #64748b;">Тип: ${restStop.facilityType}</div>
										<div style="color: #64748b;">Время от начала: ${formatDuration(restStop.timeFromStart)}</div>
										<div style="color: #64748b;">Причина: ${restStop.reason}</div>
									</div>
									${
										restStop.amenities && restStop.amenities.length > 0
											? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
												<div style="color: #64748b; margin-bottom: 4px;">Удобства:</div>
												<div style="color: #0f172a;">${restStop.amenities.join(", ")}</div>
											</div>`
											: ""
									}
								</div>
							`,
						}}
					/>
				))}

				{/* Текущее местоположение */}
				{currentLocation && (
					<Placemark
						geometry={[currentLocation.lat, currentLocation.lon]}
						options={{
							preset: "islands#blueSportCircleIcon",
						}}
						properties={{
							hintContent: "Ваше местоположение",
							balloonContent: `
								<div style="color: #1e293b; padding: 8px;">
									<strong>Ваше местоположение</strong><br>
									Координаты: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lon.toFixed(6)}
								</div>
							`,
						}}
					/>
				)}
			</Map>

			{/* Route Info & Actions */}
			<div className="absolute bottom-4 left-4 right-4">
				<Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								{routeData ? (
									<>
										<div className="flex items-center gap-2">
											<Route className="h-4 w-4 text-orange-400" />
											<span className="text-white font-medium">
												{routeData.distance} км
											</span>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-blue-400" />
											<span className="text-slate-300">
												{formatDuration(routeData.duration || 0)}
											</span>
										</div>
										{routeData.fuelConsumption && (
											<Badge
												variant="outline"
												className="border-orange-500/30 text-orange-300"
											>
												{routeData.fuelConsumption.toFixed(1)} л
											</Badge>
										)}
									</>
								) : (
									<div className="flex items-center gap-2 text-slate-400">
										<MapPin className="h-4 w-4" />
										<span>Рассчитайте маршрут для отображения на карте</span>
									</div>
								)}
							</div>

							<div className="flex items-center gap-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={toggleFullscreen}
									className="text-white hover:bg-slate-700"
									title={isFullscreen ? "Свернуть" : "На весь экран"}
								>
									{isFullscreen ? (
										<Minimize2 className="h-4 w-4" />
									) : (
										<Maximize2 className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

// Обертка с поддержкой YMaps API
export const RouteMap = withYMaps(RouteMapComponent, true, [
	"Map",
	"Placemark",
	"Polyline",
	"control.ZoomControl",
	"control.TypeSelector",
	"control.TrafficControl",
	"control.GeolocationControl",
	"control.RoutePanel",
	"geoObject.addon.balloon",
	"geoObject.addon.hint",
	"util.bounds",
]);
function cn(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}
