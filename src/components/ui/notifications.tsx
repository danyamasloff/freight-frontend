import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellRing, 
  Check, 
  Trash2, 
  Route, 
  Users, 
  Truck, 
  AlertTriangle,
  Package,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { NotificationData } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'

interface NotificationsProps {
  notifications: NotificationData[]
  isConnected: boolean
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
}

const getNotificationIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'route_created':
    case 'route_completed':
      return Route
    case 'driver_assigned':
      return Users
    case 'vehicle_maintenance':
      return Truck
    case 'alert':
      return AlertTriangle
    case 'cargo_delivered':
      return Package
    default:
      return Bell
  }
}

const getNotificationColor = (priority: NotificationData['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-500 bg-red-50'
    case 'medium':
      return 'text-yellow-500 bg-yellow-50'
    case 'low':
      return 'text-blue-500 bg-blue-50'
    default:
      return 'text-gray-500 bg-gray-50'
  }
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  return `${days} дн назад`
}

export function NotificationsDropdown({ 
  notifications, 
  isConnected, 
  onMarkAsRead, 
  onClearAll 
}: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Уведомления</span>
          </div>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2"
              >
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-muted-foreground">
                {unreadCount} непрочитанных
              </span>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-6 px-2 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Очистить
                </Button>
              )}
            </div>
            <ScrollArea className="h-80">
              <div className="space-y-1">
                <AnimatePresence>
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type)
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <DropdownMenuItem
                          className={cn(
                            "flex items-start space-x-3 p-3 cursor-pointer",
                            !notification.read && "bg-muted/50"
                          )}
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <div className={cn(
                            "p-2 rounded-full flex-shrink-0",
                            getNotificationColor(notification.priority)
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium leading-none">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Toast уведомления для важных событий
export function NotificationToast({ notification }: { notification: NotificationData }) {
  const IconComponent = getNotificationIcon(notification.type)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className="bg-background border rounded-lg shadow-lg p-4 w-80"
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          "p-2 rounded-full flex-shrink-0",
          getNotificationColor(notification.priority)
        )}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatTime(notification.timestamp)}
            </span>
            <Badge variant="outline" className="text-xs">
              {notification.priority}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 