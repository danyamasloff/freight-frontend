import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Plus,
	Search,
	Filter,
	MoreHorizontal,
	Edit,
	Eye,
	Trash2,
	Route,
	MapPin,
	Clock,
	Truck,
	User,
	AlertTriangle,
	CheckCircle2,
	Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useGetRoutesQuery, useDeleteRouteMutation } from "@/shared/api/routesSlice";
import { ROUTES } from "@/shared/constants";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_CONFIG = {
	DRAFT: { label: "Черновик", variant: "secondary" as const, icon: Edit },
	CALCULATED: { label: "Рассчитан", variant: "default" as const, icon: CheckCircle2 },
	IN_PROGRESS: { label: "В процессе", variant: "default" as const, icon: Clock },
	COMPLETED: { label: "Завершен", variant: "default" as const, icon: CheckCircle2 },
};

export function RoutesPage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [deleteRouteId, setDeleteRouteId] = useState<number | null>(null);

	// API hooks
	const { data: routes = [], isLoading, error } = useGetRoutesQuery();
	const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

	// Фильтрация маршрутов
	const filteredRoutes = routes.filter((route) => {
		const matchesSearch =
			searchQuery === "" ||
			route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			route.startAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
			route.endAddress.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "all" || route.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const handleDelete = async () => {
		if (!deleteRouteId) return;

		try {
			await deleteRoute(deleteRouteId).unwrap();
			setDeleteRouteId(null);
		} catch (error) {
			console.error("Ошибка удаления маршрута:", error);
		}
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}ч ${mins}мин` : `${mins}мин`;
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
							<h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
							<p className="text-muted-foreground">
								Не удалось загрузить список маршрутов
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Заголовок и статистика */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Маршруты</h1>
					<p className="text-muted-foreground">Управление маршрутами грузоперевозок</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate(`${ROUTES.ROUTE_PLANNER}`)}>
						<Calculator className="h-4 w-4 mr-2" />
						Планировщик
					</Button>
					<Button onClick={() => navigate(`${ROUTES.ROUTE_CREATE}`)}>
						<Plus className="h-4 w-4 mr-2" />
						Создать маршрут
					</Button>
				</div>
			</div>

			{/* Статистика */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-2xl font-bold">{routes.length}</p>
								<p className="text-sm text-muted-foreground">Всего маршрутов</p>
							</div>
							<Route className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-2xl font-bold">
									{routes.filter((r) => r.status === "IN_PROGRESS").length}
								</p>
								<p className="text-sm text-muted-foreground">В процессе</p>
							</div>
							<Clock className="h-8 w-8 text-orange-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-2xl font-bold">
									{routes.filter((r) => r.status === "COMPLETED").length}
								</p>
								<p className="text-sm text-muted-foreground">Завершено</p>
							</div>
							<CheckCircle2 className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-2xl font-bold">
									{Math.round(routes.reduce((sum, r) => sum + r.distance, 0))}
								</p>
								<p className="text-sm text-muted-foreground">Общий км</p>
							</div>
							<MapPin className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Фильтры и поиск */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Поиск по названию или адресам..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Статус" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Все статусы</SelectItem>
								<SelectItem value="DRAFT">Черновик</SelectItem>
								<SelectItem value="CALCULATED">Рассчитан</SelectItem>
								<SelectItem value="IN_PROGRESS">В процессе</SelectItem>
								<SelectItem value="COMPLETED">Завершен</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Таблица маршрутов */}
			<Card>
				<CardHeader>
					<CardTitle>Список маршрутов ({filteredRoutes.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredRoutes.length === 0 ? (
						<div className="text-center py-12">
							<Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								{searchQuery || statusFilter !== "all"
									? "Маршруты не найдены"
									: "Нет маршрутов"}
							</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery || statusFilter !== "all"
									? "Попробуйте изменить параметры поиска"
									: "Создайте первый маршрут или воспользуйтесь планировщиком"}
							</p>
							{!searchQuery && statusFilter === "all" && (
								<div className="flex gap-2 justify-center">
									<Button
										variant="outline"
										onClick={() => navigate(`${ROUTES.ROUTE_PLANNER}`)}
									>
										<Calculator className="h-4 w-4 mr-2" />
										Планировщик
									</Button>
									<Button onClick={() => navigate(`${ROUTES.ROUTE_CREATE}`)}>
										<Plus className="h-4 w-4 mr-2" />
										Создать маршрут
									</Button>
								</div>
							)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Название</TableHead>
									<TableHead>Маршрут</TableHead>
									<TableHead>Статус</TableHead>
									<TableHead>Расстояние</TableHead>
									<TableHead>Время</TableHead>
									<TableHead>Создан</TableHead>
									<TableHead className="w-[70px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredRoutes.map((route) => {
									const statusConfig =
										STATUS_CONFIG[route.status] || STATUS_CONFIG.DRAFT;
									const StatusIcon = statusConfig.icon;

									return (
										<TableRow
											key={route.id}
											className="cursor-pointer hover:bg-muted/50"
										>
											<TableCell
												className="font-medium"
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<div className="flex items-center gap-3">
													<div className="flex-shrink-0">
														<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
															<Route className="h-5 w-5 text-primary" />
														</div>
													</div>
													<div>
														<div className="font-medium">
															{route.name}
														</div>
														{route.vehicleId && (
															<div className="text-sm text-muted-foreground flex items-center gap-1">
																<Truck className="h-3 w-3" />
																ТС #{route.vehicleId}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<div className="space-y-1">
													<div className="text-sm font-medium">
														{route.startAddress}
													</div>
													<div className="text-xs text-muted-foreground flex items-center gap-1">
														<MapPin className="h-3 w-3" />
														{route.endAddress}
													</div>
												</div>
											</TableCell>
											<TableCell
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<Badge
													variant={statusConfig.variant}
													className="flex items-center gap-1 w-fit"
												>
													<StatusIcon className="h-3 w-3" />
													{statusConfig.label}
												</Badge>
											</TableCell>
											<TableCell
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<div className="font-medium">
													{Math.round(route.distance)} км
												</div>
											</TableCell>
											<TableCell
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<div className="font-medium">
													{formatDuration(route.duration)}
												</div>
											</TableCell>
											<TableCell
												onClick={() =>
													navigate(`${ROUTES.ROUTES}/${route.id}`)
												}
											>
												<div className="text-sm text-muted-foreground">
													{format(new Date(route.createdAt), "dd.MM.yy", {
														locale: ru,
													})}
												</div>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>
															Действия
														</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																navigate(
																	`${ROUTES.ROUTES}/${route.id}`
																)
															}
														>
															<Eye className="h-4 w-4 mr-2" />
															Просмотр
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																navigate(
																	`${ROUTES.ROUTES}/${route.id}/edit`
																)
															}
														>
															<Edit className="h-4 w-4 mr-2" />
															Редактировать
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																setDeleteRouteId(route.id)
															}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Удалить
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Диалог удаления */}
			<AlertDialog open={!!deleteRouteId} onOpenChange={() => setDeleteRouteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
						<AlertDialogDescription>
							Вы действительно хотите удалить этот маршрут? Это действие нельзя
							отменить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Удаление..." : "Удалить"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

export default RoutesPage;
