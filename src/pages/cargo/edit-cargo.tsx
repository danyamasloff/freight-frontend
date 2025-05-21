import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CargoForm } from '@/features/cargo/cargo-form';
import { useGetCargoQuery } from '@/shared/api/cargoSlice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function EditCargoPage() {
    const { id } = useParams<{ id: string }>();
    const cargoId = parseInt(id || '0');
    const navigate = useNavigate();

    const { data: cargo, isLoading, error } = useGetCargoQuery(cargoId);

    useEffect(() => {
        if (!id || isNaN(cargoId)) {
            navigate('/cargo');
        }
    }, [id, cargoId, navigate]);

    if (error) {
        return (
            <div className="container py-8">
                <Alert variant="destructive" className="max-w-4xl mx-auto">
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить данные груза. Пожалуйста, попробуйте позже.
                    </AlertDescription>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/cargo')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6 text-muted-foreground">
                <Button variant="link" asChild className="p-0">
                    <Link to="/cargo">Грузы</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Button variant="link" asChild className="p-0">
                    <Link to={`/cargo/${id}`}>{cargo?.name || `Груз #${id}`}</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Редактирование</span>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center">
                        <Package className="h-6 w-6 mr-2" />
                        Редактирование груза
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Измените информацию о грузе
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link to={`/cargo/${id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к просмотру
                    </Link>
                </Button>
            </div>

            <div className="max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Загрузка данных груза...</span>
                    </div>
                ) : (
                    <CargoForm initialData={cargo} id={cargoId} />
                )}
            </div>
        </div>
    );
}