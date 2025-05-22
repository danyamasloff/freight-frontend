import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/features/fleet/components/vehicle-form';
import { useGetVehicleQuery } from '@/shared/api/vehiclesApiSlice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditVehiclePage() {
    const { id } = useParams<{ id: string }>();
    const vehicleId = parseInt(id || '0');
    const navigate = useNavigate();

    const { data: vehicle, isLoading, error } = useGetVehicleQuery(vehicleId, {
        skip: isNaN(vehicleId) || vehicleId <= 0
    });

    if (isNaN(vehicleId) || vehicleId <= 0) {
        navigate('/fleet');
        return null;
    }

    if (error) {
        return (
            <div className="container py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить данные ТС. Пожалуйста, попробуйте позже.
                    </AlertDescription>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link to="/fleet">
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
                    <Link to={`/fleet/${vehicleId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к ТС
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">
                    {isLoading
                        ? "Загрузка данных..."
                        : `Редактирование: ${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`
                    }
                </h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Загрузка данных ТС...</span>
                </div>
            ) : (
                <VehicleForm initialData={vehicle} id={vehicleId} />
            )}
        </div>
    );
}