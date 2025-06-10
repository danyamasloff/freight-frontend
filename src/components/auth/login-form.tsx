import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiPost, handleApiResponse } from "@/lib/api";

interface LoginFormProps {
	onLoginSuccess: (token: string) => void;
}

interface LoginRequest {
	username: string;
	password: string;
}

interface LoginResponse {
	token: string;
	refreshToken: string;
	username: string;
	expiresIn: number;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
	const [credentials, setCredentials] = useState<LoginRequest>({
		username: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!credentials.username || !credentials.password) {
			setError("Введите логин и пароль");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await apiPost("/auth/login", credentials).then(
				handleApiResponse<LoginResponse>
			);

			// Сохраняем токен в localStorage
			localStorage.setItem("authToken", response.token);
			localStorage.setItem("refreshToken", response.refreshToken);
			localStorage.setItem("username", response.username);

			toast({
				title: "Успешный вход",
				description: `Добро пожаловать, ${response.username}!`,
			});

			onLoginSuccess(response.token);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Ошибка входа";
			setError(errorMessage);

			toast({
				title: "Ошибка входа",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDemoLogin = () => {
		// Демо данные для тестирования
		setCredentials({
			username: "admin",
			password: "admin123",
		});
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Вход в систему</CardTitle>
				<CardDescription>
					Введите ваши учетные данные для доступа к планировщику маршрутов
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">Логин</Label>
						<Input
							id="username"
							type="text"
							value={credentials.username}
							onChange={(e) =>
								setCredentials({ ...credentials, username: e.target.value })
							}
							placeholder="Введите логин"
							disabled={loading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Пароль</Label>
						<Input
							id="password"
							type="password"
							value={credentials.password}
							onChange={(e) =>
								setCredentials({ ...credentials, password: e.target.value })
							}
							placeholder="Введите пароль"
							disabled={loading}
						/>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Вход..." : "Войти"}
						</Button>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleDemoLogin}
							disabled={loading}
						>
							Демо данные
						</Button>
					</div>
				</form>

				<div className="mt-4 text-sm text-muted-foreground">
					<p>
						<strong>Тестовые данные:</strong>
					</p>
					<p>Логин: admin</p>
					<p>Пароль: admin123</p>
				</div>
			</CardContent>
		</Card>
	);
};
