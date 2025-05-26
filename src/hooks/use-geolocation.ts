import {useState, useCallback, useRef} from 'react'

export interface GeolocationPosition {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp?: number
}

export interface GeolocationError {
    code: number
    message: string
}

export interface UseGeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const [position, setPosition] = useState<GeolocationPosition | null>(null)
    const [error, setError] = useState<GeolocationError | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const watchIdRef = useRef<number | null>(null)

    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 300000, // 5 минут
    } = options

    const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = {
                    code: 0,
                    message: 'Геолокация не поддерживается вашим браузером'
                }
                setError(error)
                reject(error)
                return
            }

            setIsLoading(true)
            setError(null)

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const position: GeolocationPosition = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        timestamp: pos.timestamp,
                    }

                    setPosition(position)
                    setIsLoading(false)
                    setError(null)
                    resolve(position)
                },
                (err) => {
                    let message = 'Не удалось определить местоположение'

                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            message = 'Доступ к геолокации запрещен'
                            break
                        case err.POSITION_UNAVAILABLE:
                            message = 'Информация о местоположении недоступна'
                            break
                        case err.TIMEOUT:
                            message = 'Превышено время ожидания запроса местоположения'
                            break
                    }

                    const error = {
                        code: err.code,
                        message,
                    }

                    setError(error)
                    setIsLoading(false)
                    reject(error)
                },
                {
                    enableHighAccuracy,
                    timeout,
                    maximumAge,
                }
            )
        })
    }, [enableHighAccuracy, timeout, maximumAge])

    const watchPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError({
                code: 0,
                message: 'Геолокация не поддерживается вашим браузером'
            })
            return
        }

        // Останавливаем предыдущее отслеживание
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
        }

        setIsLoading(true)
        setError(null)

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const position: GeolocationPosition = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp,
                }

                setPosition(position)
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                let message = 'Не удалось определить местоположение'

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        message = 'Доступ к геолокации запрещен'
                        break
                    case err.POSITION_UNAVAILABLE:
                        message = 'Информация о местоположении недоступна'
                        break
                    case err.TIMEOUT:
                        message = 'Превышено время ожидания запроса местоположения'
                        break
                }

                setError({
                    code: err.code,
                    message,
                })
                setIsLoading(false)
            },
            {
                enableHighAccuracy,
                timeout,
                maximumAge,
            }
        )
    }, [enableHighAccuracy, timeout, maximumAge])

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
    }, [])

    const clearPosition = useCallback(() => {
        setPosition(null)
        setError(null)
        stopWatching()
    }, [stopWatching])

    return {
        position,
        error,
        isLoading,
        getCurrentPosition,
        watchPosition,
        stopWatching,
        clearPosition,
        isSupported: !!navigator.geolocation,
    }
}