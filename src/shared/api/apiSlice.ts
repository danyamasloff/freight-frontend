import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Получаем токен из Redux state или localStorage
            const state = getState() as RootState
            let token = state.auth.token

            if (!token) {
                token = localStorage.getItem('token')
            }

            if (token) {
                console.log('Adding token to request headers')
                headers.set('Authorization', `Bearer ${token}`)
            } else {
                console.warn('No token available for request')
            }

            headers.set('Content-Type', 'application/json')
            return headers
        },
    }),
    tagTypes: ['Route', 'Driver', 'Vehicle', 'Cargo', 'User'],
    endpoints: () => ({}),
})