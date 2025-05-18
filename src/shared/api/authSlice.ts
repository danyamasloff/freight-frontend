import { apiSlice } from './apiSlice'
import type {
    LoginRequest,
    RegistrationRequest,
    JwtResponse,
    RefreshTokenRequest,
    MessageResponse
} from '@/shared/types/api'

export const authSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<JwtResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<MessageResponse, RegistrationRequest>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        logout: builder.mutation<MessageResponse, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        refreshToken: builder.mutation<JwtResponse, RefreshTokenRequest>({
            query: (refreshData) => ({
                url: '/auth/refresh',
                method: 'POST',
                body: refreshData,
            }),
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
} = authSlice