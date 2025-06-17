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
            invalidatesTags: ['Cargo', 'Notification'],
        }),
        updateCargo: builder.mutation<CargoDetail, { id: number; data: Partial<CargoCreate> }>({
            query: ({ id, data }) => ({
                url: `/cargos/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Cargo', id }, 'Notification'],
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
        getAvailableCargosForRoute: builder.query<CargoSummary[], { excludeRouteId?: number }>({
            query: ({ excludeRouteId }) => {
                const params = new URLSearchParams();
                if (excludeRouteId) {
                    params.append('excludeRouteId', excludeRouteId.toString());
                }
                return `/cargos/available-for-route?${params}`;
            },
            providesTags: ['Cargo'],
        }),
        getCargosWithAvailability: builder.query<any[], { forRouteId?: number }>({
            query: ({ forRouteId }) => {
                const params = new URLSearchParams();
                if (forRouteId) {
                    params.append('forRouteId', forRouteId.toString());
                }
                return `/cargos/with-availability?${params}`;
            },
            providesTags: ['Cargo'],
            transformResponse: (response: any[]) => 
                response.map((cargo) => ({
                    ...cargo,
                    isAvailable: cargo.status === 'AVAILABLE' || cargo.status === 'PENDING',
                    assignedRouteId: cargo.assignedRouteId || null,
                    reasonUnavailable: cargo.assignedRouteId ? `назначен на маршрут №${cargo.assignedRouteId}` : 
                                     cargo.status === 'IN_TRANSIT' ? 'в доставке' :
                                     cargo.status === 'DELIVERED' ? 'доставлен' : null
                })),
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
    useCheckDriverComplianceQuery,
    useGetAvailableCargosForRouteQuery,
    useGetCargosWithAvailabilityQuery
} = cargoSlice;

// Для проверки совместимости
interface ComplianceResult {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
}