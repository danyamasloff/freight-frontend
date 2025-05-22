import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/features/fleet/components/vehicle-form';

export default function CreateVehiclePage() {
    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button variant="outline" asChild>
                    <Link to="/fleet">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">Добавление нового ТС</h1>
            </div>

            <VehicleForm />
        </div>
    );
}