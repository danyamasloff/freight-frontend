import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { API_CONFIG, API_ERROR_CODES } from '@/shared/config/api-config'

// Типы для обработки ошибок API
interface ApiError {
    status: number;
    data: {
        message?: string;
        code?: string;
        errors?: Record<string, string[]>;
    };
}

// Базовая конфигурация query с обработкой ошибок и retry логикой
const baseQueryWithRetry = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.REQUEST_TIMEOUT,
    prepareHeaders: (headers, { getState }) => {
        // Получаем токен из Redux state или localStorage
        const state = getState() as RootState
        let token = state.auth?.token

        if (!token) {
            token = localStorage.getItem(API_CONFIG.JWT.TOKEN_KEY)
        }

        if (token) {
            console.log('Adding token to request headers')
            headers.set('Authorization', `Bearer ${token}`)
        } else {
            console.warn('No token available for request')
        }

        headers.set('Content-Type', 'application/json')
        headers.set('Accept', 'application/json')
        
        return headers
    },
})

// Query wrapper с retry логикой и обработкой ошибок
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQueryWithRetry(args, api, extraOptions)
    
    // Обработка ошибок аутентификации
    if (result.error?.status === API_ERROR_CODES.UNAUTHORIZED) {
        console.warn('Unauthorized request, attempting token refresh...')
        
        // Попытка обновить токен
        const refreshToken = localStorage.getItem(API_CONFIG.JWT.REFRESH_TOKEN_KEY)
        if (refreshToken) {
            const refreshResult = await baseQueryWithRetry(
                {
                    url: '/auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            )
            
            if (refreshResult.data) {
                // Сохраняем новый токен
                const { token, refreshToken: newRefreshToken } = refreshResult.data as any
                localStorage.setItem(API_CONFIG.JWT.TOKEN_KEY, token)
                localStorage.setItem(API_CONFIG.JWT.REFRESH_TOKEN_KEY, newRefreshToken)
                
                // Повторяем исходный запрос с новым токеном
                result = await baseQueryWithRetry(args, api, extraOptions)
            } else {
                // Токен обновить не удалось, очищаем токены и перенаправляем на логин
                localStorage.removeItem(API_CONFIG.JWT.TOKEN_KEY)
                localStorage.removeItem(API_CONFIG.JWT.REFRESH_TOKEN_KEY)
                // Здесь можно добавить редирект на страницу логина
                console.error('Token refresh failed, redirecting to login...')
            }
        }
    }
    
    // Retry логика для временных ошибок
    if (result.error?.status === API_ERROR_CODES.INTERNAL_SERVER_ERROR) {
        let retryCount = 0
        while (retryCount < API_CONFIG.MAX_RETRY_ATTEMPTS && result.error) {
            console.warn(`Retrying request, attempt ${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS}`)
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)))
            result = await baseQueryWithRetry(args, api, extraOptions)
            retryCount++
        }
    }
    
    // Логирование ошибок для отладки
    if (result.error) {
        const error = result.error as ApiError
        console.error('API Error:', {
            status: error.status,
            message: error.data?.message,
            code: error.data?.code,
            endpoint: args.url || args,
            errors: error.data?.errors,
        })
    }
    
    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: [
        'Route',
        'Driver', 
        'Vehicle', 
        'Cargo', 
        'User', 
        'Notification', 
        'Weather',
        'Geocoding',
        'Analytics'
    ],
    endpoints: () => ({}),
    // Настройки кеширования (синхронизировано с Backend)
    keepUnusedDataFor: 60, // секунды
    refetchOnMountOrArgChange: 30, // секунды
    refetchOnFocus: false,
    refetchOnReconnect: true,
})

// Utility функции для работы с API
export const apiUtils = {
    // Функция для создания query параметров
    createQueryParams: (params: Record<string, any>): string => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value))
            }
        })
        return searchParams.toString()
    },
    
    // Функция для обработки ошибок API
    handleApiError: (error: any): string => {
        if (error?.data?.message) {
            return error.data.message
        }
        if (error?.data?.errors) {
            return Object.values(error.data.errors).flat().join(', ')
        }
        if (error?.status) {
            switch (error.status) {
                case API_ERROR_CODES.UNAUTHORIZED:
                    return 'Ошибка авторизации. Пожалуйста, войдите в систему.'
                case API_ERROR_CODES.FORBIDDEN:
                    return 'Недостаточно прав для выполнения операции.'
                case API_ERROR_CODES.NOT_FOUND:
                    return 'Запрашиваемый ресурс не найден.'
                case API_ERROR_CODES.CONFLICT:
                    return 'Конфликт данных. Возможно, ресурс уже существует.'
                case API_ERROR_CODES.UNPROCESSABLE_ENTITY:
                    return 'Неверные данные запроса.'
                case API_ERROR_CODES.INTERNAL_SERVER_ERROR:
                    return 'Внутренняя ошибка сервера. Попробуйте позже.'
                default:
                    return 'Произошла неизвестная ошибка.'
            }
        }
        return 'Произошла ошибка при выполнении запроса.'
    },
    
    // Функция для проверки валидности токена
    isTokenValid: (): boolean => {
        const token = localStorage.getItem(API_CONFIG.JWT.TOKEN_KEY)
        if (!token) return false
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const expiry = payload.exp * 1000
            return Date.now() < expiry
        } catch {
            return false
        }
    },
    
    // Функция для очистки токенов
    clearTokens: (): void => {
        localStorage.removeItem(API_CONFIG.JWT.TOKEN_KEY)
        localStorage.removeItem(API_CONFIG.JWT.REFRESH_TOKEN_KEY)
    },
}