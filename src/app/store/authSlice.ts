import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { JwtResponse } from '@/shared/types/api'

interface AuthState {
    token: string | null
    refreshToken: string | null
    username: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    username: localStorage.getItem('username'),
    isAuthenticated: !!localStorage.getItem('token'),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<JwtResponse>) => {
            // Используем правильное поле token из ответа API
            state.token = action.payload.token
            state.refreshToken = action.payload.refreshToken
            state.username = action.payload.username
            state.isAuthenticated = true

            // Сохраняем в localStorage
            localStorage.setItem('token', action.payload.token)
            localStorage.setItem('refreshToken', action.payload.refreshToken)
            localStorage.setItem('username', action.payload.username)

            console.log('Token saved to localStorage:',
                action.payload.token ? action.payload.token.substring(0, 10) + '...' : 'no token')
        },
        clearCredentials: (state) => {
            state.token = null
            state.refreshToken = null
            state.username = null
            state.isAuthenticated = false

            // Очищаем localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('username')
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
            localStorage.setItem('token', action.payload)
        },
    },
})

export const { setCredentials, clearCredentials, setToken } = authSlice.actions
export { authSlice }