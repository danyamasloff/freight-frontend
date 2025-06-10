const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Получение токена авторизации из localStorage
const getAuthToken = (): string | null => {
	return localStorage.getItem('authToken');
};

// Базовые заголовки для всех API запросов
const getBaseHeaders = () => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	const token = getAuthToken();
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return headers;
};

// Утилита для GET запросов
export const apiGet = async (endpoint: string): Promise<Response> => {
	return fetch(`${API_BASE_URL}${endpoint}`, {
		method: 'GET',
		headers: getBaseHeaders(),
	});
};

// Утилита для POST запросов
export const apiPost = async (endpoint: string, data?: any): Promise<Response> => {
	return fetch(`${API_BASE_URL}${endpoint}`, {
		method: 'POST',
		headers: getBaseHeaders(),
		body: data ? JSON.stringify(data) : undefined,
	});
};

// Утилита для обработки API ответов
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		if (response.status === 401) {
			// Удаляем токен при ошибке авторизации
			localStorage.removeItem('authToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('username');
			throw new Error('Необходима авторизация');
		}
		if (response.status === 403) {
			throw new Error('Доступ запрещен');
		}
		if (response.status === 404) {
			throw new Error('Ресурс не найден');
		}
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	try {
		return await response.json();
	} catch (error) {
		throw new Error('Ошибка парсинга ответа API');
	}
};

// Функции для управления аутентификацией
export const isAuthenticated = (): boolean => {
	return !!getAuthToken();
};

export const logout = (): void => {
	localStorage.removeItem('authToken');
	localStorage.removeItem('refreshToken');
	localStorage.removeItem('username');
};

export const getUsername = (): string | null => {
	return localStorage.getItem('username');
}; 