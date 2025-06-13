export interface RoutePoint {
    lat: number;
    lng: number;
    address?: string;
    name?: string;
}

export interface RouteRequest {
    from: RoutePoint;
    to: RoutePoint;
    vehicle: VehicleParams;
    preferences: RoutePreferences;
}

export interface VehicleParams {
    weight: number;
    height: number;
    width: number;
    length: number;
    axleWeight: number;
    type: 'truck' | 'van' | 'car';
    hazmat?: boolean;
}

export interface RoutePreferences {
    avoidTolls: boolean;
    avoidFerries: boolean;
    avoidHighways: boolean;
    fastest: boolean;
    shortest: boolean;
}

export interface RouteSegment {
    id: string;
    geometry: [number, number][];
    distance: number;
    duration: number;
    instructions: string;
    roadQuality: RoadQuality;
    tollInfo?: TollInfo;
    weatherData?: WeatherInfo;
}

export interface RouteAnalytics {
    totalDistance: number;
    totalDuration: number;
    totalCost: number;
    fuelCost: number;
    tollCosts: TollInfo[];
    weatherRisks: WeatherRisk[];
    roadRisks: RoadRisk[];
    recommendations: string[];
}

export interface RoadQuality {
    surface: 'asphalt' | 'concrete' | 'gravel' | 'dirt';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    score: number; // 0-100
    restrictions?: string[];
}

export interface TollInfo {
    segmentId: string;
    cost: number;
    currency: string;
    operator: string;
    location: RoutePoint;
}

export interface WeatherInfo {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    visibility: number;
    conditions: string;
    icon: string;
    timestamp: string;
}

export interface WeatherRisk {
    type: 'rain' | 'snow' | 'ice' | 'fog' | 'wind' | 'heat';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    affectedSegments: string[];
}

export interface RoadRisk {
    type: 'construction' | 'accident' | 'congestion' | 'surface' | 'weight_limit';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: RoutePoint;
    estimatedDelay?: number;
}

export interface CalculatedRoute {
    id: string;
    segments: RouteSegment[];
    analytics: RouteAnalytics;
    alternativeRoutes?: CalculatedRoute[];
    metadata: {
        calculatedAt: string;
        requestParams: RouteRequest;
        provider: string;
    };
}

export interface RouteState {
    currentRoute: CalculatedRoute | null;
    isCalculating: boolean;
    error: string | null;
    history: CalculatedRoute[];
} 