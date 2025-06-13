// Синхронизированные типы с Backend DTO для корректной работы API
// Этот файл обеспечивает точное соответствие между Frontend и Backend моделями

// === ROUTING DTOs (синхронизировано с Backend) ===

export interface RouteRequestDto {
    name?: string;
    
    // Начальная точка
    startLat: number;
    startLon: number;
    startAddress?: string;
    
    // Конечная точка
    endLat: number;
    endLon: number;
    endAddress?: string;
    
    // Промежуточные точки
    waypoints?: WaypointDto[];
    
    // GraphHopper параметры
    profile?: string;
    calcPoints?: boolean;
    instructions?: boolean;
    pointsEncoded?: boolean;
    
    // Связанные сущности
    vehicleId?: number;
    driverId?: number;
    cargoId?: number;
    
    // Время отправления (ISO string)
    departureTime?: string;
    
    // Дополнительные параметры
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidUrbanAreas?: boolean;
    considerWeather?: boolean;
    considerTraffic?: boolean;
}

export interface WaypointDto {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
    waypointType?: string;
    stopover?: boolean;
    stopDuration?: number;
}

export interface RouteResponseDto {
    // Основные параметры маршрута (точно как в Backend)
    distance: number;        // в километрах (BigDecimal)
    duration: number;        // в минутах (long)
    
    // Геометрия маршрута
    coordinates: number[][]; // List<double[]>
    instructions: InstructionDto[];
    
    // Время отправления
    departureTime?: string;  // LocalDateTime в ISO формате
    
    // Информация о рисках (BigDecimal -> number)
    weatherRiskScore?: number;
    roadQualityRiskScore?: number;
    trafficRiskScore?: number;
    overallRiskScore?: number;
    
    // Экономические показатели (BigDecimal -> number)
    estimatedFuelConsumption?: number;
    estimatedFuelCost?: number;
    estimatedTollCost?: number;
    estimatedDriverCost?: number;
    estimatedTotalCost?: number;
    
    // Сегменты
    roadQualitySegments?: RoadQualitySegmentDto[];
    weatherAlertSegments?: WeatherAlertSegmentDto[];
    tollSegments?: TollSegmentDto[];
    
    // Соответствие РТО
    rtoCompliant?: boolean;
    rtoWarnings?: string[];
}

export interface InstructionDto {
    text: string;
    distance: number;     // в километрах
    time: number;         // в минутах
    streetName?: string;
    exitNumber?: number;
    turnAngle?: number;   // градусы
}

export interface RoadQualitySegmentDto {
    startIndex: number;
    endIndex: number;
    distance: number;
    quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
    surfaceType: 'ASPHALT' | 'CONCRETE' | 'GRAVEL' | 'UNPAVED';
    description?: string;
    riskScore?: number;
}

export interface WeatherAlertSegmentDto {
    startIndex: number;
    endIndex: number;
    distance: number;
    weatherType: 'RAIN' | 'SNOW' | 'ICE' | 'FOG' | 'STRONG_WIND';
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    description?: string;
    riskScore?: number;
}

export interface TollSegmentDto {
    startIndex: number;
    endIndex: number;
    distance: number;
    tollName?: string;
    cost?: number;
    currency?: string;
}

// === VEHICLE DTOs (синхронизировано с Backend) ===

export interface VehicleDetailBackendDto {
    id: number;
    registrationNumber: string;
    model: string;
    manufacturer: string;
    productionYear: number;
    
    // Габариты
    heightCm: number;
    widthCm: number;
    lengthCm: number;
    
    // Вес и грузоподъемность
    emptyWeightKg: number;
    maxLoadCapacityKg: number;
    grossWeightKg: number;
    
    // Параметры двигателя
    engineType: 'DIESEL' | 'PETROL' | 'ELECTRIC' | 'HYBRID';
    fuelCapacityLitres: number;
    fuelConsumptionPer100km: number;
    
    // Экологический класс
    emissionClass: 'EURO_3' | 'EURO_4' | 'EURO_5' | 'EURO_6';
    
    // Конфигурация осей
    axisConfiguration: string; // 4X2, 6X4, 8X4 и т.д.
    axisCount: number;
    
    // Специальные характеристики
    hasRefrigerator: boolean;
    hasDangerousGoodsPermission: boolean;
    hasOversizedCargoPermission: boolean;
    
    // Текущее состояние
    currentFuelLevelLitres?: number;
    currentOdometerKm?: number;
    
    // Метаданные
    createdAt: string;
    updatedAt: string;
}

export interface VehicleSummaryBackendDto {
    id: number;
    registrationNumber: string;
    model: string;
    manufacturer: string;
    currentFuelLevelLitres?: number;
    currentOdometerKm?: number;
}

// === DRIVER DTOs (синхронизировано с Backend) ===

export interface DriverDetailBackendDto {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate?: string;
    licenseNumber: string;
    licenseIssueDate?: string;
    licenseExpiryDate?: string;
    licenseCategories?: string;
    phoneNumber?: string;
    email?: string;
    drivingExperienceYears?: number;
    hasDangerousGoodsCertificate?: boolean;
    dangerousGoodsCertificateExpiry?: string;
    hasInternationalTransportationPermit?: boolean;
    hourlyRate?: number;
    perKilometerRate?: number;
    currentDrivingStatus: DrivingStatusEnum;
    currentStatusStartTime?: string;
    dailyDrivingMinutesToday?: number;
    continuousDrivingMinutes?: number;
    weeklyDrivingMinutes?: number;
    currentLocation?: GeoPointDto;
    createdAt: string;
    updatedAt: string;
}

export interface DriverSummaryBackendDto {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    licenseNumber: string;
    phoneNumber?: string;
    drivingExperienceYears?: number;
    currentDrivingStatus: DrivingStatusEnum;
    currentLocation?: GeoPointDto;
}

export enum DrivingStatusEnum {
    DRIVING = 'DRIVING',
    REST_BREAK = 'REST_BREAK',
    DAILY_REST = 'DAILY_REST',
    WEEKLY_REST = 'WEEKLY_REST',
    OTHER_WORK = 'OTHER_WORK',
    AVAILABILITY = 'AVAILABILITY',
    OFF_DUTY = 'OFF_DUTY'
}

// === GEO DTOs ===

export interface GeoPointDto {
    lat: number;
    lng: number;
    address?: string;
}

export interface GeoLocationBackendDto {
    id?: number;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    type: string;
    provider?: string;
    displayName?: string;
    category?: string;
    importance?: number;
    boundingBox?: [number, number, number, number];
}

// === WEATHER DTOs ===

export interface WeatherDataBackendDto {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    rainVolume1h?: number;
    rainVolume3h?: number;
    snowVolume1h?: number;
    snowVolume3h?: number;
    cloudiness: number;
    visibility?: number;
    sunrise?: string;
    sunset?: string;
    weatherId: number;
    weatherMain: string;
    weatherDescription: string;
    weatherIcon: string;
    timestamp: string;
    riskScore?: number;
    riskLevel?: string;
    riskDescription?: string;
}

export interface RouteWeatherForecastBackendDto {
    route: RouteResponseDto;
    departureTime: string;
    pointForecasts: RoutePointWeatherDto[];
    hazardWarnings: WeatherHazardWarningDto[];
    hasHazardousConditions: boolean;
    summary?: string;
}

export interface RoutePointWeatherDto {
    pointIndex: number;
    distanceFromStart: number;
    estimatedTime: string;
    weatherData: WeatherDataBackendDto;
}

export interface WeatherHazardWarningDto {
    hazardType: 'STRONG_WIND' | 'ICE_RISK' | 'LOW_VISIBILITY' | 'HEAVY_RAIN' | 'HEAVY_SNOW' | 'FOG' | 'STORM';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    distanceFromStart: number;
    expectedTime: string;
    description: string;
    recommendation: string;
}

// === COMPLIANCE DTOs ===

export interface ComplianceResultBackendDto {
    compliant: boolean;
    warnings: string[];
}

// === Функции трансформации данных ===

export const transformToFrontendRoute = (backendRoute: RouteResponseDto): RouteResponseDto => {
    return {
        ...backendRoute,
        // Преобразование единиц измерения если нужно
        distance: backendRoute.distance, // км остаются км
        duration: backendRoute.duration, // минуты остаются минутами
    };
};

export const transformToBackendRouteRequest = (frontendRequest: Partial<RouteRequestDto>): RouteRequestDto => {
    return {
        ...frontendRequest,
        // Убеждаемся что обязательные поля присутствуют
        startLat: frontendRequest.startLat || 0,
        startLon: frontendRequest.startLon || 0,
        endLat: frontendRequest.endLat || 0,
        endLon: frontendRequest.endLon || 0,
        // Устанавливаем значения по умолчанию
        profile: frontendRequest.profile || 'driving',
        calcPoints: frontendRequest.calcPoints ?? true,
        instructions: frontendRequest.instructions ?? true,
        pointsEncoded: frontendRequest.pointsEncoded ?? false,
    };
}; 