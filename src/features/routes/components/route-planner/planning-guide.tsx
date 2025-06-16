// freight-frontend/src/features/routes/components/route-planner/planning-guide.tsx

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
	TruckIcon,
	ShieldCheckIcon,
	BarChart3Icon,
} from "lucide-react";

export function PlanningGuide() {
	const features = [
		{
			icon: MapPinIcon,
			title: "Умный геокодинг",
			description:
				"Начните вводить название места - система предложит варианты с точными координатами",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
		{
			icon: ClockIcon,
			title: "Учет времени",
			description:
				"Система рассчитывает время прибытия и показывает актуальный прогноз погоды",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
		{
			icon: CloudIcon,
			title: "Погодные данные",
			description: "Реальные прогнозы погоды для точек отправления и прибытия",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
		{
			icon: NavigationIcon,
			title: "Оптимизация маршрута",
			description: "Автоматический расчет оптимального пути с учетом дорожных условий",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
		{
			icon: TruckIcon,
			title: "Выбор транспорта",
			description: "Учитывайте характеристики ТС для точного расчета расхода топлива",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
		{
			icon: BarChart3Icon,
			title: "Экономический анализ",
			description: "Детальный расчет стоимости маршрута с учетом всех расходов",
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-500/20",
		},
	];

	return (
		<Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 mb-6 border-2 border-orange-200 dark:border-orange-500/30">
			<CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-b border-orange-200 dark:border-orange-500/30">
				<CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
					<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
						<InfoIcon className="w-5 h-5 text-orange-500" />
					</div>
					Как работает планировщик
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6 bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-orange-500/5 dark:to-amber-500/5">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex flex-col items-start p-4 rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-400 transition-all duration-300 hover:shadow-md hover:shadow-orange-500/10"
						>
							<div className={`p-3 rounded-lg ${feature.bgColor} mb-3`}>
								<feature.icon className={`w-6 h-6 ${feature.color}`} />
							</div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								{feature.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>

				<div className="mt-8 p-4 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30">
					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-500/30">
							<CheckCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
								Готовы начать?
							</h4>
							<p className="text-sm text-orange-700 dark:text-orange-200">
								Заполните форму выше, чтобы рассчитать оптимальный маршрут для
								вашего груза. Система автоматически учтет все факторы и предоставит
								детальную аналитику.
							</p>
						</div>
					</div>
				</div>
				<div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
			</CardContent>
		</Card>
	);
}

function cn(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}
