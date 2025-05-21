import { apiSlice } from './apiSlice';
import type { CargoSummary, CargoDetail, CargoCreate } from '@/shared/types/cargo';

export const cargoSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCargos: builder.query<CargoSummary[], void>({
            query: () => '/cargos',
            providesTags: ['Cargo'],
        }),
        getCargo: builder.query<CargoDetail, number>({
            query: (id) => `/cargos/${id}`,
            providesTags: (result, error, id) => [{ type: 'Cargo', id }],
        }),
        createCargo: builder.mutation<CargoDetail, CargoCreate>({
            query: (cargoData) => ({
                url: '/cargos',
                method: 'POST',
                body: cargoData,
            }),
            invalidatesTags: ['Cargo'],
        }),
        updateCargo: builder.mutation<CargoDetail, { id: number; data: Partial<CargoCreate> }>({
            query: ({ id, data }) => ({
                url: `/cargos/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Cargo', id }],
        }),
        deleteCargo: builder.mutation<void, number>({
            query: (id) => ({
                url: `/cargos/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cargo'],
        }),
        checkVehicleCompliance: builder.query<ComplianceResult, { cargoId: number; vehicleId: number }>({
            query: ({ cargoId, vehicleId }) => `/cargos/${cargoId}/compliance/vehicle/${vehicleId}`,
        }),
        checkDriverCompliance: builder.query<ComplianceResult, { cargoId: number; driverId: number }>({
            query: ({ cargoId, driverId }) => `/cargos/${cargoId}/compliance/driver/${driverId}`,
        }),
    }),
});

export const {
    useGetCargosQuery,
    useGetCargoQuery,
    useCreateCargoMutation,
    useUpdateCargoMutation,
    useDeleteCargoMutation,
    useCheckVehicleComplianceQuery,
    useCheckDriverComplianceQuery
} = cargoSlice;

// Для проверки совместимости
interface ComplianceResult {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
}