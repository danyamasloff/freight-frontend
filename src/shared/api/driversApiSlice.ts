import { apiSlice } from './apiSlice';
import type {
    DriverSummaryDto,
    DriverDetailDto,
    DriverMedicalDto,
    DriverPerformanceDto,
    DriverRestAnalysisDto,
    DrivingStatus
} from '@/shared/types/driver';
import type { RouteResponseDto } from '@/shared/types/routing';

export const driversApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // CRUD операции
        getDrivers: builder.query<DriverSummaryDto[], void>({
            query: () => '/drivers',
            providesTags: ['Driver'],
        }),
        getDriver: builder.query<DriverDetailDto, number>({
            query: (id) => `/drivers/${id}`,
            providesTags: (result, error, id) => [{ type: 'Driver', id }],
        }),
        createDriver: builder.mutation<DriverDetailDto, Partial<DriverDetailDto>>({
            query: (driverData) => ({
                url: '/drivers',
                method: 'POST',
                body: driverData,
            }),
            invalidatesTags: ['Driver'],
        }),
        updateDriver: builder.mutation<DriverDetailDto, { id: number; data: Partial<DriverDetailDto> }>({
            query: ({ id, data }) => ({
                url: `/drivers/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }],
        }),
        deleteDriver: builder.mutation<void, number>({
            query: (id) => ({
                url: `/drivers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Driver'],
        }),

        // Медицинские данные
        getDriverMedical: builder.query<DriverMedicalDto, number>({
            query: (driverId) => `/drivers/${driverId}/medical`,
            providesTags: (result, error, id) => [{ type: 'Driver', id, medical: true }],
        }),
        updateDriverMedical: builder.mutation<DriverMedicalDto, { driverId: number; data: DriverMedicalDto }>({
            query: ({ driverId, data }) => ({
                url: `/drivers/${driverId}/medical`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId, medical: true }],
        }),

        // Квалификации
        getDriverQualifications: builder.query<string[], number>({
            query: (driverId) => `/drivers/${driverId}/qualifications`,
            providesTags: (result, error, id) => [{ type: 'Driver', id, qualifications: true }],
        }),
        updateDriverQualifications: builder.mutation<string[], { driverId: number; qualifications: string[] }>({
            query: ({ driverId, qualifications }) => ({
                url: `/drivers/${driverId}/qualifications`,
                method: 'PUT',
                body: qualifications,
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId, qualifications: true }],
        }),

        // Статус водителя (РТО)
        updateDriverStatus: builder.mutation<DriverDetailDto, { driverId: number; status: DrivingStatus; timestamp: string }>({
            query: ({ driverId, status, timestamp }) => ({
                url: `/drivers/${driverId}/status?status=${status}&timestamp=${timestamp}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),

        // Аналитика
        analyzeDriverRestTime: builder.mutation<DriverRestAnalysisDto, { driverId: number; routeId: number }>({
            query: ({ driverId, routeId }) => ({
                url: `/drivers/${driverId}/rest-analysis/route/${routeId}`,
                method: 'GET',
            }),
        }),
        analyzeDriverPerformance: builder.query<DriverPerformanceDto, { driverId: number; startDate?: string; endDate?: string }>({
            query: ({ driverId, startDate, endDate }) => {
                let url = `/drivers/${driverId}/performance`;
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }

                return url;
            },
        }),

        // РТО для планируемого маршрута (не привязанного к маршруту в БД)
        analyzeRouteRto: builder.mutation<DriverRestAnalysisDto, { driverId: number; route: RouteResponseDto; departureTime: string }>({
            query: ({ driverId, route, departureTime }) => ({
                url: `/drivers/${driverId}/analyze-rest-time?departureTime=${departureTime}`,
                method: 'POST',
                body: route,
            }),
        }),
    }),
});

export const {
    useGetDriversQuery,
    useGetDriverQuery,
    useCreateDriverMutation,
    useUpdateDriverMutation,
    useDeleteDriverMutation,
    useGetDriverMedicalQuery,
    useUpdateDriverMedicalMutation,
    useGetDriverQualificationsQuery,
    useUpdateDriverQualificationsMutation,
    useUpdateDriverStatusMutation,
    useAnalyzeDriverRestTimeMutation,
    useAnalyzeDriverPerformanceQuery,
    useAnalyzeRouteRtoMutation,
} = driversApiSlice;