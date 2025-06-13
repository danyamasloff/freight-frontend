import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RouteState, RouteRequest, CalculatedRoute, RoutePoint, WeatherInfo } from '@/shared/types/route';
import { graphHopperAPI, openWeatherAPI } from '@/shared/api/external-apis';

// Асинхронные экшены
export const calculateRoute = createAsyncThunk(
    'routes/calculateRoute',
    async (request: RouteRequest, { rejectWithValue }) => {
        try {
            const route = await graphHopperAPI.calculateRoute(request);
            
            // Получаем данные о погоде для ключевых точек маршрута
            const weatherPromises = [
                openWeatherAPI.getCurrentWeather(request.from.lat, request.from.lng),
                openWeatherAPI.getCurrentWeather(request.to.lat, request.to.lng)
            ];
            
            const weatherData = await Promise.all(weatherPromises);
            
            // Добавляем данные о погоде к маршруту
            route.segments = route.segments.map((segment, index) => ({
                ...segment,
                weatherData: index < weatherData.length ? weatherData[index] : undefined
            }));
            
            return route;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Ошибка расчета маршрута');
        }
    }
);

export const getWeatherForecast = createAsyncThunk(
    'routes/getWeatherForecast',
    async (point: RoutePoint, { rejectWithValue }) => {
        try {
            return await openWeatherAPI.getWeatherForecast(point.lat, point.lng);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Ошибка получения прогноза погоды');
        }
    }
);

// Начальное состояние
const initialState: RouteState = {
    currentRoute: null,
    isCalculating: false,
    error: null,
    history: []
};

// Slice
const routesSlice = createSlice({
    name: 'routes',
    initialState,
    reducers: {
        clearCurrentRoute: (state) => {
            state.currentRoute = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        addToHistory: (state, action: PayloadAction<CalculatedRoute>) => {
            state.history.unshift(action.payload);
            // Ограничиваем историю 10 маршрутами
            if (state.history.length > 10) {
                state.history = state.history.slice(0, 10);
            }
        },
        removeFromHistory: (state, action: PayloadAction<string>) => {
            state.history = state.history.filter(route => route.id !== action.payload);
        },
        clearHistory: (state) => {
            state.history = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Расчет маршрута
            .addCase(calculateRoute.pending, (state) => {
                state.isCalculating = true;
                state.error = null;
            })
            .addCase(calculateRoute.fulfilled, (state, action) => {
                state.isCalculating = false;
                state.currentRoute = action.payload;
                state.error = null;
                // Добавляем в историю
                state.history.unshift(action.payload);
                if (state.history.length > 10) {
                    state.history = state.history.slice(0, 10);
                }
            })
            .addCase(calculateRoute.rejected, (state, action) => {
                state.isCalculating = false;
                state.error = action.payload as string;
            })
            // Прогноз погоды
            .addCase(getWeatherForecast.pending, (state) => {
                // Можно добавить состояние загрузки погоды
            })
            .addCase(getWeatherForecast.fulfilled, (state, action) => {
                // Обновляем данные о погоде в текущем маршруте
                if (state.currentRoute) {
                    // Логика обновления погоды в маршруте
                }
            })
            .addCase(getWeatherForecast.rejected, (state, action) => {
                // Обработка ошибки прогноза погоды
                console.error('Weather forecast error:', action.payload);
            });
    }
});

// Экспорт экшенов
export const {
    clearCurrentRoute,
    clearError,
    addToHistory,
    removeFromHistory,
    clearHistory
} = routesSlice.actions;

// Селекторы
export const selectCurrentRoute = (state: { routes: RouteState }) => state.routes.currentRoute;
export const selectIsCalculating = (state: { routes: RouteState }) => state.routes.isCalculating;
export const selectRouteError = (state: { routes: RouteState }) => state.routes.error;
export const selectRouteHistory = (state: { routes: RouteState }) => state.routes.history;

// Экспорт редюсера
export default routesSlice.reducer; 