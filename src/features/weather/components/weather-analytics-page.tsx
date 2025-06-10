import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { RouteWeatherAnalytics } from "@/features/weather";
import { useGetRouteQuery } from "@/shared/api/routesSlice";
import type { RouteResponse } from "@/shared/types/api";

export function WeatherAnalyticsPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const routeId = searchParams.get("routeId");
	const departureTime = searchParams.get("departureTime") || new Date().toISOString();

	const {
		data: route,
		isLoading,
		error,
	} = useGetRouteQuery(routeId ? parseInt(routeId) : 0, { skip: !routeId });

	const handleBack = () => {
		navigate(-1);
	};

	if (!routeId) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center space-x-3 mb-6">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Назад
					</Button>
					<h1 className="text-2xl font-bold">Погодная аналитика</h1>
				</div>

				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						Не указан ID маршрута. Пожалуйста, выберите маршрут для анализа погодных
						условий.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center space-x-3 mb-6">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Назад
					</Button>
					<h1 className="text-2xl font-bold">Погодная аналитика</h1>
				</div>

				<Card>
					<CardContent className="p-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<p className="text-muted-foreground">Загрузка данных маршрута...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !route) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center space-x-3 mb-6">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Назад
					</Button>
					<h1 className="text-2xl font-bold">Погодная аналитика</h1>
				</div>

				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						Ошибка при загрузке данных маршрута. Пожалуйста, попробуйте позже.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<RouteWeatherAnalytics
				route={route}
				departureTime={departureTime}
				onBack={handleBack}
			/>
		</div>
	);
}
