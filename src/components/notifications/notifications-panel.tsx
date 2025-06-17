import React, { useState } from "react";
import {
	Bell,
	Check,
	CheckCheck,
	X,
	Trash2,
	Clock,
	AlertCircle,
	Info,
	Truck,
	User,
	Package,
	AlertTriangle,
	Navigation,
	Users,
	MoreHorizontal,
	Dot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNotifications, type UseNotificationsReturn } from "@/hooks/use-notifications";
import type { Notification } from "@/shared/api/notificationsSlice";

// Функция для получения иконки по типу уведомления
const getNotificationIcon = (type: string) => {
	const iconClass = "h-4 w-4";

	switch (type) {
		case "ROUTE_CREATED":
		case "ROUTE_UPDATED":
		case "ROUTE_STATUS_CHANGED":
			return <Navigation className={iconClass} />;
		case "DRIVER_ASSIGNED":
		case "DRIVER_CREATED":
		case "DRIVER_UPDATED":
		case "DRIVER_STATUS_CHANGED":
			return <Users className={iconClass} />;
		case "VEHICLE_CREATED":
		case "VEHICLE_UPDATED":
		case "VEHICLE_FUEL_LOW":
		case "VEHICLE_MAINTENANCE_DUE":
			return <Truck className={iconClass} />;
		case "CARGO_CREATED":
		case "CARGO_UPDATED":
		case "CARGO_ASSIGNED":
			return <Package className={iconClass} />;
		case "COMPLIANCE_WARNING":
			return <Clock className={iconClass} />;
		case "WEATHER_ALERT":
			return <AlertTriangle className={iconClass} />;
		case "SYSTEM_INFO":
			return <Info className={iconClass} />;
		case "SYSTEM_WARNING":
		case "SYSTEM_ERROR":
			return <AlertTriangle className={iconClass} />;
		default:
			return <Bell className={iconClass} />;
	}
};

// Функция для получения цвета по типу уведомления
const getNotificationVariant = (type: string): { bg: string; icon: string; border: string } => {
	switch (type) {
		case "SYSTEM_ERROR":
		case "VEHICLE_FUEL_LOW":
		case "WEATHER_ALERT":
			return {
				bg: "bg-destructive/10 hover:bg-destructive/20",
				icon: "text-destructive",
				border: "border-l-destructive",
			};
		case "SYSTEM_WARNING":
		case "COMPLIANCE_WARNING":
		case "VEHICLE_MAINTENANCE_DUE":
			return {
				bg: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30",
				icon: "text-amber-600 dark:text-amber-400",
				border: "border-l-amber-500",
			};
		case "ROUTE_STATUS_CHANGED":
		case "DRIVER_STATUS_CHANGED":
			return {
				bg: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30",
				icon: "text-yellow-600 dark:text-yellow-400",
				border: "border-l-yellow-500",
			};
		default:
			return {
				bg: "bg-primary/5 hover:bg-primary/10",
				icon: "text-primary",
				border: "border-l-primary",
			};
	}
};

interface NotificationItemProps {
	notification: Notification;
	onMarkAsRead: (id: number) => void;
	onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	notification,
	onMarkAsRead,
	onDelete,
}) => {
	const variant = getNotificationVariant(notification.type);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, x: -20, scale: 0.95 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			exit={{ opacity: 0, x: 20, scale: 0.95 }}
			transition={{
				duration: 0.3,
				type: "spring",
				stiffness: 100,
				damping: 15,
			}}
			whileHover={{ y: -2 }}
			className="group relative"
		>
			<Card
				className={cn(
					"relative border-l-4 transition-all duration-300 ease-out cursor-pointer",
					"hover:shadow-lg hover:shadow-primary/5",
					!notification.read
						? `${variant.bg} ${variant.border} shadow-sm`
						: "border-l-muted hover:border-l-primary/20"
				)}
			>
				<CardContent className="p-4">
					<div className="flex items-start gap-4">
						{/* Иконка уведомления */}
						<div
							className={cn(
								"flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
								"border-2 border-background shadow-sm",
								variant.bg,
								variant.icon,
								"group-hover:scale-110 group-hover:shadow-md"
							)}
						>
							{getNotificationIcon(notification.type)}
						</div>

						{/* Контент уведомления */}
						<div className="flex-1 space-y-2 min-w-0">
							<div className="flex items-start justify-between gap-2">
								<p
									className={cn(
										"text-sm leading-relaxed break-words",
										!notification.read
											? "font-semibold text-foreground"
											: "font-medium text-muted-foreground"
									)}
								>
									{notification.message}
								</p>

								{!notification.read && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="flex-shrink-0 mt-1"
									>
										<div className="w-2 h-2 bg-primary rounded-full shadow-sm" />
									</motion.div>
								)}
							</div>

							<div className="flex items-center justify-between">
								<p className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Clock className="h-3 w-3" />
									{formatDistanceToNow(new Date(notification.createdAt), {
										addSuffix: true,
										locale: ru,
									})}
								</p>

								{/* Действия */}
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									{!notification.read && (
										<motion.div
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
										>
											<Button
												variant="ghost"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													onMarkAsRead(notification.id);
												}}
												className="h-7 w-7 p-0 hover:bg-primary/20 hover:text-primary"
												title="Отметить как прочитанное"
											>
												<Check className="h-3 w-3" />
											</Button>
										</motion.div>
									)}

									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
									>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												onDelete(notification.id);
											}}
											className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
											title="Удалить уведомление"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</motion.div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

interface NotificationsPanelProps {
	className?: string;
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Используем кастомный хук для работы с уведомлениями
	const {
		notifications,
		unreadCount,
		isLoading,
		error,
		groupedNotifications,
		markAsRead: handleMarkAsRead,
		markAllAsRead: handleMarkAllAsRead,
		deleteNotification: handleDelete,
		refetch,
		hasUnread,
		hasCritical,
	} = useNotifications({
		autoRefresh: true,
		refreshInterval: 30000,
		showToasts: true,
	});

	const renderNotificationGroup = (
		title: string,
		notifications: Notification[],
		icon: React.ReactNode
	) => {
		if (notifications.length === 0) return null;

		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="space-y-3"
			>
				<div className="flex items-center gap-2 px-1">
					<div className="text-muted-foreground">{icon}</div>
					<h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
					<div className="flex-1 h-px bg-border" />
					<Badge variant="secondary" className="text-xs">
						{notifications.length}
					</Badge>
				</div>

				<div className="space-y-2">
					<AnimatePresence mode="popLayout">
						{notifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onMarkAsRead={handleMarkAsRead}
								onDelete={handleDelete}
							/>
						))}
					</AnimatePresence>
				</div>
			</motion.div>
		);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"relative group transition-all duration-200",
						"hover:bg-primary/10 hover:text-primary",
						"focus:bg-primary/10 focus:text-primary",
						className
					)}
				>
					<motion.div
						animate={
							hasUnread
								? {
										scale: [1, 1.1, 1],
										rotate: [0, -10, 10, 0],
									}
								: {}
						}
						transition={{
							duration: 0.5,
							repeat: hasUnread ? Infinity : 0,
							repeatDelay: 3,
						}}
					>
						<Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
					</motion.div>

					<AnimatePresence>
						{hasUnread && (
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ type: "spring", stiffness: 500, damping: 20 }}
								className="absolute -top-1 -right-1"
							>
								<Badge
									className={cn(
										"h-5 w-5 p-0 text-xs font-bold rounded-full",
										"bg-destructive text-destructive-foreground",
										"shadow-lg animate-pulse border-2 border-background"
									)}
								>
									{unreadCount > 99 ? "99+" : unreadCount}
								</Badge>
							</motion.div>
						)}
					</AnimatePresence>
					<span className="sr-only">Уведомления</span>
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="w-full sm:w-96 sm:max-w-96 p-0">
				<motion.div
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 100 }}
					transition={{ type: "spring", stiffness: 100, damping: 20 }}
					className="h-full flex flex-col"
				>
					<SheetHeader className="px-6 py-4 border-b bg-muted/30">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="relative">
									<Bell className="h-5 w-5 text-primary" />
									{hasUnread && (
										<Dot className="absolute -top-1 -right-1 h-3 w-3 text-destructive" />
									)}
								</div>
								<div>
									<SheetTitle className="text-base">Уведомления</SheetTitle>
									<p className="text-sm text-muted-foreground">
										{notifications.length > 0
											? `${notifications.length} всего, ${unreadCount} непрочитанных`
											: "Нет уведомлений"}
									</p>
								</div>
							</div>

							{hasUnread && (
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										variant="outline"
										size="sm"
										onClick={handleMarkAllAsRead}
										className="text-xs gap-1 hover:bg-primary/10"
									>
										<CheckCheck className="h-3 w-3" />
										Прочитать все
									</Button>
								</motion.div>
							)}
						</div>
					</SheetHeader>

					<div className="flex-1 overflow-hidden">
						{isLoading ? (
							<div className="flex items-center justify-center h-32">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
								/>
							</div>
						) : error ? (
							<div className="flex flex-col items-center justify-center h-32 px-6">
								<AlertCircle className="h-8 w-8 text-destructive mb-2" />
								<p className="text-sm text-muted-foreground text-center">
									Не удалось загрузить уведомления
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => refetch()}
									className="mt-2"
								>
									Повторить
								</Button>
							</div>
						) : notifications.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex flex-col items-center justify-center h-64 px-6"
							>
								<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
									<Bell className="h-8 w-8 text-muted-foreground" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Нет уведомлений</h3>
								<p className="text-sm text-muted-foreground text-center">
									Здесь будут отображаться важные обновления и события системы
								</p>
							</motion.div>
						) : (
							<ScrollArea className="h-full px-6 py-4">
								<div className="space-y-6">
									{renderNotificationGroup(
										"Сегодня",
										groupedNotifications.today,
										<Dot className="h-4 w-4" />
									)}
									{renderNotificationGroup(
										"Вчера",
										groupedNotifications.yesterday,
										<Clock className="h-4 w-4" />
									)}
									{renderNotificationGroup(
										"На этой неделе",
										groupedNotifications.thisWeek,
										<Clock className="h-4 w-4" />
									)}
									{renderNotificationGroup(
										"Ранее",
										groupedNotifications.older,
										<MoreHorizontal className="h-4 w-4" />
									)}
								</div>
							</ScrollArea>
						)}
					</div>
				</motion.div>
			</SheetContent>
		</Sheet>
	);
}
