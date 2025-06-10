import { useEffect, useRef, useState } from 'react'

export interface NotificationData {
  id: string
  type: 'route_created' | 'route_completed' | 'driver_assigned' | 'vehicle_maintenance' | 'alert' | 'cargo_delivered'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
  read?: boolean
  data?: any
}

interface UseWebSocketReturn {
  isConnected: boolean
  notifications: NotificationData[]
  sendMessage: (message: any) => void
  clearNotifications: () => void
  markAsRead: (id: string) => void
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Для демонстрации используем mock WebSocket
  const wsUrl = url || 'ws://localhost:8080/ws/notifications'

  const connect = () => {
    try {
      // В реальном проекте здесь будет настоящий WebSocket
      // wsRef.current = new WebSocket(wsUrl)
      
      // Симуляция WebSocket соединения
      setIsConnected(true)
      
      // Добавляем начальные демо-уведомления
      const initialNotifications: NotificationData[] = [
        {
          id: '1',
          type: 'route_completed',
          title: 'Маршрут завершен',
          message: 'Маршрут Москва - Казань успешно завершен водителем Петровым А.И.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 минут назад
          priority: 'high',
          read: false
        },
        {
          id: '2',
          type: 'vehicle_maintenance',
          title: 'Требуется техобслуживание',
          message: 'Транспортное средство МН123АВ требует планового ТО',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
          priority: 'medium',
          read: false
        },
        {
          id: '3',
          type: 'driver_assigned',
          title: 'Водитель назначен',
          message: 'Водитель Сидоров В.П. назначен на маршрут Москва - Нижний Новгород',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
          priority: 'low',
          read: true
        }
      ]
      
      setNotifications(initialNotifications)
      
      // Симуляция получения новых уведомлений
      const mockNotifications = () => {
        const notificationTypes = ['route_created', 'cargo_delivered', 'alert', 'driver_assigned', 'vehicle_maintenance']
        const priorities = ['low', 'medium', 'high'] as const
        const messages = [
          'Создан новый маршрут доставки',
          'Груз успешно доставлен в пункт назначения',
          'Обнаружена проблема с транспортным средством',
          'Водитель назначен на новый маршрут',
          'Требуется техническое обслуживание'
        ]
        
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)] as NotificationData['type']
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        
        const newNotification: NotificationData = {
          id: Date.now().toString(),
          type: randomType,
          title: `${randomType === 'route_created' ? 'Новый маршрут' : 
                   randomType === 'cargo_delivered' ? 'Груз доставлен' :
                   randomType === 'alert' ? 'Внимание' :
                   randomType === 'driver_assigned' ? 'Водитель назначен' :
                   'Техобслуживание'}`,
          message: randomMessage,
          timestamp: new Date(),
          priority: randomPriority,
          read: false
        }
        
        setNotifications(prev => [newNotification, ...prev].slice(0, 50))
      }

      // Убираем автоматический спам уведомлений
      // Уведомления будут приходить только при реальных событиях через addNotification
      
      return () => {
        // Cleanup function
      }

      /* Реальная реализация WebSocket:
      wsRef.current.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationData
          setNotifications(prev => [data, ...prev].slice(0, 50))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        
        // Автоматическое переподключение через 5 секунд
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      */
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      setIsConnected(false)
    }
  }

  const sendMessage = (message: any) => {
    // В реальном приложении отправляем через WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
    
    // Для демонстрации добавляем уведомление напрямую
    if (message.type === 'notification' && message.data) {
      setNotifications(prev => [message.data, ...prev].slice(0, 50))
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    )
  }

  useEffect(() => {
    const cleanup = connect()

    return () => {
      if (cleanup) cleanup()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [wsUrl])

  return {
    isConnected,
    notifications,
    sendMessage,
    clearNotifications,
    markAsRead
  }
} 