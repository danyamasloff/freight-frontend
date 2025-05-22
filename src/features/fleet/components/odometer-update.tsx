import { Loader2, Gauge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUpdateOdometerMutation } from '@/shared/api/vehiclesApiSlice';

// Схема валидации
const odometerSchema = z.object({
    odometerValue: z.coerce.number()
        .min(0, { message: "Пробег не может быть отрицательным" })
});

interface OdometerUpdateProps {
    vehicleId: number;
    currentOdometer?: number;
}

export function OdometerUpdate({ vehicleId, currentOdometer = 0 }: OdometerUpdateProps) {
    const [updateOdometer, { isLoading }] = useUpdateOdometerMutation();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof odometerSchema>>({
        resolver: zodResolver(odometerSchema),
        defaultValues: {
            odometerValue: currentOdometer
        }
    });

    const onSubmit = async (values: z.infer<typeof odometerSchema>) => {
        try {
            await updateOdometer({
                id: vehicleId,
                odometerValue: values.odometerValue
            }).unwrap();

            toast({
                title: "Пробег обновлен",
                description: `Новый пробег: ${values.odometerValue} км`
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить пробег",
                variant: "destructive"
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Пробег</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-end gap-4">
                            <FormField
                                control={form.control}
                                name="odometerValue"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Текущий пробег (км)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="mb-[1px]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Gauge className="h-4 w-4 mr-2" />
                                )}
                                Обновить
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}