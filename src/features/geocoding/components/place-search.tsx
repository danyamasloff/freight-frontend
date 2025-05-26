import React, { useState, useMemo } from 'react'
import { Search, MapPin, Fuel, Coffee, Car, Hotel, CreditCard, Plus, Loader2, Navigation, AlertCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from 'use-debounce'
import { useGeocoding } from '../hooks/use-geocoding'
import { useSearchPlacesQuery } from '@/shared/api/geocodingSlice'
import type { GeoLocation, POICategory } from '@/shared/types/api'

interface PlaceSearchProps {
    onPlaceSelect?: (place: GeoLocation) => void
    className?: string
    placeholder?: string
    showCurrentLocation?: boolean
    defaultRadius?: number
}

const POI_CATEGORIES = [
    { id: 'fuel' as POICategory, label: 'АЗС', icon: Fuel, description: 'Заправочные станции' },
    { id: 'food' as POICategory, label: 'Еда', icon: Coffee, description: 'Кафе и рестораны' },
    { id: 'parking' as POICategory, label: 'Парковка', icon: Car, description: 'Места для стоянки' },
    { id: 'lodging' as POICategory, label: 'Ночлег', icon: Hotel, description: 'Отели и мотели' },
    { id: 'atms' as POICategory, label: 'Банкоматы', icon: CreditCard, description: 'Банкоматы и банки' },
    { id: 'pharmacies' as POICategory, label: 'Аптеки', icon: Plus, description: 'Аптеки и медпункты' },
    { id: 'hospitals' as POICategory, label: 'Больницы', icon: Building2, description: 'Больницы и клиники' },
] as const

export function PlaceSearch({
                                onPlaceSelect,
                                className = '',
                                placeholder = 'Поиск мест, адресов, POI...',
                                showCurrentLocation = true,
                                defaultRadius = 10000,
                            }: PlaceSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery] = useDebounce(searchQuery, 300)
    const [activeTab, setActiveTab] = useState<'search' | POICategory>('search')

    const {
        position,
        getCurrentPosition,
        isLocationLoading,
        calculateDistance,
        formatDistance,
        queries
    } = useGeocoding({ defaultRadius })

    // Поиск по запросу
    const searchParams = useMemo(() => ({
        query: debouncedQuery,
        limit: 10,
        lat: position?.latitude,
        lon: position?.longitude,
    }), [debouncedQuery, position])

    const {
        data: searchResults,
        isLoading: searchLoading,
        error: searchError,
    } = useSearchPlacesQuery(searchParams, {
        skip: !debouncedQuery || debouncedQuery.length < 2,
    })

    const handlePlaceClick = (place: GeoLocation) => {
        // Убеждаемся, что есть алиасы для совместимости
        const enrichedPlace: GeoLocation = {
            ...place,
            lat: place.latitude,
            lng: place.longitude,
            // Добавляем расстояние если есть позиция
            ...(position && {
                distance: calculateDistance(place),
                distanceFormatted: formatDistance(calculateDistance(place))
            })
        }
        onPlaceSelect?.(enrichedPlace)
    }

    const handleGetCurrentLocation = () => {
        getCurrentPosition().catch((error) => {
            console.error('Ошибка получения местоположения:', error)
        })
    }

    const PlaceItem = ({ place }: { place: GeoLocation }) => {
        const distance = position ? calculateDistance(place) : 0

        return (
            <div
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handlePlaceClick(place)}
            >
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{place.name}</p>
                    {(place.description || place.displayName) && (
                        <p className="text-xs text-muted-foreground truncate">
                            {place.description || place.displayName}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                            {place.type || place.category || 'Место'}
                        </Badge>
                        {position && distance > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {formatDistance(distance)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Поиск мест
                </CardTitle>
                <CardDescription>
                    Найдите нужное место или выберите из категорий POI
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Геолокация */}
                {showCurrentLocation && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGetCurrentLocation}
                                disabled={isLocationLoading}
                                className="flex-shrink-0"
                            >
                                {isLocationLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Navigation className="h-4 w-4 mr-2" />
                                )}
                                {isLocationLoading ? 'Определение...' : 'Моё местоположение'}
                            </Button>

                            {position && (
                                <div className="text-xs text-muted-foreground">
                                    {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="search">Поиск</TabsTrigger>
                        <TabsTrigger value="fuel">АЗС</TabsTrigger>
                        <TabsTrigger value="food">Еда</TabsTrigger>
                        <TabsTrigger value="parking">Авто</TabsTrigger>
                    </TabsList>

                    {/* Поиск по запросу */}
                    <TabsContent value="search" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {searchError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>Ошибка поиска. Попробуйте еще раз.</AlertDescription>
                            </Alert>
                        )}

                        <ScrollArea className="h-96">
                            {searchLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="ml-2 text-sm text-muted-foreground">Поиск...</span>
                                </div>
                            ) : searchResults && searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((place, index) => (
                                        <PlaceItem key={`${place.id || index}`} place={place} />
                                    ))}
                                </div>
                            ) : debouncedQuery && debouncedQuery.length >= 2 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    Ничего не найдено
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    Введите запрос для поиска
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* POI категории */}
                    {POI_CATEGORIES.slice(0, 3).map((category) => {
                        const query = queries[category.id]

                        return (
                            <TabsContent key={category.id} value={category.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <category.icon className="h-4 w-4" />
                                        <span className="font-medium">{category.label}</span>
                                    </div>
                                    {position && (
                                        <Badge variant="outline" className="text-xs">
                                            Радиус: {Math.round(defaultRadius / 1000)} км
                                        </Badge>
                                    )}
                                </div>

                                {!position ? (
                                    <Alert>
                                        <Navigation className="h-4 w-4" />
                                        <AlertDescription>
                                            Определите местоположение для поиска {category.label.toLowerCase()}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <ScrollArea className="h-80">
                                        {query.isLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <span className="ml-2 text-sm text-muted-foreground">
                                                    Поиск {category.label.toLowerCase()}...
                                                </span>
                                            </div>
                                        ) : query.data && query.data.length > 0 ? (
                                            <div className="space-y-2">
                                                {query.data.map((place, index) => (
                                                    <PlaceItem key={`${place.id || index}`} place={place} />
                                                ))}
                                            </div>
                                        ) : query.error ? (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Ошибка загрузки {category.label.toLowerCase()}
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                {category.label} не найдены в радиусе {Math.round(defaultRadius / 1000)} км
                                            </div>
                                        )}
                                    </ScrollArea>
                                )}
                            </TabsContent>
                        )
                    })}
                </Tabs>

                {/* Дополнительные категории */}
                {position && (
                    <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2">
                            {POI_CATEGORIES.slice(3).map((category) => {
                                const query = queries[category.id]
                                return (
                                    <Button
                                        key={category.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveTab(category.id)}
                                        className="justify-start"
                                        disabled={query?.isLoading}
                                    >
                                        {query?.isLoading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <category.icon className="h-4 w-4 mr-2" />
                                        )}
                                        {category.label}
                                        {query?.data && query.data.length > 0 && (
                                            <Badge variant="secondary" className="ml-auto">
                                                {query.data.length}
                                            </Badge>
                                        )}
                                    </Button>
                                )
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}