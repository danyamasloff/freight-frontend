/**
 * Сохраняет аутентификационные данные в localStorage
 */
export const saveAuthData = (token: string, refreshToken: string, username: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('username', username)
}

/**
 * Получает токен из localStorage
 */
export const getToken = (): string | null => {
    return localStorage.getItem('token')
}

/**
 * Проверяет, аутентифицирован ли пользователь
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token')
}

/**
 * Очищает аутентификационные данные из localStorage
 */
export const clearAuthData = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
}