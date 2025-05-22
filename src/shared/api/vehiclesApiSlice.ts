import { apiSlice } from './apiSlice';
import type {
    VehicleSummaryDto,
    VehicleDetailDto,
    FuelUpdateDto,
    OdometerUpdateDto
} from '@/shared/types/vehicle';

export const vehiclesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // CRUD операции
        getVehicles: builder.query<VehicleSummaryDto[], void>({
            query: () => '/vehicles',
            providesTags: ['Vehicle'],
        }),
        getVehicle: builder.query<VehicleDetailDto, number>({
            query: (id) => `/vehicles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
        }),
        createVehicle: builder.mutation<VehicleDetailDto, Partial<VehicleDetailDto>>({
            query: (vehicleData) => ({
                url: '/vehicles',
                method: 'POST',
                body: vehicleData,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicle: builder.mutation<VehicleDetailDto, { id: number; data: Partial<VehicleDetailDto> }>({
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

        // Обновление уровня топлива
        updateFuelLevel: builder.mutation<VehicleDetailDto, FuelUpdateDto>({
            query: ({ id, fuelLevel }) => ({
                url: `/vehicles/${id}/fuel-level?fuelLevel=${fuelLevel}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
        }),

        // Обновление пробега
        updateOdometer: builder.mutation<VehicleDetailDto, OdometerUpdateDto>({
            query: ({ id, odometerValue }) => ({
                url: `/vehicles/${id}/odometer?odometerValue=${odometerValue}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
        }),
    }),
});

export const {
    useGetVehiclesQuery,
    useGetVehicleQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
    useUpdateFuelLevelMutation,
    useUpdateOdometerMutation,
} = vehiclesApiSlice;