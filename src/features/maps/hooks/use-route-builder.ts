import { useState, useCallback } from 'react'
import { RoutePoint, RouteInfo } from '../types'
import { useWeatherAnalytics } from '@/features/weather/hooks/use-weather-analytics'

interface UseRouteBuilderOptions {
  enableWeatherAnalytics?: boolean
  vehicleType?: 'car' | 'truck'
  avoidTolls?: boolean
  avoidHighways?: boolean
}

interface UseRouteBuilderResult {
  route: RoutePoint[]
  routeInfo: RouteInfo | null
  isBuilding: boolean
  error: string | null
  addPoint: (coordinates: [number, number], address?: string) => void
  removePoint: (index: number) => void
  clearRoute: () => void
  buildRoute: () => Promise<void>
  setStartPoint: (coordinates: [number, number], address?: string) => void
  setEndPoint: (coordinates: [number, number], address?: string) => void
}

export function useRouteBuilder(options: UseRouteBuilderOptions = {}): UseRouteBuilderResult {
  const {
    enableWeatherAnalytics = true,
    vehicleType = 'truck',
    avoidTolls = false,
    avoidHighways = false
  } = options

  const [route, setRoute] = useState<RoutePoint[]>([])
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Получаем погодную аналитику для маршрута
  const {
    weatherData,
    riskAssessment,
    isLoading: isLoadingWeather
  } = useWeatherAnalytics({
    startPoint: route.find(p => p.type === 'start')?.coordinates,
    endPoint: route.find(p => p.type === 'end')?.coordinates,
    waypoints: route.filter(p => p.type === 'waypoint').map(p => p.coordinates),
    enabled: enableWeatherAnalytics && route.length >= 2
  })

  // Добавление точки маршрута
  const addPoint = useCallback((coordinates: [number, number], address?: string) => {
    setRoute(prev => {
      const newPoint: RoutePoint = {
        coordinates,
        address,
        type: prev.length === 0 ? 'start' : 'waypoint'
      }
      return [...prev, newPoint]
    })
  }, [])

  // Удаление точки маршрута
  const removePoint = useCallback((index: number) => {
    setRoute(prev => {
      const newRoute = prev.filter((_, i) => i !== index)
      // Переназначаем типы точек
      return newRoute.map((point, i) => ({
        ...point,
        type: i === 0 ? 'start' as const :
              i === newRoute.length - 1 ? 'end' as const :
              'waypoint' as const
      }))
    })
  }, [])

  // Очистка маршрута
  const clearRoute = useCallback(() => {
    setRoute([])
    setRouteInfo(null)
    setError(null)
  }, [])

  // Установка начальной точки
  const setStartPoint = useCallback((coordinates: [number, number], address?: string) => {
    setRoute(prev => {
      const newRoute = prev.filter(p => p.type !== 'start')
      const startPoint: RoutePoint = {
        coordinates,
        address,
        type: 'start'
      }
      return [startPoint, ...newRoute]
    })
  }, [])

  // Установка конечной точки
  const setEndPoint = useCallback((coordinates: [number, number], address?: string) => {
    setRoute(prev => {
      const newRoute = prev.filter(p => p.type !== 'end')
      const endPoint: RoutePoint = {
        coordinates,
        address,
        type: 'end'
      }
      
      // Если есть только начальная точка, добавляем конечную
      if (newRoute.length === 1 && newRoute[0].type === 'start') {
        return [...newRoute, endPoint]
      }
      
      // Иначе заменяем последнюю точку на конечную
      return [...newRoute.slice(0, -1), endPoint]
    })
  }, [])

  // Построение маршрута
  const buildRoute = useCallback(async () => {
    if (route.length < 2) {
      setError('Необходимо указать минимум 2 точки')
      return
    }

    const startPoint = route.find(p => p.type === 'start')
    const endPoint = route.find(p => p.type === 'end')

    if (!startPoint || !endPoint) {
      setError('Необходимо указать начальную и конечную точки')
      return
    }

    setIsBuilding(true)
    setError(null)

    try {
      // Здесь должен быть вызов API для построения маршрута
      // Пока используем моковые данные
      
      // Рассчитываем примерное расстояние (по прямой)
      const distance = calculateDistance(
        startPoint.coordinates[1], startPoint.coordinates[0],
        endPoint.coordinates[1], endPoint.coordinates[0]
      ) * 1000 // в метрах

      // Примерное время (60 км/ч для грузовика, 80 км/ч для легкового)
      const avgSpeed = vehicleType === 'truck' ? 60 : 80
      const duration = (distance / 1000) / avgSpeed * 3600 // в секундах

      // Примерная стоимость топлива
      const fuelConsumption = vehicleType === 'truck' ? 25 : 8 // л/100км
      const fuelPrice = 55 // руб/л
      const fuelCost = (distance / 1000) * (fuelConsumption / 100) * fuelPrice

      // Координаты маршрута (упрощенно - прямая линия)
      const coordinates: [number, number][] = [
        startPoint.coordinates,
        ...route.filter(p => p.type === 'waypoint').map(p => p.coordinates),
        endPoint.coordinates
      ]

      const newRouteInfo: RouteInfo = {
        distance,
        duration,
        fuelCost,
        riskScore: riskAssessment?.overallRisk || 0,
        coordinates
      }

      setRouteInfo(newRouteInfo)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка построения маршрута')
    } finally {
      setIsBuilding(false)
    }
  }, [route, vehicleType, riskAssessment])

  return {
    route,
    routeInfo,
    isBuilding: isBuilding || isLoadingWeather,
    error,
    addPoint,
    removePoint,
    clearRoute,
    buildRoute,
    setStartPoint,
    setEndPoint
  }
}

// Функция для расчета расстояния между двумя точками (формула гаверсинуса)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
} 