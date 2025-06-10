import React, { createContext, useContext, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { NotificationData, useWebSocket } from '@/hooks/useWebSocket'
import { NotificationToast } from '@/components/ui/notifications'

interface NotificationContextType {
  notifications: NotificationData[]
  isConnected: boolean
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
  showToast: (notification: NotificationData) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { notifications, isConnected, markAsRead, clearNotifications, sendMessage } = useWebSocket()
  const [toastNotifications, setToastNotifications] = useState<NotificationData[]>([])

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    
    // Отправляем уведомление через WebSocket (в реальном приложении)
    sendMessage({
      type: 'notification',
      data: newNotification
    })
    
    // Показываем toast для важных уведомлений
    if (notification.priority === 'high') {
      showToast(newNotification)
    }
  }

  const showToast = (notification: NotificationData) => {
    setToastNotifications(prev => [...prev, notification])
    
    // Автоматически убираем toast через 5 секунд
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Показываем toast для новых важных уведомлений
  useEffect(() => {
    const latestNotification = notifications[0]
    if (latestNotification && latestNotification.priority === 'high' && !latestNotification.read) {
      showToast(latestNotification)
    }
  }, [notifications])

  const value: NotificationContextType = {
    notifications,
    isConnected,
    addNotification,
    markAsRead,
    clearNotifications,
    showToast
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toastNotifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
} 