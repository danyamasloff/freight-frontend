/**
 * Format distance in meters to human readable format
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} м`
    }

    const kilometers = meters / 1000
    if (kilometers < 10) {
        return `${kilometers.toFixed(1)} км`
    }

    return `${Math.round(kilometers)} км`
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours === 0) {
        return `${minutes} мин`
    }

    if (minutes === 0) {
        return `${hours} ч`
    }

    return `${hours} ч ${minutes} мин`
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'RUB'): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
    }).format(amount)
}

/**
 * Format coordinates to string
 */
export function formatCoordinates([lng, lat]: [number, number]): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}