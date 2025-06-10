import { apiSlice } from './apiSlice'
import type { Notification } from '@/components/ui/notification-center'

export interface NotificationCreateRequest {
    type: Notification['type']
    severity: Notification['severity']
    title: string
    message: string
    actionRequired?: boolean
    routeId?: number
    driverId?: number
    vehicleId?: number
    metadata?: Record<string, any>
}

export interface NotificationUpdateRequest {
    read?: boolean
    dismissed?: boolean
}

export const notificationsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Получение уведомлений для текущего пользователя
        getNotifications: builder.query<Notification[], {
            unreadOnly?: boolean
            type?: Notification['type']
            severity?: Notification['severity']
            limit?: number
        }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams()
                if (params.unreadOnly) searchParams.append('unreadOnly', 'true')
                if (params.type) searchParams.append('type', params.type)
                if (params.severity) searchParams.append('severity', params.severity)
                if (params.limit) searchParams.append('limit', params.limit.toString())
                
                return `/notifications?${searchParams}`
            },
            providesTags: ['Notification'],
            transformResponse: (response: any[]) => 
                response.map(notification => ({
                    ...notification,
                    timestamp: new Date(notification.timestamp)
                }))
        }),

        // Создание уведомления
        createNotification: builder.mutation<Notification, NotificationCreateRequest>({
            query: (notification) => ({
                url: '/notifications',
                method: 'POST',
                body: notification,
            }),
            invalidatesTags: ['Notification'],
            transformResponse: (response: any) => ({
                ...response,
                timestamp: new Date(response.timestamp)
            })
        }),

        // Отметить уведомление как прочитанное
        markAsRead: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Отметить все уведомления как прочитанные
        markAllAsRead: builder.mutation<void, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Удалить уведомление
        dismissNotification: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Получение уведомлений для конкретного маршрута
        getRouteNotifications: builder.query<Notification[], number>({
            query: (routeId) => `/notifications/route/${routeId}`,
            providesTags: (result, error, routeId) => [
                { type: 'Notification', id: `route-${routeId}` }
            ],
            transformResponse: (response: any[]) => 
                response.map(notification => ({
                    ...notification,
                    timestamp: new Date(notification.timestamp)
                }))
        }),

        // Получение уведомлений для конкретного водителя
        getDriverNotifications: builder.query<Notification[], number>({
            query: (driverId) => `/notifications/driver/${driverId}`,
            providesTags: (result, error, driverId) => [
                { type: 'Notification', id: `driver-${driverId}` }
            ],
            transformResponse: (response: any[]) => 
                response.map(notification => ({
                    ...notification,
                    timestamp: new Date(notification.timestamp)
                }))
        }),

        // Получение уведомлений для конкретного ТС
        getVehicleNotifications: builder.query<Notification[], number>({
            query: (vehicleId) => `/notifications/vehicle/${vehicleId}`,
            providesTags: (result, error, vehicleId) => [
                { type: 'Notification', id: `vehicle-${vehicleId}` }
            ],
            transformResponse: (response: any[]) => 
                response.map(notification => ({
                    ...notification,
                    timestamp: new Date(notification.timestamp)
                }))
        }),
    }),
})

export const {
    useGetNotificationsQuery,
    useCreateNotificationMutation,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDismissNotificationMutation,
    useGetRouteNotificationsQuery,
    useGetDriverNotificationsQuery,
    useGetVehicleNotificationsQuery,
} = notificationsSlice 