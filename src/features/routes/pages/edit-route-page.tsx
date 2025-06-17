import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
	MapPin,
	Route,
	Clock,
	ArrowLeft,
	Save,
	Loader2,
	Plus,
	Trash2,
	GripVertical,
	Navigation,
	Calendar,
	AlertCircle,
	Map,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { useGetRouteQuery, useUpdateRouteMutation } from "@/shared/api/routesSlice";
import { useGetVehiclesWithAvailabilityQuery } from "@/shared/api/vehiclesApiSlice";
import { useGetDriversWithAvailabilityQuery } from "@/shared/api/driversSlice";
import { useGetCargosWithAvailabilityQuery } from "@/shared/api/cargoSlice";
import { PlaceSearchEnhanced } from "@/features/geocoding";
import { RouteMap } from "@/features/maps";
import { ROUTES, ROUTE_STATUS } from "@/shared/constants";

// Схема валидации
const waypointSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Название точки обязательно"),
	address: z.string().min(1, "Адрес обязателен"),
	latitude: z.number(),
	longitude: z.number(),
	waypointType: z.string().default("WAYPOINT"),
	stayDurationMinutes: z.number().min(0).default(0),
});

const routeEditSchema = z.object({
	name: z.string().min(2, "Название маршрута должно содержать минимум 2 символа"),
	startAddress: z.string().min(1, "Адрес отправления обязателен"),
	endAddress: z.string().min(1, "Адрес назначения обязателен"),
	startLat: z.number(),
	startLon: z.number(),
	endLat: z.number(),
	endLon: z.number(),
	departureTime: z.string().optional(),
	status: z.enum(["DRAFT", "PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
	waypoints: z.array(waypointSchema).default([]),
	vehicleId: z.number().optional(),
	driverId: z.number().optional(),
	cargoId: z.number().optional(),
});

type RouteEditForm = z.infer<typeof routeEditSchema>;

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const mapVariants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export function EditRoutePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("details");
	const [showMap, setShowMap] = useState(false);

	// RTK Query hooks
	const { data: route, isLoading, error } = useGetRouteQuery(Number(id));
	const [updateRoute, { isLoading: isUpdating }] = useUpdateRouteMutation();
	const { data: vehicles = [] } = useGetVehiclesWithAvailabilityQuery({ forRouteId: Number(id) });
	const { data: drivers = [] } = useGetDriversWithAvailabilityQuery({ forRouteId: Number(id) });
	const { data: cargos = [] } = useGetCargosWithAvailabilityQuery({ forRouteId: Number(id) });

	// Форма
	const form = useForm<RouteEditForm>({
		resolver: zodResolver(routeEditSchema),
		defaultValues: {
			name: "",
			startAddress: "",
			endAddress: "",
			startLat: 0,
			startLon: 0,
			endLat: 0,
			endLon: 0,
			departureTime: "",
			status: "DRAFT",
			waypoints: [],
		},
	});

	const { fields, append, remove, move } = useFieldArray({
		control: form.control,
		name: "waypoints",
	});

	// Заполняем форму данными маршрута
	useEffect(() => {
		if (route) {
			const departureTime = route.departureTime
				? new Date(route.departureTime).toISOString().slice(0, 16)
				: "";

			form.reset({
				name: route.name || "",
				startAddress: route.startAddress || "",
				endAddress: route.endAddress || "",
				startLat: route.startLat || 0,
				startLon: route.startLon || 0,
				endLat: route.endLat || 0,
				endLon: route.endLon || 0,
				departureTime,
				status: route.status || "DRAFT",
				waypoints:
					route.waypoints?.map((wp, index) => ({
						id: wp.id?.toString() || index.toString(),
						name: wp.name || "",
						address: wp.address || "",
						latitude: wp.latitude || 0,
						longitude: wp.longitude || 0,
						waypointType: wp.waypointType || "WAYPOINT",
						stayDurationMinutes: wp.stayDurationMinutes || 0,
					})) || [],
				vehicleId: route.vehicleId,
				driverId: route.driverId,
				cargoId: route.cargoId,
			});

			if (route.startLat && route.startLon) {
				setShowMap(true);
			}
		}
	}, [route, form]);

	const onSubmit = async (data: RouteEditForm) => {
		try {
			await updateRoute({
				id: Number(id),
				data: {
					...data,
					departureTime: data.departureTime || undefined,
					waypoints: data.waypoints.map((wp) => ({
						name: wp.name,
						address: wp.address,
						latitude: wp.latitude,
						longitude: wp.longitude,
						waypointType: wp.waypointType,
						stayDurationMinutes: wp.stayDurationMinutes,
					})),
				},
			}).unwrap();

			toast({
				title: "Успешно!",
				description: "Маршрут обновлен",
				duration: 3000,
			});

			navigate(`/routes/${id}`);
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось обновить маршрут",
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const handleAddWaypoint = () => {
		append({
			id: Date.now().toString(),
			name: "",
			address: "",
			latitude: 0,
			longitude: 0,
			waypointType: "WAYPOINT",
			stayDurationMinutes: 0,
		});
	};

	const handleStartAddressSelect = (place: any) => {
		form.setValue("startAddress", place.address);
		form.setValue("startLat", place.latitude);
		form.setValue("startLon", place.longitude);
		setShowMap(true);
	};

	const handleEndAddressSelect = (place: any) => {
		form.setValue("endAddress", place.address);
		form.setValue("endLat", place.latitude);
		form.setValue("endLon", place.longitude);
		setShowMap(true);
	};

	const handleWaypointAddressSelect = (index: number, place: any) => {
		form.setValue(`waypoints.${index}.address`, place.address);
		form.setValue(`waypoints.${index}.latitude`, place.latitude);
		form.setValue(`waypoints.${index}.longitude`, place.longitude);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<Skeleton className="h-8 w-1/4" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-1/3" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-4 w-1/4" />
									<Skeleton className="h-10 w-full" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<motion.div
				className="container mx-auto p-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Ошибка загрузки данных маршрута. Попробуйте обновить страницу.
					</AlertDescription>
				</Alert>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="container mx-auto p-6 space-y-6"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Заголовок */}
			<motion.div variants={itemVariants} className="flex items-center gap-4">
				<Link to={`/routes/${id}`}>
					<Button variant="outline" size="icon" className="hover-lift">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gradient">Редактирование маршрута</h1>
					<p className="text-muted-foreground">{route?.name || `Маршрут #${id}`}</p>
				</div>
				{route?.status && (
					<Badge
						variant={route.status === "COMPLETED" ? "default" : "secondary"}
						className="animate-fade-in"
					>
						{route.status}
					</Badge>
				)}
			</motion.div>

			{/* Форма */}
			<motion.div variants={itemVariants}>
				<Card className="claude-card">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger
										value="details"
										className="flex items-center gap-2"
									>
										<Route className="h-4 w-4" />
										Детали
									</TabsTrigger>
									<TabsTrigger
										value="waypoints"
										className="flex items-center gap-2"
									>
										<MapPin className="h-4 w-4" />
										Точки
									</TabsTrigger>
									<TabsTrigger value="map" className="flex items-center gap-2">
										<Map className="h-4 w-4" />
										Карта
									</TabsTrigger>
								</TabsList>

								<AnimatePresence mode="wait">
									<TabsContent value="details" asChild>
										<motion.div
											key="details"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Route className="h-5 w-5" />
													Основная информация
												</CardTitle>
												<CardDescription>
													Настройки маршрута и адреса
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="name"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Route className="h-4 w-4" />
																	Название маршрута
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="Введите название"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="status"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Статус</FormLabel>
																<Select
																	onValueChange={field.onChange}
																	defaultValue={field.value}
																>
																	<FormControl>
																		<SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
																			<SelectValue placeholder="Выберите статус" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="DRAFT">
																			Черновик
																		</SelectItem>
																		<SelectItem value="PLANNED">
																			Запланирован
																		</SelectItem>
																		<SelectItem value="IN_PROGRESS">
																			В процессе
																		</SelectItem>
																		<SelectItem value="COMPLETED">
																			Завершен
																		</SelectItem>
																		<SelectItem value="CANCELLED">
																			Отменен
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="departureTime"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Calendar className="h-4 w-4" />
																	Время отправления
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="datetime-local"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<div className="space-y-4">
													<FormField
														control={form.control}
														name="startAddress"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Navigation className="h-4 w-4" />
																	Адрес отправления
																</FormLabel>
																<FormControl>
																	<PlaceSearchEnhanced
																		placeholder="Введите адрес отправления"
																		onPlaceSelect={
																			handleStartAddressSelect
																		}
																		defaultValue={field.value}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="endAddress"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<MapPin className="h-4 w-4" />
																	Адрес назначения
																</FormLabel>
																<FormControl>
																	<PlaceSearchEnhanced
																		placeholder="Введите адрес назначения"
																		onPlaceSelect={
																			handleEndAddressSelect
																		}
																		defaultValue={field.value}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="waypoints" asChild>
										<motion.div
											key="waypoints"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<MapPin className="h-5 w-5" />
													Промежуточные точки
												</CardTitle>
												<CardDescription>
													Добавьте остановки на маршруте
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<Reorder.Group
													axis="y"
													values={fields}
													onReorder={(newOrder) => {
														newOrder.forEach((item, index) => {
															const oldIndex = fields.findIndex(
																(field) => field.id === item.id
															);
															if (oldIndex !== index) {
																move(oldIndex, index);
															}
														});
													}}
													className="space-y-4"
												>
													{fields.map((field, index) => (
														<Reorder.Item
															key={field.id}
															value={field}
															className="group"
														>
															<motion.div
																initial={{ opacity: 0, y: 20 }}
																animate={{ opacity: 1, y: 0 }}
																exit={{ opacity: 0, y: -20 }}
																className="claude-card p-4 cursor-grab active:cursor-grabbing"
															>
																<div className="flex items-start gap-4">
																	<GripVertical className="h-5 w-5 text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />

																	<div className="flex-1 space-y-4">
																		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																			<FormField
																				control={
																					form.control
																				}
																				name={`waypoints.${index}.name`}
																				render={({
																					field,
																				}) => (
																					<FormItem>
																						<FormLabel>
																							Название
																							точки
																						</FormLabel>
																						<FormControl>
																							<Input
																								{...field}
																								placeholder="Название"
																								className="transition-all duration-200 focus:scale-[1.02]"
																							/>
																						</FormControl>
																						<FormMessage />
																					</FormItem>
																				)}
																			/>

																			<FormField
																				control={
																					form.control
																				}
																				name={`waypoints.${index}.stayDurationMinutes`}
																				render={({
																					field,
																				}) => (
																					<FormItem>
																						<FormLabel className="flex items-center gap-2">
																							<Clock className="h-4 w-4" />
																							Время
																							стоянки
																							(мин)
																						</FormLabel>
																						<FormControl>
																							<Input
																								{...field}
																								type="number"
																								min="0"
																								placeholder="0"
																								onChange={(
																									e
																								) =>
																									field.onChange(
																										parseInt(
																											e
																												.target
																												.value
																										) ||
																											0
																									)
																								}
																								className="transition-all duration-200 focus:scale-[1.02]"
																							/>
																						</FormControl>
																						<FormMessage />
																					</FormItem>
																				)}
																			/>
																		</div>

																		<FormField
																			control={form.control}
																			name={`waypoints.${index}.address`}
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel>
																						Адрес
																					</FormLabel>
																					<FormControl>
																						<PlaceSearchEnhanced
																							placeholder="Введите адрес точки"
																							onPlaceSelect={(
																								place
																							) =>
																								handleWaypointAddressSelect(
																									index,
																									place
																								)
																							}
																							defaultValue={
																								field.value
																							}
																						/>
																					</FormControl>
																					<FormMessage />
																				</FormItem>
																			)}
																		/>
																	</div>

																	<Button
																		type="button"
																		variant="outline"
																		size="icon"
																		onClick={() =>
																			remove(index)
																		}
																		className="hover:bg-destructive hover:text-destructive-foreground"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</motion.div>
														</Reorder.Item>
													))}
												</Reorder.Group>

												<Button
													type="button"
													variant="outline"
													onClick={handleAddWaypoint}
													className="w-full border-dashed hover-lift"
												>
													<Plus className="mr-2 h-4 w-4" />
													Добавить точку
												</Button>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="map" asChild>
										<motion.div
											key="map"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Map className="h-5 w-5" />
													Предварительный просмотр
												</CardTitle>
												<CardDescription>
													Карта маршрута с точками
												</CardDescription>
											</CardHeader>
											<CardContent>
												<AnimatePresence>
													{showMap && (
														<motion.div
															variants={mapVariants}
															initial="hidden"
															animate="visible"
															exit="hidden"
															className="h-96 rounded-lg overflow-hidden border"
														>
															<RouteMap
																startPoint={
																	form.watch("startLat") &&
																	form.watch("startLon")
																		? {
																				lat: form.watch(
																					"startLat"
																				),
																				lng: form.watch(
																					"startLon"
																				),
																				address:
																					form.watch(
																						"startAddress"
																					),
																			}
																		: undefined
																}
																endPoint={
																	form.watch("endLat") &&
																	form.watch("endLon")
																		? {
																				lat: form.watch(
																					"endLat"
																				),
																				lng: form.watch(
																					"endLon"
																				),
																				address:
																					form.watch(
																						"endAddress"
																					),
																			}
																		: undefined
																}
																waypoints={
																	form
																		.watch("waypoints")
																		?.map((wp) => ({
																			lat: wp.latitude,
																			lng: wp.longitude,
																			address: wp.address,
																			name: wp.name,
																		})) || []
																}
																height="100%"
															/>
														</motion.div>
													)}
												</AnimatePresence>

												{!showMap && (
													<div className="h-96 flex items-center justify-center bg-muted rounded-lg border-2 border-dashed">
														<div className="text-center">
															<Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
															<p className="text-muted-foreground">
																Добавьте адреса для отображения
																карты
															</p>
														</div>
													</div>
												)}
											</CardContent>
										</motion.div>
									</TabsContent>
								</AnimatePresence>
							</Tabs>

							{/* Кнопки действий */}
							<motion.div
								variants={itemVariants}
								className="flex justify-between items-center pt-6 border-t"
							>
								<Link to={`/routes/${id}`}>
									<Button variant="outline">Отмена</Button>
								</Link>

								<Button
									type="submit"
									disabled={isUpdating}
									className="interactive-button-claude min-w-[120px]"
								>
									{isUpdating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Сохранение...
										</>
									) : (
										<>
											<Save className="mr-2 h-4 w-4" />
											Сохранить
										</>
									)}
								</Button>
							</motion.div>
						</form>
					</Form>
				</Card>
			</motion.div>
		</motion.div>
	);
}

export default EditRoutePage;
