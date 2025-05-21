import React from 'react'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { RouteMap } from '@/features/maps/components'

export function RoutesPage() {
    return (
        <div className="h-full flex flex-col">
            {/* Заголовок страницы */}
            <div className="mb-6">
                <BackgroundGradient className="rounded-2xl p-6 bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Планирование маршрутов
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Постройте оптимальный маршрут для грузового транспорта с учетом дорожных условий и погоды
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Статус системы</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">Все системы работают</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </BackgroundGradient>
            </div>

            {/* Карта маршрутов */}
            <div className="flex-1 min-h-0">
                <BackgroundGradient className="rounded-2xl p-6 h-full bg-white dark:bg-zinc-900">
                    <RouteMap className="h-full" />
                </BackgroundGradient>
            </div>
        </div>
    )
}