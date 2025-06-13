import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	InfoIcon,
	MapPinIcon,
	ClockIcon,
	CloudIcon,
	NavigationIcon,
	CheckCircleIcon,
} from "lucide-react";

export function PlanningGuide() {
	return (
		<Card className="claude-card mb-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<InfoIcon className="w-5 h-5" />
					Как работает планировщик
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<MapPinIcon className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h4 className="font-medium text-sm">Умный геокодинг</h4>
								<p className="text-xs text-muted-foreground">
									Начните вводить название места - система предложит варианты с
									точными координатами
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<ClockIcon className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h4 className="font-medium text-sm">Учет времени</h4>
								<p className="text-xs text-muted-foreground">
									Система рассчитывает время прибытия и показывает актуальный
									прогноз погоды
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<CloudIcon className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h4 className="font-medium text-sm">Погодные данные</h4>
								<p className="text-xs text-muted-foreground">
									Реальные прогнозы погоды для точек отправления и прибытия
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<NavigationIcon className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h4 className="font-medium text-sm">Оптимизация маршрута</h4>
								<p className="text-xs text-muted-foreground">
									Учет параметров транспорта, водителя и груза для точного расчета
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<CheckCircleIcon className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h4 className="font-medium text-sm">Интеграция с API</h4>
								<p className="text-xs text-muted-foreground">
									Данные получаются из реальных внешних сервисов: GraphHopper,
									OpenWeatherMap
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="border-t pt-4">
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary" className="text-xs">
							🌍 Геокодинг GraphHopper
						</Badge>
						<Badge variant="secondary" className="text-xs">
							🌤️ Погода OpenWeatherMap
						</Badge>
						<Badge variant="secondary" className="text-xs">
							⏰ Расчет времени прибытия
						</Badge>
						<Badge variant="secondary" className="text-xs">
							🚛 Учет параметров ТС
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
