import { apiSlice } from './apiSlice'

export interface Notification {
    id: number;
    type: string;
    entityId?: number;
    message: string;
    additionalData?: string;
    read: boolean;
    createdAt: string;
    readAt?: string;
    userId?: number;
}

export interface NotificationCreateRequest {
    type: string;
    entityId?: number;
    message: string;
    additionalData?: string;
    userId?: number;
}

export const notificationsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Получение всех уведомлений
        getNotifications: builder.query<Notification[], {
            unreadOnly?: boolean;
        }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.unreadOnly) searchParams.append('unreadOnly', 'true');
                
                return `/notifications?${searchParams}`;
            },
            providesTags: ['Notification'],
            transformResponse: (response: any[]) => 
                response.map(notification => ({
                    ...notification,
                    createdAt: notification.createdAt,
                    readAt: notification.readAt,
                }))
        }),

        // Получение количества непрочитанных уведомлений
        getUnreadCount: builder.query<number, void>({
            query: () => '/notifications/unread-count',
            providesTags: ['Notification'],
        }),

        // Отметить уведомление как прочитанное
        markAsRead: builder.mutation<void, number>({
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
        deleteNotification: builder.mutation<void, number>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
})

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} = notificationsSlice 