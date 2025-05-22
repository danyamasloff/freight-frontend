export enum DrivingStatus {
    DRIVING = 'DRIVING',
    REST_BREAK = 'REST_BREAK',
    DAILY_REST = 'DAILY_REST',
    WEEKLY_REST = 'WEEKLY_REST',
    OTHER_WORK = 'OTHER_WORK',
    AVAILABILITY = 'AVAILABILITY'
}

export interface DriverSummary {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber: string;
    licenseNumber: string;
    drivingExperienceYears?: number;
    currentDrivingStatus?: DrivingStatus;
}

export interface DriverDetail extends DriverSummary {
    birthDate?: string;
    licenseIssueDate?: string;
    licenseExpiryDate?: string;
    licenseCategories?: string;
    email?: string;
    hasDangerousGoodsCertificate: boolean;
    dangerousGoodsCertificateExpiry?: string;
    hasInternationalTransportationPermit: boolean;
    hourlyRate?: number;
    perKilometerRate?: number;
    currentStatusStartTime?: string;
    dailyDrivingMinutesToday?: number;
    continuousDrivingMinutes?: number;
    weeklyDrivingMinutes?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DriverCreate {
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate?: string;
    licenseNumber: string;
    licenseIssueDate?: string;
    licenseExpiryDate?: string;
    licenseCategories?: string;
    phoneNumber: string;
    email?: string;
    drivingExperienceYears?: number;
    hasDangerousGoodsCertificate?: boolean;
    dangerousGoodsCertificateExpiry?: string;
    hasInternationalTransportationPermit?: boolean;
    hourlyRate?: number;
    perKilometerRate?: number;
}

export interface DriverUpdate extends Partial<DriverCreate> {
    id: number;
}

export interface DriverMedical {
    driverId?: number;
    medicalCertificateNumber?: string;
    medicalCertificateIssueDate?: string;
    medicalCertificateExpiryDate?: string;
    medicalRestrictions?: string;
    hasMedicalRestrictions?: boolean;
    nextMedicalCheckDate?: string;
    bloodType?: string;
    hasChronicConditions?: boolean;
    chronicConditionsDescription?: string;
}

export interface DriverQualification {
    licenseNumber: string;
    issueDate?: string;
    expiryDate?: string;
    categories?: string;
    hasDangerousGoodsCertificate: boolean;
    dangerousGoodsExpiryDate?: string;
    hasInternationalPermit: boolean;
}

export interface RestStopRecommendation {
    distanceFromStartKm: number;
    timeFromDeparture: string;
    expectedArrivalAtStop: string;
    recommendedRestDurationMinutes: number;
    restType: string;
    reason: string;
    longitude?: number;
    latitude?: number;
    locationName?: string;
    locationDescription?: string;
    locationType?: string;
    distanceFromRoute?: number;
    facilities?: Record<string, boolean>;
    fuelPrice?: number;
    parkingCost?: number;
}

export interface DriverRestAnalysis {
    driverId: number;
    driverName: string;
    departureTime?: string;
    estimatedArrivalTime?: string;
    estimatedTripDurationMinutes: number;
    currentDrivingStatus?: DrivingStatus;
    currentStatusStartTime?: string;
    remainingContinuousDrivingMinutes: number;
    remainingDailyDrivingMinutes: number;
    restStopRecommendations?: RestStopRecommendation[];
    compliantWithRegulations: boolean;
    summary?: string;
}

export interface DriverPerformance {
    driverId: number;
    driverName: string;
    analyzedPeriodStart: string;
    analyzedPeriodEnd: string;
    completedRoutesCount: number;
    totalDistanceDrivenKm: number;
    avgFuelEfficiencyPercent: number;
    avgDeliveryTimeEfficiencyPercent: number;
    rating?: number;
    incidentsCount?: number;
    avgSpeedKmh?: number;
    totalFuelConsumptionLiters?: number;
    avgFuelConsumptionPer100km?: number;
    totalDrivingMinutes?: number;
    totalRestMinutes?: number;
    rankingByEfficiency?: number;
    percentileByEfficiency?: number;
    performanceHistory?: PerformanceHistoryPoint[];
}

export interface PerformanceHistoryPoint {
    date: string;
    fuelEfficiency: number;
    timeEfficiency: number;
    rating?: number;
}