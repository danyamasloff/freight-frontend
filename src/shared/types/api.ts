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
    accessToken: string
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

// Типы геокодирования
export interface GeoPoint {
    lat: number
    lng: number
    address?: string
}

export interface GeoLocation {
    name: string
    displayName: string
    lat: number
    lng: number
    type: string
    category: string
    importance: number
    boundingBox?: [number, number, number, number]
}

// Типы маршрутов
export interface RouteRequest {
    name?: string
    startLat: number
    startLon: number
    endLat: number
    endLon: number
    waypointsLat?: number[]
    waypointsLon?: number[]
    startAddress?: string
    endAddress?: string
    vehicleId?: number
    driverId?: number
    cargoId?: number
    departureTime?: string
    avoidTolls?: boolean
    avoidHighways?: boolean
    avoidFerries?: boolean
}

export interface RouteInstruction {
    text: string
    distance: number
    time: number
    interval: [number, number]
    sign: number
    streetName?: string
}

export interface RouteResponse {
    distance: number
    duration: number
    coordinates: [number, number][]
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