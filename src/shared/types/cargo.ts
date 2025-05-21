export enum CargoType {
    GENERAL = 'GENERAL',
    BULK = 'BULK',
    LIQUID = 'LIQUID',
    CONTAINER = 'CONTAINER',
    REFRIGERATED = 'REFRIGERATED',
    DANGEROUS = 'DANGEROUS',
    OVERSIZED = 'OVERSIZED',
    HEAVY = 'HEAVY',
    LIVESTOCK = 'LIVESTOCK',
    PERISHABLE = 'PERISHABLE',
    VALUABLE = 'VALUABLE',
    FRAGILE = 'FRAGILE'
}

export interface CargoSummary {
    id: number;
    name: string;
    description?: string;
    weightKg: number;
    cargoType: CargoType;
    isFragile: boolean;
    isPerishable: boolean;
    isDangerous: boolean;
    isOversized: boolean;
    requiresTemperatureControl: boolean;
    declaredValue?: number;
    currency?: string;
}

export interface CargoDetail extends CargoSummary {
    volumeCubicMeters?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    dangerousGoodsClass?: string;
    unNumber?: string;
    minTemperatureCelsius?: number;
    maxTemperatureCelsius?: number;
    requiresCustomsClearance: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CargoCreate {
    name: string;
    description?: string;
    weightKg: number;
    volumeCubicMeters?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    cargoType: CargoType;
    isFragile: boolean;
    isPerishable: boolean;
    isDangerous: boolean;
    dangerousGoodsClass?: string;
    unNumber?: string;
    isOversized: boolean;
    requiresTemperatureControl: boolean;
    minTemperatureCelsius?: number;
    maxTemperatureCelsius?: number;
    requiresCustomsClearance: boolean;
    declaredValue?: number;
    currency?: string;
}