import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/shared/api/apiSlice'
import { authSlice } from './authSlice'

export const store = configureStore({
    reducer: {
        api: apiSlice.reducer,
        auth: authSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(apiSlice.middleware),
    devTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch