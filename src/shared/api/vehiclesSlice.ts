import { apiSlice } from './apiSlice'
import type { VehicleSummary, VehicleDetail } from '@/shared/types/api'

export const vehiclesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getVehicles: builder.query<VehicleSummary[], void>({
            query: () => '/vehicles',
            providesTags: ['Vehicle'],
        }),
        getVehicle: builder.query<VehicleDetail, number>({
            query: (id) => `/vehicles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
        }),
        createVehicle: builder.mutation<VehicleDetail, Partial<VehicleDetail>>({
            query: (vehicleData) => ({
                url: '/vehicles',
                method: 'POST',
                body: vehicleData,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicle: builder.mutation<VehicleDetail, { id: number; data: Partial<VehicleDetail> }>({
            query: ({ id, data }) => ({
                url: `/vehicles/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
        }),
        deleteVehicle: builder.mutation<void, number>({
            query: (id) => ({
                url: `/vehicles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateFuelLevel: builder.mutation<VehicleDetail, { id: number; fuelLevel: number }>({
            query: ({ id, fuelLevel }) => ({
                url: `/vehicles/${id}/fuel-level?fuelLevel=${fuelLevel}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
        }),
        updateOdometer: builder.mutation<VehicleDetail, { id: number; odometerValue: number }>({
            query: ({ id, odometerValue }) => ({
                url: `/vehicles/${id}/odometer?odometerValue=${odometerValue}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
        }),
    }),
})

export const {
    useGetVehiclesQuery,
    useGetVehicleQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
    useUpdateFuelLevelMutation,
    useUpdateOdometerMutation,
} = vehiclesSlice