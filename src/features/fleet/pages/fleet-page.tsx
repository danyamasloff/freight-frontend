import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Truck,
	Plus,
	Search,
	Loader2,
	Filter,
	ArrowUpDown,
	AlertCircle,
	Fuel,
	Calendar,
	MapPin,
	Settings,
	Eye,
	Edit,
	MoreVertical,
	TrendingUp,
	Activity,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	Grid3X3,
	List,
	Gauge,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import { useGetVehiclesQuery } from "@/shared/api/vehiclesApiSlice";
import { VehicleStatus } from "@/shared/types/vehicle";

export function FleetPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("ALL");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { data: vehicles, isLoading, error } = useGetVehiclesQuery();

	// Фильтрация и поиск
	const filteredVehicles =
		vehicles?.filter((vehicle) => {
			const matchesSearch = searchQuery
				? `${vehicle.brand} ${vehicle.model} ${vehicle.licensePlate}`
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				: true;

			const matchesFilter = filterStatus === "ALL" || vehicle.status === filterStatus;

			return matchesSearch && matchesFilter;
		}) || [];

	// Статистика автопарка
	const stats = {
		total: vehicles?.length || 0,
		available: vehicles?.filter((v) => v.status === VehicleStatus.AVAILABLE).length || 0,
		inUse: vehicles?.filter((v) => v.status === VehicleStatus.IN_USE).length || 0,
		maintenance: vehicles?.filter((v) => v.status === VehicleStatus.MAINTENANCE).length || 0,
		outOfService:
			vehicles?.filter((v) => v.status === VehicleStatus.OUT_OF_SERVICE).length || 0,
	};

	const utilizationRate = stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0;
	const availabilityRate =
		stats.total > 0 ? Math.round(((stats.available + stats.inUse) / stats.total) * 100) : 0;

	// Форматирование отображения статуса
	const formatStatus = (status: VehicleStatus) => {
		switch (status) {
			case VehicleStatus.AVAILABLE:
				return "Доступно";
			case VehicleStatus.IN_USE:
				return "В работе";
			case VehicleStatus.MAINTENANCE:
				return "ТО";
			case VehicleStatus.OUT_OF_SERVICE:
				return "Неисправно";
			default:
				return status;
		}
	};

	// Получение класса статуса для бейджа
	const getStatusVariant = (status: VehicleStatus) => {
		switch (status) {
			case VehicleStatus.AVAILABLE:
				return "default";
			case VehicleStatus.IN_USE:
				return "secondary";
			case VehicleStatus.MAINTENANCE:
				return "outline";
			case VehicleStatus.OUT_OF_SERVICE:
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: VehicleStatus) => {
		switch (status) {
			case VehicleStatus.AVAILABLE:
				return CheckCircle2;
			case VehicleStatus.IN_USE:
				return Activity;
			case VehicleStatus.MAINTENANCE:
				return Settings;
			case VehicleStatus.OUT_OF_SERVICE:
				return XCircle;
			default:
				return AlertTriangle;
		}
	};

	const getStatusColor = (status: VehicleStatus) => {
		switch (status) {
			case VehicleStatus.AVAILABLE:
				return "text-primary";
			case VehicleStatus.IN_USE:
				return "text-blue-500";
			case VehicleStatus.MAINTENANCE:
				return "text-yellow-500";
			case VehicleStatus.OUT_OF_SERVICE:
				return "text-destructive";
			default:
				return "text-muted-foreground";
		}
	};

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
					Не удалось загрузить список транспортных средств. Пожалуйста, попробуйте позже.
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
							Автопарк
						</h1>
						<p className="text-muted-foreground text-lg">
							Управление транспортными средствами компании
						</p>
					</div>
					<Button asChild size="lg">
						<Link to="/fleet/create">
							<Plus className="mr-2 h-5 w-5" />
							Добавить ТС
						</Link>
					</Button>
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
								Всего ТС
							</CardTitle>
							<div className="p-2 bg-primary/10 rounded-full">
								<Truck className="h-4 w-4 text-primary" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.total}
							</div>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-3 w-3 text-primary" />
								<p className="text-xs text-muted-foreground">Активный автопарк</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Коэффициент использования
							</CardTitle>
							<div className="p-2 bg-blue-500/10 rounded-full">
								<Gauge className="h-4 w-4 text-blue-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{utilizationRate}%
							</div>
							<div className="mt-3">
								<Progress value={utilizationRate} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									{stats.inUse} из {stats.total} в работе
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Готовность парка
							</CardTitle>
							<div className="p-2 bg-green-500/10 rounded-full">
								<CheckCircle2 className="h-4 w-4 text-green-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{availabilityRate}%
							</div>
							<div className="mt-3">
								<Progress value={availabilityRate} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">
									{stats.available + stats.inUse} готовы к работе
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Требуют внимания
							</CardTitle>
							<div className="p-2 bg-yellow-500/10 rounded-full">
								<AlertTriangle className="h-4 w-4 text-yellow-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-foreground mb-2">
								{stats.maintenance + stats.outOfService}
							</div>
							<div className="flex items-center gap-2">
								<Settings className="h-3 w-3 text-yellow-500" />
								<p className="text-xs text-muted-foreground">ТО и ремонт</p>
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
										placeholder="Поиск по марке, модели или номеру..."
										className="pl-9"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-muted-foreground" />
									<Select value={filterStatus} onValueChange={setFilterStatus}>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Фильтр по статусу" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ALL">Все статусы</SelectItem>
											{Object.values(VehicleStatus).map((status) => (
												<SelectItem key={status} value={status}>
													{formatStatus(status)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant={viewMode === "grid" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("grid")}
								>
									<Grid3X3 className="h-4 w-4" />
								</Button>
								<Button
									variant={viewMode === "list" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("list")}
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Список транспортных средств */}
			<motion.div variants={itemVariants}>
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2 text-muted-foreground">
							Загрузка транспортных средств...
						</span>
					</div>
				) : filteredVehicles.length === 0 ? (
					<Card className="border shadow-sm">
						<CardContent className="text-center py-12">
							<Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">
								Транспортные средства не найдены
							</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery || filterStatus !== "ALL"
									? "Попробуйте изменить параметры поиска или фильтрации"
									: "Нажмите на кнопку 'Добавить ТС', чтобы добавить новое транспортное средство"}
							</p>
							{!(searchQuery || filterStatus !== "ALL") && (
								<Button asChild>
									<Link to="/fleet/create">
										<Plus className="mr-2 h-4 w-4" />
										Добавить ТС
									</Link>
								</Button>
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
						{filteredVehicles.map((vehicle, index) => {
							const StatusIcon = getStatusIcon(vehicle.status);
							return (
								<motion.div
									key={vehicle.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Card className="border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="space-y-1">
													<CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
														{vehicle.brand} {vehicle.model}
													</CardTitle>
													<CardDescription className="text-sm">
														{vehicle.licensePlate}
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
															<Link to={`/fleet/${vehicle.id}`}>
																<Eye className="mr-2 h-4 w-4" />
																Просмотр
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<Link to={`/fleet/${vehicle.id}/edit`}>
																<Edit className="mr-2 h-4 w-4" />
																Редактировать
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem>
															<Settings className="mr-2 h-4 w-4" />
															Техобслуживание
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-center justify-between">
												<Badge
													variant={getStatusVariant(vehicle.status)}
													className="flex items-center gap-1"
												>
													<StatusIcon className="h-3 w-3" />
													{formatStatus(vehicle.status)}
												</Badge>
												<div className="text-sm text-muted-foreground">
													ID: {vehicle.id}
												</div>
											</div>

											<Separator />

											<div className="grid grid-cols-2 gap-4 text-sm">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Fuel className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															Топливо
														</span>
													</div>
													<div className="font-medium">
														{Math.floor(Math.random() * 100)}%
													</div>
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															Последнее ТО
														</span>
													</div>
													<div className="font-medium">
														{new Date(
															Date.now() -
																Math.random() *
																	90 *
																	24 *
																	60 *
																	60 *
																	1000
														).toLocaleDateString("ru-RU")}
													</div>
												</div>
											</div>

											<div className="pt-2">
												<Button
													asChild
													variant="outline"
													className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
												>
													<Link to={`/fleet/${vehicle.id}`}>
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
