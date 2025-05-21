import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DriverForm } from '@/features/drivers/components/driver-form';
import { useGetDriverQuery } from '@/shared/api/driversApiSlice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditDriverPage() {
    const { id } = useParams<{ id: string }>();
    const driverId = parseInt(id || '0');
    const navigate = useNavigate();

    const { data: driver, isLoading, error } = useGetDriverQuery(driverId, {
        skip: isNaN(driverId) || driverId <= 0
    });

    if (isNaN(driverId) || driverId <= 0) {
        navigate('/drivers');
        return null;
    }

    if (error) {
        return (
            <div className="container py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить данные водителя. Пожалуйста, попробуйте позже.
                    </AlertDescription>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link to="/drivers">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                        </Link>
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button variant="outline" asChild>
                    <Link to={`/drivers/${driverId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к водителю
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">
                    {isLoading
                        ? "Загрузка данных..."
                        : `Редактирование данных водителя: ${driver?.lastName} ${driver?.firstName}`
                    }
                </h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Загрузка данных водителя...</span>
                </div>
            ) : (
                <DriverForm initialData={driver} id={driverId} />
            )}
        </div>
    );
}