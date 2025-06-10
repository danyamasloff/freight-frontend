// Yandex Maps API types
export interface YandexMapState {
  center: [number, number]
  zoom: number
  type?: string
}

export interface YandexMapOptions {
  suppressMapOpenBlock?: boolean
  yandexMapDisablePoiInteractivity?: boolean
}

export interface YandexRouteOptions {
  routingMode?: 'driving' | 'walking' | 'transit'
  avoidTrafficJams?: boolean
  strictBounds?: boolean
}

export interface YandexPlacemarkOptions {
  preset?: string
  iconColor?: string
  iconContent?: string
}

export interface YandexPolylineOptions {
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeStyle?: 'solid' | 'dash' | 'dot'
}

// Route types
export interface RoutePoint {
  coordinates: [number, number]
  address?: string
  type: 'start' | 'end' | 'waypoint'
  weatherData?: any
}

export interface RouteInfo {
  distance: number
  duration: number
  fuelCost?: number
  tollCost?: number
  riskScore?: number
  coordinates?: [number, number][]
}

// Map settings
export interface MapSettings {
  showTraffic: boolean
  showWeather: boolean
  mapType: 'map' | 'satellite' | 'hybrid'
  showWeatherOverlay: boolean
}

// Weather integration types
export interface WeatherMapLayer {
  type: 'temperature' | 'precipitation' | 'wind' | 'clouds'
  opacity: number
  visible: boolean
}

export interface MapWeatherData {
  coordinates: [number, number]
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  precipitation: number
  visibility: number
  conditions: string
} 