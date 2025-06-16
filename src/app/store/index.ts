import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import { apiSlice } from '@/shared/api/apiSlice'
import { authSlice } from '@/app/store/authSlice'
// Импортируем API слайсы только для инициализации endpoints
import '@/shared/api/geocodingSlice'
import '@/shared/api/cargoSlice'
import '@/shared/api/driversSlice'
import '@/shared/api/vehiclesApiSlice'
import { weatherApi } from '@/shared/api/weatherSlice'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Только auth будет сохраняться
}

const rootReducer = combineReducers({
    api: apiSlice.reducer,
    auth: authSlice.reducer,
    weatherApi: weatherApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            apiSlice.middleware,
            weatherApi.middleware
        ),
    devTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
})

setupListeners(store.dispatch)

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch