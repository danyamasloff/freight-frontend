import {fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const handle401Error = (error: any) => {
    // Проверяем, является ли это ошибкой 401 Unauthorized
    if (error && error.status === 401) {
        console.warn('401 Unauthorized detected, redirecting to login')

        // Очищаем данные аутентификации
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('username')

        // Перенаправляем на страницу входа (можно использовать store.dispatch и action)
        window.location.href = '/login?expired=true'

        return true
    }

    return false
}

// Пример использования в baseQuery:
export const createBaseQueryWithAuth = () => fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = localStorage.getItem('token')
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
    validateStatus: (response, body) => {
        if (response.status === 401) {
            handle401Error({ status: 401 })
            return false
        }
        return response.status >= 200 && response.status < 300
    }
})