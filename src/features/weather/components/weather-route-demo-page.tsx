import React from "react";
import { CreateRoutePage } from "@/features/routes/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, MapPin, Navigation, Shield } from "lucide-react";

export function WeatherRouteDemoPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Заголовок */}
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold">
					Интеграция OpenWeatherMap с планированием маршрутов
				</h1>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Планируйте маршруты с учетом погодных условий и рисков. Система автоматически
					определяет ваше местоположение и анализирует погодные условия по всему маршруту.
				</p>
			</div>

			{/* Информационные карточки */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<MapPin className="h-8 w-8 text-blue-500" />
						<div>
							<div className="font-medium">Геолокация</div>
							<div className="text-sm text-muted-foreground">
								Автоопределение местоположения
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<CloudRain className="h-8 w-8 text-green-500" />
						<div>
							<div className="font-medium">OpenWeatherMap</div>
							<div className="text-sm text-muted-foreground">
								Актуальные погодные данные
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Navigation className="h-8 w-8 text-orange-500" />
						<div>
							<div className="font-medium">Маршрутизация</div>
							<div className="text-sm text-muted-foreground">Оптимальные пути</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Shield className="h-8 w-8 text-red-500" />
						<div>
							<div className="font-medium">Анализ рисков</div>
							<div className="text-sm text-muted-foreground">
								Погодные предупреждения
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Основные возможности */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Возможности системы</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<h4 className="font-medium">Погодная интеграция</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-green-500"
									/>
									Текущая погода в вашем местоположении
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-blue-500"
									/>
									Прогноз погоды по всему маршруту
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-orange-500"
									/>
									Предупреждения о погодных опасностях
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-red-500"
									/>
									Автоматический расчет погодных рисков
								</li>
							</ul>
						</div>
						<div className="space-y-3">
							<h4 className="font-medium">Планирование маршрутов</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-green-500"
									/>
									Автоматическое определение местоположения
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-blue-500"
									/>
									Учет погодных условий при планировании
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-orange-500"
									/>
									Настройки избежания платных дорог и автомагистралей
								</li>
								<li className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="w-2 h-2 p-0 rounded-full bg-red-500"
									/>
									Рекомендации по безопасности
								</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Основной компонент планирования */}
			<CreateRoutePage />

			{/* Инструкции */}
			<Card>
				<CardHeader>
					<CardTitle>Как использовать</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center space-y-2">
								<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
									1
								</div>
								<h4 className="font-medium">Разрешите геолокацию</h4>
								<p className="text-sm text-muted-foreground">
									Система автоматически определит ваше местоположение для анализа
									погоды
								</p>
							</div>
							<div className="text-center space-y-2">
								<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
									2
								</div>
								<h4 className="font-medium">Введите пункт назначения</h4>
								<p className="text-sm text-muted-foreground">
									Укажите конечную точку маршрута (координаты или название города)
								</p>
							</div>
							<div className="text-center space-y-2">
								<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
									3
								</div>
								<h4 className="font-medium">Анализируйте риски</h4>
								<p className="text-sm text-muted-foreground">
									Изучите погодные условия и получите рекомендации по безопасности
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
