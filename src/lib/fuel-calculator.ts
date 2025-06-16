import { RouteResponseDto } from '@/shared/types/backend-sync';

// Типы для расчета топлива
export interface FuelCalculationData {
  distance: number; // км
  vehicleType: string;
  loadWeight?: number; // кг
  weatherConditions?: 'normal' | 'bad' | 'extreme';
  roadType?: 'highway' | 'city' | 'mixed';
  fuelConsumptionPer100km?: number; // л/100км
}

export interface FuelPrice {
  price: number; // руб/л
  station: string;
  distance: number; // км от маршрута
  latitude: number;
  longitude: number;
}

export interface FuelCalculationResult {
  baseFuelConsumption: number; // литров
  adjustedFuelConsumption: number; // литров с учетом факторов
  fuelCost: number; // рублей
  fuelPricePerLiter: number; // руб/л
  nearestStations: FuelPrice[];
  explanation: string;
  savingsOpportunity?: {
    cheapestStation: FuelPrice;
    potentialSavings: number;
  };
}

// Базовые нормы расхода по типам ТС
const FUEL_CONSUMPTION_NORMS = {
  truck: 35, // л/100км для грузовика
  van: 12,   // л/100км для фургона
  bus: 28,   // л/100км для автобуса
  car: 8     // л/100км для легкового авто
};

// Коэффициенты влияния на расход
const WEATHER_FACTORS = {
  normal: 1.0,
  bad: 1.15,     // +15% в плохую погоду
  extreme: 1.25  // +25% в экстремальную погоду
};

const ROAD_TYPE_FACTORS = {
  highway: 0.9,  // -10% на трассе
  city: 1.2,     // +20% в городе
  mixed: 1.0     // базовый расход
};

const LOAD_WEIGHT_FACTOR = 0.15; // +15% расхода за каждые 10 тонн груза

export class FuelCalculator {
  
  /**
   * Рассчитывает расход топлива и стоимость
   */
  static async calculateFuelConsumption(data: FuelCalculationData): Promise<FuelCalculationResult> {
    try {
      // Базовый расход топлива
      const baseConsumption = data.fuelConsumptionPer100km || 
                             FUEL_CONSUMPTION_NORMS[data.vehicleType as keyof typeof FUEL_CONSUMPTION_NORMS] || 
                             FUEL_CONSUMPTION_NORMS.truck;

      // Базовое потребление на весь маршрут
      const baseFuelConsumption = (data.distance / 100) * baseConsumption;

      // Корректировка по факторам
      let adjustmentFactor = 1.0;
      
      // Влияние погоды
      if (data.weatherConditions && data.weatherConditions in WEATHER_FACTORS) {
        adjustmentFactor *= WEATHER_FACTORS[data.weatherConditions];
      }

      // Влияние типа дороги
      if (data.roadType && data.roadType in ROAD_TYPE_FACTORS) {
        adjustmentFactor *= ROAD_TYPE_FACTORS[data.roadType];
      }

      // Влияние веса груза (для каждых 10 тонн +15%)
      if (data.loadWeight && data.loadWeight > 0) {
        const loadFactor = 1 + (data.loadWeight / 10000) * LOAD_WEIGHT_FACTOR;
        adjustmentFactor *= loadFactor;
      }

      const adjustedFuelConsumption = baseFuelConsumption * adjustmentFactor;

      // Получение цен на топливо
      const fuelPrices = await this.getFuelPrices();
      const averageFuelPrice = fuelPrices.reduce((sum, station) => sum + station.price, 0) / fuelPrices.length || 65;
      
      const fuelCost = adjustedFuelConsumption * averageFuelPrice;

      // Поиск возможностей экономии
      const cheapestStation = fuelPrices.reduce((min, station) => 
        station.price < min.price ? station : min, fuelPrices[0]);
      
      const potentialSavings = cheapestStation ? 
        (averageFuelPrice - cheapestStation.price) * adjustedFuelConsumption : 0;

      // Объяснение расчета
      const explanation = this.buildExplanation({
        baseConsumption,
        distance: data.distance,
        weatherConditions: data.weatherConditions,
        roadType: data.roadType,
        loadWeight: data.loadWeight,
        adjustmentFactor,
        adjustedFuelConsumption,
        averageFuelPrice
      });

      return {
        baseFuelConsumption,
        adjustedFuelConsumption,
        fuelCost,
        fuelPricePerLiter: averageFuelPrice,
        nearestStations: fuelPrices.slice(0, 5), // топ-5 ближайших
        explanation,
        savingsOpportunity: cheapestStation && potentialSavings > 0 ? {
          cheapestStation,
          potentialSavings
        } : undefined
      };

    } catch (error) {
      console.error('Ошибка расчета топлива:', error);
      throw new Error('Не удалось рассчитать расход топлива');
    }
  }

  /**
   * Получает актуальные цены на топливо
   */
  private static async getFuelPrices(): Promise<FuelPrice[]> {
    // Моковые данные (в реальном проекте - API запрос)
    return [
      {
        price: 62.5,
        station: 'Лукойл',
        distance: 2.1,
        latitude: 55.7558,
        longitude: 37.6176
      },
      {
        price: 63.8,
        station: 'Роснефть',
        distance: 1.5,
        latitude: 55.7558,
        longitude: 37.6176
      },
      {
        price: 61.2,
        station: 'Газпром нефть',
        distance: 3.2,
        latitude: 55.7558,
        longitude: 37.6176
      },
      {
        price: 64.1,
        station: 'Татнефть',
        distance: 2.8,
        latitude: 55.7558,
        longitude: 37.6176
      },
      {
        price: 59.9,
        station: 'Независимая АЗС',
        distance: 4.5,
        latitude: 55.7558,
        longitude: 37.6176
      }
    ];
  }

  /**
   * Строит объяснение расчета
   */
  private static buildExplanation(params: any): string {
    let explanation = `Базовый расход: ${params.baseConsumption} л/100км × ${params.distance} км = ${params.baseConsumption * params.distance / 100} л. `;
    
    if (params.weatherConditions && params.weatherConditions !== 'normal') {
      const weatherPercent = ((WEATHER_FACTORS[params.weatherConditions] - 1) * 100).toFixed(0);
      explanation += `Поправка на погоду: +${weatherPercent}%. `;
    }

    if (params.roadType && params.roadType !== 'mixed') {
      const roadPercent = ((ROAD_TYPE_FACTORS[params.roadType] - 1) * 100).toFixed(0);
      const sign = ROAD_TYPE_FACTORS[params.roadType] > 1 ? '+' : '';
      explanation += `Поправка на тип дороги: ${sign}${roadPercent}%. `;
    }

    if (params.loadWeight && params.loadWeight > 0) {
      const loadPercent = ((params.loadWeight / 10000) * LOAD_WEIGHT_FACTOR * 100).toFixed(0);
      explanation += `Поправка на вес груза (${(params.loadWeight / 1000).toFixed(1)} т): +${loadPercent}%. `;
    }

    explanation += `Итого: ${params.adjustedFuelConsumption.toFixed(1)} л × ${params.averageFuelPrice.toFixed(1)} руб/л = ${(params.adjustedFuelConsumption * params.averageFuelPrice).toFixed(0)} руб.`;

    return explanation;
  }

  /**
   * Интеграция с данными маршрута из бэкенда
   */
  static async calculateFromRoute(route: RouteResponseDto): Promise<FuelCalculationResult> {
    const data: FuelCalculationData = {
      distance: route.distanceKm || 0,
      vehicleType: 'truck',
      fuelConsumptionPer100km: route.estimatedFuelConsumption ? 
        (route.estimatedFuelConsumption / (route.distanceKm || 1)) * 100 : undefined,
      weatherConditions: route.weatherRiskScore && route.weatherRiskScore > 3 ? 'bad' : 'normal',
      roadType: 'mixed'
    };

    return this.calculateFuelConsumption(data);
  }
} 