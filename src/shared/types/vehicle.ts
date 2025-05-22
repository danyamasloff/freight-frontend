export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE',
    IN_USE = 'IN_USE',
    MAINTENANCE = 'MAINTENANCE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

// Базовый DTO для ТС в списке
export interface VehicleSummaryDto {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    status: VehicleStatus;
    currentLocation?: {
        lat: number;
        lng: number;
        address?: string;
    };
}

// Расширенный DTO с детальной информацией о ТС
export interface VehicleDetailDto {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    vin?: string;
    heightCm: number;
    widthCm: number;
    lengthCm: number;
    emptyWeightKg: number;
    grossWeightKg: number;
    fuelTankCapacityL: number;
    currentFuelL?: number;
    fuelConsumptionPer100km: number;
    currentOdometerKm?: number;
    status: VehicleStatus;

    // Дополнительные свойства
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    registrationExpiryDate?: string;
    insuranceExpiryDate?: string;

    // Специфические разрешения
    hasDangerousGoodsPermission?: boolean;
    hasOversizedCargoPermission?: boolean;
    hasRefrigerator?: boolean;
    refrigeratorMinTempC?: number;
    refrigeratorMaxTempC?: number;

    // Текущее местоположение
    currentLocation?: {
        lat: number;
        lng: number;
        address?: string;
    };

    // Мета-информация
    createdAt?: string;
    updatedAt?: string;
}

// Модель для обновления уровня топлива
export interface FuelUpdateDto {
    id: number;
    fuelLevel: number;
}

// Модель для обновления пробега
export interface OdometerUpdateDto {
    id: number;
    odometerValue: number;
}