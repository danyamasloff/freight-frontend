import { apiSlice } from './apiSlice'
import type { CargoSummary, CargoDetail } from '@/shared/types/api'

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
        createCargo: builder.mutation<CargoDetail, Partial<CargoDetail>>({
            query: (cargoData) => ({
                url: '/cargos',
                method: 'POST',
                body: cargoData,
            }),
            invalidatesTags: ['Cargo'],
        }),
        updateCargo: builder.mutation<CargoDetail, { id: number; data: Partial<CargoDetail> }>({
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
    }),
})

export const {
    useGetCargosQuery,
    useGetCargoQuery,
    useCreateCargoMutation,
    useUpdateCargoMutation,
    useDeleteCargoMutation,
} = cargoSlice