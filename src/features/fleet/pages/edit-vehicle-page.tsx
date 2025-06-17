import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	Truck,
	Hash,
	Gauge,
	Fuel,
	ArrowLeft,
	Save,
	Loader2,
	AlertCircle,
	Calendar,
	Settings,
	Info,
	Car,
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

import { useGetVehicleQuery, useUpdateVehicleMutation } from "@/shared/api/vehiclesApiSlice";
import { ROUTES } from "@/shared/constants";

// Схема валидации
const vehicleEditSchema = z.object({
	registrationNumber: z.string().min(1, "Государственный номер обязателен"),
	manufacturer: z.string().min(1, "Производитель обязателен"),
	model: z.string().min(1, "Модель обязательна"),
	year: z
		.number()
		.min(1900, "Год выпуска должен быть валидным")
		.max(new Date().getFullYear() + 1),
	fuelCapacity: z.number().min(1, "Объем топливного бака должен быть больше 0"),
	currentFuelLevel: z.number().min(0, "Текущий уровень топлива не может быть отрицательным"),
	currentOdometer: z.number().min(0, "Пробег не может быть отрицательным"),
	maxLoad: z.number().min(0, "Максимальная загрузка не может быть отрицательной"),
	fuelType: z.enum(["DIESEL", "GASOLINE", "ELECTRIC", "HYBRID"]),
	vehicleType: z.enum(["TRUCK", "VAN", "TRAILER", "OTHER"]),
	status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]),
	description: z.string().optional(),
});

type VehicleEditForm = z.infer<typeof vehicleEditSchema>;

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

const inputVariants = {
	focus: { scale: 1.02, transition: { duration: 0.2 } },
	blur: { scale: 1, transition: { duration: 0.2 } },
};

export function EditVehiclePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("basic");

	// RTK Query hooks
	const { data: vehicle, isLoading, error } = useGetVehicleQuery(Number(id));
	const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

	// Форма
	const form = useForm<VehicleEditForm>({
		resolver: zodResolver(vehicleEditSchema),
		defaultValues: {
			registrationNumber: "",
			manufacturer: "",
			model: "",
			year: new Date().getFullYear(),
			fuelCapacity: 0,
			currentFuelLevel: 0,
			currentOdometer: 0,
			maxLoad: 0,
			fuelType: "DIESEL",
			vehicleType: "TRUCK",
			status: "AVAILABLE",
			description: "",
		},
	});

	// Заполняем форму данными транспортного средства
	useEffect(() => {
		if (vehicle) {
			form.reset({
				registrationNumber: vehicle.registrationNumber || "",
				manufacturer: vehicle.manufacturer || "",
				model: vehicle.model || "",
				year: vehicle.year || new Date().getFullYear(),
				fuelCapacity: vehicle.fuelCapacity || 0,
				currentFuelLevel: vehicle.currentFuelLevel || 0,
				currentOdometer: vehicle.currentOdometer || 0,
				maxLoad: vehicle.maxLoad || 0,
				fuelType: vehicle.fuelType || "DIESEL",
				vehicleType: vehicle.vehicleType || "TRUCK",
				status: vehicle.status || "AVAILABLE",
				description: vehicle.description || "",
			});
		}
	}, [vehicle, form]);

	const onSubmit = async (data: VehicleEditForm) => {
		try {
			await updateVehicle({
				id: Number(id),
				data,
			}).unwrap();

			toast({
				title: "Успешно!",
				description: "Данные транспортного средства обновлены",
				duration: 3000,
			});

			navigate(`/fleet/${id}`);
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось обновить данные транспортного средства",
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const getFuelLevelColor = (level: number, capacity: number) => {
		const percentage = (level / capacity) * 100;
		if (percentage > 60) return "text-green-600";
		if (percentage > 30) return "text-yellow-600";
		return "text-red-600";
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "AVAILABLE":
				return "bg-green-100 text-green-800";
			case "IN_USE":
				return "bg-blue-100 text-blue-800";
			case "MAINTENANCE":
				return "bg-yellow-100 text-yellow-800";
			case "OUT_OF_SERVICE":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
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
							{Array.from({ length: 8 }).map((_, i) => (
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
						Ошибка загрузки данных транспортного средства. Попробуйте обновить страницу.
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
				<Link to={`/fleet/${id}`}>
					<Button variant="outline" size="icon" className="hover-lift">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gradient">Редактирование ТС</h1>
					<p className="text-muted-foreground">
						{vehicle?.registrationNumber} - {vehicle?.manufacturer} {vehicle?.model}
					</p>
				</div>
				{vehicle?.status && (
					<Badge className={`animate-fade-in ${getStatusColor(vehicle.status)}`}>
						{vehicle.status}
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
									<TabsTrigger value="basic" className="flex items-center gap-2">
										<Car className="h-4 w-4" />
										Основное
									</TabsTrigger>
									<TabsTrigger
										value="technical"
										className="flex items-center gap-2"
									>
										<Settings className="h-4 w-4" />
										Техническое
									</TabsTrigger>
									<TabsTrigger value="status" className="flex items-center gap-2">
										<Gauge className="h-4 w-4" />
										Состояние
									</TabsTrigger>
								</TabsList>

								<AnimatePresence mode="wait">
									<TabsContent value="basic" asChild>
										<motion.div
											key="basic"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Car className="h-5 w-5" />
													Основная информация
												</CardTitle>
												<CardDescription>
													Базовые данные о транспортном средстве
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="registrationNumber"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Hash className="h-4 w-4" />
																	Государственный номер
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			placeholder="А123АА123"
																			className="transition-all duration-200"
																			style={{
																				textTransform:
																					"uppercase",
																			}}
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="vehicleType"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Truck className="h-4 w-4" />
																	Тип ТС
																</FormLabel>
																<Select
																	onValueChange={field.onChange}
																	defaultValue={field.value}
																>
																	<FormControl>
																		<SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
																			<SelectValue placeholder="Выберите тип" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="TRUCK">
																			Грузовик
																		</SelectItem>
																		<SelectItem value="VAN">
																			Фургон
																		</SelectItem>
																		<SelectItem value="TRAILER">
																			Прицеп
																		</SelectItem>
																		<SelectItem value="OTHER">
																			Другое
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="manufacturer"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Производитель</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			placeholder="Mercedes, Volvo, МАЗ..."
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="model"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Модель</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			placeholder="Actros, FH16..."
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="year"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Calendar className="h-4 w-4" />
																	Год выпуска
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			type="number"
																			min="1900"
																			max={
																				new Date().getFullYear() +
																				1
																			}
																			placeholder="2020"
																			onChange={(e) =>
																				field.onChange(
																					parseInt(
																						e.target
																							.value
																					) || 0
																				)
																			}
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="fuelType"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Fuel className="h-4 w-4" />
																	Тип топлива
																</FormLabel>
																<Select
																	onValueChange={field.onChange}
																	defaultValue={field.value}
																>
																	<FormControl>
																		<SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
																			<SelectValue placeholder="Выберите тип топлива" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="DIESEL">
																			Дизель
																		</SelectItem>
																		<SelectItem value="GASOLINE">
																			Бензин
																		</SelectItem>
																		<SelectItem value="ELECTRIC">
																			Электричество
																		</SelectItem>
																		<SelectItem value="HYBRID">
																			Гибрид
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name="description"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-2">
																<Info className="h-4 w-4" />
																Описание
															</FormLabel>
															<FormControl>
																<motion.div
																	variants={inputVariants}
																	whileFocus="focus"
																	initial="blur"
																>
																	<Input
																		{...field}
																		placeholder="Дополнительная информация о ТС"
																		className="transition-all duration-200"
																	/>
																</motion.div>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="technical" asChild>
										<motion.div
											key="technical"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Settings className="h-5 w-5" />
													Технические характеристики
												</CardTitle>
												<CardDescription>
													Грузоподъемность и параметры топливной системы
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="maxLoad"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Максимальная загрузка (кг)
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			type="number"
																			step="1"
																			min="0"
																			placeholder="0"
																			onChange={(e) =>
																				field.onChange(
																					parseFloat(
																						e.target
																							.value
																					) || 0
																				)
																			}
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="fuelCapacity"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Fuel className="h-4 w-4" />
																	Объем топливного бака (л)
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			type="number"
																			step="1"
																			min="1"
																			placeholder="0"
																			onChange={(e) =>
																				field.onChange(
																					parseFloat(
																						e.target
																							.value
																					) || 0
																				)
																			}
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="status" asChild>
										<motion.div
											key="status"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Gauge className="h-5 w-5" />
													Текущее состояние
												</CardTitle>
												<CardDescription>
													Пробег, топливо и статус ТС
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
																		<SelectItem value="AVAILABLE">
																			Доступен
																		</SelectItem>
																		<SelectItem value="IN_USE">
																			В использовании
																		</SelectItem>
																		<SelectItem value="MAINTENANCE">
																			На обслуживании
																		</SelectItem>
																		<SelectItem value="OUT_OF_SERVICE">
																			Не в эксплуатации
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="currentOdometer"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Gauge className="h-4 w-4" />
																	Пробег (км)
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			type="number"
																			step="1"
																			min="0"
																			placeholder="0"
																			onChange={(e) =>
																				field.onChange(
																					parseFloat(
																						e.target
																							.value
																					) || 0
																				)
																			}
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="currentFuelLevel"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Fuel
																		className={`h-4 w-4 ${getFuelLevelColor(field.value, form.watch("fuelCapacity"))}`}
																	/>
																	Текущий уровень топлива (л)
																</FormLabel>
																<FormControl>
																	<motion.div
																		variants={inputVariants}
																		whileFocus="focus"
																		initial="blur"
																	>
																		<Input
																			{...field}
																			type="number"
																			step="0.1"
																			min="0"
																			max={form.watch(
																				"fuelCapacity"
																			)}
																			placeholder="0"
																			onChange={(e) =>
																				field.onChange(
																					parseFloat(
																						e.target
																							.value
																					) || 0
																				)
																			}
																			className="transition-all duration-200"
																		/>
																	</motion.div>
																</FormControl>
																{form.watch("fuelCapacity") > 0 && (
																	<p className="text-sm text-muted-foreground">
																		{(
																			(field.value /
																				form.watch(
																					"fuelCapacity"
																				)) *
																			100
																		).toFixed(1)}
																		% от полного бака
																	</p>
																)}
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
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
								<Link to={`/fleet/${id}`}>
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
