import { Link } from 'react-router-dom'
import { User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DriverForm } from './driver-form'

export function CreateDriverPage() {
    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/drivers">Водители</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Добавление водителя</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <User className="h-8 w-8" />
                    Добавление нового водителя
                </h1>
                <p className="text-muted-foreground mt-1">
                    Заполните информацию о водителе для добавления в систему управления автопарком
                </p>
            </div>

            <DriverForm />
        </div>
    )
}