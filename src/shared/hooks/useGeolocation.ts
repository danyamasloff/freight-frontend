import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Геолокация не поддерживается браузером',
        loading: false,
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Неизвестная ошибка'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Доступ к геолокации запрещен'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Информация о местоположении недоступна'
          break
        case error.TIMEOUT:
          errorMessage = 'Время ожидания геолокации истекло'
          break
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 300000, // 5 минут
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geoOptions
    )
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Геолокация не поддерживается браузером',
        loading: false,
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Неизвестная ошибка'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Доступ к геолокации запрещен'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Информация о местоположении недоступна'
          break
        case error.TIMEOUT:
          errorMessage = 'Время ожидания геолокации истекло'
          break
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 300000,
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geoOptions
    )
  }

  return {
    ...state,
    refetch,
  }
} 