import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    type Notification,
} from '@/shared/api/notificationsSlice';

export interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    showToasts?: boolean;
}

export interface UseNotificationsReturn {
    // Данные
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: any;
    
    // Группировка
    groupedNotifications: {
        today: Notification[];
        yesterday: Notification[];
        thisWeek: Notification[];
        older: Notification[];
    };
    
    // Фильтрация
    unreadNotifications: Notification[];
    criticalNotifications: Notification[];
    
    // Действия
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    refetch: () => void;
    
    // Состояние
    hasUnread: boolean;
    hasCritical: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
    const {
        autoRefresh = true,
        refreshInterval = 30000, // 30 секунд
        showToasts = true,
    } = options;
    
    const { toast } = useToast();
    
    // API hooks
    const { 
        data: notifications = [], 
        isLoading, 
        error,
        refetch 
    } = useGetNotificationsQuery({});
    
    const { data: unreadCount = 0 } = useGetUnreadCountQuery();
    
    const [markAsReadMutation] = useMarkAsReadMutation();
    const [markAllAsReadMutation] = useMarkAllAsReadMutation();
    const [deleteNotificationMutation] = useDeleteNotificationMutation();

    // Автоматическое обновление
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            refetch();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refetch]);

    // Группировка уведомлений по времени
    const groupedNotifications = useCallback(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const groups = {
            today: [] as Notification[],
            yesterday: [] as Notification[],
            thisWeek: [] as Notification[],
            older: [] as Notification[],
        };

        notifications.forEach((notification) => {
            const date = new Date(notification.createdAt);
            if (date >= today) {
                groups.today.push(notification);
            } else if (date >= yesterday) {
                groups.yesterday.push(notification);
            } else if (date >= thisWeek) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    }, [notifications]);

    // Фильтрация уведомлений
    const unreadNotifications = notifications.filter(n => !n.read);
    
    const criticalNotifications = notifications.filter(n => 
        ['SYSTEM_ERROR', 'VEHICLE_FUEL_LOW', 'WEATHER_ALERT', 'COMPLIANCE_WARNING'].includes(n.type)
    );

    // Действия с уведомлениями
    const markAsRead = useCallback(async (id: number) => {
        try {
            await markAsReadMutation(id).unwrap();
            
            if (showToasts) {
                toast({
                    title: "✓ Уведомление прочитано",
                    description: "Уведомление помечено как прочитанное",
                });
            }
        } catch (error) {
            if (showToasts) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось отметить уведомление как прочитанное",
                    variant: "destructive",
                });
            }
            throw error;
        }
    }, [markAsReadMutation, showToasts, toast]);

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllAsReadMutation().unwrap();
            
            if (showToasts) {
                toast({
                    title: "✓ Все уведомления прочитаны",
                    description: "Все уведомления помечены как прочитанные",
                });
            }
        } catch (error) {
            if (showToasts) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось отметить все уведомления как прочитанные",
                    variant: "destructive",
                });
            }
            throw error;
        }
    }, [markAllAsReadMutation, showToasts, toast]);

    const deleteNotification = useCallback(async (id: number) => {
        try {
            await deleteNotificationMutation(id).unwrap();
            
            if (showToasts) {
                toast({
                    title: "✓ Уведомление удалено",
                    description: "Уведомление успешно удалено",
                });
            }
        } catch (error) {
            if (showToasts) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось удалить уведомление",
                    variant: "destructive",
                });
            }
            throw error;
        }
    }, [deleteNotificationMutation, showToasts, toast]);

    return {
        // Данные
        notifications,
        unreadCount,
        isLoading,
        error,
        
        // Группировка
        groupedNotifications: groupedNotifications(),
        
        // Фильтрация
        unreadNotifications,
        criticalNotifications,
        
        // Действия
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch,
        
        // Состояние
        hasUnread: unreadCount > 0,
        hasCritical: criticalNotifications.length > 0,
    };
} 