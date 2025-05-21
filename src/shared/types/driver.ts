export enum DrivingStatus {
    DRIVING = 'DRIVING',
    REST_BREAK = 'REST_BREAK',
    DAILY_REST = 'DAILY_REST',
    WEEKLY_REST = 'WEEKLY_REST',
    OTHER_WORK = 'OTHER_WORK',
    AVAILABILITY = 'AVAILABILITY'
}

// Базовый DTO для водителя в списке
export interface DriverSummaryDto {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    licenseNumber: string;
    phoneNumber?: string;
    drivingExperienceYears?: number;
    currentDrivingStatus?: DrivingStatus;
}

// Расширенный DTO с детальной информацией о водителе
export interface DriverDetailDto {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate?: string;
    licenseNumber: string;
    licenseIssueDate?: string;
    licenseExpiryDate?: string;
    licenseCategories?: string;

    // Контактная информация
    phoneNumber?: string;
    email?: string;

    // Опыт и квалификация
    drivingExperienceYears?: number;
    hasDangerousGoodsCertificate?: boolean;
    dangerousGoodsCertificateExpiry?: string;
    hasInternationalTransportationPermit?: boolean;

    // Информация о работе и оплате
    hourlyRate?: number;
    perKilometerRate?: number;

    // Текущий статус РТО
    currentDrivingStatus?: DrivingStatus;
    currentStatusStartTime?: string;
    dailyDrivingMinutesToday?: number;
    continuousDrivingMinutes?: number;
    weeklyDrivingMinutes?: number;

    // Метаданные
    createdAt?: string;
    updatedAt?: string;
}

// DTO для медицинских данных водителя
export interface DriverMedicalDto {
    driverId?: number;
    medicalCertificateExpiry?: string;
    hasMedicalRestrictions?: boolean;
    medicalRestrictions?: string;
    nextMedicalCheckDate?: string;
    bloodType?: string;
    hasChronicConditions?: boolean;
    chronicConditionsDescription?: string;
    certificateNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    medicalCertificateNumber?: string;
    restrictions?: string;
    medicalCertificateIssueDate?: string;
    medicalCertificateExpiryDate?: string;
}

// Квалификации водителя
export interface DriverQualificationDto {
    licenseNumber: string;
    issueDate?: string;
    expiryDate?: string;
    categories?: string;
    hasDangerousGoodsCertificate: boolean;
    dangerousGoodsExpiryDate?: string;
    hasInternationalPermit: boolean;
}

// DTO для анализа эффективности водителя
export interface DriverPerformanceDto {
    driverId: number;
    driverName: string;
    analyzedPeriodStart?: string;
    analyzedPeriodEnd?: string;

    // Основные показатели
    completedRoutesCount?: number;
    totalDistanceDrivenKm?: number;
    avgFuelEfficiencyPercent?: number;
    avgDeliveryTimeEfficiencyPercent?: number;
    rating?: number;
    incidentsCount?: number;

    // Расширенная статистика
    avgSpeedKmh?: number;
    totalFuelConsumptionLiters?: number;
    avgFuelConsumptionPer100km?: number;
    totalDrivingMinutes?: number;
    totalRestMinutes?: number;

    // Сравнение с другими водителями
    rankingByEfficiency?: number;
    percentileByEfficiency?: number;

    // История показателей
    performanceHistory?: PerformanceHistoryPoint[];
}

export interface PerformanceHistoryPoint {
    date: string;
    fuelEfficiency?: number;
    timeEfficiency?: number;
    rating?: number;
}

// DTO с рекомендацией по остановке для отдыха водителя
export interface RestStopRecommendationDto {
    distanceFromStartKm: number;
    timeFromDeparture: string;
    latitude?: number;
    longitude?: number;
    expectedArrivalAtStop?: string;
    recommendedRestDurationMinutes: number;
    restType: string;
    reason: string;
    locationName?: string;
    locationDescription?: string;
    locationType?: string;
    rating?: number;
    distanceFromRoute?: number;
    facilities?: Record<string, boolean>;
    fuelPrice?: number;
    parkingCost?: number;
}

// DTO с результатами анализа РТО
export interface DriverRestAnalysisDto {
    driverId?: number;
    driverName?: string;
    departureTime?: string;
    estimatedArrivalTime?: string;
    estimatedTripDurationMinutes?: number;
    currentDrivingStatus?: DrivingStatus;
    currentStatusStartTime?: string;
    remainingContinuousDrivingMinutes?: number;
    remainingDailyDrivingMinutes?: number;
    restStopRecommendations?: RestStopRecommendationDto[];
    compliantWithRegulations?: boolean;
    summary?: string;
}