import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Cloud,
	DollarSign,
	AlertTriangle,
	Route,
	Fuel,
	Clock,
	TrendingUp,
	Wind,
	Thermometer,
	MapPin,
	Droplets,
	Eye,
} from "lucide-react";

interface RouteAnalyticsProps {
	data: any;
}

export function RouteAnalytics({ data }: RouteAnalyticsProps) {
	const getRiskLevel = (score: number) => {
		if (score < 30)
			return { label: "Низкий", color: "bg-green-500", textColor: "text-green-700" };
		if (score < 70)
			return { label: "Средний", color: "bg-yellow-500", textColor: "text-yellow-700" };
		return { label: "Высокий", color: "bg-red-500", textColor: "text-red-700" };
	};

	const risk = getRiskLevel(data?.overallRiskScore || 50);

	return (
		<Card className="claude-card">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5 text-primary" />
					Аналитика маршрута
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview">Обзор</TabsTrigger>
						<TabsTrigger value="weather">Погода</TabsTrigger>
						<TabsTrigger value="economics">Экономика</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<Route className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm font-medium">Расстояние</span>
								</div>
								<div className="text-2xl font-bold">{data?.distance || 0} км</div>
							</div>
							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm font-medium">Время в пути</span>
								</div>
								<div className="text-2xl font-bold">
									{Math.floor((data?.duration || 0) / 60)} ч{" "}
									{(data?.duration || 0) % 60} мин
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Общий риск маршрута</span>
								<Badge variant="outline" className={risk.textColor}>
									{risk.label}
								</Badge>
							</div>
							<Progress
								value={data?.overallRiskScore || 0}
								className="h-3"
								style={
									{
										"--progress-foreground": risk.color,
									} as React.CSSProperties
								}
							/>
							<div className="text-xs text-muted-foreground">
								Оценка: {data?.overallRiskScore || 0}/100
							</div>
						</div>

						{/* Краткие предупреждения */}
						{data?.alerts && data.alerts.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-semibold text-sm">Предупреждения</h4>
								{data.alerts.slice(0, 3).map((alert: any, index: number) => (
									<div
										key={index}
										className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
									>
										<AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
										<span className="text-sm text-yellow-800">
											{alert.message}
										</span>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="weather" className="space-y-4">
						{data?.weatherForecast?.map((forecast: any, index: number) => (
							<Card key={index} className="p-4">
								<div className="flex justify-between items-start mb-3">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<MapPin className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">{forecast.location}</span>
										</div>
										<div className="text-sm text-muted-foreground">
											{new Date(forecast.time).toLocaleString("ru-RU")}
										</div>
									</div>
									<Badge variant="outline" className="flex items-center gap-1">
										<Thermometer className="h-3 w-3" />
										{forecast.temperature}°C
									</Badge>
								</div>

								<div className="grid grid-cols-3 gap-4 text-sm">
									<div className="flex items-center gap-1">
										<Wind className="h-4 w-4 text-muted-foreground" />
										<span>{forecast.windSpeed} м/с</span>
									</div>
									<div className="flex items-center gap-1">
										<Droplets className="h-4 w-4 text-muted-foreground" />
										<span>{forecast.humidity}%</span>
									</div>
									<div className="flex items-center gap-1">
										<Eye className="h-4 w-4 text-muted-foreground" />
										<span>{forecast.visibility} км</span>
									</div>
								</div>

								<div className="mt-3 flex items-center gap-1">
									<Cloud className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{forecast.description}</span>
								</div>

								{forecast.risks && forecast.risks.length > 0 && (
									<div className="mt-3 space-y-1">
										<div className="text-sm font-medium text-orange-700">
											Риски:
										</div>
										{forecast.risks.map((risk: string, riskIndex: number) => (
											<div
												key={riskIndex}
												className="text-sm text-orange-600"
											>
												• {risk}
											</div>
										))}
									</div>
								)}
							</Card>
						))}

						{(!data?.weatherForecast || data.weatherForecast.length === 0) && (
							<div className="text-center py-8 text-muted-foreground">
								<Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p>Данные о погоде будут доступны после расчета маршрута</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="economics" className="space-y-4">
						<div className="space-y-3">
							<div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2">
									<Fuel className="w-4 h-4 text-muted-foreground" />
									<span>Топливо</span>
								</div>
								<span className="font-semibold">
									{data?.estimatedFuelCost || 0} ₽
								</span>
							</div>

							<div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2">
									<Route className="w-4 h-4 text-muted-foreground" />
									<span>Платные дороги</span>
								</div>
								<span className="font-semibold">
									{data?.estimatedTollCost || 0} ₽
								</span>
							</div>

							<div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-muted-foreground" />
									<span>Оплата водителя</span>
								</div>
								<span className="font-semibold">
									{data?.estimatedDriverCost || 0} ₽
								</span>
							</div>

							<div className="pt-3 border-t border-border">
								<div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
									<span className="font-semibold text-lg">Итого</span>
									<span className="font-bold text-xl text-primary">
										{(data?.estimatedTotalCost || 0).toLocaleString()} ₽
									</span>
								</div>
							</div>
						</div>

						{/* Детализация расходов */}
						{data?.costBreakdown && (
							<div className="space-y-3">
								<h4 className="font-semibold">Детализация расходов</h4>
								{Object.entries(data.costBreakdown).map(
									([key, value]: [string, any]) => (
										<div key={key} className="flex justify-between text-sm">
											<span className="text-muted-foreground capitalize">
												{key.replace(/([A-Z])/g, " $1").toLowerCase()}
											</span>
											<span>{value} ₽</span>
										</div>
									)
								)}
							</div>
						)}

						{/* Рекомендации по экономии */}
						{data?.savingRecommendations && data.savingRecommendations.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-semibold text-green-700">
									Рекомендации по экономии
								</h4>
								{data.savingRecommendations.map((rec: string, index: number) => (
									<div
										key={index}
										className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200"
									>
										<DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
										<span className="text-sm text-green-800">{rec}</span>
									</div>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
