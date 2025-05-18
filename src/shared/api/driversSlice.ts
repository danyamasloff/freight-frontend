import { apiSlice } from './apiSlice'
import type {
    DriverSummary,
    DriverDetail,
    DriverRestAnalysis,
    RestStopRecommendation,
    DrivingStatus,
    RouteResponse
} from '@/shared/types/api'

export const driversSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDrivers: builder.query<DriverSummary[], void>({
            query: () => '/drivers',
            providesTags: ['Driver'],
        }),
        getDriver: builder.query<DriverDetail, number>({
            query: (id) => `/drivers/${id}`,
            providesTags: (result, error, id) => [{ type: 'Driver', id }],
        }),
        createDriver: builder.mutation<DriverDetail, Partial<DriverDetail>>({
            query: (driverData) => ({
                url: '/drivers',
                method: 'POST',
                body: driverData,
            }),
            invalidatesTags: ['Driver'],
        }),
        updateDriver: builder.mutation<DriverDetail, { id: number; data: Partial<DriverDetail> }>({
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
        // РТО анализ
        analyzeRestTime: builder.mutation<DriverRestAnalysis, {
            driverId: number
            route: RouteResponse
            departureTime: string
        }>({
            query: ({ driverId, route, departureTime }) => ({
                url: `/drivers/${driverId}/analyze-rest-time?departureTime=${departureTime}`,
                method: 'POST',
                body: route,
            }),
        }),
        getRestStops: builder.query<RestStopRecommendation[], {
            driverId: number
            startLat: number
            startLon: number
            endLat: number
            endLon: number
            departureTime: string
        }>({
            query: ({ driverId, startLat, startLon, endLat, endLon, departureTime }) =>
                `/drivers/${driverId}/rest-stops?startLat=${startLat}&startLon=${startLon}&endLat=${endLat}&endLon=${endLon}&departureTime=${departureTime}`,
        }),
        updateDriverStatus: builder.mutation<DriverDetail, {
            driverId: number
            status: DrivingStatus
            timestamp: string
        }>({
            query: ({ driverId, status, timestamp }) => ({
                url: `/drivers/${driverId}/status?status=${status}&timestamp=${timestamp}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),
    }),
})

export const {
    useGetDriversQuery,
    useGetDriverQuery,
    useCreateDriverMutation,
    useUpdateDriverMutation,
    useDeleteDriverMutation,
    useAnalyzeRestTimeMutation,
    useGetRestStopsQuery,
    useUpdateDriverStatusMutation,
} = driversSlice