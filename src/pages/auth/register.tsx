import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Loader2,
	AlertCircle,
	CheckCircle,
	UserPlus,
	TruckIcon,
	ArrowRight,
	Shield,
	Database,
	BarChart3,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRegisterMutation } from "@/shared/api/authSlice.ts";
import Blackhole from "@/components/ui/blackhole";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GlowContainer } from "@/components/ui/glow-container";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const registerSchema = z
	.object({
		username: z
			.string()
			.min(3, "Имя пользователя должно содержать минимум 3 символа")
			.max(50, "Слишком длинное имя пользователя")
			.regex(
				/^[a-zA-Z0-9._-]+$/,
				"Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания"
			),
		email: z.string().email("Некорректный email адрес").max(100, "Слишком длинный email"),
		firstName: z
			.string()
			.min(2, "Имя должно содержать минимум 2 символа")
			.max(50, "Слишком длинное имя"),
		lastName: z
			.string()
			.min(2, "Фамилия должна содержать минимум 2 символа")
			.max(50, "Слишком длинная фамилия"),
		password: z
			.string()
			.min(8, "Пароль должен содержать минимум 8 символов")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Пароль должен содержать строчные и заглавные буквы, а также цифры"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [register, { isLoading, error }] = useRegisterMutation();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		register: registerField,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			firstName: "",
			lastName: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: RegisterFormData) => {
		try {
			const { confirmPassword, ...registerData } = data;
			await register(registerData).unwrap();

			setRegistrationSuccess(true);
			toast({
				title: "Регистрация успешна",
				description: "Аккаунт был создан. Теперь вы можете войти в систему.",
			});

			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err: any) {
			toast({
				title: "Ошибка регистрации",
				description: err.data?.message || "Произошла ошибка при регистрации",
				variant: "destructive",
			});
		}
	};

	const errorMessage =
		error && "data" in error
			? (error.data as any)?.message || "Произошла ошибка при регистрации"
			: error && "message" in error
				? error.message
				: null;

	if (!mounted) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-orange-500" />
			</div>
		);
	}

	if (registrationSuccess) {
		return (
			<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-orange-950">
				<div className="absolute inset-0 z-0">
					<Blackhole
						strokeColor="rgba(75, 85, 99, 0.5)"
						numberOfLines={60}
						numberOfDiscs={40}
						particleRGBColor={[75, 85, 99]}
					/>
				</div>

				<div className="absolute inset-0 bg-gradient-to-br from-black/90 via-transparent to-orange-950/90 z-10" />

				<div className="relative z-20 min-h-screen flex items-center justify-center p-6">
					<Card className="backdrop-blur-xl bg-black/40 border-orange-500/30 shadow-2xl w-full max-w-md">
						<CardContent className="text-center py-16">
							<div className="flex justify-center mb-8">
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
									<div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-full shadow-2xl">
										<CheckCircle className="h-16 w-16 text-white" />
									</div>
								</div>
							</div>

							<AnimatedGradientText
								as="h2"
								className="text-4xl mb-4"
								colors={["from-orange-400", "via-amber-400", "to-yellow-400"]}
							>
								Добро пожаловать!
							</AnimatedGradientText>
							<p className="text-gray-300 text-lg mb-8 leading-relaxed">
								Ваш аккаунт в системе управления грузоперевозками успешно создан.
								Теперь у вас есть доступ к полному функционалу аналитической
								подсистемы.
							</p>

							<div className="space-y-4 mb-8">
								<div className="flex items-center justify-center space-x-3 text-orange-300">
									<Shield className="h-5 w-5" />
									<span>Защищенный доступ активирован</span>
								</div>
								<div className="flex items-center justify-center space-x-3 text-orange-300">
									<Database className="h-5 w-5" />
									<span>Аналитические инструменты доступны</span>
								</div>
								<div className="flex items-center justify-center space-x-3 text-orange-300">
									<BarChart3 className="h-5 w-5" />
									<span>Система мониторинга подключена</span>
								</div>
							</div>

							<div className="flex items-center justify-center space-x-2 text-orange-400">
								<Loader2 className="h-5 w-5 animate-spin" />
								<span className="text-lg">
									Перенаправление на страницу входа...
								</span>
							</div>

							<p className="text-gray-500 text-sm mt-4">
								Автоматический переход через несколько секунд
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-orange-900">
			{/* Интерактивная черная дыра */}
			<div className="absolute inset-0 z-0">
				<Blackhole
					strokeColor="rgba(75, 85, 99, 0.4)"
					numberOfLines={100}
					numberOfDiscs={80}
					particleRGBColor={[75, 85, 99]}
				/>
			</div>

			{/* Градиентный оверлей */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/90 via-transparent to-orange-950/95 z-10" />

			{/* Floating particles effect */}
			<FloatingParticles
				count={60}
				color="bg-orange-400/30"
				minSize={1}
				maxSize={5}
				className="z-10"
			/>

			{/* Основной контент */}
			<div className="relative z-20 min-h-screen flex">
				{/* Левая часть - информация о регистрации */}
				<div className="hidden lg:flex flex-1 flex-col justify-center px-12 py-16">
					<div className="max-w-lg">
						<div className="flex items-center space-x-3 mb-8">
							<div className="p-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-2xl">
								<UserPlus className="h-8 w-8 text-white" />
							</div>
							<div>
								<AnimatedGradientText
									as="h1"
									className="text-3xl"
									colors={["from-white", "via-orange-200", "to-amber-200"]}
								>
									Присоединяйтесь
								</AnimatedGradientText>
								<p className="text-gray-400 text-sm">к экосистеме TruckNavigator</p>
							</div>
						</div>

						<h2 className="text-4xl font-bold text-white mb-6 leading-tight">
							Начните управлять{" "}
							<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
								логистикой будущего
							</span>
						</h2>

						<p className="text-gray-300 text-lg mb-8 leading-relaxed">
							Получите доступ к передовым инструментам аналитики, оптимизации
							маршрутов и управления автопарком в едином интерфейсе.
						</p>

						<div className="space-y-4">
							<div className="flex items-start space-x-4 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg mt-1">
									<Shield className="h-5 w-5 text-orange-400" />
								</div>
								<div>
									<h4 className="font-semibold mb-1">Безопасность данных</h4>
									<p className="text-sm text-gray-400">
										Корпоративная защита и шифрование
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg mt-1">
									<Database className="h-5 w-5 text-amber-400" />
								</div>
								<div>
									<h4 className="font-semibold mb-1">Аналитика и отчеты</h4>
									<p className="text-sm text-gray-400">
										Детальная статистика в реальном времени
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg mt-1">
									<BarChart3 className="h-5 w-5 text-orange-500" />
								</div>
								<div>
									<h4 className="font-semibold mb-1">Умная оптимизация</h4>
									<p className="text-sm text-gray-400">
										Современные алгоритмы планирования
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Правая часть - форма регистрации */}
				<div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-12">
					<div className="w-full max-w-lg">
						<GlowContainer glowColor="orange" intensity="high" animated>
							<Card className="backdrop-blur-xl bg-black/40 border-orange-500/20 shadow-2xl">
								<CardHeader className="text-center pb-6 pt-8">
									<div className="flex justify-center mb-6 lg:hidden">
										<div className="p-4 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-2xl">
											<UserPlus className="h-8 w-8 text-white" />
										</div>
									</div>

									<h1 className="text-2xl font-bold text-white mb-2">
										Создать аккаунт
									</h1>
									<p className="text-gray-400">
										Зарегистрируйтесь в системе управления грузоперевозками
									</p>
								</CardHeader>

								<CardContent className="space-y-6">
									{errorMessage && (
										<Alert
											variant="destructive"
											className="bg-red-950/50 border-red-500/50"
										>
											<AlertCircle className="h-4 w-4" />
											<AlertDescription className="text-red-200">
												{errorMessage}
											</AlertDescription>
										</Alert>
									)}

									<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-200">
													Имя
												</label>
												<div className="relative group">
													<User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
													<Input
														{...registerField("firstName")}
														placeholder="Иван"
														className="pl-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
														disabled={isLoading}
														autoComplete="given-name"
													/>
												</div>
												{errors.firstName && (
													<p className="text-xs text-red-400">
														{errors.firstName.message}
													</p>
												)}
											</div>

											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-200">
													Фамилия
												</label>
												<div className="relative group">
													<User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
													<Input
														{...registerField("lastName")}
														placeholder="Иванов"
														className="pl-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
														disabled={isLoading}
														autoComplete="family-name"
													/>
												</div>
												{errors.lastName && (
													<p className="text-xs text-red-400">
														{errors.lastName.message}
													</p>
												)}
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-200">
												Имя пользователя
											</label>
											<div className="relative group">
												<User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...registerField("username")}
													placeholder="username"
													className="pl-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
													disabled={isLoading}
													autoComplete="username"
												/>
											</div>
											{errors.username && (
												<p className="text-sm text-red-400">
													{errors.username.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-200">
												Email адрес
											</label>
											<div className="relative group">
												<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...registerField("email")}
													type="email"
													placeholder="email@example.com"
													className="pl-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
													disabled={isLoading}
													autoComplete="email"
												/>
											</div>
											{errors.email && (
												<p className="text-sm text-red-400">
													{errors.email.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-200">
												Пароль
											</label>
											<div className="relative group">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...registerField("password")}
													type={showPassword ? "text" : "password"}
													placeholder="Создайте надежный пароль"
													className="pl-10 pr-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
													disabled={isLoading}
													autoComplete="new-password"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-3 text-gray-400 hover:text-orange-400 transition-colors"
													disabled={isLoading}
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
											{errors.password && (
												<p className="text-sm text-red-400">
													{errors.password.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-200">
												Подтвердите пароль
											</label>
											<div className="relative group">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...registerField("confirmPassword")}
													type={showConfirmPassword ? "text" : "password"}
													placeholder="Повторите пароль"
													className="pl-10 pr-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
													disabled={isLoading}
													autoComplete="new-password"
												/>
												<button
													type="button"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
													className="absolute right-3 top-3 text-gray-400 hover:text-orange-400 transition-colors"
													disabled={isLoading}
												>
													{showConfirmPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
											{errors.confirmPassword && (
												<p className="text-sm text-red-400">
													{errors.confirmPassword.message}
												</p>
											)}
										</div>

										<Button
											type="submit"
											disabled={isLoading || isSubmitting}
											className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
											size="lg"
										>
											{isLoading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Создание аккаунта...
												</>
											) : (
												<>
													Создать аккаунт
													<ArrowRight className="ml-2 h-4 w-4" />
												</>
											)}
										</Button>
									</form>

									<div className="text-center pt-4 border-t border-gray-700">
										<p className="text-sm text-gray-400">
											Уже есть аккаунт?{" "}
											<Link
												to="/login"
												className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
											>
												Войти в систему
											</Link>
										</p>
									</div>
								</CardContent>
							</Card>
						</GlowContainer>

						<div className="text-center mt-8">
							<p className="text-xs text-gray-500">
								Регистрируясь, вы соглашаетесь с условиями использования системы
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
