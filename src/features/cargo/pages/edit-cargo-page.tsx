import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	Package,
	Weight,
	Boxes,
	ArrowLeft,
	Save,
	Loader2,
	AlertCircle,
	AlertTriangle,
	Thermometer,
	FileText,
	Shield,
	Info,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { useGetCargoQuery, useUpdateCargoMutation } from "@/shared/api/cargoSlice";
import { ROUTES } from "@/shared/constants";

// Схема валидации
const cargoEditSchema = z.object({
	name: z.string().min(2, "Название груза должно содержать минимум 2 символа"),
	description: z.string().optional(),
	cargoType: z.enum(["STANDARD", "FRAGILE", "HAZARDOUS", "PERISHABLE", "OVERSIZED"]),
	weightKg: z.number().min(0.1, "Вес должен быть больше 0"),
	volumeM3: z.number().min(0, "Объем не может быть отрицательным"),
	isHazardous: z.boolean().default(false),
	hazardClass: z.string().optional(),
	unNumber: z.string().optional(),
	packingGroup: z.enum(["I", "II", "III"]).optional(),
	temperatureMin: z.number().optional(),
	temperatureMax: z.number().optional(),
	isTemperatureControlled: z.boolean().default(false),
	specialInstructions: z.string().optional(),
	status: z.enum(["READY", "IN_TRANSIT", "DELIVERED", "DELAYED"]),
});

type CargoEditForm = z.infer<typeof cargoEditSchema>;

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

const bannerVariants = {
	hidden: { opacity: 0, scale: 0.95, y: -10 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		y: -10,
		transition: { duration: 0.3 },
	},
};

export function EditCargoPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("basic");

	// RTK Query hooks
	const { data: cargo, isLoading, error } = useGetCargoQuery(Number(id));
	const [updateCargo, { isLoading: isUpdating }] = useUpdateCargoMutation();

	// Форма
	const form = useForm<CargoEditForm>({
		resolver: zodResolver(cargoEditSchema),
		defaultValues: {
			name: "",
			description: "",
			cargoType: "STANDARD",
			weightKg: 0,
			volumeM3: 0,
			isHazardous: false,
			hazardClass: "",
			unNumber: "",
			temperatureMin: 0,
			temperatureMax: 0,
			isTemperatureControlled: false,
			specialInstructions: "",
			status: "READY",
		},
	});

	// Следим за изменениями опасности груза
	const isHazardous = form.watch("isHazardous");
	const isTemperatureControlled = form.watch("isTemperatureControlled");

	// Заполняем форму данными груза
	useEffect(() => {
		if (cargo) {
			form.reset({
				name: cargo.name || "",
				description: cargo.description || "",
				cargoType: cargo.cargoType || "STANDARD",
				weightKg: cargo.weightKg || 0,
				volumeM3: cargo.volumeM3 || 0,
				isHazardous: cargo.isHazardous || false,
				hazardClass: cargo.hazardClass || "",
				unNumber: cargo.unNumber || "",
				packingGroup: cargo.packingGroup,
				temperatureMin: cargo.temperatureMin || 0,
				temperatureMax: cargo.temperatureMax || 0,
				isTemperatureControlled: cargo.isTemperatureControlled || false,
				specialInstructions: cargo.specialInstructions || "",
				status: cargo.status || "READY",
			});
		}
	}, [cargo, form]);

	const onSubmit = async (data: CargoEditForm) => {
		try {
			await updateCargo({
				id: Number(id),
				data,
			}).unwrap();

			toast({
				title: "Успешно!",
				description: "Данные груза обновлены",
				duration: 3000,
			});

			navigate(`/cargo/${id}`);
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось обновить данные груза",
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "READY":
				return "bg-green-100 text-green-800";
			case "IN_TRANSIT":
				return "bg-blue-100 text-blue-800";
			case "DELIVERED":
				return "bg-purple-100 text-purple-800";
			case "DELAYED":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getCargoTypeIcon = (type: string) => {
		switch (type) {
			case "FRAGILE":
				return "🔍";
			case "HAZARDOUS":
				return "⚠️";
			case "PERISHABLE":
				return "❄️";
			case "OVERSIZED":
				return "📦";
			default:
				return "📋";
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
						Ошибка загрузки данных груза. Попробуйте обновить страницу.
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
				<Link to={`/cargo/${id}`}>
					<Button variant="outline" size="icon" className="hover-lift">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gradient">Редактирование груза</h1>
					<p className="text-muted-foreground">{cargo?.name || `Груз #${id}`}</p>
				</div>
				{cargo?.status && (
					<Badge className={`animate-fade-in ${getStatusColor(cargo.status)}`}>
						{getCargoTypeIcon(cargo.cargoType || "STANDARD")} {cargo.status}
					</Badge>
				)}
			</motion.div>

			{/* Warning Banner для опасных грузов */}
			<AnimatePresence>
				{isHazardous && (
					<motion.div
						variants={bannerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<Alert className="border-orange-200 bg-orange-50">
							<AlertTriangle className="h-4 w-4 text-orange-600" />
							<AlertDescription className="text-orange-800">
								<strong>Внимание!</strong> Груз классифицирован как опасный.
								Tребуется специальное обращение и документооборот согласно
								международным стандартам ADR.
							</AlertDescription>
						</Alert>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Форма */}
			<motion.div variants={itemVariants}>
				<Card className="claude-card">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="basic" className="flex items-center gap-2">
										<Package className="h-4 w-4" />
										Основное
									</TabsTrigger>
									<TabsTrigger value="safety" className="flex items-center gap-2">
										<Shield className="h-4 w-4" />
										Безопасность
									</TabsTrigger>
									<TabsTrigger
										value="conditions"
										className="flex items-center gap-2"
									>
										<Thermometer className="h-4 w-4" />
										Условия
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
													<Package className="h-5 w-5" />
													Основная информация
												</CardTitle>
												<CardDescription>
													Название, тип и физические характеристики груза
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="name"
														render={({ field }) => (
															<FormItem className="col-span-full">
																<FormLabel className="flex items-center gap-2">
																	<Package className="h-4 w-4" />
																	Название груза
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="Введите название груза"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="cargoType"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Тип груза</FormLabel>
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
																		<SelectItem value="STANDARD">
																			📋 Стандартный
																		</SelectItem>
																		<SelectItem value="FRAGILE">
																			🔍 Хрупкий
																		</SelectItem>
																		<SelectItem value="HAZARDOUS">
																			⚠️ Опасный
																		</SelectItem>
																		<SelectItem value="PERISHABLE">
																			❄️ Скоропортящийся
																		</SelectItem>
																		<SelectItem value="OVERSIZED">
																			📦 Негабаритный
																		</SelectItem>
																	</SelectContent>
																</Select>
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
																		<SelectItem value="READY">
																			Готов к отправке
																		</SelectItem>
																		<SelectItem value="IN_TRANSIT">
																			В пути
																		</SelectItem>
																		<SelectItem value="DELIVERED">
																			Доставлен
																		</SelectItem>
																		<SelectItem value="DELAYED">
																			Задержан
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="weightKg"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Weight className="h-4 w-4" />
																	Вес (кг)
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		step="0.1"
																		min="0.1"
																		placeholder="0.0"
																		onChange={(e) =>
																			field.onChange(
																				parseFloat(
																					e.target.value
																				) || 0
																			)
																		}
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="volumeM3"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Boxes className="h-4 w-4" />
																	Объем (м³)
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		step="0.01"
																		min="0"
																		placeholder="0.00"
																		onChange={(e) =>
																			field.onChange(
																				parseFloat(
																					e.target.value
																				) || 0
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
													name="description"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-2">
																<FileText className="h-4 w-4" />
																Описание
															</FormLabel>
															<FormControl>
																<Textarea
																	{...field}
																	placeholder="Подробное описание груза"
																	className="transition-all duration-200 focus:scale-[1.01] min-h-[100px]"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="safety" asChild>
										<motion.div
											key="safety"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Shield className="h-5 w-5" />
													Безопасность и классификация
												</CardTitle>
												<CardDescription>
													Параметры для опасных и специальных грузов
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<FormField
													control={form.control}
													name="isHazardous"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={field.onChange}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel className="flex items-center gap-2">
																	<AlertTriangle className="h-4 w-4 text-orange-600" />
																	Опасный груз
																</FormLabel>
																<p className="text-sm text-muted-foreground">
																	Груз требует специального
																	обращения согласно ADR
																</p>
															</div>
														</FormItem>
													)}
												/>

												<AnimatePresence>
													{isHazardous && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.3 }}
															className="space-y-4"
														>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<FormField
																	control={form.control}
																	name="hazardClass"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				Класс опасности
																			</FormLabel>
																			<FormControl>
																				<Input
																					{...field}
																					placeholder="1.1, 2.1, 3..."
																					className="transition-all duration-200 focus:scale-[1.02]"
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<FormField
																	control={form.control}
																	name="unNumber"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				UN номер
																			</FormLabel>
																			<FormControl>
																				<Input
																					{...field}
																					placeholder="UN1234"
																					className="transition-all duration-200 focus:scale-[1.02]"
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<FormField
																	control={form.control}
																	name="packingGroup"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				Группа упаковки
																			</FormLabel>
																			<Select
																				onValueChange={
																					field.onChange
																				}
																				defaultValue={
																					field.value
																				}
																			>
																				<FormControl>
																					<SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
																						<SelectValue placeholder="Выберите группу" />
																					</SelectTrigger>
																				</FormControl>
																				<SelectContent>
																					<SelectItem value="I">
																						I - Высокая
																						опасность
																					</SelectItem>
																					<SelectItem value="II">
																						II - Средняя
																						опасность
																					</SelectItem>
																					<SelectItem value="III">
																						III - Низкая
																						опасность
																					</SelectItem>
																				</SelectContent>
																			</Select>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="conditions" asChild>
										<motion.div
											key="conditions"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Thermometer className="h-5 w-5" />
													Условия транспортировки
												</CardTitle>
												<CardDescription>
													Температурный режим и специальные требования
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<FormField
													control={form.control}
													name="isTemperatureControlled"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={field.onChange}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel className="flex items-center gap-2">
																	<Thermometer className="h-4 w-4 text-blue-600" />
																	Требуется температурный контроль
																</FormLabel>
																<p className="text-sm text-muted-foreground">
																	Груз требует поддержания
																	определенной температуры
																</p>
															</div>
														</FormItem>
													)}
												/>

												<AnimatePresence>
													{isTemperatureControlled && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.3 }}
															className="space-y-4"
														>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<FormField
																	control={form.control}
																	name="temperatureMin"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				Минимальная
																				температура (°C)
																			</FormLabel>
																			<FormControl>
																				<Input
																					{...field}
																					type="number"
																					step="0.1"
																					placeholder="-18"
																					onChange={(e) =>
																						field.onChange(
																							parseFloat(
																								e
																									.target
																									.value
																							) || 0
																						)
																					}
																					className="transition-all duration-200 focus:scale-[1.02]"
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<FormField
																	control={form.control}
																	name="temperatureMax"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				Максимальная
																				температура (°C)
																			</FormLabel>
																			<FormControl>
																				<Input
																					{...field}
																					type="number"
																					step="0.1"
																					placeholder="4"
																					onChange={(e) =>
																						field.onChange(
																							parseFloat(
																								e
																									.target
																									.value
																							) || 0
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
														</motion.div>
													)}
												</AnimatePresence>

												<FormField
													control={form.control}
													name="specialInstructions"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-2">
																<Info className="h-4 w-4" />
																Специальные инструкции
															</FormLabel>
															<FormControl>
																<Textarea
																	{...field}
																	placeholder="Особые требования к погрузке, разгрузке, транспортировке..."
																	className="transition-all duration-200 focus:scale-[1.01] min-h-[100px]"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
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
								<Link to={`/cargo/${id}`}>
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

export default EditCargoPage;
