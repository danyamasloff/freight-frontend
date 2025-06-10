// Базовые типы API
export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
    timestamp: string
}

export interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

// Типы аутентификации
export interface LoginRequest {
    username: string
    password: string
}

export interface RegistrationRequest {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
}

export interface JwtResponse {
    token: string
    refreshToken: string
    username: string
    expiresIn: number // в миллисекундах
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface MessageResponse {
    message: string
}

// Типы геокодирования (соответствуют Java DTO)
export interface GeoPoint {
    lat: number
    lng: number
    address?: string
}

export interface GeoLocation {
    id?: number
    name: string
    description?: string
    latitude: number
    longitude: number
    type: string
    provider?: string
    displayName?: string
    category?: string
    importance?: number
    boundingBox?: [number, number, number, number]

    // Алиасы для обратной совместимости
    lat: number
    lng: number
}

// Статусы вождения (синхронизировано с Java enum)
export enum DrivingStatus {
    DRIVING = 'DRIVING',
    REST_BREAK = 'REST_BREAK',
    DAILY_REST = 'DAILY_REST',
    WEEKLY_REST = 'WEEKLY_REST',
    OTHER_WORK = 'OTHER_WORK',
    AVAILABILITY = 'AVAILABILITY',
    OFF_DUTY = 'OFF_DUTY'
}

// Типы водителей (синхронизировано с Java DTO)
export interface DriverSummary {
    id: number
    firstName: string
    lastName: string
    middleName?: string
    licenseNumber: string
    phoneNumber?: string
    drivingExperienceYears?: number
    currentDrivingStatus: DrivingStatus
    currentLocation?: GeoPoint
}

export interface DriverDetail {
    id: number
    firstName: string
    lastName: string
    middleName?: string
    birthDate?: string
    licenseNumber: string
    licenseIssueDate?: string
    licenseExpiryDate?: string
    licenseCategories?: string
    phoneNumber?: string
    email?: string
    drivingExperienceYears?: number
    hasDangerousGoodsCertificate?: boolean
    dangerousGoodsCertificateExpiry?: string
    hasInternationalTransportationPermit?: boolean
    hourlyRate?: number
    perKilometerRate?: number
    currentDrivingStatus: DrivingStatus
    currentStatusStartTime?: string
    dailyDrivingMinutesToday?: number
    continuousDrivingMinutes?: number
    weeklyDrivingMinutes?: number
    currentLocation?: GeoPoint
    createdAt: string
    updatedAt: string
}

// DTO для квалификации водителя (из analytics пакета)
export interface DriverQualificationDto {
    licenseNumber?: string
    issueDate?: string
    expiryDate?: string
    categories?: string
    hasDangerousGoodsCertificate?: boolean
    dangerousGoodsExpiryDate?: string
    hasInternationalPermit?: boolean
}

// DTO для медицинских данных водителя
export interface DriverMedicalDto {
    certificateNumber?: string
    issueDate?: string
    expiryDate?: string
    restrictions?: string
}

// Типы маршрутов (соответствуют Java DTO)
export interface RouteRequest {
    name?: string
    startLat: number
    startLon: number
    endLat: number
    endLon: number
    waypointsLat?: number[]
    waypointsLon?: number[]
    waypoints?: Array<{
        latitude: number
        longitude: number
        address?: string
    }>
    startAddress?: string
    endAddress?: string
    vehicleId?: number | null
    driverId?: number | null
    cargoId?: number | null
    departureTime?: string | null
    profile?: string
    calcPoints?: boolean
    instructions?: boolean
    pointsEncoded?: boolean
    avoidTolls?: boolean
    avoidHighways?: boolean
    avoidUrbanAreas?: boolean
    considerWeather?: boolean
    considerTraffic?: boolean
}

// Инструкция для навигации (синхронизировано с Java)
export interface RouteInstruction {
    text: string
    distance: number // в километрах
    time: number // в минутах
    streetName?: string
    exitNumber?: number
    turnAngle?: number // угол поворота в градусах
}

// Сегменты маршрута
export interface RoadQualitySegment {
    startIndex: number
    endIndex: number
    distance: number
    quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR'
    surfaceType: 'ASPHALT' | 'CONCRETE' | 'GRAVEL' | 'UNPAVED'
    description?: string
    riskScore?: number
}

export interface WeatherAlertSegment {
    startIndex: number
    endIndex: number
    distance: number
    weatherType: 'RAIN' | 'SNOW' | 'ICE' | 'FOG' | 'STRONG_WIND'
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
    description?: string
    riskScore?: number
}

export interface TollSegment {
    startIndex: number
    endIndex: number
    distance: number
    tollName?: string
    cost?: number
    currency?: string
}

// Базовый тип ответа маршрута (синхронизировано с RouteResponseDto)
export interface RouteResponse {
    distance: number // в километрах
    duration: number // в минутах
    coordinates: number[][]
    instructions: RouteInstruction[]
    departureTime?: string
    
    // Аналитика рисков
    weatherRiskScore?: number
    roadQualityRiskScore?: number
    trafficRiskScore?: number
    overallRiskScore?: number
    
    // Экономические показатели
    estimatedFuelConsumption?: number
    estimatedFuelCost?: number
    estimatedTollCost?: number
    estimatedDriverCost?: number
    estimatedTotalCost?: number
    
    // Сегменты
    roadQualitySegments?: RoadQualitySegment[]
    weatherAlertSegments?: WeatherAlertSegment[]
    tollSegments?: TollSegment[]
    
    // Соответствие РТО
    rtoCompliant?: boolean
    rtoWarnings?: string[]
}

// Расширенный тип для GraphHopper API
export interface RouteResponseExtended extends RouteResponse {
    startAddress?: string
    endAddress?: string
    riskFactors?: string[]
    fuelConsumption?: number
    geometry?: any
}

export interface RouteSummary {
    id: number
    name: string
    startAddress: string
    endAddress: string
    // Поля из реального API бэкенда
    distanceKm: number
    estimatedDurationMinutes: number
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    vehicleId?: number
    driverId?: number
    departureTime?: string
    estimatedTotalCost?: number
    // Алиасы для обратной совместимости
    distance: number
    duration: number
    estimatedCost?: number
}

export interface RouteDetail extends RouteSummary {
    coordinates?: [number, number][]
    instructions?: RouteInstruction[]
    waypoints?: any[]
    cargoId?: number
    cargo?: CargoDetail
    vehicle?: any
    driver?: any
    // Поля из реального API бэкенда
    estimatedFuelConsumption?: number
    actualFuelConsumption?: number
    estimatedFuelCost?: number
    estimatedTollCost?: number
    estimatedDriverCost?: number
    actualTotalCost?: number
    currency?: string
    overallRiskScore?: number
    weatherRiskScore?: number
    roadQualityRiskScore?: number
    trafficRiskScore?: number
    cargoRiskScore?: number
    rtoWarnings?: string[]
    // Алиасы для обратной совместимости
    riskScore?: number
    riskFactors?: string[]
    weatherForecast?: RouteWeatherForecast
    fuelConsumption?: number
    totalEstimatedCost?: number
    weatherRisk?: number
    roadQualityRisk?: number
    trafficRisk?: number
    createdAt?: string
    updatedAt?: string
}

export interface RouteCreateUpdate {
    name: string
    startLat: number
    startLon: number
    endLat: number
    endLon: number
    startAddress: string
    endAddress: string
    vehicleId: number
    driverId?: number
    cargoId?: number
    departureTime?: string
    waypoints?: GeoPoint[]
}

// Параметры планирования маршрутов
export interface RoutePlanRequest {
    fromLat: number
    fromLon: number
    toLat: number
    toLon: number
    vehicleType?: 'car' | 'truck'
}

export interface RoutePlanByNameRequest {
    fromPlace: string
    toPlace: string
    vehicleType?: 'car' | 'truck'
}

export interface FindPlaceRequest {
    query: string
    placeType?: 'fuel' | 'food' | 'parking' | 'warehouse'
    lat?: number
    lon?: number
}

// POI категории
export type POICategory =
    | 'fuel'        // АЗС
    | 'food'        // Кафе и рестораны
    | 'parking'     // Парковки
    | 'lodging'     // Отели и мотели
    | 'atms'        // Банкоматы
    | 'pharmacies'  // Аптеки
    | 'hospitals'   // Больницы

// Типы грузов
export interface CargoSummary {
    id: number
    type: string
    weight: number
    status: string
}

export interface CargoDetail {
    id: number
    type: string
    weight: number
    volume?: number
    value?: number
    description?: string
    temperatureMin?: number
    temperatureMax?: number
    hazardous: boolean
    specialRequirements?: string[]
    status: string
    createdAt: string
    updatedAt: string
}

// Типы транспортных средств
export interface VehicleSummary {
    id: number
    licensePlate: string
    brand: string
    model: string
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
    currentLocation?: GeoPoint
}

export interface VehicleDetail {
    id: number
    licensePlate: string
    brand: string
    model: string
    year: number
    vin?: string
    heightCm: number
    widthCm: number
    lengthCm: number
    emptyWeightKg: number
    grossWeightKg: number
    fuelTankCapacityL: number
    currentFuelL?: number
    fuelConsumptionPer100km: number
    currentOdometerKm?: number
    status: VehicleSummary['status']
    currentLocation?: GeoPoint
    createdAt: string
    updatedAt: string
}

// Типы погоды (синхронизированы с backend DTO)
export interface WeatherData {
    // Базовая информация
    cityName?: string
    forecastTime?: string
    
    // Основные показатели
    temperature: number           // Температура в градусах Цельсия
    feelsLike?: number           // Ощущаемая температура
    humidity: number             // Влажность в процентах
    pressure: number             // Атмосферное давление в гектопаскалях
    
    // Ветер
    windSpeed: number            // Скорость ветра в м/с
    windDirection: number        // Направление ветра в градусах
    windGust?: number           // Порывы ветра в м/с
    
    // Осадки
    rainVolume1h?: number       // Количество осадков за 1 час в мм
    rainVolume3h?: number       // Количество осадков за 3 часа в мм
    snowVolume1h?: number       // Количество снега за 1 час в мм
    snowVolume3h?: number       // Количество снега за 3 часа в мм
    
    // Облачность и видимость
    cloudiness: number          // Облачность в процентах
    visibility?: number         // Видимость в метрах
    
    // Восход и закат
    sunrise?: string
    sunset?: string
    
    // Описание погоды
    weatherId: number           // Идентификатор погодного условия
    weatherMain: string         // Основная категория погоды (Rain, Snow, ...)
    weatherDescription: string  // Описание погоды
    weatherIcon: string         // Идентификатор иконки погоды
    icon: string               // Алиас для weatherIcon
    timestamp: string          // Временная метка
    
    // Расчетные показатели для оценки риска
    riskScore?: number         // Оценка риска от 0 до 100
    riskLevel?: string         // Уровень риска: LOW, MODERATE, HIGH, SEVERE
    riskDescription?: string   // Описание риска
}

export interface WeatherForecast {
    location: GeoPoint
    current: WeatherData
    hourly?: WeatherData[]
    daily?: WeatherData[]
    forecasts: WeatherData[]   // Список прогнозов (совместимость с backend)
}

export type WeatherHazardType = 'STRONG_WIND' | 'ICE_RISK' | 'LOW_VISIBILITY' | 'HEAVY_RAIN' | 'HEAVY_SNOW' | 'FOG' | 'STORM'
export type HazardSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'

export interface WeatherHazardWarning {
    hazardType: WeatherHazardType    // Тип погодной опасности  
    severity: HazardSeverity         // Серьезность опасности
    distanceFromStart: number        // Расстояние от начала маршрута
    expectedTime: string             // Ожидаемое время столкновения с опасностью
    description: string              // Описание опасного явления
    recommendation: string           // Рекомендация для водителя
    
    // Алиасы для обратной совместимости
    type: WeatherHazardType
    severityLevel?: HazardSeverity
    timeStart: string
    timeEnd: string
    location: GeoPoint
    recommendations: string[]
}

export interface RoutePointWeather {
    pointIndex: number           // Индекс точки в маршруте
    distanceFromStart: number    // Расстояние от начала маршрута в км
    estimatedTime: string        // Оценочное время прибытия в точку
    weatherData: WeatherData     // Погодные данные для этой точки
    
    // Алиасы для обратной совместимости
    coordinate: [number, number]
    time: string
    weather: WeatherData
}

export interface RouteWeatherForecast {
    route: RouteResponse                    // Базовая информация о маршруте
    departureTime: string                   // Время отправления
    pointForecasts: RoutePointWeather[]     // Прогнозы для точек маршрута
    hazardWarnings: WeatherHazardWarning[]  // Предупреждения об опасностях
    hasHazardousConditions: boolean         // Флаг наличия опасных условий
    summary?: string                        // Краткая сводка о погоде на маршруте
    
    // Алиасы для обратной совместимости
    weatherPoints: Array<{
        coordinate: [number, number]
        time: string
        weather: WeatherData
    }>
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    recommendations: string[]
}

// Дополнительные типы для анализа
export interface RestStopRecommendation {
    location: GeoPoint
    recommendedArrivalTime: string
    restDuration: number
    reason: string
    facilityTypes: string[]
}

export interface DriverRestAnalysis {
    compliant: boolean
    warnings: string[]
    restStopRecommendations: RestStopRecommendation[]
    totalDrivingTime: number
    totalRestTime: number
    nextMandatoryRest: string
}

// Типы для аналитики и производительности
export interface DriverPerformanceDto {
    driverId: number
    driverName: string
    totalRoutes: number
    totalDistance: number
    averageFuelEfficiency: number
    averageDeliveryTime: number
    safetyRating: number
    onTimeDeliveryRate: number
    period: string
}

// Типы для назначений
export interface AssignmentSummary {
    id: number
    routeId: number
    driverId: number
    vehicleId: number
    cargoId?: number
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    assignedAt: string
    startedAt?: string
    completedAt?: string
}

export interface AssignmentDetail extends AssignmentSummary {
    route: RouteDetail
    driver: DriverDetail
    vehicle: VehicleDetail
    cargo?: CargoDetail
    notes?: string
    createdAt: string
    updatedAt: string
}

// Типы для топлива
export interface FuelStationDto {
    id: number
    name: string
    brand?: string
    latitude: number
    longitude: number
    address: string
    fuelTypes: string[]
    amenities: string[]
    rating?: number
    pricePerLiter?: number
    lastUpdated?: string
}

// Типы для соответствия требованиям (compliance)
export interface ComplianceCheckResult {
    compliant: boolean
    violations: ComplianceViolation[]
    warnings: ComplianceWarning[]
    recommendations: string[]
}

export interface ComplianceViolation {
    type: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
    regulation: string
    penalty?: string
}

export interface ComplianceWarning {
    type: string
    description: string
    recommendation: string
} 