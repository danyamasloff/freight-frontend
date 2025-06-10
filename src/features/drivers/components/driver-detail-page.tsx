import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Edit,
	Loader2,
	MapPin,
	Phone,
	Mail,
	XCircle,
	AlertTriangle,
	CreditCard,
	Shield,
	TrendingUp,
	Car,
	Route,
	Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { useGetDriverQuery, useDeleteDriverMutation } from "@/shared/api/driversSlice";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime } from "@/shared/utils/format";
import { LICENSE_CATEGORIES, DRIVER_STATUS_CONFIG, type DrivingStatus } from "../types";
import { DriverStatusPanel } from "./driver-status-panel";
import { RestTimeAnalysis } from "./rest-time-analysis";

export function DriverDetailPage() {
	const { id } = useParams<{ id: string }>();
	const driverId = parseInt(id || "0");
	const navigate = useNavigate();
	const { toast } = useToast();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");

	const { data: driver, isLoading, error } = useGetDriverQuery(driverId);
	const [deleteDriver, { isLoading: isDeleting }] = useDeleteDriverMutation();

	useEffect(() => {
		if (!id || isNaN(driverId)) {
			navigate("/drivers");
		}
	}, [id, driverId, navigate]);

	const handleDelete = async () => {
		try {
			await deleteDriver(driverId).unwrap();
			toast({
				title: "Водитель удален",
				description: "Водитель успешно удален из системы.",
			});
			navigate("/drivers");
		} catch (error) {
			toast({
				title: "Ошибка удаления",
				description: "Не удалось удалить водителя. Пожалуйста, попробуйте еще раз.",
				variant: "destructive",
			});
			console.error("Error deleting driver:", error);
		} finally {
			setDeleteDialogOpen(false);
		}
	};

	const getLicenseCategoryLabel = (category: string) => {
		const categoryInfo = LICENSE_CATEGORIES.find((c) => c.value === category);
		return categoryInfo?.label || category;
	};

	const getStatusBadge = (status: DrivingStatus) => {
		const config = DRIVER_STATUS_CONFIG[status];
		if (!config) {
			return (
				<Badge variant="secondary">
					<span className="mr-1">❓</span>
					Неизвестно
				</Badge>
			);
		}

		return (
			<Badge variant={status === "DRIVING" ? "default" : "secondary"}>
				<span className="mr-1">{config.icon}</span>
				{config.label}
			</Badge>
		);
	};

	const isDocumentExpiringSoon = (expiryDate?: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const now = new Date();
		const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
		return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
	};

	const isDocumentExpired = (expiryDate?: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const now = new Date();
		return expiry < now;
	};

	const getDocumentStatus = (expiryDate?: string) => {
		if (!expiryDate) return { status: "unknown", icon: null, color: "text-muted-foreground" };

		if (isDocumentExpired(expiryDate)) {
			return {
				status: "expired",
				icon: <XCircle className="h-4 w-4 text-red-500" />,
				color: "text-red-500",
			};
		}

		if (isDocumentExpiringSoon(expiryDate)) {
			return {
				status: "expiring",
				icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
				color: "text-yellow-500",
			};
		}

		return {
			status: "valid",
			icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
			color: "text-green-500",
		};
	};

	if (error) {
		return (
			<Alert variant="destructive" className="mx-auto max-w-4xl mt-8">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Ошибка</AlertTitle>
				<AlertDescription>
					Не удалось загрузить данные о водителе. Пожалуйста, попробуйте позже.
				</AlertDescription>
				<Button variant="outline" className="mt-4" onClick={() => navigate("/drivers")}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
				</Button>
			</Alert>
		);
	}

	return (
		<div className="container py-8">
			<div className="flex items-center mb-6 text-muted-foreground">
				<Button variant="link" asChild className="p-0">
					<Link to="/drivers">Водители</Link>
				</Button>
				<ChevronRight className="h-4 w-4 mx-2" />
				<span className="text-foreground font-medium">
					{isLoading
						? "Загрузка..."
						: `${driver?.firstName || ""} ${driver?.lastName || ""}`.trim() ||
							"Детали водителя"}
				</span>
			</div>

			<div className="grid grid-cols-12 gap-6">
				{/* Main Content */}
				<div className="col-span-8">
					<Card className="mb-6">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center gap-4">
								{isLoading ? (
									<Skeleton className="h-16 w-16 rounded-full" />
								) : (
									<AvatarGenerator
										firstName={driver?.firstName}
										lastName={driver?.lastName}
										size="xl"
									/>
								)}
								<div>
									<CardTitle className="text-2xl">
										{isLoading ? (
											<Skeleton className="h-8 w-48" />
										) : (
											`${driver?.firstName || ""} ${driver?.lastName || ""}`.trim()
										)}
									</CardTitle>
									<CardDescription className="flex items-center gap-2 mt-1">
										{isLoading ? (
											<Skeleton className="h-4 w-32" />
										) : (
											<>
												<CreditCard className="h-4 w-4" />
												{driver?.licenseNumber}
												{driver?.phoneNumber && (
													<>
														<Separator
															orientation="vertical"
															className="h-4"
														/>
														<Phone className="h-4 w-4" />
														{driver.phoneNumber}
													</>
												)}
											</>
										)}
									</CardDescription>
								</div>
							</div>
							<div className="flex space-x-2">
								{!isLoading && (
									<>
										<Button variant="outline" size="sm" asChild>
											<Link to={`/drivers/edit/${driverId}`}>
												<Edit className="h-4 w-4 mr-1" /> Редактировать
											</Link>
										</Button>
										<Dialog
											open={deleteDialogOpen}
											onOpenChange={setDeleteDialogOpen}
										>
											<DialogTrigger asChild>
												<Button variant="outline" size="sm">
													Удалить
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Удаление водителя</DialogTitle>
													<DialogDescription>
														Вы уверены, что хотите удалить водителя "
														{driver?.firstName} {driver?.lastName}"? Это
														действие нельзя отменить.
													</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<Button
														variant="outline"
														onClick={() => setDeleteDialogOpen(false)}
													>
														Отмена
													</Button>
													<Button
														variant="destructive"
														onClick={handleDelete}
														disabled={isDeleting}
													>
														{isDeleting && (
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														)}
														Удалить
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="space-y-4">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-5/6" />
								</div>
							) : (
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-2">
										<div className="text-sm text-muted-foreground">
											Текущий статус
										</div>
										<div>
											{driver?.currentDrivingStatus
												? getStatusBadge(driver.currentDrivingStatus)
												: "-"}
										</div>
									</div>

									<div className="space-y-2">
										<div className="text-sm text-muted-foreground">
											Стаж вождения
										</div>
										<div className="font-medium">
											{driver?.drivingExperienceYears
												? `${driver.drivingExperienceYears} лет`
												: "Не указан"}
										</div>
									</div>

									<div className="space-y-2">
										<div className="text-sm text-muted-foreground">Рейтинг</div>
										<div className="font-medium">
											<div className="flex items-center gap-1">
												<span>★ 4.2</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="overview">Обзор</TabsTrigger>
							<TabsTrigger value="documents">Документы</TabsTrigger>
							<TabsTrigger value="rates">Тарифы</TabsTrigger>
							<TabsTrigger value="rto">Анализ РТО</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6 mt-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Контактная информация</CardTitle>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<div className="space-y-4">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-3/4" />
										</div>
									) : (
										<div className="grid grid-cols-2 gap-4">
											<div className="flex items-center gap-3">
												<Phone className="h-4 w-4 text-muted-foreground" />
												<div>
													<div className="text-sm text-muted-foreground">
														Телефон
													</div>
													<div className="font-medium">
														{driver?.phoneNumber || "Не указан"}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<div>
													<div className="text-sm text-muted-foreground">
														Email
													</div>
													<div className="font-medium">
														{driver?.email || "Не указан"}
													</div>
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Категории водительского удостоверения
									</CardTitle>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<Skeleton className="h-4 w-full" />
									) : driver?.licenseCategories ? (
										<div className="flex flex-wrap gap-2">
											{driver.licenseCategories.split(",").map((category) => (
												<Badge key={category.trim()} variant="secondary">
													{getLicenseCategoryLabel(category.trim())}
												</Badge>
											))}
										</div>
									) : (
										<p className="text-muted-foreground">
											Категории не указаны
										</p>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">История изменений</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Дата создания
											</span>
											<span className="font-medium flex items-center">
												<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
												{isLoading ? (
													<Skeleton className="h-4 w-24" />
												) : (
													formatDateTime(driver?.createdAt || "")
												)}
											</span>
										</div>

										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Последнее обновление
											</span>
											<span className="font-medium flex items-center">
												<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
												{isLoading ? (
													<Skeleton className="h-4 w-24" />
												) : (
													formatDateTime(driver?.updatedAt || "")
												)}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="documents" className="space-y-6 mt-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Документы и разрешения
									</CardTitle>
									<CardDescription>
										Статус действующих документов и разрешений водителя
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* License Expiry */}
									{driver?.licenseExpiryDate && (
										<div className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center gap-3">
												<CreditCard className="h-5 w-5 text-muted-foreground" />
												<div>
													<div className="font-medium">
														Водительское удостоверение
													</div>
													<div className="text-sm text-muted-foreground">
														Действительно до:{" "}
														{formatDate(driver.licenseExpiryDate)}
													</div>
												</div>
											</div>
											{getDocumentStatus(driver.licenseExpiryDate).icon}
										</div>
									)}

									{/* Expiring Documents Alert */}
									{driver &&
										[
											{
												date: driver.licenseExpiryDate,
												name: "Водительское удостоверение",
											},
										].some(
											(doc) =>
												isDocumentExpiringSoon(doc.date) ||
												isDocumentExpired(doc.date)
										) && (
											<Alert variant="destructive">
												<AlertTriangle className="h-4 w-4" />
												<AlertDescription>
													<strong>Внимание!</strong> У водителя есть
													документы, которые истекают в ближайшее время
													или уже просрочены.
												</AlertDescription>
											</Alert>
										)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="rates" className="space-y-6 mt-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Тарифы оплаты</CardTitle>
									<CardDescription>
										Настройки оплаты труда водителя
									</CardDescription>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<div className="space-y-4">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-3/4" />
										</div>
									) : (
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<div className="text-sm text-muted-foreground">
													Почасовая ставка
												</div>
												<div className="text-2xl font-bold">
													{driver?.hourlyRate
														? `${driver.hourlyRate} ₽/час`
														: "Не указана"}
												</div>
											</div>

											<div className="space-y-2">
												<div className="text-sm text-muted-foreground">
													Ставка за километр
												</div>
												<div className="text-2xl font-bold">
													{driver?.perKilometerRate
														? `${driver.perKilometerRate} ₽/км`
														: "Не указана"}
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Earnings Calculator */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Калькулятор заработка</CardTitle>
									<CardDescription>
										Примерный расчет оплаты за рейс
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-8 text-muted-foreground">
										<TrendingUp className="h-12 w-12 mx-auto mb-4" />
										<p>
											Калькулятор будет доступен после назначения водителя на
											маршрут
										</p>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="rto" className="mt-6">
							<RestTimeAnalysis
								driverId={driverId}
								// route and departureTime would be passed from parent when available
							/>
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="col-span-4 space-y-6">
					<DriverStatusPanel driverId={driverId} />

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Быстрые действия</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button className="w-full justify-start" asChild>
								<Link to={`/routes/create?driverId=${driverId}`}>
									<Route className="mr-2 h-4 w-4" /> Назначить на маршрут
								</Link>
							</Button>

							<Button variant="outline" className="w-full justify-start">
								<Car className="mr-2 h-4 w-4" /> Назначить транспорт
							</Button>

							<Button variant="outline" className="w-full justify-start">
								<Calendar className="mr-2 h-4 w-4" /> Расписание работы
							</Button>

							<Button variant="outline" className="w-full justify-start" asChild>
								<Link to={`/drivers/edit/${driverId}`}>
									<Settings className="mr-2 h-4 w-4" /> Настройки
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Последняя активность</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-6 text-muted-foreground">
								<Clock className="h-8 w-8 mx-auto mb-2" />
								<p className="text-sm">История активности пуста</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
