import React from "react";
import { CheckCircle2, Calculator, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RouteResponseDto } from "@/shared/types/backend-sync";

interface RouteCalculationResultProps {
	calculatedRoute: RouteResponseDto | null;
}

export function RouteCalculationResult({ calculatedRoute }: RouteCalculationResultProps) {
	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}ч ${mins}мин`;
	};

	if (!calculatedRoute) {
		return (
			<Card className="border-gray-200">
				<CardContent className="pt-6">
					<div className="text-center text-gray-500">
						<Calculator className="h-12 w-12 mx-auto mb-3 text-gray-400" />
						<p className="text-sm">
							Заполните форму и нажмите "Рассчитать" для получения информации о
							маршруте
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-orange-200 bg-orange-50">
			<CardHeader className="pb-4">
				<CardTitle className="text-lg font-medium text-orange-900 flex items-center gap-2">
					<CheckCircle2 className="h-5 w-5 text-orange-600" />
					Результаты расчета
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Основные показатели */}
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-white rounded-lg border border-orange-200">
						<div className="text-2xl font-bold text-orange-600">
							{Math.round(calculatedRoute.distance)}
						</div>
						<div className="text-sm text-gray-600">км</div>
					</div>
					<div className="text-center p-3 bg-white rounded-lg border border-orange-200">
						<div className="text-2xl font-bold text-orange-600">
							{formatDuration(calculatedRoute.duration)}
						</div>
						<div className="text-sm text-gray-600">время</div>
					</div>
				</div>

				{/* Экономические показатели */}
				{(calculatedRoute.estimatedTotalCost || calculatedRoute.estimatedFuelCost) && (
					<div className="space-y-2">
						<h4 className="font-medium text-gray-900">Экономика</h4>
						<div className="space-y-1 text-sm">
							{calculatedRoute.estimatedFuelCost && (
								<div className="flex justify-between">
									<span className="text-gray-600">Топливо</span>
									<span className="font-medium">
										{Math.round(calculatedRoute.estimatedFuelCost)} ₽
									</span>
								</div>
							)}
							{calculatedRoute.estimatedTollCost && (
								<div className="flex justify-between">
									<span className="text-gray-600">Платные дороги</span>
									<span className="font-medium">
										{Math.round(calculatedRoute.estimatedTollCost)} ₽
									</span>
								</div>
							)}
							{calculatedRoute.estimatedDriverCost && (
								<div className="flex justify-between">
									<span className="text-gray-600">Водитель</span>
									<span className="font-medium">
										{Math.round(calculatedRoute.estimatedDriverCost)} ₽
									</span>
								</div>
							)}
							{calculatedRoute.estimatedTotalCost && (
								<div className="flex justify-between border-t border-orange-200 pt-2">
									<span className="font-medium text-gray-900">
										Общая стоимость
									</span>
									<span className="font-bold text-orange-600">
										{Math.round(calculatedRoute.estimatedTotalCost)} ₽
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Анализ рисков */}
				{calculatedRoute.overallRiskScore && (
					<div className="space-y-2">
						<h4 className="font-medium text-gray-900">Анализ рисков</h4>
						<div className="flex items-center gap-2">
							<div className="flex-1 bg-gray-200 rounded-full h-2">
								<div
									className={`h-2 rounded-full ${
										calculatedRoute.overallRiskScore > 0.7
											? "bg-red-500"
											: calculatedRoute.overallRiskScore > 0.4
												? "bg-yellow-500"
												: "bg-green-500"
									}`}
									style={{ width: `${calculatedRoute.overallRiskScore * 100}%` }}
								/>
							</div>
							<Badge
								variant={
									calculatedRoute.overallRiskScore > 0.7
										? "destructive"
										: calculatedRoute.overallRiskScore > 0.4
											? "default"
											: "secondary"
								}
							>
								{calculatedRoute.overallRiskScore > 0.7
									? "Высокий"
									: calculatedRoute.overallRiskScore > 0.4
										? "Средний"
										: "Низкий"}
							</Badge>
						</div>

						{/* Детальные риски */}
						{(calculatedRoute.weatherRiskScore ||
							calculatedRoute.roadQualityRiskScore ||
							calculatedRoute.trafficRiskScore) && (
							<div className="grid grid-cols-3 gap-2 text-xs">
								{calculatedRoute.weatherRiskScore && (
									<div className="text-center p-2 bg-white rounded border border-orange-200">
										<div className="font-medium">Погода</div>
										<div className="text-gray-600">
											{Math.round(calculatedRoute.weatherRiskScore * 100)}%
										</div>
									</div>
								)}
								{calculatedRoute.roadQualityRiskScore && (
									<div className="text-center p-2 bg-white rounded border border-orange-200">
										<div className="font-medium">Дороги</div>
										<div className="text-gray-600">
											{Math.round(calculatedRoute.roadQualityRiskScore * 100)}
											%
										</div>
									</div>
								)}
								{calculatedRoute.trafficRiskScore && (
									<div className="text-center p-2 bg-white rounded border border-orange-200">
										<div className="font-medium">Трафик</div>
										<div className="text-gray-600">
											{Math.round(calculatedRoute.trafficRiskScore * 100)}%
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Предупреждения РТО */}
				{calculatedRoute.rtoWarnings && calculatedRoute.rtoWarnings.length > 0 && (
					<Alert className="border-yellow-200 bg-yellow-50">
						<AlertTriangle className="h-4 w-4 text-yellow-600" />
						<AlertDescription className="text-yellow-800">
							<div className="space-y-1">
								<div className="font-medium">Предупреждения РТО:</div>
								{calculatedRoute.rtoWarnings.map((warning, index) => (
									<div key={index} className="text-sm">
										{warning}
									</div>
								))}
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Соответствие РТО */}
				{calculatedRoute.rtoCompliant !== undefined && (
					<div className="flex items-center gap-2">
						<div
							className={`w-3 h-3 rounded-full ${calculatedRoute.rtoCompliant ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="text-sm font-medium">
							{calculatedRoute.rtoCompliant ? "Соответствует РТО" : "Нарушение РТО"}
						</span>
					</div>
				)}

				{/* Расход топлива */}
				{calculatedRoute.estimatedFuelConsumption && (
					<div className="text-center p-3 bg-white rounded-lg border border-orange-200">
						<div className="text-lg font-bold text-gray-900">
							{calculatedRoute.estimatedFuelConsumption.toFixed(1)} л
						</div>
						<div className="text-sm text-gray-600">расход топлива</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
