import React, { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/shared/utils/format'

export interface Notification {
    id: string
    type: 'weather' | 'route' | 'compliance' | 'vehicle' | 'driver' | 'system'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    timestamp: Date
    read: boolean
    actionRequired?: boolean
    routeId?: number
    driverId?: number
    vehicleId?: number
    metadata?: Record<string, any>
}

interface NotificationCenterProps {
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
    onDismiss: (id: string) => void
    onNotificationClick?: (notification: Notification) => void
    className?: string
}

const getNotificationIcon = (type: Notification['type'], severity: Notification['severity']) => {
    const iconClass = cn(
        'h-4 w-4',
        severity === 'critical' && 'text-red-500',
        severity === 'high' && 'text-orange-500',
        severity === 'medium' && 'text-yellow-500',
        severity === 'low' && 'text-blue-500'
    )

    switch (type) {
        case 'weather':
            return <AlertTriangle className={iconClass} />
        case 'route':
            return <Navigation className={iconClass} />
        case 'compliance':
            return <Clock className={iconClass} />
        case 'vehicle':
            return <AlertTriangle className={iconClass} />
        case 'driver':
            return <Info className={iconClass} />
        case 'system':
            return <CheckCircle className={iconClass} />
        default:
            return <Info className={iconClass} />
    }
}

const getSeverityBadge = (severity: Notification['severity']) => {
    const variants = {
        low: 'default',
        medium: 'secondary',
        high: 'destructive',
        critical: 'destructive'
    } as const

    const labels = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий',
        critical: 'Критический'
    }

    return (
        <Badge variant={variants[severity]} className="text-xs">
            {labels[severity]}
        </Badge>
    )
}

const getTypeLabel = (type: Notification['type']) => {
    const labels = {
        weather: 'Погода',
        route: 'Маршрут',
        compliance: 'РТО',
        vehicle: 'ТС',
        driver: 'Водитель',
        system: 'Система'
    }
    return labels[type]
}

export function NotificationCenter({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDismiss,
    onNotificationClick,
    className
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false)
    
    const unreadCount = notifications.filter(n => !n.read).length
    const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read).length

    // Группируем уведомления по типам
    const groupedNotifications = notifications.reduce((acc, notification) => {
        if (!acc[notification.type]) {
            acc[notification.type] = []
        }
        acc[notification.type].push(notification)
        return acc
    }, {} as Record<string, Notification[]>)

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id)
        }
        onNotificationClick?.(notification)
    }

    return (
        <div className={cn('relative', className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <Badge 
                        variant={criticalCount > 0 ? "destructive" : "default"}
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 top-12 w-96 max-h-96 z-50 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Уведомления</CardTitle>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onMarkAllAsRead}
                                        className="text-xs"
                                    >
                                        Прочитать все
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-6 w-6"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {unreadCount} непрочитанных уведомлений
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-80">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Нет уведомлений</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {Object.entries(groupedNotifications).map(([type, typeNotifications]) => (
                                        <div key={type}>
                                            <div className="px-4 py-2 bg-muted/50">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {getTypeLabel(type as Notification['type'])}
                                                </p>
                                            </div>
                                            {typeNotifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={cn(
                                                        'p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors',
                                                        !notification.read && 'bg-blue-50/50 dark:bg-blue-950/20'
                                                    )}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {getNotificationIcon(notification.type, notification.severity)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className={cn(
                                                                    'text-sm font-medium truncate',
                                                                    !notification.read && 'font-semibold'
                                                                )}>
                                                                    {notification.title}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    {getSeverityBadge(notification.severity)}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            onDismiss(notification.id)
                                                                        }}
                                                                        className="h-4 w-4 opacity-50 hover:opacity-100"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDateTime(notification.timestamp)}
                                                                </p>
                                                                {notification.actionRequired && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Требует действий
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 