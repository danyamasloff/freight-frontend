import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, User, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useGetDriverQuery } from '@/shared/api/driversSlice'
import { DriverForm } from './driver-form'

export function EditDriverPage() {
    const { id } = useParams<{ id: string }>()
    const driverId = parseInt(id || '0')
    const navigate = useNavigate()

    const { data: driver, isLoading, error } = useGetDriverQuery(driverId)

    useEffect(() => {
        if (!id || isNaN(driverId)) {
            navigate('/drivers')
        }
    }, [id, driverId, navigate])

    if (error) {
        return (
            <div className="container py-8">
                <Alert variant="destructive" className="mx-auto max-w-4xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить данные о водителе. Пожалуйста, попробуйте позже.
                    </AlertDescription>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/drivers')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                    </Button>
                </Alert>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Загрузка данных водителя...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/drivers">Водители</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Button variant="link" asChild className="p-0">
                    <Link to={`/drivers/${driverId}`}>{driver?.name}</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Редактирование</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <User className="h-8 w-8" />
                    Редактирование водителя
                </h1>
                <p className="text-muted-foreground mt-1">
                    Редактирование информации о водителе "{driver?.name}"
                </p>
            </div>

            <DriverForm
                initialData={driver}
                id={driverId}
            />
        </div>
    )
}