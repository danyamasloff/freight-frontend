import axios from 'axios';
import { WeatherInfo, RouteRequest, CalculatedRoute } from '@/shared/types/route';

// API ключи (в реальном проекте должны быть в .env)
const OPENWEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY || 'demo_key';
const GRAPHHOPPER_API_KEY = process.env.VITE_GRAPHHOPPER_API_KEY || 'demo_key';

// OpenWeatherMap API клиент
export class OpenWeatherMapAPI {
    private baseURL = 'https://api.openweathermap.org/data/2.5';

    async getCurrentWeather(lat: number, lon: number): Promise<WeatherInfo> {
        try {
            const response = await axios.get(`${this.baseURL}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: OPENWEATHER_API_KEY,
                    units: 'metric',
                    lang: 'ru'
                }
            });

            const data = response.data;
            return {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                windDirection: data.wind.deg,
                precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
                visibility: data.visibility / 1000, // в км
                conditions: data.weather[0].description,
                icon: data.weather[0].icon,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('OpenWeatherMap API error:', error);
            throw new Error('Не удалось получить данные о погоде');
        }
    }

    async getWeatherForecast(lat: number, lon: number, days: number = 5): Promise<WeatherInfo[]> {
        try {
            const response = await axios.get(`${this.baseURL}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: OPENWEATHER_API_KEY,
                    units: 'metric',
                    lang: 'ru',
                    cnt: days * 8 // 8 прогнозов в день (каждые 3 часа)
                }
            });

            return response.data.list.map((item: any) => ({
                temperature: item.main.temp,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                windDirection: item.wind.deg,
                precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
                visibility: 10, // По умолчанию
                conditions: item.weather[0].description,
                icon: item.weather[0].icon,
                timestamp: item.dt_txt
            }));
        } catch (error) {
            console.error('OpenWeatherMap forecast API error:', error);
            throw new Error('Не удалось получить прогноз погоды');
        }
    }
}

// GraphHopper API клиент
export class GraphHopperAPI {
    private baseURL = 'https://graphhopper.com/api/1';

    async calculateRoute(request: RouteRequest): Promise<CalculatedRoute> {
        try {
            const response = await axios.get(`${this.baseURL}/route`, {
                params: {
                    point: [`${request.from.lat},${request.from.lng}`, `${request.to.lat},${request.to.lng}`],
                    vehicle: request.vehicle.type,
                    locale: 'ru',
                    instructions: true,
                    calc_points: true,
                    details: ['road_class', 'surface', 'toll'],
                    key: GRAPHHOPPER_API_KEY,
                    // Параметры для грузовиков
                    'vehicle.weight': request.vehicle.weight,
                    'vehicle.height': request.vehicle.height,
                    'vehicle.width': request.vehicle.width,
                    'vehicle.length': request.vehicle.length,
                    'vehicle.axle_weight': request.vehicle.axleWeight,
                    'vehicle.hazmat': request.vehicle.hazmat || false,
                    // Предпочтения маршрута
                    'avoid': this.buildAvoidString(request.preferences)
                }
            });

            const route = response.data.paths[0];
            
            return {
                id: this.generateRouteId(),
                segments: this.parseRouteSegments(route),
                analytics: await this.calculateAnalytics(route, request),
                alternativeRoutes: response.data.paths.slice(1).map((path: any) => ({
                    id: this.generateRouteId(),
                    segments: this.parseRouteSegments(path),
                    analytics: this.calculateAnalytics(path, request),
                    metadata: {
                        calculatedAt: new Date().toISOString(),
                        requestParams: request,
                        provider: 'GraphHopper'
                    }
                })),
                metadata: {
                    calculatedAt: new Date().toISOString(),
                    requestParams: request,
                    provider: 'GraphHopper'
                }
            };
        } catch (error) {
            console.error('GraphHopper API error:', error);
            throw new Error('Не удалось рассчитать маршрут');
        }
    }

    private buildAvoidString(preferences: any): string {
        const avoid = [];
        if (preferences.avoidTolls) avoid.push('toll');
        if (preferences.avoidFerries) avoid.push('ferry');
        if (preferences.avoidHighways) avoid.push('motorway');
        return avoid.join(',');
    }

    private parseRouteSegments(route: any): any[] {
        // Парсинг сегментов маршрута из ответа GraphHopper
        const instructions = route.instructions || [];
        return instructions.map((instruction: any, index: number) => ({
            id: `segment_${index}`,
            geometry: this.decodePolyline(route.points),
            distance: instruction.distance,
            duration: instruction.time,
            instructions: instruction.text,
            roadQuality: this.determineRoadQuality(instruction),
            tollInfo: this.extractTollInfo(instruction)
        }));
    }

    private decodePolyline(encoded: string): [number, number][] {
        // Упрощенная версия декодирования polyline
        // В реальном проекте использовать библиотеку polyline
        return [];
    }

    private determineRoadQuality(instruction: any): any {
        // Определение качества дороги на основе данных GraphHopper
        return {
            surface: 'asphalt',
            condition: 'good',
            score: 80,
            restrictions: []
        };
    }

    private extractTollInfo(instruction: any): any {
        // Извлечение информации о платных участках
        return null;
    }

    private async calculateAnalytics(route: any, request: RouteRequest): Promise<any> {
        // Расчет аналитики маршрута
        const fuelConsumption = this.calculateFuelConsumption(route.distance, request.vehicle);
        const fuelPrice = await this.getCurrentFuelPrice();
        
        return {
            totalDistance: route.distance,
            totalDuration: route.time,
            totalCost: fuelConsumption * fuelPrice,
            fuelCost: fuelConsumption * fuelPrice,
            tollCosts: [],
            weatherRisks: [],
            roadRisks: [],
            recommendations: this.generateRecommendations(route, request)
        };
    }

    private calculateFuelConsumption(distance: number, vehicle: any): number {
        // Расчет расхода топлива в литрах
        const baseConsumption = vehicle.type === 'truck' ? 35 : 8; // л/100км
        return (distance / 1000 / 100) * baseConsumption;
    }

    private async getCurrentFuelPrice(): Promise<number> {
        // В реальном проекте - запрос к API цен на топливо
        return 52.5; // руб/литр
    }

    private generateRecommendations(route: any, request: RouteRequest): string[] {
        const recommendations = [];
        
        if (route.time > 8 * 60 * 60 * 1000) { // более 8 часов
            recommendations.push('Рекомендуется запланировать обязательный отдых');
        }
        
        if (request.vehicle.weight > 20000) {
            recommendations.push('Проверьте весовые ограничения на маршруте');
        }
        
        return recommendations;
    }

    private generateRouteId(): string {
        return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Экспорт экземпляров
export const openWeatherAPI = new OpenWeatherMapAPI();
export const graphHopperAPI = new GraphHopperAPI(); 