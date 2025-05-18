import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { JwtResponse } from '@/shared/types/api'

interface AuthState {
    token: string | null
    refreshToken: string | null
    username: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    username: null,
    isAuthenticated: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<JwtResponse>) => {
            state.token = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
            state.username = action.payload.username
            state.isAuthenticated = true
        },
        clearCredentials: (state) => {
            state.token = null
            state.refreshToken = null
            state.username = null
            state.isAuthenticated = false
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
        },
    },
})

export const { setCredentials, clearCredentials, setToken } = authSlice.actions
export { authSlice }