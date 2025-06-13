import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Eye,
	EyeOff,
	User,
	Lock,
	Loader2,
	AlertCircle,
	TruckIcon,
	BarChart3,
	Route,
	MapPin,
	ChevronRight,
} from "lucide-react";

import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation } from "@/shared/api/authSlice";
import { useAppDispatch } from "@/shared/hooks/redux";
import { setCredentials } from "@/app/store/authSlice";
import Blackhole from "@/components/ui/blackhole";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GlowContainer } from "@/components/ui/glow-container";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const loginSchema = z.object({
	username: z.string().min(1, "Имя пользователя не может быть пустым"),
	password: z.string().min(1, "Пароль не может быть пустым"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { toast } = useToast();
	const [login, { isLoading, error }] = useLoginMutation();
	const [showPassword, setShowPassword] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			console.log("Attempting login with:", { username: data.username });
			const result = await login(data).unwrap();

			if (!result.token) {
				console.error("No token in response:", result);
				throw new Error("No token received from server");
			}

			localStorage.setItem("token", result.token);
			localStorage.setItem("refreshToken", result.refreshToken || "");
			localStorage.setItem("username", result.username || "");

			dispatch(setCredentials(result));

			toast({
				title: "Успешный вход",
				description: "Добро пожаловать в систему управления грузоперевозками!",
			});

			navigate("/dashboard");
		} catch (err: any) {
			console.error("Login error:", err);
			toast({
				title: "Ошибка входа",
				description: err.data?.message || "Неверное имя пользователя или пароль",
				variant: "destructive",
			});
		}
	};

	const errorMessage =
		error && "data" in error
			? (error.data as any)?.message || "Произошла ошибка при входе"
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

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
			{/* Интерактивная черная дыра */}
			<div className="absolute inset-0 z-0">
				<Blackhole
					strokeColor="rgba(75, 85, 99, 0.4)"
					numberOfLines={80}
					numberOfDiscs={60}
					particleRGBColor={[75, 85, 99]}
				/>
			</div>

			{/* Градиентный оверлей */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/90 via-transparent to-gray-950/95 z-10" />

			{/* Floating particles effect */}
			<FloatingParticles
				count={40}
				color="bg-orange-400/20"
				minSize={1}
				maxSize={4}
				className="z-10"
			/>

			{/* Основной контент */}
			<div className="relative z-20 min-h-screen flex">
				{/* Левая часть - информация о системе */}
				<div className="hidden lg:flex flex-1 flex-col justify-center px-12 py-16">
					<div className="max-w-lg">
						<div className="flex items-center space-x-3 mb-8">
							<div className="p-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-2xl">
								<TruckIcon className="h-8 w-8 text-white" />
							</div>
							<div>
								<AnimatedGradientText
									as="h1"
									className="text-3xl"
									colors={["from-white", "via-orange-200", "to-amber-200"]}
								>
									TruckNavigator
								</AnimatedGradientText>
								<p className="text-gray-400 text-sm">
									Аналитическая подсистема АСУ
								</p>
							</div>
						</div>

						<h2 className="text-4xl font-bold text-white mb-6 leading-tight">
							Система управления{" "}
							<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
								грузовыми перевозками
							</span>
						</h2>

						<p className="text-gray-300 text-lg mb-8 leading-relaxed">
							Комплексное решение для оптимизации логистических процессов на
							автомобильном транспорте с использованием современной аналитики.
						</p>

						<div className="space-y-4">
							<div className="flex items-center space-x-3 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg">
									<BarChart3 className="h-5 w-5 text-orange-400" />
								</div>
								<span>Аналитика в реальном времени</span>
							</div>
							<div className="flex items-center space-x-3 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg">
									<Route className="h-5 w-5 text-amber-400" />
								</div>
								<span>Оптимизация маршрутов</span>
							</div>
							<div className="flex items-center space-x-3 text-gray-300">
								<div className="p-2 bg-gray-800/50 rounded-lg">
									<MapPin className="h-5 w-5 text-orange-500" />
								</div>
								<span>Мониторинг транспорта</span>
							</div>
						</div>
					</div>
				</div>

				{/* Правая часть - форма авторизации */}
				<div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-12">
					<div className="w-full max-w-md">
						<GlowContainer glowColor="orange" intensity="high" animated>
							<Card className="backdrop-blur-xl bg-black/40 border-orange-500/20 shadow-2xl">
								<CardHeader className="text-center pb-6 pt-8">
									<div className="flex justify-center mb-6 lg:hidden">
										<div className="p-4 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-2xl">
											<TruckIcon className="h-8 w-8 text-white" />
										</div>
									</div>

									<h1 className="text-2xl font-bold text-white mb-2">
										Вход в систему
									</h1>
									<p className="text-gray-400">Войдите в вашу учетную запись</p>
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
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-200">
												Имя пользователя
											</label>
											<div className="relative group">
												<User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...register("username")}
													placeholder="Введите имя пользователя"
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
												Пароль
											</label>
											<div className="relative group">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
												<Input
													{...register("password")}
													type={showPassword ? "text" : "password"}
													placeholder="Введите пароль"
													className="pl-10 pr-10 bg-black/20 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-black/30 transition-all"
													disabled={isLoading}
													autoComplete="current-password"
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

										<Button
											type="submit"
											disabled={isLoading || isSubmitting}
											className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
											size="lg"
										>
											{isLoading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Выполняется вход...
												</>
											) : (
												<>
													Войти в систему
													<ChevronRight className="ml-2 h-4 w-4" />
												</>
											)}
										</Button>
									</form>

									<div className="text-center pt-4 border-t border-gray-700">
										<p className="text-sm text-gray-400">
											Нет аккаунта?{" "}
											<Link
												to="/register"
												className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
											>
												Зарегистрироваться
											</Link>
										</p>
									</div>
								</CardContent>
							</Card>
						</GlowContainer>

						<div className="text-center mt-8">
							<p className="text-xs text-gray-500">
								© 2025 TruckNavigator. Все права защищены.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
