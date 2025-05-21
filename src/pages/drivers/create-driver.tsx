import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DriverForm } from '@/features/drivers/components/driver-form';

export default function CreateDriverPage() {
    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button variant="outline" asChild>
                    <Link to="/drivers">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">Создание нового водителя</h1>
            </div>
            <DriverForm />
        </div>
    );
}