import { useState } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface UseGeocodeResult {
  geocodeAddress: (address: string) => Promise<GeoLocation | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export const useGeocode = (): UseGeocodeResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string): Promise<GeoLocation | null> => {
    if (!address.trim()) return null;
    
    setLoading(true);
    setError(null);

    try {
      // Используем Яндекс Геокодер API
      const ymaps = (window as any).ymaps;
      if (!ymaps) {
        throw new Error('Яндекс.Карты не загружены');
      }

      const result = await ymaps.geocode(address, {
        results: 1, // получаем только первый результат
      });

      const geoObjects = result.geoObjects;
      if (geoObjects.getLength() === 0) {
        setError('Адрес не найден');
        return null;
      }

      const firstGeoObject = geoObjects.get(0);
      const coords = firstGeoObject.geometry.getCoordinates();
      const addressFormatted = firstGeoObject.getAddressLine();

      return {
        latitude: coords[0],
        longitude: coords[1],
        address: addressFormatted,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка геокодирования';
      setError(errorMessage);
      console.error('Ошибка геокодирования:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const ymaps = (window as any).ymaps;
      if (!ymaps) {
        throw new Error('Яндекс.Карты не загружены');
      }

      const result = await ymaps.geocode([lat, lng], {
        results: 1,
      });

      const geoObjects = result.geoObjects;
      if (geoObjects.getLength() === 0) {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      const firstGeoObject = geoObjects.get(0);
      return firstGeoObject.getAddressLine();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обратного геокодирования';
      setError(errorMessage);
      console.error('Ошибка обратного геокодирования:', err);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setLoading(false);
    }
  };

  return {
    geocodeAddress,
    reverseGeocode,
    loading,
    error,
  };
}; 