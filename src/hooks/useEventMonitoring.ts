import { useEffect, useRef } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

// Типы событий для мониторинга
interface MonitoringEvent {
  id: string
  type: 'route_deadline' | 'maintenance_due' | 'license_expiry' | 'cargo_deadline'
  checkTime: Date
  data: any
}

// Хук для мониторинга событий и сроков
export function useEventMonitoring() {
  const { addNotification } = useNotifications()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkedEventsRef = useRef<Set<string>>(new Set())

  // Функция проверки сроков техобслуживания
  const checkMaintenanceDue = () => {
    // Симуляция данных о ТС, требующих ТО
    const vehiclesNeedingMaintenance = [
      {
        id: 'vehicle_1',
        licensePlate: 'А123БВ77',
        lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 дней назад
        maintenanceInterval: 90 // дней
      }
    ]

    vehiclesNeedingMaintenance.forEach(vehicle => {
      const daysSinceLastMaintenance = Math.floor(
        (Date.now() - vehicle.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000)
      )
      
      const eventId = `maintenance_${vehicle.id}_${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`
      
      if (daysSinceLastMaintenance >= vehicle.maintenanceInterval && !checkedEventsRef.current.has(eventId)) {
        addNotification({
          type: 'vehicle_maintenance',
          title: 'Требуется техобслуживание',
          message: `ТС ${vehicle.licensePlate} требует планового ТО (${daysSinceLastMaintenance} дней с последнего обслуживания)`,
          priority: 'high'
        })
        checkedEventsRef.current.add(eventId)
      }
    })
  }

  // Функция проверки сроков доставки
  const checkRouteDeadlines = () => {
    // Симуляция активных маршрутов с дедлайнами
    const activeRoutes = [
      {
        id: 'route_1',
        name: 'Москва - СПб экспресс',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // через 2 часа
        status: 'in_progress'
      }
    ]

    activeRoutes.forEach(route => {
      const hoursUntilDeadline = Math.floor(
        (route.deadline.getTime() - Date.now()) / (60 * 60 * 1000)
      )
      
      const eventId = `deadline_${route.id}_${Math.floor(Date.now() / (60 * 60 * 1000))}`
      
      if (hoursUntilDeadline <= 2 && hoursUntilDeadline > 0 && !checkedEventsRef.current.has(eventId)) {
        addNotification({
          type: 'alert',
          title: 'Приближается дедлайн',
          message: `Маршрут "${route.name}" должен быть завершен через ${hoursUntilDeadline} ч.`,
          priority: 'high'
        })
        checkedEventsRef.current.add(eventId)
      }
    })
  }

  // Функция проверки истечения документов
  const checkDocumentExpiry = () => {
    // Симуляция водительских прав и других документов
    const documents = [
      {
        id: 'license_1',
        driverName: 'Петров А.И.',
        type: 'Водительские права',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // через 30 дней
      }
    ]

    documents.forEach(doc => {
      const daysUntilExpiry = Math.floor(
        (doc.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      )
      
      const eventId = `expiry_${doc.id}_${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0 && !checkedEventsRef.current.has(eventId)) {
        addNotification({
          type: 'alert',
          title: 'Истекает срок документа',
          message: `${doc.type} водителя ${doc.driverName} истекает через ${daysUntilExpiry} дн.`,
          priority: 'medium'
        })
        checkedEventsRef.current.add(eventId)
      }
    })
  }

  // Основная функция мониторинга
  const runMonitoring = () => {
    checkMaintenanceDue()
    checkRouteDeadlines()
    checkDocumentExpiry()
    
    // Очищаем старые события (старше 24 часов)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const eventsToRemove = Array.from(checkedEventsRef.current).filter(eventId => {
      const timestamp = parseInt(eventId.split('_').pop() || '0') * 1000
      return timestamp < oneDayAgo
    })
    
    eventsToRemove.forEach(eventId => {
      checkedEventsRef.current.delete(eventId)
    })
  }

  useEffect(() => {
    // Запускаем первую проверку через 5 секунд после загрузки
    const initialTimeout = setTimeout(() => {
      runMonitoring()
    }, 5000)

    // Затем проверяем каждые 30 минут
    intervalRef.current = setInterval(() => {
      runMonitoring()
    }, 30 * 60 * 1000) // 30 минут

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Функция для принудительной проверки (можно вызвать вручную)
  const forceCheck = () => {
    runMonitoring()
  }

  return {
    forceCheck
  }
} 