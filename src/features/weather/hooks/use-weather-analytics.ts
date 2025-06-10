import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface WeatherData {
  current?: {
    temperature: number
    humidity: number
    windSpeed: number
    visibility: number
    description: string
    icon: string
  }
  forecast?: Array<{
    date: string
    temperature: {
      min: number
      max: number
    }
    humidity: number
    windSpeed: number
    description: string
    icon: string
  }>
}

export interface RiskFactor {
  name: string
  impact: number
  description: string
}

export interface RiskAssessment {
  overallRisk: number
  factors: RiskFactor[]
  recommendations: string[]
}

interface WeatherAnalyticsParams {
  startPoint?: [number, number]
  endPoint?: [number, number]
  waypoints?: [number, number][]
  enabled?: boolean
}

interface WeatherAnalyticsResult {
  weatherData: WeatherData | null
  riskAssessment: RiskAssessment | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export function useWeatherAnalytics({
  startPoint,
  endPoint,
  waypoints = [],
  enabled = true
}: WeatherAnalyticsParams): WeatherAnalyticsResult {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchWeatherAnalytics = useCallback(async () => {
    if (!enabled || !startPoint || !endPoint) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Формируем запрос к бэкенду для получения погодных данных
      const requestData = {
        startLat: startPoint[1],
        startLon: startPoint[0],
        endLat: endPoint[1],
        endLon: endPoint[0],
        waypoints: waypoints.map(point => ({
          lat: point[1],
          lon: point[0]
        }))
      }

      // Получаем погодные данные для маршрута
      const weatherResponse = await axios.post(
        `${API_BASE_URL}/weather/route-analysis`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const weatherResult = weatherResponse.data

      // Обрабатываем данные о погоде
      const processedWeatherData: WeatherData = {
        current: weatherResult.current ? {
          temperature: weatherResult.current.temperature,
          humidity: weatherResult.current.humidity,
          windSpeed: weatherResult.current.windSpeed,
          visibility: weatherResult.current.visibility,
          description: weatherResult.current.description,
          icon: weatherResult.current.icon
        } : undefined,
        forecast: weatherResult.forecast?.map((item: any) => ({
          date: item.date,
          temperature: {
            min: item.temperatureMin,
            max: item.temperatureMax
          },
          humidity: item.humidity,
          windSpeed: item.windSpeed,
          description: item.description,
          icon: item.icon
        }))
      }

      // Получаем оценку рисков
      const riskResponse = await axios.post(
        `${API_BASE_URL}/weather/risk-assessment`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const riskResult = riskResponse.data

      // Обрабатываем данные о рисках
      const processedRiskAssessment: RiskAssessment = {
        overallRisk: riskResult.overallRisk || 0,
        factors: riskResult.factors?.map((factor: any) => ({
          name: factor.name,
          impact: factor.impact,
          description: factor.description
        })) || [],
        recommendations: riskResult.recommendations || []
      }

      setWeatherData(processedWeatherData)
      setRiskAssessment(processedRiskAssessment)

    } catch (err) {
      console.error('Ошибка получения погодной аналитики:', err)
      
      // Если бэкенд недоступен, используем моковые данные
      if (axios.isAxiosError(err) && (err.code === 'ECONNREFUSED' || err.response?.status === 404)) {
        console.warn('Бэкенд недоступен, используем моковые данные')
        
        // Моковые данные для демонстрации
        const mockWeatherData: WeatherData = {
          current: {
            temperature: Math.round(Math.random() * 30 - 10), // -10 до 20°C
            humidity: Math.round(Math.random() * 40 + 40), // 40-80%
            windSpeed: Math.round(Math.random() * 15), // 0-15 м/с
            visibility: Math.round(Math.random() * 10 + 5), // 5-15 км
            description: ['Ясно', 'Облачно', 'Дождь', 'Снег'][Math.floor(Math.random() * 4)],
            icon: '01d'
          },
          forecast: Array.from({ length: 5 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            temperature: {
              min: Math.round(Math.random() * 20 - 5),
              max: Math.round(Math.random() * 20 + 5)
            },
            humidity: Math.round(Math.random() * 40 + 40),
            windSpeed: Math.round(Math.random() * 15),
            description: ['Ясно', 'Облачно', 'Дождь', 'Снег'][Math.floor(Math.random() * 4)],
            icon: '01d'
          }))
        }

        // Рассчитываем риски на основе погодных условий
        const calculateRisk = (weather: WeatherData): RiskAssessment => {
          const factors: RiskFactor[] = []
          let totalRisk = 0

          // Анализ температуры
          if (weather.current) {
            if (weather.current.temperature < -10) {
              factors.push({
                name: 'Низкая температура',
                impact: 30,
                description: 'Риск обледенения дороги'
              })
              totalRisk += 30
            } else if (weather.current.temperature > 35) {
              factors.push({
                name: 'Высокая температура',
                impact: 15,
                description: 'Риск перегрева двигателя'
              })
              totalRisk += 15
            }

            // Анализ ветра
            if (weather.current.windSpeed > 10) {
              factors.push({
                name: 'Сильный ветер',
                impact: 25,
                description: 'Затрудненное управление транспортом'
              })
              totalRisk += 25
            }

            // Анализ видимости
            if (weather.current.visibility < 5) {
              factors.push({
                name: 'Плохая видимость',
                impact: 40,
                description: 'Ограниченная видимость на дороге'
              })
              totalRisk += 40
            }

            // Анализ влажности
            if (weather.current.humidity > 80) {
              factors.push({
                name: 'Высокая влажность',
                impact: 10,
                description: 'Возможность тумана'
              })
              totalRisk += 10
            }
          }

          // Ограничиваем общий риск до 100%
          totalRisk = Math.min(totalRisk, 100)

          // Генерируем рекомендации
          const recommendations: string[] = []
          if (totalRisk > 50) {
            recommendations.push('Рассмотрите возможность переноса поездки')
            recommendations.push('Увеличьте дистанцию до других транспортных средств')
          }
          if (factors.some(f => f.name.includes('температура'))) {
            recommendations.push('Проверьте техническое состояние автомобиля')
          }
          if (factors.some(f => f.name.includes('ветер'))) {
            recommendations.push('Снизьте скорость движения')
          }
          if (factors.some(f => f.name.includes('видимость'))) {
            recommendations.push('Включите фары и будьте особенно внимательны')
          }

          return {
            overallRisk: totalRisk,
            factors,
            recommendations
          }
        }

        setWeatherData(mockWeatherData)
        setRiskAssessment(calculateRisk(mockWeatherData))
      } else {
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [startPoint, endPoint, waypoints, enabled])

  // Автоматически загружаем данные при изменении параметров
  useEffect(() => {
    if (enabled && startPoint && endPoint) {
      fetchWeatherAnalytics()
    }
  }, [fetchWeatherAnalytics, enabled, startPoint, endPoint])

  const refetch = useCallback(() => {
    fetchWeatherAnalytics()
  }, [fetchWeatherAnalytics])

  return {
    weatherData,
    riskAssessment,
    isLoading,
    error,
    refetch
  }
} 