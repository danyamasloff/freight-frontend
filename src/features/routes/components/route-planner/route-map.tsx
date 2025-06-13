import React, { useRef, useEffect } from "react";
import {
	YMaps,
	Map,
	RoutePanel,
	TrafficControl,
	GeolocationControl,
	ZoomControl,
	Placemark,
	Polyline,
} from "@pbe/react-yandex-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Layers, Maximize2 } from "lucide-react";

interface RouteMapProps {
	routeData?: any;
	currentLocation?: { lat: number; lon: number } | null;
}

export function RouteMap({ routeData, currentLocation }: RouteMapProps) {
	const mapRef = useRef<any>(null);

	const getMapCenter = () => {
		if (routeData && routeData.startPoint && routeData.endPoint) {
			// Центрируем карту между начальной и конечной точками
			const centerLat = (routeData.startPoint.lat + routeData.endPoint.lat) / 2;
			const centerLon = (routeData.startPoint.lon + routeData.endPoint.lon) / 2;
			return [centerLat, centerLon];
		} else if (currentLocation) {
			return [currentLocation.lat, currentLocation.lon];
		}
		// Дефолт - Москва
		return [55.751244, 37.618423];
	};

	const getMapZoom = () => {
		if (routeData && routeData.startPoint && routeData.endPoint) {
			// Автоматически подбираем зум в зависимости от расстояния
			const distance = calculateDistance(
				routeData.startPoint.lat,
				routeData.startPoint.lon,
				routeData.endPoint.lat,
				routeData.endPoint.lon
			);
			if (distance < 10) return 12;
			if (distance < 50) return 10;
			if (distance < 200) return 8;
			return 6;
		}
		return 10;
	};

	const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
		const R = 6371;
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
				Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const deg2rad = (deg: number): number => {
		return deg * (Math.PI / 180);
	};

	const handleFullScreen = () => {
		const mapElement = mapRef.current?.container?.getElement();
		if (mapElement) {
			if (mapElement.requestFullscreen) {
				mapElement.requestFullscreen();
			}
		}
	};

	return (
		<div className="space-y-4">
			{/* Заголовок карты с элементами управления */}
			<div className="flex items-center justify-between p-4 border-b">
				<div className="flex items-center gap-2">
					<MapPin className="h-5 w-5 text-blue-500" />
					<h3 className="font-semibold">Интерактивная карта</h3>
					{routeData && (
						<Badge variant="outline" className="ml-2">
							{Math.round(routeData.distance || 0)} км
						</Badge>
					)}
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleFullScreen}
						className="flex items-center gap-1"
					>
						<Maximize2 className="h-4 w-4" />
						Полный экран
					</Button>
				</div>
			</div>

			{/* Карта */}
			<div className="relative">
				<YMaps
					query={{
						apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY,
						lang: "ru_RU",
					}}
				>
					<Map
						ref={mapRef}
						defaultState={{
							center: getMapCenter(),
							zoom: getMapZoom(),
						}}
						state={{
							center: getMapCenter(),
							zoom: getMapZoom(),
						}}
						width="100%"
						height="500px"
						className="rounded-lg overflow-hidden shadow-lg"
						options={{
							suppressMapOpenBlock: true,
						}}
						modules={[
							"control.ZoomControl",
							"control.FullscreenControl",
							"control.TrafficControl",
						]}
					>
						{/* Элементы управления */}
						<ZoomControl />
						<TrafficControl />
						<GeolocationControl />

						{/* Текущее местоположение пользователя */}
						{currentLocation && (
							<Placemark
								geometry={[currentLocation.lat, currentLocation.lon]}
								properties={{
									balloonContent: "<strong>Ваше местоположение</strong>",
									hintContent: "Текущее местоположение",
								}}
								options={{
									preset: "islands#blueCircleDotIconWithCaption",
								}}
							/>
						)}

						{/* Маршрут - начальная точка */}
						{routeData && routeData.startPoint && (
							<Placemark
								geometry={[routeData.startPoint.lat, routeData.startPoint.lon]}
								properties={{
									balloonContent: `<div class="p-2">
										<strong class="text-green-600">🚀 Начало маршрута</strong><br/>
										<span class="text-sm">${routeData.startAddress || "Точка отправления"}</span>
									</div>`,
									hintContent: "Начало маршрута",
								}}
								options={{
									preset: "islands#greenDotIconWithCaption",
								}}
							/>
						)}

						{/* Маршрут - конечная точка */}
						{routeData && routeData.endPoint && (
							<Placemark
								geometry={[routeData.endPoint.lat, routeData.endPoint.lon]}
								properties={{
									balloonContent: `<div class="p-2">
										<strong class="text-red-600">🏁 Конец маршрута</strong><br/>
										<span class="text-sm">${routeData.endAddress || "Точка назначения"}</span>
									</div>`,
									hintContent: "Конец маршрута",
								}}
								options={{
									preset: "islands#redDotIconWithCaption",
								}}
							/>
						)}

						{/* Линия маршрута */}
						{routeData && routeData.geometry && (
							<Polyline
								geometry={routeData.geometry}
								properties={{
									balloonContent: `<div class="p-2">
										<strong>📍 Маршрут</strong><br/>
										<span class="text-sm">Расстояние: ${Math.round(routeData.distance || 0)} км</span><br/>
										<span class="text-sm">Время: ${Math.floor((routeData.duration || 0) / 60)} ч ${(routeData.duration || 0) % 60} мин</span>
									</div>`,
								}}
								options={{
									strokeColor: "#FF8C00", // Оранжевый цвет в стиле Claude
									strokeWidth: 5,
									strokeOpacity: 0.8,
									strokeStyle: "solid",
								}}
							/>
						)}

						{/* Опасные участки на маршруте */}
						{routeData &&
							routeData.hazardPoints &&
							routeData.hazardPoints.map((hazard: any, index: number) => (
								<Placemark
									key={`hazard-${index}`}
									geometry={[hazard.lat, hazard.lon]}
									properties={{
										balloonContent: `<div class="p-2">
										<strong class="text-amber-600">⚠️ Внимание</strong><br/>
										<span class="text-sm">${hazard.description || "Опасный участок"}</span>
									</div>`,
										hintContent: "Опасный участок",
									}}
									options={{
										preset: "islands#yellowCircleIcon",
									}}
								/>
							))}

						{/* Остановки и заправки */}
						{routeData &&
							routeData.restStops &&
							routeData.restStops.map((stop: any, index: number) => (
								<Placemark
									key={`stop-${index}`}
									geometry={[stop.coordinates[1], stop.coordinates[0]]}
									properties={{
										balloonContent: `<div class="p-2">
										<strong class="text-blue-600">⛽ ${stop.location}</strong><br/>
										<span class="text-sm">${stop.reason}</span><br/>
										<span class="text-xs text-gray-500">Рейтинг: ⭐ ${stop.rating || "Н/Д"}</span>
									</div>`,
										hintContent: stop.location,
									}}
									options={{
										preset: "islands#blueGasIcon",
									}}
								/>
							))}
					</Map>
				</YMaps>

				{/* Информационная панель поверх карты */}
				{routeData && (
					<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<Navigation className="h-4 w-4 text-blue-500" />
								<span className="font-semibold">Информация о маршруте</span>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<span className="text-muted-foreground">Расстояние:</span>
									<div className="font-semibold text-orange-600">
										{Math.round(routeData.distance || 0)} км
									</div>
								</div>
								<div>
									<span className="text-muted-foreground">Время:</span>
									<div className="font-semibold text-blue-600">
										{Math.floor((routeData.duration || 0) / 60)} ч{" "}
										{(routeData.duration || 0) % 60} мин
									</div>
								</div>
							</div>
							{routeData.estimatedFuelCost && (
								<div>
									<span className="text-muted-foreground">Топливо:</span>
									<div className="font-semibold text-green-600">
										{routeData.estimatedFuelCost} ₽
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Индикатор загрузки */}
				{!routeData && (
					<div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
						<div className="text-center space-y-2">
							<MapPin className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
							<p className="text-muted-foreground">
								Выберите маршрут для отображения на карте
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Легенда */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-full bg-green-500"></div>
					<span>Начало</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-full bg-red-500"></div>
					<span>Конец</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-full bg-blue-500"></div>
					<span>Ваше местоположение</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-full bg-orange-500"></div>
					<span>Маршрут</span>
				</div>
			</div>
		</div>
	);
}
