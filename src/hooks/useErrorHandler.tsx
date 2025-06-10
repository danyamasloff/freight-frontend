import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export interface ErrorHandlerOptions {
    showToast?: boolean
    redirectTo?: string
    customHandler?: (error: any) => void
}

export function useErrorHandler() {
    const navigate = useNavigate()

    const handleError = useCallback((error: any, options: ErrorHandlerOptions = {}) => {
        const { showToast = true, redirectTo, customHandler } = options

        // Если есть кастомный обработчик, используем его
        if (customHandler) {
            customHandler(error)
            return
        }

        // Определяем тип ошибки
        const status = error?.response?.status || error?.status
        const message = error?.response?.data?.message || error?.message || 'Неизвестная ошибка'

        console.error('Error handled:', { status, message, error })

        // Обработка по статус-кодам
        switch (status) {
            case 401:
                // Неавторизован - перенаправляем на логин
                if (showToast) {
                    // Здесь можно добавить toast уведомление
                    console.warn('Unauthorized access')
                }
                navigate('/login')
                break

            case 403:
                // Доступ запрещен
                if (showToast) {
                    console.warn('Access forbidden')
                }
                navigate('/error/403')
                break

            case 404:
                // Не найдено
                if (showToast) {
                    console.warn('Resource not found')
                }
                navigate('/error/404')
                break

            case 500:
            case 502:
            case 503:
            case 504:
                // Ошибки сервера
                if (showToast) {
                    console.error('Server error')
                }
                navigate('/error/500')
                break

            default:
                // Проверяем на сетевые ошибки
                if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError' || !navigator.onLine) {
                    navigate('/error/network')
                } else if (redirectTo) {
                    navigate(redirectTo)
                } else if (showToast) {
                    // Показываем общее уведомление об ошибке
                    console.error('General error:', message)
                }
                break
        }
    }, [navigate])

    const handleApiError = useCallback((error: any) => {
        // Специальная обработка для API ошибок
        handleError(error, {
            showToast: true
        })
    }, [handleError])

    const handleNetworkError = useCallback(() => {
        navigate('/error/network')
    }, [navigate])

    const handleServerError = useCallback(() => {
        navigate('/error/500')
    }, [navigate])

    const handleNotFound = useCallback(() => {
        navigate('/error/404')
    }, [navigate])

    const handleForbidden = useCallback(() => {
        navigate('/error/403')
    }, [navigate])

    return {
        handleError,
        handleApiError,
        handleNetworkError,
        handleServerError,
        handleNotFound,
        handleForbidden
    }
} 