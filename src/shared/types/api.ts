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
    expiresIn: number
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
    latitude: number  // Основные поля из Java DTO
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

export interface RouteInstruction {
    text: string
    distance: number
    time: number
    interval: [number, number]
    sign: number
    streetName?: string
}

// Базовый тип ответа маршрута
export interface RouteResponse {
    distance: number
    duration: number
    coordinates: number[][]
    instructions: RouteInstruction[]
    startAddress?: string
    endAddress?: string
    departureTime?: string
    // Аналитика рисков
    riskScore?: number
    weatherRisk?: number
    roadQualityRisk?: number
    trafficRisk?: number
    riskFactors?: string[]
    // Экономические показатели
    estimatedFuelCost?: number
    estimatedTollCost?: number
    totalEstimatedCost?: number
    fuelConsumption?: number
    // Соответствие РТО
    rtoCompliant?: boolean
    rtoWarnings?: string[]
    // Геометрия для PostGIS (опционально)
    geometry?: any
}

// Расширенный тип для GraphHopper API (соответствует Java RouteResponseDto)
export interface RouteResponseExtended extends RouteResponse {
    // Аналитика рисков
    riskScore?: number
    weatherRisk?: number
    roadQualityRisk?: number
    trafficRisk?: number
    riskFactors?: string[]

    // Экономические показатели
    estimatedFuelCost?: number
    estimatedTollCost?: number
    totalEstimatedCost?: number
    fuelConsumption?: number

    // Соответствие РТО
    rtoCompliant?: boolean
    rtoWarnings?: string[]
}

export interface RouteSummary {
    id: number
    name: string
    startAddress: string
    endAddress: string
    distance: number
    duration: number
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    vehicleId?: number
    driverId?: number
    departureTime?: string
    estimatedCost?: number
}

export interface RouteDetail extends RouteSummary {
    coordinates: [number, number][]
    instructions: RouteInstruction[]
    waypoints?: GeoPoint[]
    cargoId?: number
    cargo?: CargoDetail
    vehicle?: VehicleDetail
    driver?: DriverDetail
    riskScore?: number
    riskFactors?: string[]
    weatherForecast?: RouteWeatherForecast
    createdAt: string
    updatedAt: string
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

// Параметры планирования маршрутов (соответствуют Java эндпоинтам)
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

// POI категории (соответствуют Java эндпоинтам)
export type POICategory =
    | 'fuel'        // АЗС
    | 'food'        // Кафе и рестораны
    | 'parking'     // Парковки
    | 'lodging'     // Отели и мотели
    | 'atms'        // Банкоматы
    | 'pharmacies'  // Аптеки
    | 'hospitals'   // Больницы

// Типы водителей
export enum DrivingStatus {
    DRIVING = 'DRIVING',
    REST_BREAK = 'REST_BREAK',
    DAILY_REST = 'DAILY_REST',
    WEEKLY_REST = 'WEEKLY_REST',
    OFF_DUTY = 'OFF_DUTY'
}

export interface DriverSummary {
    id: number
    name: string
    licenseNumber: string
    status: DrivingStatus
    currentLocation?: GeoPoint
}

export interface DriverDetail {
    id: number
    name: string
    firstName: string
    lastName: string
    licenseNumber: string
    licenseCategory: string[]
    phone: string
    email?: string
    experience: number
    rating?: number
    status: DrivingStatus
    currentLocation?: GeoPoint
    workTimeStart?: string
    workTimeEnd?: string
    createdAt: string
    updatedAt: string
}

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

// Типы погоды
export interface WeatherData {
    temperature: number
    humidity: number
    pressure: number
    windSpeed: number
    windDirection: number
    cloudiness: number
    visibility: number
    weatherMain: string
    weatherDescription: string
    icon: string
    timestamp: string
}

export interface WeatherForecast {
    location: GeoPoint
    current: WeatherData
    hourly: WeatherData[]
    daily: WeatherData[]
}

export interface WeatherHazardWarning {
    type: 'FOG' | 'RAIN' | 'SNOW' | 'ICE' | 'WIND' | 'STORM'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
    location: GeoPoint
    timeStart: string
    timeEnd: string
    description: string
    recommendations: string[]
}

export interface RouteWeatherForecast {
    route: RouteResponse
    departureTime: string
    weatherPoints: Array<{
        coordinate: [number, number]
        time: string
        weather: WeatherData
    }>
    hazardWarnings: WeatherHazardWarning[]
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