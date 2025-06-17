import {
	Bell,
	User,
	Sun,
	Moon,
	Monitor,
	Palette,
	LogOut,
	Settings,
	UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsPanel } from "@/components/notifications";
import { useTheme } from "@/components/theme-provider";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux";
import { clearCredentials } from "@/app/store/authSlice";
import { useLogoutMutation } from "@/shared/api/authSlice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function Header() {
	const { theme, setTheme } = useTheme();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { username } = useAppSelector((state) => state.auth);
	const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return Sun;
			case "dark":
				return Moon;
			default:
				return Monitor;
		}
	};

	const ThemeIcon = getThemeIcon();

	const handleLogout = async () => {
		try {
			// Вызываем API logout если нужно
			try {
				await logout().unwrap();
			} catch (error) {
				// Игнорируем ошибки API logout, но всё равно выходим локально
				console.warn("Logout API call failed, but proceeding with local logout");
			}

			// Очищаем локальное состояние
			dispatch(clearCredentials());

			toast({
				title: "Выход выполнен",
				description: "Вы успешно вышли из системы. До свидания!",
			});

			// Перенаправляем на страницу входа
			navigate("/login");
		} catch (error) {
			console.error("Logout error:", error);
			// Даже если произошла ошибка, всё равно выходим локально
			dispatch(clearCredentials());
			navigate("/login");
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-between px-6">
				<div className="flex items-center space-x-4">
					<h1 className="text-xl font-semibold">TruckNavigator</h1>
				</div>

				<div className="flex items-center space-x-2">
					{/* Уведомления */}
					<NotificationsPanel />

					{/* Улучшенный переключатель темы */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="relative group">
								<motion.div
									key={theme}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.2 }}
									className="relative"
								>
									<ThemeIcon className="h-5 w-5 transition-colors group-hover:text-primary" />
								</motion.div>
								<span className="sr-only">Переключить тему</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2 }}
							>
								<DropdownMenuItem
									onClick={() => setTheme("light")}
									className="cursor-pointer"
								>
									<Sun className="mr-2 h-4 w-4" />
									<span>Светлая</span>
									{theme === "light" && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="ml-auto h-2 w-2 rounded-full bg-primary"
										/>
									)}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("dark")}
									className="cursor-pointer"
								>
									<Moon className="mr-2 h-4 w-4" />
									<span>Тёмная</span>
									{theme === "dark" && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="ml-auto h-2 w-2 rounded-full bg-primary"
										/>
									)}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("system")}
									className="cursor-pointer"
								>
									<Monitor className="mr-2 h-4 w-4" />
									<span>Системная</span>
									{theme === "system" && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="ml-auto h-2 w-2 rounded-full bg-primary"
										/>
									)}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									disabled
									className="text-xs text-muted-foreground"
								>
									<Palette className="mr-2 h-3 w-3" />
									Тема:{" "}
									{theme === "light"
										? "Светлая"
										: theme === "dark"
											? "Тёмная"
											: "Системная"}
								</DropdownMenuItem>
							</motion.div>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Улучшенный профиль пользователя */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="relative group">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="relative"
								>
									<User className="h-5 w-5 transition-colors group-hover:text-primary" />
								</motion.div>
								<span className="sr-only">Профиль</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2 }}
							>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{username || "Пользователь"}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											Система управления грузоперевозками
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="cursor-pointer">
									<UserCircle className="mr-2 h-4 w-4" />
									<span>Профиль</span>
								</DropdownMenuItem>
								<DropdownMenuItem className="cursor-pointer">
									<Settings className="mr-2 h-4 w-4" />
									<span>Настройки</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
									disabled={isLoggingOut}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
								</DropdownMenuItem>
							</motion.div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
