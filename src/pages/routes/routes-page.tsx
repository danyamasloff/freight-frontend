import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Plus,
	Search,
	Filter,
	ArrowUpDown,
	AlertCircle,
	Loader2,
	Route as RouteIcon,
	MapPin,
	Clock,
	Truck,
	User,
	Calendar,
	Navigation,
	CheckCircle2,
	Calculator,
	TrendingUp,
	Activity,
	XCircle,
	Grid,
	List,
	Eye,
	Edit,
	MoreVertical,
	DollarSign,
	Timer,
	Fuel,
	AlertTriangle,
	Play,
	Pause,
	Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

import { useGetRoutesQuery } from "@/shared/api/routesSlice";
import { formatDistance, formatDuration, formatDateTime } from "@/shared/utils/format";
import { ROUTE_STATUS_CONFIG, type RouteStatus } from "./types";
import type { RouteSummary } from "@/shared/types/api";

export function RoutesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<RouteStatus | "ALL">("ALL");
	const [sortBy, setSortBy] = useState("departureTime");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { data: routes, isLoading, error } = useGetRoutesQuery();

	// Filter and sort routes
	const filteredAndSortedRoutes =
		routes
			?.filter((route) => {
				const matchesSearch = searchQuery
					? route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						route.startAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
						route.endAddress.toLowerCase().includes(searchQuery.toLowerCase())
					: true;

				const matchesStatus = filterStatus === "ALL" || route.status === filterStatus;

				return matchesSearch && matchesStatus;
			})
			?.sort((a, b) => {
				let aValue: any;
				let bValue: any;

				switch (sortBy) {
					case "name":
						aValue = a.name;
						bValue = b.name;
						break;
					case "distance":
						aValue = a.distance;
						bValue = b.distance;
						break;
					case "duration":
						aValue = a.duration;
						bValue = b.duration;
						break;
					case "departureTime":
						aValue = a.departureTime ? new Date(a.departureTime).getTime() : 0;
						bValue = b.departureTime ? new Date(b.departureTime).getTime() : 0;
						break;
					case "estimatedCost":
						aValue = a.estimatedCost || 0;
						bValue = b.estimatedCost || 0;
						break;
					default:
						aValue = a.name;
						bValue = b.name;
				}

				if (typeof aValue === "string") {
					aValue = aValue.toLowerCase();
					bValue = bValue.toLowerCase();
				}

				if (sortOrder === "asc") {
					return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
				} else {
					return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
				}
			}) || [];

	const getStatusBadge = (status: RouteStatus) => {
		const config = ROUTE_STATUS_CONFIG[status] || ROUTE_STATUS_CONFIG.PLANNED;
		return (
			<Badge variant={config.variant} className="gap-1">
				<span>{config.icon}</span>
				{config.label}
			</Badge>
		);
	};

	const getStatusIcon = (status: RouteStatus) => {
		switch (status) {
			case "PLANNED":
				return Calendar;
			case "IN_PROGRESS":
				return Play;
			case "COMPLETED":
				return CheckCircle2;
			case "CANCELLED":
				return XCircle;
			default:
				return Calendar;
		}
	};

	const getStatusColor = (status: RouteStatus) => {
		switch (status) {
			case "PLANNED":
				return "text-blue-500";
			case "IN_PROGRESS":
				return "text-green-500";
			case "COMPLETED":
				return "text-gray-500";
			case "CANCELLED":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	const getRouteStats = () => {
		if (!routes) return { total: 0, planned: 0, inProgress: 0, completed: 0, cancelled: 0 };

		return {
			total: routes.length,
			planned: routes.filter((r) => r.status === "PLANNED").length,
			inProgress: routes.filter((r) => r.status === "IN_PROGRESS").length,
			completed: routes.filter((r) => r.status === "COMPLETED").length,
			cancelled: routes.filter((r) => r.status === "CANCELLED").length,
		};
	};

	const stats = getRouteStats();
	const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
	const activeRate =
		stats.total > 0 ? Math.round(((stats.planned + stats.inProgress) / stats.total) * 100) : 0;

	// Анимационные варианты
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	if (error) {
		return (
			<Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Ошибка</AlertTitle>
				<AlertDescription>
					Не удалось загрузить список маршрутов. Пожалуйста, попробуйте позже.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<motion.div
			className="space-y-8 p-6"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			{/* Header */}
			<motion.div variants={itemVariants}>
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight text-foreground">
							Маршруты
						</h1>
						<p className="text-muted-foreground text-lg">
							Планирование и управление маршрутами доставки
						</p>
					</div>
					<div className="flex gap-3">
						<Button asChild variant="outline" size="lg">
							<Link to="/routes/planner">
								<Calculator className="mr-2 h-5 w-5" />
								Планировщик
							</Link>
						</Button>
						<Button asChild size="lg">
							<Link to="/routes/create">
								<Plus className="mr-2 h-5 w-5" /> Создать маршрут
							</Link>
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Статистика */}
			<motion.div
				className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
				variants={containerVariants}
			>
				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Всего маршрутов
							</CardTitle>
							<div className="p-2 bg-primary/10 rounded-full">
								<RouteIcon className="h-4 w-4 text-primary" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.total}
							</div>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-3 w-3 text-primary" />
								<p className="text-xs text-muted-foreground">Общее количество</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Активные маршруты
							</CardTitle>
							<div className="p-2 bg-green-500/10 rounded-full">
								<Activity className="h-4 w-4 text-green-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.planned + stats.inProgress}
							</div>
							<div className="mt-3">
								<Progress value={activeRate} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									{activeRate}% от общего числа
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Завершено
							</CardTitle>
							<div className="p-2 bg-blue-500/10 rounded-full">
								<CheckCircle2 className="h-4 w-4 text-blue-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.completed}
							</div>
							<div className="mt-3">
								<Progress value={completionRate} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									{completionRate}% успешно завершено
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								В пути
							</CardTitle>
							<div className="p-2 bg-orange-500/10 rounded-full">
								<Navigation className="h-4 w-4 text-orange-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.inProgress}
							</div>
							<div className="flex items-center gap-2">
								<Play className="h-3 w-3 text-orange-500" />
								<p className="text-xs text-muted-foreground">Выполняются сейчас</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Фильтры и поиск */}
			<motion.div variants={itemVariants}>
				<Card className="border shadow-sm">
					<CardContent className="pt-6">
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex flex-col sm:flex-row gap-4 flex-1">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Поиск по названию или адресам..."
										className="pl-9"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-muted-foreground" />
									<Select
										value={filterStatus}
										onValueChange={(value: RouteStatus | "ALL") =>
											setFilterStatus(value)
										}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Фильтр по статусу" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ALL">Все статусы</SelectItem>
											<Separator className="my-1" />
											<SelectItem value="PLANNED">Планируется</SelectItem>
											<SelectItem value="IN_PROGRESS">В пути</SelectItem>
											<SelectItem value="COMPLETED">Завершен</SelectItem>
											<SelectItem value="CANCELLED">Отменен</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Сортировка" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="departureTime">
											По времени отправления
										</SelectItem>
										<SelectItem value="name">По названию</SelectItem>
										<SelectItem value="distance">По расстоянию</SelectItem>
										<SelectItem value="duration">По времени в пути</SelectItem>
										<SelectItem value="estimatedCost">По стоимости</SelectItem>
									</SelectContent>
								</Select>

								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setSortOrder(sortOrder === "asc" ? "desc" : "asc")
									}
								>
									<ArrowUpDown className="h-4 w-4" />
								</Button>

								<Separator orientation="vertical" className="h-6" />

								<Button
									variant={viewMode === "grid" ? "default" : "outline"}
									size="icon"
									onClick={() => setViewMode("grid")}
								>
									<Grid className="h-4 w-4" />
								</Button>
								<Button
									variant={viewMode === "list" ? "default" : "outline"}
									size="icon"
									onClick={() => setViewMode("list")}
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Список маршрутов */}
			<motion.div variants={itemVariants}>
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2 text-muted-foreground">Загрузка маршрутов...</span>
					</div>
				) : filteredAndSortedRoutes.length === 0 ? (
					<Card className="border shadow-sm">
						<CardContent className="text-center py-12">
							<RouteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">Маршруты не найдены</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery || filterStatus !== "ALL"
									? "Попробуйте изменить параметры поиска или фильтрации"
									: "Нажмите на кнопку 'Создать маршрут', чтобы создать первый маршрут"}
							</p>
							{!(searchQuery || filterStatus !== "ALL") && (
								<div className="flex gap-2 justify-center">
									<Button asChild>
										<Link to="/routes/create">
											<Plus className="mr-2 h-4 w-4" />
											Создать маршрут
										</Link>
									</Button>
									<Button asChild variant="outline">
										<Link to="/routes/planner">
											<Calculator className="mr-2 h-4 w-4" />
											Планировщик
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				) : (
					<div
						className={
							viewMode === "grid"
								? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
								: "space-y-4"
						}
					>
						{filteredAndSortedRoutes.map((route, index) => {
							const StatusIcon = getStatusIcon(
								(route.status as RouteStatus) || "PLANNED"
							);
							return (
								<motion.div
									key={route.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Card className="border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="space-y-1 flex-1">
													<CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
														{route.name}
													</CardTitle>
													<CardDescription className="text-sm">
														ID: {route.id}
													</CardDescription>
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem asChild>
															<Link to={`/routes/${route.id}`}>
																<Eye className="mr-2 h-4 w-4" />
																Просмотр
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<Link to={`/routes/${route.id}/edit`}>
																<Edit className="mr-2 h-4 w-4" />
																Редактировать
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem>
															<Navigation className="mr-2 h-4 w-4" />
															Отслеживать
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-center justify-between">
												{getStatusBadge(
													(route.status as RouteStatus) || "PLANNED"
												)}
												{route.estimatedCost && (
													<div className="text-sm font-medium">
														{route.estimatedCost.toLocaleString()} ₽
													</div>
												)}
											</div>

											<div className="space-y-2">
												<div className="flex items-start gap-2">
													<MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
													<span className="text-sm text-muted-foreground truncate">
														{route.startAddress}
													</span>
												</div>
												<div className="flex items-start gap-2">
													<MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
													<span className="text-sm text-muted-foreground truncate">
														{route.endAddress}
													</span>
												</div>
											</div>

											<Separator />

											<div className="grid grid-cols-2 gap-4 text-sm">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<RouteIcon className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															Расстояние
														</span>
													</div>
													<div className="font-medium">
														{formatDistance(route.distance)}
													</div>
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															Время
														</span>
													</div>
													<div className="font-medium">
														{formatDuration(route.duration)}
													</div>
												</div>
											</div>

											{route.departureTime && (
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															Отправление
														</span>
													</div>
													<div className="font-medium text-sm">
														{formatDateTime(route.departureTime)}
													</div>
												</div>
											)}

											<div className="flex gap-2">
												{route.vehicleId && (
													<Badge variant="outline" className="text-xs">
														<Truck className="h-3 w-3 mr-1" />
														ТС
													</Badge>
												)}
												{route.driverId && (
													<Badge variant="outline" className="text-xs">
														<User className="h-3 w-3 mr-1" />
														Водитель
													</Badge>
												)}
											</div>

											<div className="pt-2">
												<Button
													asChild
													variant="outline"
													className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
												>
													<Link to={`/routes/${route.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														Подробнее
													</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
