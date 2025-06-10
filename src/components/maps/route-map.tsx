import React, { useEffect, useState, useRef } from "react";
import { Map, Placemark, Polyline, GeoObject, withYMaps } from "@pbe/react-yandex-maps";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { WeatherData, FuelPriceData, TollRoadData } from "@/lib/api/route-service";

interface RouteMapProps {
	center: [number, number];
	zoom?: number;
	startCoords?: [number, number] | null;
	endCoords?: [number, number] | null;
	startAddress?: string;
	endAddress?: string;
	routeCoordinates?: number[][];
	weatherData?: WeatherData[];
	fuelStations?: FuelPriceData[];
	tollRoads?: TollRoadData[];
	onMapClick?: (coords: [number, number]) => void;
	className?: string;
}

const RouteMapComponent: React.FC<RouteMapProps & { ymaps?: any }> = ({
	center,
	zoom = 10,
	startCoords,
	endCoords,
	startAddress,
	endAddress,
	routeCoordinates = [],
	weatherData = [],
	fuelStations = [],
	tollRoads = [],
	onMapClick,
	className,
	ymaps,
}) => {
	const mapRef = useRef<any>(null);
	const [routePolyline, setRoutePolyline] = useState<any>(null);

	// Создание линии маршрута
	useEffect(() => {
		if (ymaps && routeCoordinates.length > 0 && mapRef.current) {
			const polyline = new ymaps.Polyline(
				routeCoordinates,
				{
					hintContent: "Маршрут",
				},
				{
					strokeColor: "#2563eb",
					strokeWidth: 4,
					strokeOpacity: 0.8,
				}
			);

			setRoutePolyline(polyline);
			mapRef.current.geoObjects.add(polyline);

			// Центрируем карту по маршруту
			if (startCoords && endCoords) {
				const bounds = ymaps.util.bounds.fromPoints([startCoords, endCoords]);
				mapRef.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
			}

			return () => {
				if (mapRef.current && polyline) {
					mapRef.current.geoObjects.remove(polyline);
				}
			};
		}
	}, [ymaps, routeCoordinates, startCoords, endCoords]);

	const handleMapClick = (e: any) => {
		if (onMapClick) {
			const coords = e.get("coords") as [number, number];
			onMapClick(coords);
		}
	};

	const getWeatherIcon = (weatherDesc: string) => {
		if (weatherDesc.includes("дождь") || weatherDesc.includes("rain")) {
			return "🌧️";
		} else if (weatherDesc.includes("снег") || weatherDesc.includes("snow")) {
			return "❄️";
		} else if (weatherDesc.includes("облачно") || weatherDesc.includes("cloud")) {
			return "☁️";
		} else if (weatherDesc.includes("туман") || weatherDesc.includes("fog")) {
			return "🌫️";
		}
		return "☀️";
	};

	const getRiskColor = (riskLevel: string) => {
		switch (riskLevel) {
			case "HIGH":
				return "#ef4444";
			case "MEDIUM":
				return "#f59e0b";
			default:
				return "#10b981";
		}
	};

	return (
		<Map
			instanceRef={mapRef}
			defaultState={{ center, zoom }}
			width="100%"
			height="100%"
			className={className}
			onClick={handleMapClick}
		>
			{/* Стартовая точка */}
			{startCoords && (
				<Placemark
					geometry={startCoords}
					properties={{
						balloonContent: `
              <div style="padding: 8px;">
                <strong>Точка отправления</strong><br/>
                ${startAddress || "Координаты: " + startCoords.join(", ")}
              </div>
            `,
						iconCaption: "Старт",
					}}
					options={{
						preset: "islands#greenStretchyIcon",
						draggable: false,
					}}
				/>
			)}

			{/* Конечная точка */}
			{endCoords && (
				<Placemark
					geometry={endCoords}
					properties={{
						balloonContent: `
              <div style="padding: 8px;">
                <strong>Точка назначения</strong><br/>
                ${endAddress || "Координаты: " + endCoords.join(", ")}
              </div>
            `,
						iconCaption: "Финиш",
					}}
					options={{
						preset: "islands#redStretchyIcon",
						draggable: false,
					}}
				/>
			)}

			{/* Метки АЗС */}
			{fuelStations.slice(0, 5).map((station, index) => (
				<Placemark
					key={`fuel-${index}`}
					geometry={[
						// Используем примерные координаты вдоль маршрута
						center[0] + (Math.random() - 0.5) * 0.1,
						center[1] + (Math.random() - 0.5) * 0.1,
					]}
					properties={{
						balloonContent: `
              <div style="padding: 8px; min-width: 200px;">
                <strong>${station.stationName}</strong><br/>
                <div style="margin: 4px 0;">
                  <span style="color: #059669; font-weight: bold;">${station.pricePerLiter}₽/л</span>
                  <span style="margin-left: 8px; color: #6b7280;">${station.fuelType}</span>
                </div>
                <div style="color: #6b7280; font-size: 12px;">
                  ${station.distance}км от маршрута
                </div>
                <div style="color: #6b7280; font-size: 12px;">
                  ${station.address}
                </div>
              </div>
            `,
						iconCaption: `${station.pricePerLiter}₽`,
					}}
					options={{
						preset: "islands#blueCircleDotIcon",
						iconColor: "#059669",
					}}
				/>
			))}

			{/* Метки погодных условий */}
			{weatherData.slice(0, 3).map((weather, index) => (
				<Placemark
					key={`weather-${index}`}
					geometry={[
						// Распределяем метки вдоль маршрута
						center[0] + (index - 1) * 0.05,
						center[1] + (index - 1) * 0.05,
					]}
					properties={{
						balloonContent: `
              <div style="padding: 8px; min-width: 180px;">
                <strong>Погодные условия</strong><br/>
                <div style="margin: 4px 0;">
                  <span style="font-size: 18px;">${getWeatherIcon(weather.weatherDescription)}</span>
                  <span style="margin-left: 8px; font-weight: bold;">${weather.temperature}°C</span>
                </div>
                <div style="margin: 4px 0; color: #6b7280;">
                  Ветер: ${weather.windSpeed} м/с<br/>
                  Влажность: ${weather.humidity}%
                </div>
                <div style="margin: 4px 0;">
                  <span style="
                    background: ${getRiskColor(weather.riskLevel)};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                  ">
                    ${weather.riskLevel} РИСК
                  </span>
                </div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">
                  ${weather.weatherDescription}
                </div>
              </div>
            `,
						iconCaption: getWeatherIcon(weather.weatherDescription),
					}}
					options={{
						preset: "islands#violetCircleDotIcon",
						iconColor: getRiskColor(weather.riskLevel),
					}}
				/>
			))}

			{/* Метки платных дорог */}
			{tollRoads.slice(0, 3).map((toll, index) => (
				<Placemark
					key={`toll-${index}`}
					geometry={[
						// Размещаем метки платных дорог
						center[0] + (index - 1) * 0.08,
						center[1] + (index - 1) * 0.08,
					]}
					properties={{
						balloonContent: `
              <div style="padding: 8px; min-width: 200px;">
                <strong>Платная дорога</strong><br/>
                <div style="margin: 4px 0;">
                  <strong>${toll.name}</strong>
                </div>
                <div style="margin: 4px 0;">
                  <span style="color: #dc2626; font-weight: bold; font-size: 16px;">${toll.cost}₽</span>
                </div>
                <div style="color: #6b7280; font-size: 12px;">
                  Протяженность: ${toll.distance}км
                </div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">
                  ${toll.segment.start} → ${toll.segment.end}
                </div>
              </div>
            `,
						iconCaption: `${toll.cost}₽`,
					}}
					options={{
						preset: "islands#redStretchyIcon",
						iconColor: "#dc2626",
					}}
				/>
			))}
		</Map>
	);
};

// Обертка с поддержкой YMaps API
export const RouteMap = withYMaps(RouteMapComponent, true, [
	"util.bounds",
	"Polyline",
	"geoObject.addon.balloon",
	"geoObject.addon.hint",
]);
