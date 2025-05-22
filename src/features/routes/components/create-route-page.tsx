import { Link } from 'react-router-dom'
import { ArrowLeft, Route as RouteIcon, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RouteForm } from './route-form'

export function CreateRoutePage() {
    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/routes">Маршруты</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Создание маршрута</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <RouteIcon className="h-8 w-8" />
                    Создание нового маршрута
                </h1>
                <p className="text-muted-foreground mt-1">
                    Планирование маршрута доставки с назначением ресурсов
                </p>
            </div>

            <RouteForm />
        </div>
    )
}