import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateDriverStatusMutation } from '@/shared/api/driversApiSlice';
import { DrivingStatus } from '@/shared/types/driver';

interface DriverStatusUpdateProps {
    driverId: number;
    currentStatus?: DrivingStatus;
}

export function DriverStatusUpdate({ driverId, currentStatus }: DriverStatusUpdateProps) {
    const [selectedStatus, setSelectedStatus] = useState<DrivingStatus | undefined>(undefined);
    const [updateStatus, { isLoading }] = useUpdateDriverStatusMutation();
    const { toast } = useToast();

    const handleStatusChange = async () => {
        if (!selectedStatus || selectedStatus === currentStatus) return;

        try {
            await updateStatus({
                driverId,
                status: selectedStatus,
                timestamp: new Date().toISOString()
            }).unwrap();

            toast({
                title: "Статус обновлен",
                description: `Статус водителя успешно изменен на "${formatStatus(selectedStatus)}"`,
            });
        } catch (error) {
            toast({
                title: "Ошибка обновления статуса",
                description: "Не удалось обновить статус водителя",
                variant: "destructive"
            });
        }
    };

    // Форматирование отображения статуса
    const formatStatus = (status?: DrivingStatus) => {
        if (!status) return 'Неизвестно';

        switch (status) {
            case DrivingStatus.DRIVING:
                return 'За рулем';
            case DrivingStatus.REST_BREAK:
                return 'Короткий отдых';
            case DrivingStatus.DAILY_REST:
                return 'Дневной отдых';
            case DrivingStatus.WEEKLY_REST:
                return 'Недельный отдых';
            case DrivingStatus.OTHER_WORK:
                return 'Другая работа';
            case DrivingStatus.AVAILABILITY:
                return 'Доступен';
            default:
                return status;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Изменение статуса</CardTitle>
                <CardDescription>Обновление текущего статуса водителя</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as DrivingStatus)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(DrivingStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {formatStatus(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleStatusChange}
                        disabled={isLoading || !selectedStatus || selectedStatus === currentStatus}
                        className="md:w-auto w-full"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Обновить статус
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}