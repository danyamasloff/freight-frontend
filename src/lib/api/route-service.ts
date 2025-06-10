import axios from 'axios';

// Типы данных для API запросов
export interface RouteCalculationRequest {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  startAddress?: string;
  endAddress?: string;
  vehicleId?: number;
  driverId?: number;
  departureTime?: string;
  avoidTolls?: boolean;
  considerWeather?: boolean;
  considerTraffic?: boolean;
}

export interface RouteAnalytics {
  distance: number;
  duration: number;
  fuelCost: number;
  tollRoads: number;
  weatherConditions: string;
  restStops: Array<{
    location: string;
    time: string;
    reason: string;
  }>;
  costBreakdown: {
    fuel: number;
    tolls: number;
    driver: number;
    total: number;
  };
  weatherRisk: number;
  roadQualityRisk: number;
  overallRisk: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherDescription: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FuelPriceData {
  stationName: string;
  fuelType: string;
  pricePerLiter: number;
  distance: number;
  address: string;
}

export interface TollRoadData {
  name: string;
  cost: number;
  distance: number;
  segment: {
    start: string;
    end: string;
  };
}

// API базовый URL - возьмем из переменных окружения или используем localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен аутентификации, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class RouteService {
  /**
   * Рассчитать маршрут с аналитикой
   */
  static async calculateRoute(request: RouteCalculationRequest): Promise<RouteAnalytics> {
    try {
      const response = await api.post('/routes/calculate', request);
      
      // Преобразуем ответ бэкенда в нужный формат
      const routeData = response.data.data;
      
      return {
        distance: routeData.distance,
        duration: routeData.duration,
        fuelCost: routeData.estimatedFuelCost || 0,
        tollRoads: routeData.estimatedTollCost || 0,
        weatherConditions: await this.getWeatherSummary(request),
        restStops: await this.getRestStops(request),
        costBreakdown: {
          fuel: routeData.estimatedFuelCost || 0,
          tolls: routeData.estimatedTollCost || 0,
          driver: routeData.estimatedDriverCost || 0,
          total: routeData.estimatedTotalCost || 0,
        },
        weatherRisk: routeData.weatherRiskScore || 0,
        roadQualityRisk: routeData.roadQualityRiskScore || 0,
        overallRisk: routeData.overallRiskScore || 0,
      };
    } catch (error) {
      console.error('Ошибка при расчете маршрута:', error);
      throw new Error('Не удалось рассчитать маршрут');
    }
  }

  /**
   * Получить данные о погоде по маршруту
   */
  static async getWeatherAlongRoute(startLat: number, startLon: number, endLat: number, endLon: number): Promise<WeatherData[]> {
    try {
      const response = await api.get('/weather/route', {
        params: {
          startLat,
          startLon,
          endLat,
          endLon,
        },
      });
      
      return response.data.data.weatherPoints.map((point: any) => ({
        temperature: point.weather.temperature,
        humidity: point.weather.humidity,
        windSpeed: point.weather.windSpeed,
        weatherDescription: point.weather.weatherDescription,
        riskLevel: this.calculateWeatherRisk(point.weather),
      }));
    } catch (error) {
      console.error('Ошибка при получении данных о погоде:', error);
      return [];
    }
  }

  /**
   * Получить цены на топливо по маршруту
   */
  static async getFuelPricesAlongRoute(startLat: number, startLon: number, endLat: number, endLon: number): Promise<FuelPriceData[]> {
    try {
      const response = await api.get('/fuel-stations/route', {
        params: {
          startLat,
          startLon,
          endLat,
          endLon,
          radius: 50000, // 50 км от маршрута
        },
      });
      
      return response.data.data.map((station: any) => ({
        stationName: station.name,
        fuelType: station.fuelTypes?.[0] || 'Дизель',
        pricePerLiter: station.pricePerLiter || 0,
        distance: station.distanceFromRoute || 0,
        address: station.address,
      }));
    } catch (error) {
      console.error('Ошибка при получении цен на топливо:', error);
      return [];
    }
  }

  /**
   * Получить информацию о платных дорогах
   */
  static async getTollRoadsData(startLat: number, startLon: number, endLat: number, endLon: number): Promise<TollRoadData[]> {
    try {
      const response = await api.post('/routes/calculate', {
        startLat,
        startLon,
        endLat,
        endLon,
        avoidTolls: false,
      });
      
      const tollSegments = response.data.data.tollSegments || [];
      
      return tollSegments.map((segment: any) => ({
        name: segment.tollName || 'Платная дорога',
        cost: segment.cost || 0,
        distance: segment.distance || 0,
        segment: {
          start: segment.startAddress || 'Начало участка',
          end: segment.endAddress || 'Конец участка',
        },
      }));
    } catch (error) {
      console.error('Ошибка при получении данных о платных дорогах:', error);
      return [];
    }
  }

  /**
   * Получить рекомендуемые остановки для отдыха
   */
  private static async getRestStops(request: RouteCalculationRequest) {
    try {
      const response = await api.post('/analytics/driver-rest', {
        routeRequest: request,
        driverId: request.driverId,
      });
      
      return response.data.data.restStopRecommendations.map((stop: any) => ({
        location: stop.location.address || `${stop.location.lat}, ${stop.location.lng}`,
        time: new Date(stop.recommendedArrivalTime).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        reason: stop.reason,
      }));
    } catch (error) {
      console.error('Ошибка при получении остановок для отдыха:', error);
      return [];
    }
  }

  /**
   * Получить сводку по погоде
   */
  private static async getWeatherSummary(request: RouteCalculationRequest): Promise<string> {
    try {
      const weatherData = await this.getWeatherAlongRoute(
        request.startLat,
        request.startLon,
        request.endLat,
        request.endLon
      );
      
      if (weatherData.length === 0) {
        return 'Данные о погоде недоступны';
      }
      
      const avgTemp = weatherData.reduce((sum, w) => sum + w.temperature, 0) / weatherData.length;
      const hasRain = weatherData.some(w => w.weatherDescription.toLowerCase().includes('дождь'));
      const hasSnow = weatherData.some(w => w.weatherDescription.toLowerCase().includes('снег'));
      
      if (hasSnow) {
        return `Снег, средняя температура ${Math.round(avgTemp)}°C`;
      } else if (hasRain) {
        return `Дождь, средняя температура ${Math.round(avgTemp)}°C`;
      } else {
        return `Ясно, средняя температура ${Math.round(avgTemp)}°C`;
      }
    } catch (error) {
      return 'Переменная облачность, без осадков';
    }
  }

  /**
   * Рассчитать уровень риска погоды
   */
  private static calculateWeatherRisk(weather: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (weather.windSpeed > 15 || weather.temperature < -10 || weather.temperature > 35) {
      return 'HIGH';
    } else if (weather.windSpeed > 10 || weather.temperature < 0 || weather.temperature > 30) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Получить список транспортных средств
   */
  static async getVehicles() {
    try {
      const response = await api.get('/fleet/vehicles');
      return response.data.data;
    } catch (error) {
      console.error('Ошибка при получении списка ТС:', error);
      return [];
    }
  }

  /**
   * Получить список водителей
   */
  static async getDrivers() {
    try {
      const response = await api.get('/drivers');
      return response.data.data;
    } catch (error) {
      console.error('Ошибка при получении списка водителей:', error);
      return [];
    }
  }
} 