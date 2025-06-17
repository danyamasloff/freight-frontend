import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	Plus,
	Search,
	Filter,
	ArrowUpDown,
	AlertCircle,
	Loader2,
	User,
	Phone,
	Mail,
	Calendar,
	MapPin,
	Clock,
	AlertTriangle,
	CheckCircle2,
	Star,
	TrendingUp,
	Activity,
	Award,
	Navigation,
	Truck,
	MoreHorizontal,
	Edit,
	Eye,
	Download,
	RefreshCw,
	Users,
	Shield,
	Zap,
	Grid3X3,
	List,
	SortAsc,
	SortDesc,
	UserCheck,
	UserX,
	Coffee,
	Bed,
	Car,
	Target,
	Trophy,
	Clock4,
	MapIcon,
	PhoneCall,
	Mail as MailIcon,
	Calendar as CalendarIcon,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

import { useGetDriversQuery } from "@/shared/api/driversSlice";
import { DrivingStatus, DRIVER_STATUS_CONFIG } from "../types";
import { type DriverSummary } from "@/shared/types/api";

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
	visible: { opacity: 1, y: 0 },
};

const cardVariants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.3 },
	},
	hover: {
		scale: 1.02,
		transition: { duration: 0.2 },
	},
};

const statsCardVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5 },
	},
	hover: {
		y: -5,
		transition: { duration: 0.2 },
	},
};

export function EnhancedDriversPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("ALL");
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

	const { data: drivers, isLoading, error, refetch } = useGetDriversQuery();

	// Расширенная статистика
	const statistics = useMemo(() => {
		if (!drivers) return null;

		const total = drivers.length;
		const active = drivers.filter(
			(d) => d.currentDrivingStatus === DrivingStatus.DRIVING
		).length;
		const onBreak = drivers.filter(
			(d) =>
				d.currentDrivingStatus &&
				[
					DrivingStatus.REST_BREAK,
					DrivingStatus.DAILY_REST,
					DrivingStatus.WEEKLY_REST,
				].includes(d.currentDrivingStatus)
		).length;
		const available = drivers.filter(
			(d) => d.currentDrivingStatus === DrivingStatus.AVAILABILITY
		).length;
		const avgRating = 4.2; // Временно фиксированное значение, так как rating нет в API
		const avgExperience =
			drivers.reduce((sum, d) => sum + (d.drivingExperienceYears || 0), 0) / total;

		return {
			total,
			active,
			onBreak,
			available,
			avgRating,
			avgExperience,
			efficiency: total > 0 ? (active / total) * 100 : 0,
		};
	}, [drivers]);

	// Фильтрация и сортировка
	const filteredAndSortedDrivers = useMemo(() => {
		if (!drivers) return [];

		return drivers
			.filter((driver) => {
				const fullName = `${driver.firstName} ${driver.lastName}`.trim();
				const matchesSearch = searchQuery
					? fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
						driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
						driver.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
					: true;

				const matchesStatus =
					filterStatus === "ALL" || driver.currentDrivingStatus === filterStatus;

				return matchesSearch && matchesStatus;
			})
			.sort((a, b) => {
				let aValue: any;
				let bValue: any;

				switch (sortBy) {
					case "name":
						aValue = `${a.firstName} ${a.lastName}`.trim();
						bValue = `${b.firstName} ${b.lastName}`.trim();
						break;
					case "experience":
						aValue = a.drivingExperienceYears || 0;
						bValue = b.drivingExperienceYears || 0;
						break;
					case "rating":
						aValue = 4.2; // Временно фиксированное значение
						bValue = 4.2; // Временно фиксированное значение
						break;
					default:
						aValue = `${a.firstName} ${a.lastName}`.trim();
						bValue = `${b.firstName} ${b.lastName}`.trim();
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
			});
	}, [drivers, searchQuery, filterStatus, sortBy, sortOrder]);

	const getDriverInitials = (firstName: string, lastName: string) => {
		if (!firstName && !lastName) return "NN";
		return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
	};

	const getStatusBadge = (status?: DrivingStatus) => {
		if (!status) {
			return (
				<Badge variant="secondary" className="animate-pulse">
					<span className="mr-1">❓</span>
					Неизвестно
				</Badge>
			);
		}

		const config = DRIVER_STATUS_CONFIG[status];
		if (!config) {
			return (
				<Badge variant="secondary" className="animate-pulse">
					<span className="mr-1">❓</span>
					Неизвестно
				</Badge>
			);
		}

		const variants = {
			[DrivingStatus.DRIVING]: "default",
			[DrivingStatus.AVAILABILITY]: "secondary",
			[DrivingStatus.REST_BREAK]: "outline",
			[DrivingStatus.DAILY_REST]: "outline",
			[DrivingStatus.WEEKLY_REST]: "outline",
			[DrivingStatus.OFF_DUTY]: "destructive",
			[DrivingStatus.OTHER_WORK]: "outline",
		} as const;

		return (
			<Badge
				variant={variants[status] || "secondary"}
				className="transition-all duration-200"
			>
				<span className="mr-1">{config.icon}</span>
				{config.label}
			</Badge>
		);
	};

	const getRatingStars = (rating: number) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		for (let i = 0; i < fullStars; i++) {
			stars.push(<Star key={i} className="h-3 w-3 fill-primary text-primary" />);
		}

		if (hasHalfStar) {
			stars.push(<Star key="half" className="h-3 w-3 fill-primary/50 text-primary" />);
		}

		const emptyStars = 5 - Math.ceil(rating);
		for (let i = 0; i < emptyStars; i++) {
			stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
		}

		return <div className="flex items-center gap-0.5">{stars}</div>;
	};

	const getExperienceLevel = (experience: number) => {
		if (experience >= 10) return { label: "Эксперт", color: "text-primary", icon: Trophy };
		if (experience >= 5) return { label: "Опытный", color: "text-foreground", icon: Award };
		if (experience >= 2)
			return { label: "Средний", color: "text-muted-foreground", icon: Target };
		return { label: "Новичок", color: "text-muted-foreground", icon: User };
	};

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="container py-8"
			>
				<Alert variant="destructive" className="mx-auto max-w-4xl">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Ошибка загрузки</AlertTitle>
					<AlertDescription>
						Не удалось загрузить список водителей. Пожалуйста, попробуйте позже.
					</AlertDescription>
				</Alert>
			</motion.div>
		);
	}

	return (
		<TooltipProvider>
			<motion.div
				className="container py-8 space-y-8"
				initial="hidden"
				animate="visible"
				variants={containerVariants}
			>
				{/* Header */}
				<motion.div
					className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
					variants={itemVariants}
				>
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight text-foreground">
							Водители
						</h1>
						<p className="text-muted-foreground text-lg">
							Управление водителями и мониторинг их статуса
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="transition-all duration-200 hover:scale-105"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Обновить
						</Button>
						<Button asChild className="transition-all duration-200 hover:scale-105">
							<Link to="/drivers/create">
								<Plus className="mr-2 h-4 w-4" />
								Добавить водителя
							</Link>
						</Button>
					</div>
				</motion.div>

				{/* Statistics Cards */}
				{statistics && (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
						variants={containerVariants}
					>
						<motion.div variants={statsCardVariants} whileHover="hover">
							<Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">
												Всего водителей
											</p>
											<p className="text-3xl font-bold text-foreground">
												{statistics.total}
											</p>
										</div>
										<div className="p-3 bg-muted rounded-full">
											<Users className="h-6 w-6 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div variants={statsCardVariants} whileHover="hover">
							<Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">
												На маршруте
											</p>
											<p className="text-3xl font-bold text-primary">
												{statistics.active}
											</p>
										</div>
										<div className="p-3 bg-primary/10 rounded-full">
											<Car className="h-6 w-6 text-primary" />
										</div>
									</div>
									<div className="mt-2">
										<Progress value={statistics.efficiency} className="h-2" />
										<p className="text-xs text-muted-foreground mt-1">
											{statistics.efficiency.toFixed(1)}% эффективность
										</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div variants={statsCardVariants} whileHover="hover">
							<Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">
												На отдыхе
											</p>
											<p className="text-3xl font-bold text-foreground">
												{statistics.onBreak}
											</p>
										</div>
										<div className="p-3 bg-muted rounded-full">
											<Coffee className="h-6 w-6 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div variants={statsCardVariants} whileHover="hover">
							<Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">
												Средний рейтинг
											</p>
											<div className="flex items-center gap-2">
												<p className="text-3xl font-bold text-foreground">
													{statistics.avgRating.toFixed(1)}
												</p>
												{getRatingStars(statistics.avgRating)}
											</div>
										</div>
										<div className="p-3 bg-primary/10 rounded-full">
											<Star className="h-6 w-6 text-primary" />
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</motion.div>
				)}

				{/* Filters and Controls */}
				<motion.div variants={itemVariants}>
					<Card className="border shadow-sm">
						<CardContent className="p-6">
							<div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
								<div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
									<div className="relative w-full sm:w-80">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
										<Input
											placeholder="Поиск водителей..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring"
										/>
									</div>

									<Select value={filterStatus} onValueChange={setFilterStatus}>
										<SelectTrigger className="w-full sm:w-48 transition-all duration-200">
											<Filter className="mr-2 h-4 w-4" />
											<SelectValue placeholder="Статус" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ALL">Все статусы</SelectItem>
											<SelectItem value={DrivingStatus.DRIVING}>
												На маршруте
											</SelectItem>
											<SelectItem value={DrivingStatus.AVAILABILITY}>
												Доступен
											</SelectItem>
											<SelectItem value={DrivingStatus.REST_BREAK}>
												Перерыв
											</SelectItem>
											<SelectItem value={DrivingStatus.DAILY_REST}>
												Суточный отдых
											</SelectItem>
											<SelectItem value={DrivingStatus.WEEKLY_REST}>
												Недельный отдых
											</SelectItem>
											<SelectItem value={DrivingStatus.OFF_DUTY}>
												Не на смене
											</SelectItem>
										</SelectContent>
									</Select>

									<Select value={sortBy} onValueChange={setSortBy}>
										<SelectTrigger className="w-full sm:w-48 transition-all duration-200">
											<ArrowUpDown className="mr-2 h-4 w-4" />
											<SelectValue placeholder="Сортировка" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">По имени</SelectItem>
											<SelectItem value="experience">По опыту</SelectItem>
											<SelectItem value="rating">По рейтингу</SelectItem>
										</SelectContent>
									</Select>

									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setSortOrder(sortOrder === "asc" ? "desc" : "asc")
										}
										className="transition-all duration-200 hover:scale-105"
									>
										{sortOrder === "asc" ? (
											<SortAsc className="h-4 w-4" />
										) : (
											<SortDesc className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant={viewMode === "cards" ? "default" : "outline"}
										size="sm"
										onClick={() => setViewMode("cards")}
										className="transition-all duration-200"
									>
										<Grid3X3 className="h-4 w-4" />
									</Button>
									<Button
										variant={viewMode === "table" ? "default" : "outline"}
										size="sm"
										onClick={() => setViewMode("table")}
										className="transition-all duration-200"
									>
										<List className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Loading State */}
				{isLoading && (
					<motion.div
						className="flex items-center justify-center py-12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<div className="flex items-center gap-3">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
							<p className="text-lg text-muted-foreground">Загрузка водителей...</p>
						</div>
					</motion.div>
				)}

				{/* Content */}
				{!isLoading && (
					<AnimatePresence mode="wait">
						{viewMode === "cards" ? (
							<motion.div
								key="cards"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
							>
								{filteredAndSortedDrivers.map((driver, index) => {
									const experienceLevel = getExperienceLevel(
										driver.drivingExperienceYears || 0
									);
									const ExperienceIcon = experienceLevel.icon;
									const fullName =
										`${driver.firstName} ${driver.lastName}`.trim();

									return (
										<motion.div
											key={driver.id}
											variants={cardVariants}
											initial="hidden"
											animate="visible"
											whileHover="hover"
											transition={{ delay: index * 0.1 }}
										>
											<Card className="border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
												<CardHeader className="pb-3">
													<div className="flex items-start justify-between">
														<div className="flex items-center gap-3">
															<AvatarGenerator
																firstName={driver.firstName}
																lastName={driver.lastName}
																className="h-12 w-12 ring-2 ring-border"
															/>
															<div>
																<CardTitle className="text-lg group-hover:text-primary transition-colors">
																	{fullName}
																</CardTitle>
																<div className="flex items-center gap-2 mt-1">
																	<ExperienceIcon
																		className={`h-4 w-4 ${experienceLevel.color}`}
																	/>
																	<span
																		className={`text-sm font-medium ${experienceLevel.color}`}
																	>
																		{experienceLevel.label}
																	</span>
																</div>
															</div>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	className="opacity-0 group-hover:opacity-100 transition-opacity"
																>
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuLabel>
																	Действия
																</DropdownMenuLabel>
																<DropdownMenuSeparator />
																<DropdownMenuItem asChild>
																	<Link
																		to={`/drivers/${driver.id}`}
																	>
																		<Eye className="mr-2 h-4 w-4" />
																		Просмотр
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuItem asChild>
																	<Link
																		to={`/drivers/edit/${driver.id}`}
																	>
																		<Edit className="mr-2 h-4 w-4" />
																		Редактировать
																	</Link>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</CardHeader>
												<CardContent className="space-y-4">
													<div className="flex items-center justify-between">
														{getStatusBadge(
															driver.currentDrivingStatus
														)}
														{getRatingStars(4.2)}
													</div>

													<div className="space-y-3">
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Shield className="h-4 w-4" />
															<span>
																Лицензия: {driver.licenseNumber}
															</span>
														</div>

														{driver.phoneNumber && (
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<PhoneCall className="h-4 w-4" />
																<span>{driver.phoneNumber}</span>
															</div>
														)}

														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Clock4 className="h-4 w-4" />
															<span>
																Опыт:{" "}
																{driver.drivingExperienceYears || 0}{" "}
																лет
															</span>
														</div>
													</div>

													<Separator />

													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															Рейтинг
														</span>
														<span className="font-semibold">
															4.2/5.0
														</span>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</motion.div>
						) : (
							<motion.div
								key="table"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
							>
								<Card className="border shadow-sm">
									<Table>
										<TableHeader>
											<TableRow className="border-b-2">
												<TableHead className="font-semibold">
													Водитель
												</TableHead>
												<TableHead className="font-semibold">
													Статус
												</TableHead>
												<TableHead className="font-semibold">
													Рейтинг
												</TableHead>
												<TableHead className="font-semibold">
													Опыт
												</TableHead>
												<TableHead className="font-semibold">
													Контакты
												</TableHead>
												<TableHead className="font-semibold">
													Местоположение
												</TableHead>
												<TableHead className="font-semibold text-right">
													Действия
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredAndSortedDrivers.map((driver, index) => {
												const experienceLevel = getExperienceLevel(
													driver.drivingExperienceYears || 0
												);
												const ExperienceIcon = experienceLevel.icon;
												const fullName =
													`${driver.firstName} ${driver.lastName}`.trim();

												return (
													<motion.tr
														key={driver.id}
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: index * 0.05 }}
														className="group hover:bg-muted/50 transition-colors"
													>
														<TableCell>
															<div className="flex items-center gap-3">
																<AvatarGenerator
																	firstName={driver.firstName}
																	lastName={driver.lastName}
																	className="h-10 w-10"
																/>
																<div>
																	<p className="font-medium group-hover:text-primary transition-colors">
																		{fullName}
																	</p>
																	<div className="flex items-center gap-1 mt-1">
																		<ExperienceIcon
																			className={`h-3 w-3 ${experienceLevel.color}`}
																		/>
																		<span
																			className={`text-xs ${experienceLevel.color}`}
																		>
																			{experienceLevel.label}
																		</span>
																	</div>
																</div>
															</div>
														</TableCell>
														<TableCell>
															{getStatusBadge(
																driver.currentDrivingStatus
															)}
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																{getRatingStars(4.2)}
																<span className="text-sm font-medium">
																	4.2
																</span>
															</div>
														</TableCell>
														<TableCell>
															<span className="font-medium">
																{driver.drivingExperienceYears || 0}{" "}
																лет
															</span>
														</TableCell>
														<TableCell>
															<div className="space-y-1">
																{driver.phoneNumber && (
																	<div className="flex items-center gap-1 text-sm">
																		<PhoneCall className="h-3 w-3" />
																		{driver.phoneNumber}
																	</div>
																)}
															</div>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-1 text-sm max-w-48">
																<MapIcon className="h-3 w-3 flex-shrink-0" />
																<span className="truncate">
																	Неизвестно
																</span>
															</div>
														</TableCell>
														<TableCell className="text-right">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="opacity-0 group-hover:opacity-100 transition-opacity"
																	>
																		<MoreHorizontal className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuLabel>
																		Действия
																	</DropdownMenuLabel>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem asChild>
																		<Link
																			to={`/drivers/${driver.id}`}
																		>
																			<Eye className="mr-2 h-4 w-4" />
																			Просмотр
																		</Link>
																	</DropdownMenuItem>
																	<DropdownMenuItem asChild>
																		<Link
																			to={`/drivers/edit/${driver.id}`}
																		>
																			<Edit className="mr-2 h-4 w-4" />
																			Редактировать
																		</Link>
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</motion.tr>
												);
											})}
										</TableBody>
									</Table>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				)}

				{/* Empty State */}
				{!isLoading && filteredAndSortedDrivers.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-12"
					>
						<div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
							<Users className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Водители не найдены</h3>
						<p className="text-muted-foreground mb-4">
							{searchQuery || filterStatus !== "ALL"
								? "Попробуйте изменить параметры поиска или фильтры"
								: "Начните с добавления первого водителя"}
						</p>
						{!searchQuery && filterStatus === "ALL" && (
							<Button asChild>
								<Link to="/drivers/create">
									<Plus className="mr-2 h-4 w-4" />
									Добавить водителя
								</Link>
							</Button>
						)}
					</motion.div>
				)}
			</motion.div>
		</TooltipProvider>
	);
}
