import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	User,
	Phone,
	MapPin,
	Gauge,
	DollarSign,
	ArrowLeft,
	Save,
	Loader2,
	CheckCircle,
	AlertCircle,
	Clock,
	Fuel,
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
import { useToast } from "@/hooks/use-toast";

import { useGetDriverQuery, useUpdateDriverMutation } from "@/shared/api/driversSlice";
import { ROUTES } from "@/shared/constants";

// Схема валидации
const driverEditSchema = z.object({
	firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
	lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
	middleName: z.string().optional(),
	phoneNumber: z.string().min(10, "Номер телефона должен содержать минимум 10 цифр"),
	licenseNumber: z.string().min(5, "Номер водительского удостоверения обязателен"),
	ratePerKm: z.number().min(0, "Ставка за км не может быть отрицательной"),
	hourlyRate: z.number().min(0, "Почасовая ставка не может быть отрицательной"),
	fuelConsumptionPer100Km: z.number().min(1, "Расход топлива должен быть больше 0"),
	email: z.string().email("Неверный формат email").optional().or(z.literal("")),
	address: z.string().optional(),
});

type DriverEditForm = z.infer<typeof driverEditSchema>;

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

export function EditDriverPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("basic");

	// RTK Query hooks
	const { data: driver, isLoading, error } = useGetDriverQuery(Number(id));
	const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();

	// Форма
	const form = useForm<DriverEditForm>({
		resolver: zodResolver(driverEditSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			middleName: "",
			phoneNumber: "",
			licenseNumber: "",
			ratePerKm: 0,
			hourlyRate: 0,
			fuelConsumptionPer100Km: 0,
			email: "",
			address: "",
		},
	});

	// Заполняем форму данными водителя
	useEffect(() => {
		if (driver) {
			form.reset({
				firstName: driver.firstName || "",
				lastName: driver.lastName || "",
				middleName: driver.middleName || "",
				phoneNumber: driver.phoneNumber || "",
				licenseNumber: driver.licenseNumber || "",
				ratePerKm: driver.ratePerKm || 0,
				hourlyRate: driver.hourlyRate || 0,
				fuelConsumptionPer100Km: driver.fuelConsumptionPer100Km || 0,
				email: driver.email || "",
				address: driver.address || "",
			});
		}
	}, [driver, form]);

	const onSubmit = async (data: DriverEditForm) => {
		try {
			await updateDriver({
				id: Number(id),
				data,
			}).unwrap();

			toast({
				title: "Успешно!",
				description: "Данные водителя обновлены",
				duration: 3000,
			});

			navigate(`/drivers/${id}`);
		} catch (error) {
			toast({
				title: "Ошибка",
				description: "Не удалось обновить данные водителя",
				variant: "destructive",
				duration: 5000,
			});
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
						Ошибка загрузки данных водителя. Попробуйте обновить страницу.
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
				<Link to={`/drivers/${id}`}>
					<Button variant="outline" size="icon" className="hover-lift">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gradient">Редактирование водителя</h1>
					<p className="text-muted-foreground">
						{driver?.firstName} {driver?.lastName}
					</p>
				</div>
				{driver?.status && (
					<Badge
						variant={driver.status === "AVAILABLE" ? "default" : "secondary"}
						className="animate-fade-in"
					>
						{driver.status}
					</Badge>
				)}
			</motion.div>

			{/* Форма */}
			<motion.div variants={itemVariants}>
				<Card className="claude-card">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="basic" className="flex items-center gap-2">
										<User className="h-4 w-4" />
										Основные данные
									</TabsTrigger>
									<TabsTrigger
										value="parameters"
										className="flex items-center gap-2"
									>
										<Gauge className="h-4 w-4" />
										Параметры
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
													<User className="h-5 w-5" />
													Личные данные
												</CardTitle>
												<CardDescription>
													Основная информация о водителе
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="firstName"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<User className="h-4 w-4" />
																	Имя
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="Введите имя"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="lastName"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<User className="h-4 w-4" />
																	Фамилия
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="Введите фамилию"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="middleName"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Отчество</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="Введите отчество"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="phoneNumber"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Phone className="h-4 w-4" />
																	Телефон
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="+7 (999) 123-45-67"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="email"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Email</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="email"
																		placeholder="email@example.com"
																		className="transition-all duration-200 focus:scale-[1.02]"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="licenseNumber"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Номер удостоверения
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="1234 567890"
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
													name="address"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-2">
																<MapPin className="h-4 w-4" />
																Адрес
															</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder="Введите адрес"
																	className="transition-all duration-200 focus:scale-[1.02]"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</CardContent>
										</motion.div>
									</TabsContent>

									<TabsContent value="parameters" asChild>
										<motion.div
											key="parameters"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.3 }}
											className="space-y-6"
										>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Gauge className="h-5 w-5" />
													Рабочие параметры
												</CardTitle>
												<CardDescription>
													Ставки и характеристики работы
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name="ratePerKm"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<DollarSign className="h-4 w-4" />
																	Ставка за км (₽)
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		step="0.01"
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

													<FormField
														control={form.control}
														name="hourlyRate"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Clock className="h-4 w-4" />
																	Почасовая ставка (₽)
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		step="0.01"
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

													<FormField
														control={form.control}
														name="fuelConsumptionPer100Km"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2">
																	<Fuel className="h-4 w-4" />
																	Расход топлива (л/100км)
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		step="0.1"
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
								<Link to={`/drivers/${id}`}>
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
