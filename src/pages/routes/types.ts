// Типы и константы для страниц маршрутов

export const ROUTE_STATUS_CONFIG = {
    PLANNED: {
        label: 'Запланирован',
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        variant: 'outline' as const,
        icon: '📅',
    },
    IN_PROGRESS: {
        label: 'В пути',
        color: 'orange',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        variant: 'default' as const,
        icon: '🚛',
    },
    COMPLETED: {
        label: 'Завершен',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        variant: 'secondary' as const,
        icon: '✅',
    },
    CANCELLED: {
        label: 'Отменен',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        variant: 'destructive' as const,
        icon: '❌',
    },
} as const;

export type RouteStatus = keyof typeof ROUTE_STATUS_CONFIG;

export interface RouteStatusInfo {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

// Дополнительные константы для работы с маршрутами
export const ROUTE_RISK_LEVELS = {
    LOW: {
        label: 'Низкий',
        color: 'green',
        value: 'low',
    },
    MEDIUM: {
        label: 'Средний',
        color: 'yellow',
        value: 'medium',
    },
    HIGH: {
        label: 'Высокий',
        color: 'red',
        value: 'high',
    },
} as const;

export const ROUTE_PRIORITIES = {
    LOW: 'Низкий',
    NORMAL: 'Обычный',
    HIGH: 'Высокий',
    URGENT: 'Срочный',
} as const; 