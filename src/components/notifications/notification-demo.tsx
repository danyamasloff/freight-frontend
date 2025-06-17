import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Bell,
	Truck,
	AlertTriangle,
	Info,
	Users,
	Package,
	Navigation,
	Clock,
	CheckCircle,
	Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationDemoProps {
	className?: string;
}

export function NotificationDemo({ className }: NotificationDemoProps) {
	const {
		notifications,
		unreadCount,
		criticalNotifications,
		hasUnread,
		hasCritical,
		markAllAsRead,
	} = useNotifications();

	const notificationTypes = [
		{
			icon: <Truck className="h-4 w-4" />,
			label: "Транспорт",
			count: notifications.filter((n) => n.type.includes("VEHICLE")).length,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
		},
		{
			icon: <Users className="h-4 w-4" />,
			label: "Водители",
			count: notifications.filter((n) => n.type.includes("DRIVER")).length,
			color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
		},
		{
			icon: <Navigation className="h-4 w-4" />,
			label: "Маршруты",
			count: notifications.filter((n) => n.type.includes("ROUTE")).length,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
		},
		{
			icon: <Package className="h-4 w-4" />,
			label: "Грузы",
			count: notifications.filter((n) => n.type.includes("CARGO")).length,
			color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
		},
		{
			icon: <AlertTriangle className="h-4 w-4" />,
			label: "Критические",
			count: criticalNotifications.length,
			color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
		},
	];

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<motion.div
						animate={{
							scale: hasUnread ? [1, 1.1, 1] : 1,
							rotate: hasUnread ? [0, -5, 5, 0] : 0,
						}}
						transition={{
							duration: 0.5,
							repeat: hasUnread ? Infinity : 0,
							repeatDelay: 3,
						}}
					>
						<Bell className="h-5 w-5 text-primary" />
					</motion.div>
					Центр уведомлений
					{hasUnread && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="relative"
						>
							<Badge variant="destructive" className="animate-pulse">
								{unreadCount}
							</Badge>
						</motion.div>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Статистика по типам уведомлений */}
				<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
					{notificationTypes.map((type, index) => (
						<motion.div
							key={type.label}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className="group"
						>
							<div
								className={`
                                flex items-center gap-2 p-3 rounded-lg border transition-all duration-200
                                hover:shadow-md hover:scale-105 cursor-pointer
                                ${type.color}
                            `}
							>
								<div className="flex-shrink-0">{type.icon}</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{type.label}</p>
									<p className="text-xs opacity-75">{type.count} уведомл.</p>
								</div>
								{type.count > 0 && (
									<Badge variant="secondary" className="ml-auto text-xs">
										{type.count}
									</Badge>
								)}
							</div>
						</motion.div>
					))}
				</div>

				{/* Статус и действия */}
				<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
					<div className="flex items-center gap-2">
						{hasUnread ? (
							<>
								<div className="flex items-center gap-1">
									<div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
									<span className="text-sm font-medium">
										{unreadCount} непрочитанных
									</span>
								</div>
								{hasCritical && (
									<Badge variant="destructive" className="text-xs">
										<AlertTriangle className="h-3 w-3 mr-1" />
										Критические!
									</Badge>
								)}
							</>
						) : (
							<div className="flex items-center gap-1 text-muted-foreground">
								<CheckCircle className="h-4 w-4 text-green-500" />
								<span className="text-sm">Все прочитано</span>
							</div>
						)}
					</div>

					{hasUnread && (
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="outline"
								size="sm"
								onClick={markAllAsRead}
								className="text-xs gap-1"
							>
								<CheckCircle className="h-3 w-3" />
								Прочитать все
							</Button>
						</motion.div>
					)}
				</div>

				{/* Индикаторы активности */}
				<div className="grid grid-cols-2 gap-3">
					<motion.div
						whileHover={{ scale: 1.02 }}
						className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
					>
						<Zap className="h-4 w-4 text-primary" />
						<div>
							<p className="text-sm font-medium">Активность</p>
							<p className="text-xs text-muted-foreground">
								{notifications.length > 0 ? "Высокая" : "Низкая"}
							</p>
						</div>
					</motion.div>

					<motion.div
						whileHover={{ scale: 1.02 }}
						className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/20"
					>
						<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
						<div>
							<p className="text-sm font-medium">Последнее</p>
							<p className="text-xs text-muted-foreground">
								{notifications.length > 0 ? "Сейчас" : "Давно"}
							</p>
						</div>
					</motion.div>
				</div>

				{/* Подсказка */}
				<div className="p-3 bg-muted/20 rounded-lg border border-dashed">
					<div className="flex items-start gap-2">
						<Info className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div className="text-xs text-muted-foreground">
							<p className="font-medium mb-1">Система уведомлений активна</p>
							<p>
								Автоматическое обновление каждые 30 секунд. Критические уведомления
								отображаются мгновенно.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
