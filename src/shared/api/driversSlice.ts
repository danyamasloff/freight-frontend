import { apiSlice } from './apiSlice';
import type {
    DriverSummary,
    DriverDetail,
    DriverCreate,
    DriverUpdate,
    DriverMedical,
    DriverQualification,
    DriverRestAnalysis,
    DriverPerformance,
    DrivingStatus
} from '@/shared/types/driver';
import type { RouteResponse } from '@/shared/types/api';

export const driversSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // CRUD операции
        getDrivers: builder.query<DriverSummary[], void>({
            query: () => '/drivers',
            providesTags: ['Driver'],
        }),
        getDriver: builder.query<DriverDetail, number>({
            query: (id) => `/drivers/${id}`,
            providesTags: (result, error, id) => [{ type: 'Driver', id }],
        }),
        createDriver: builder.mutation<DriverDetail, DriverCreate>({
            query: (driverData) => ({
                url: '/drivers',
                method: 'POST',
                body: driverData,
            }),
            invalidatesTags: ['Driver'],
        }),
        updateDriver: builder.mutation<DriverDetail, DriverUpdate>({
            query: (driverData) => ({
                url: `/drivers/${driverData.id}`,
                method: 'PUT',
                body: driverData,
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

        // Операции с медицинскими данными
        getDriverMedical: builder.query<DriverMedical, number>({
            query: (driverId) => `/drivers/${driverId}/medical`,
            providesTags: (result, error, driverId) => [{ type: 'Driver', id: driverId }],
        }),
        updateDriverMedical: builder.mutation<DriverMedical, { driverId: number; data: DriverMedical }>({
            query: ({ driverId, data }) => ({
                url: `/drivers/${driverId}/medical`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),

        // Операции с квалификациями
        getDriverQualifications: builder.query<string[], number>({
            query: (driverId) => `/drivers/${driverId}/qualifications`,
            providesTags: (result, error, driverId) => [{ type: 'Driver', id: driverId }],
        }),
        updateDriverQualifications: builder.mutation<string[], { driverId: number; qualifications: string[] }>({
            query: ({ driverId, qualifications }) => ({
                url: `/drivers/${driverId}/qualifications`,
                method: 'PUT',
                body: qualifications,
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),

        // Операции с режимом труда и отдыха
        analyzeDriverRestTime: builder.query<DriverRestAnalysis, { driverId: number; routeId: number }>({
            query: ({ driverId, routeId }) => `/drivers/${driverId}/rest-analysis/route/${routeId}`,
        }),
        analyzeRouteRestTime: builder.mutation<DriverRestAnalysis, {
            driverId: number;
            route: RouteResponse;
            departureTime: string;
        }>({
            query: ({ driverId, route, departureTime }) => ({
                url: `/drivers/${driverId}/analyze-rest-time?departureTime=${departureTime}`,
                method: 'POST',
                body: route,
            }),
        }),
        updateDriverStatus: builder.mutation<DriverDetail, {
            driverId: number;
            status: DrivingStatus;
            timestamp: string;
        }>({
            query: ({ driverId, status, timestamp }) => ({
                url: `/drivers/${driverId}/status?status=${status}&timestamp=${timestamp}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),

        // Анализ эффективности водителя
        getDriverPerformance: builder.query<DriverPerformance, {
            driverId: number;
            startDate?: string;
            endDate?: string;
        }>({
            query: ({ driverId, startDate, endDate }) => {
                let url = `/drivers/${driverId}/performance`;
                const params = new URLSearchParams();

                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                return url;
            },
            providesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
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
    useAnalyzeDriverRestTimeQuery,
    useAnalyzeRouteRestTimeMutation,
    useUpdateDriverStatusMutation,
    useGetDriverPerformanceQuery,
} = driversSlice;