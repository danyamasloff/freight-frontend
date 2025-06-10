import { RoutePlanningRequest, DetailedRouteResponse, GeocodingResult } from '../types'

// Временные типы для планирования (пока нет бэкенда)
interface TempRoutePlanningRequest {
  startAddress: string
  endAddress: string
  vehicleType: 'truck' | 'van' | 'car'
  departureTime?: string
}

interface TempGeocodingResult {
  address: string
  coordinates: [number, number]
  confidence: number
  country: string
  region: string
  city: string
}

interface TempDetailedRouteResponse {
  id?: string
  startPoint: string
  endPoint: string
  distance: number
  duration: number
  fuelConsumption: number
  fuelCost: number
  tollCost: number
  estimatedDriverCost: number
  totalCost: number
  overallRisk: number
  weatherRisk: number
  roadQualityRisk: number
  trafficRisk: number
  cargoRisk?: number
  geometry: number[][]
  waypoints: any[]
  weatherConditions: any[]
  restStops: any[]
  tollRoads: any[]
  riskAnalysis: any
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export class RoutePlanningAPI {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      // Возвращаем мок-данные если API недоступен
      console.warn('API недоступен, используем мок-данные:', error)
      throw error
    }
  }

  /**
   * Геокодирование адреса в координаты с моками
   */
  static async geocodeAddress(address: string): Promise<TempGeocodingResult> {
    try {
      return await this.request<TempGeocodingResult>(`/api/geocoding/address?q=${encodeURIComponent(address)}`)
    } catch (error) {
      // Мок-данные для популярных городов
      const mockCoordinates: Record<string, [number, number]> = {
        'москва': [55.751574, 37.573856],
        'санкт-петербург': [59.939095, 30.315868],
        'новосибирск': [55.030204, 82.920430],
        'екатеринбург': [56.838011, 60.597465],
        'нижний новгород': [56.296504, 44.007457],
        'казань': [55.796127, 49.106414],
        'челябинск': [55.154, 61.4291],
        'омск': [54.989347, 73.368221],
        'самара': [53.195063, 50.151001],
        'ростов-на-дону': [47.227088, 39.744059],
      }

      const normalizedAddress = address.toLowerCase().trim()
      
      // Простой поиск по ключевым словам
      for (const [city, coords] of Object.entries(mockCoordinates)) {
        if (normalizedAddress.includes(city)) {
          return {
            address: address,
            coordinates: coords,
            confidence: 0.9,
            country: 'Россия',
            region: 'Неизвестно',
            city: city.charAt(0).toUpperCase() + city.slice(1)
          }
        }
      }

      // Дефолтные координаты для Москвы
      return {
        address: address,
        coordinates: [55.751574, 37.573856],
        confidence: 0.5,
        country: 'Россия',
        region: 'Москва',
        city: 'Москва'
      }
    }
  }

  /**
   * Планирование маршрута с детальной информацией
   */
  static async planDetailedRoute(request: TempRoutePlanningRequest): Promise<TempDetailedRouteResponse> {
    try {
      return await this.request<TempDetailedRouteResponse>('/api/routes/plan', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      // Мок-данные для демонстрации
      const startCoords = await this.geocodeAddress(request.startAddress)
      const endCoords = await this.geocodeAddress(request.endAddress)
      
      // Вычисляем примерное расстояние (простая формула)
      const distance = this.calculateDistance(
        startCoords.coordinates[0], 
        startCoords.coordinates[1],
        endCoords.coordinates[0], 
        endCoords.coordinates[1]
      )

      const duration = Math.round(distance * 1.2) // примерно 1.2 минуты на км
      const fuelConsumption = Math.round(distance * 0.35 * 10) / 10 // 35л/100км для грузовика
      const fuelCost = Math.round(fuelConsumption * 55) // 55 руб за литр
      const tollCost = Math.round(distance * 1.5) // 1.5 руб за км платных дорог
      const estimatedDriverCost = Math.round(duration * 2.5) // 2.5 руб за минуту
      
      return {
        id: 'temp-' + Date.now(),
        startPoint: request.startAddress,
        endPoint: request.endAddress,
        distance: Math.round(distance),
        duration: duration,
        fuelConsumption: fuelConsumption,
        fuelCost: fuelCost,
        tollCost: tollCost,
        estimatedDriverCost: estimatedDriverCost,
        totalCost: fuelCost + tollCost + estimatedDriverCost + Math.round(distance * 0.5),
        overallRisk: 2.5,
        weatherRisk: 2.0,
        roadQualityRisk: 3.0,
        trafficRisk: 2.5,
        geometry: [
          [startCoords.coordinates[1], startCoords.coordinates[0]],
          [endCoords.coordinates[1], endCoords.coordinates[0]]
        ],
        waypoints: [
          {
            lat: startCoords.coordinates[0],
            lon: startCoords.coordinates[1],
            address: request.startAddress,
            stopType: 'pickup',
            duration: 0
          },
          {
            lat: endCoords.coordinates[0],
            lon: endCoords.coordinates[1],
            address: request.endAddress,
            stopType: 'delivery',
            duration: 0
          }
        ],
        weatherConditions: [
          {
            location: startCoords.city,
            coordinates: startCoords.coordinates,
            temperature: Math.round(Math.random() * 30 - 10),
            condition: ['Ясно', 'Облачно', 'Дождь', 'Снег'][Math.floor(Math.random() * 4)],
            precipitation: Math.round(Math.random() * 100),
            visibility: Math.round(Math.random() * 50 + 10),
            windSpeed: Math.round(Math.random() * 30),
            humidity: Math.round(Math.random() * 100),
            pressure: Math.round(Math.random() * 50 + 740),
            timestamp: new Date().toISOString()
          },
          {
            location: endCoords.city,
            coordinates: endCoords.coordinates,
            temperature: Math.round(Math.random() * 30 - 10),
            condition: ['Ясно', 'Облачно', 'Дождь', 'Снег'][Math.floor(Math.random() * 4)],
            precipitation: Math.round(Math.random() * 100),
            visibility: Math.round(Math.random() * 50 + 10),
            windSpeed: Math.round(Math.random() * 30),
            humidity: Math.round(Math.random() * 100),
            pressure: Math.round(Math.random() * 50 + 740),
            timestamp: new Date().toISOString()
          }
        ],
        restStops: [
          {
            id: 'stop-1',
            location: 'Автозаправочная станция "Лукойл"',
            coordinates: [
              (startCoords.coordinates[0] + endCoords.coordinates[0]) / 2,
              (startCoords.coordinates[1] + endCoords.coordinates[1]) / 2
            ] as [number, number],
            type: 'mandatory' as const,
            timeFromStart: Math.round(duration * 0.5),
            reason: 'Обязательный отдых после 4 часов вождения',
            facilityType: 'gas_station' as const,
            amenities: ['Топливо', 'Кафе', 'Туалет', 'Душ', 'Парковка для грузовиков'],
            rating: 4.2,
            workingHours: '24/7'
          }
        ],
        tollRoads: [
          {
            id: 'toll-1',
            name: 'Платный участок М-4 "Дон"',
            cost: tollCost * 0.7,
            distance: Math.round(distance * 0.3),
            currency: '₽',
            paymentMethods: ['Наличные', 'Банковская карта', 'Транспондер'],
            coordinates: {
              start: startCoords.coordinates,
              end: [(startCoords.coordinates[0] + endCoords.coordinates[0]) / 2, (startCoords.coordinates[1] + endCoords.coordinates[1]) / 2]
            }
          }
        ],
        riskAnalysis: {
          overall: {
            score: 2.5,
            label: 'Средний' as const,
            color: '#f59e0b'
          },
          weather: {
            level: {
              score: 2.0,
              label: 'Низкий' as const,
              color: '#10b981'
            },
            factors: ['Местами возможны осадки', 'Пониженная видимость утром'],
            recommendations: ['Снизить скорость в условиях плохой видимости', 'Включить фары']
          },
          road: {
            level: {
              score: 3.0,
              label: 'Средний' as const,
              color: '#f59e0b'
            },
            factors: ['Ремонтные работы на отдельных участках', 'Сужение полосы движения'],
            recommendations: ['Соблюдать дистанцию', 'Быть готовым к остановкам в пробках']
          },
          traffic: {
            level: {
              score: 2.5,
              label: 'Средний' as const,
              color: '#f59e0b'
            },
            factors: ['Повышенная загруженность в часы пик', 'Возможные заторы в городской части'],
            recommendations: ['Планировать поездку вне часов пик', 'Рассмотреть альтернативные маршруты']
          }
        }
      }
    }
  }

  /**
   * Получение детальной информации о маршруте
   */
  static async getRouteDetails(routeId: string): Promise<TempDetailedRouteResponse> {
    try {
      return await this.request<TempDetailedRouteResponse>(`/api/routes/${routeId}/details`)
    } catch (error) {
      throw new Error('Детали маршрута недоступны')
    }
  }

  /**
   * Оптимизация маршрута
   */
  static async optimizeRoute(routeId: string, options: any): Promise<TempDetailedRouteResponse> {
    try {
      return await this.request<TempDetailedRouteResponse>(`/api/routes/${routeId}/optimize`, {
        method: 'POST',
        body: JSON.stringify(options)
      })
    } catch (error) {
      throw new Error('Оптимизация маршрута недоступна')
    }
  }

  /**
   * Расчет расстояния между двумя точками (формула гаверсинуса)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Радиус Земли в км
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }
} 