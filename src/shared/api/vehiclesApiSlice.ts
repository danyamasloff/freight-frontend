import { apiSlice } from './apiSlice';
import type {
    VehicleDetailBackendDto,
    VehicleSummaryBackendDto
} from '@/shared/types/backend-sync';

// Типы для обновления данных ТС
export interface FuelUpdateDto {
    id: number;
    fuelLevel: number;
}

export interface OdometerUpdateDto {
    id: number;
    odometerValue: number;
}

// Функции трансформации для совместимости с существующим кодом
const transformVehicleDetail = (vehicle: VehicleDetailBackendDto): any => {
    return {
        id: vehicle.id,
        licensePlate: vehicle.registrationNumber,
        brand: vehicle.manufacturer,
        model: vehicle.model,
        year: vehicle.productionYear,
        heightCm: vehicle.heightCm,
        widthCm: vehicle.widthCm,
        lengthCm: vehicle.lengthCm,
        emptyWeightKg: vehicle.emptyWeightKg,
        grossWeightKg: vehicle.grossWeightKg,
        fuelTankCapacityL: vehicle.fuelCapacityLitres,
        currentFuelL: vehicle.currentFuelLevelLitres,
        fuelConsumptionPer100km: vehicle.fuelConsumptionPer100km,
        currentOdometerKm: vehicle.currentOdometerKm,
        // Специальные характеристики
        hasRefrigerator: vehicle.hasRefrigerator,
        hasDangerousGoodsPermission: vehicle.hasDangerousGoodsPermission,
        hasOversizedCargoPermission: vehicle.hasOversizedCargoPermission,
        // Дополнительные поля из Backend
        engineType: vehicle.engineType,
        emissionClass: vehicle.emissionClass,
        axisConfiguration: vehicle.axisConfiguration,
        axisCount: vehicle.axisCount,
        maxLoadCapacityKg: vehicle.maxLoadCapacityKg,
        // Метаданные
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        // Статус (добавляем значение по умолчанию)
        status: 'AVAILABLE' as const,
    };
};

const transformVehicleSummary = (vehicle: VehicleSummaryBackendDto): any => {
    return {
        id: vehicle.id,
        licensePlate: vehicle.registrationNumber,
        brand: vehicle.manufacturer,
        model: vehicle.model,
        currentFuelL: vehicle.currentFuelLevelLitres,
        currentOdometerKm: vehicle.currentOdometerKm,
        // Статус (добавляем значение по умолчанию)
        status: 'AVAILABLE' as const,
    };
};

// Функция для трансформации данных Frontend в Backend формат
const transformToBackendVehicle = (frontendVehicle: any): Partial<VehicleDetailBackendDto> => {
    return {
        id: frontendVehicle.id,
        registrationNumber: frontendVehicle.licensePlate || frontendVehicle.registrationNumber,
        model: frontendVehicle.model,
        manufacturer: frontendVehicle.brand || frontendVehicle.manufacturer,
        productionYear: frontendVehicle.year || frontendVehicle.productionYear,
        heightCm: frontendVehicle.heightCm,
        widthCm: frontendVehicle.widthCm,
        lengthCm: frontendVehicle.lengthCm,
        emptyWeightKg: frontendVehicle.emptyWeightKg,
        grossWeightKg: frontendVehicle.grossWeightKg,
        fuelCapacityLitres: frontendVehicle.fuelTankCapacityL || frontendVehicle.fuelCapacityLitres,
        fuelConsumptionPer100km: frontendVehicle.fuelConsumptionPer100km,
        currentFuelLevelLitres: frontendVehicle.currentFuelL || frontendVehicle.currentFuelLevelLitres,
        currentOdometerKm: frontendVehicle.currentOdometerKm,
        hasRefrigerator: frontendVehicle.hasRefrigerator || false,
        hasDangerousGoodsPermission: frontendVehicle.hasDangerousGoodsPermission || false,
        hasOversizedCargoPermission: frontendVehicle.hasOversizedCargoPermission || false,
        engineType: frontendVehicle.engineType || 'DIESEL',
        emissionClass: frontendVehicle.emissionClass || 'EURO_6',
        axisConfiguration: frontendVehicle.axisConfiguration || '4X2',
        axisCount: frontendVehicle.axisCount || 2,
        maxLoadCapacityKg: frontendVehicle.maxLoadCapacityKg || frontendVehicle.grossWeightKg - frontendVehicle.emptyWeightKg,
    };
};

export const vehiclesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === CRUD операции (синхронизированы с Backend) ===
        getVehicles: builder.query<any[], void>({
            query: () => '/vehicles',
            providesTags: ['Vehicle'],
            transformResponse: (response: VehicleSummaryBackendDto[]) => 
                response.map(transformVehicleSummary),
        }),
        getVehicle: builder.query<any, number>({
            query: (id) => `/vehicles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
            transformResponse: (response: VehicleDetailBackendDto) => 
                transformVehicleDetail(response),
        }),
        createVehicle: builder.mutation<any, Partial<any>>({
            query: (vehicleData) => ({
                url: '/vehicles',
                method: 'POST',
                body: transformToBackendVehicle(vehicleData),
            }),
            invalidatesTags: ['Vehicle'],
            transformResponse: (response: VehicleDetailBackendDto) => 
                transformVehicleDetail(response),
        }),
        updateVehicle: builder.mutation<any, { id: number; data: Partial<any> }>({
            query: ({ id, data }) => ({
                url: `/vehicles/${id}`,
                method: 'PUT',
                body: transformToBackendVehicle({ ...data, id }),
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
            transformResponse: (response: VehicleDetailBackendDto) => 
                transformVehicleDetail(response),
        }),
        deleteVehicle: builder.mutation<void, number>({
            query: (id) => ({
                url: `/vehicles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle'],
        }),

        // === Специальные операции ===
        updateFuelLevel: builder.mutation<any, FuelUpdateDto>({
            query: ({ id, fuelLevel }) => ({
                url: `/vehicles/${id}/fuel-level?fuelLevel=${fuelLevel}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
            transformResponse: (response: VehicleDetailBackendDto) => 
                transformVehicleDetail(response),
        }),

        updateOdometer: builder.mutation<any, OdometerUpdateDto>({
            query: ({ id, odometerValue }) => ({
                url: `/vehicles/${id}/odometer?odometerValue=${odometerValue}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
            transformResponse: (response: VehicleDetailBackendDto) => 
                transformVehicleDetail(response),
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