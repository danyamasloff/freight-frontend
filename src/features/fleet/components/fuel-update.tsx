import { useState } from 'react';
import { Loader2, Fuel } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUpdateFuelLevelMutation } from '@/shared/api/vehiclesApiSlice';

// Схема валидации
const fuelSchema = z.object({
    fuelLevel: z.coerce.number()
        .min(0, { message: "Уровень топлива не может быть отрицательным" })
});

interface FuelUpdateProps {
    vehicleId: number;
    currentFuel?: number;
    tankCapacity?: number;
}

export function FuelUpdate({ vehicleId, currentFuel = 0, tankCapacity = 0 }: FuelUpdateProps) {
    const [updateFuel, { isLoading }] = useUpdateFuelLevelMutation();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof fuelSchema>>({
        resolver: zodResolver(fuelSchema),
        defaultValues: {
            fuelLevel: currentFuel
        }
    });

    const onSubmit = async (values: z.infer<typeof fuelSchema>) => {
        try {
            await updateFuel({
                id: vehicleId,
                fuelLevel: values.fuelLevel
            }).unwrap();

            toast({
                title: "Уровень топлива обновлен",
                description: `Новый уровень топлива: ${values.fuelLevel} л`
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить уровень топлива",
                variant: "destructive"
            });
        }
    };

    // Расчет процента заполнения бака
    const getFuelPercentage = () => {
        if (!tankCapacity || tankCapacity === 0) return 0;
        const percentage = (form.watch('fuelLevel') / tankCapacity) * 100;
        return Math.min(100, Math.max(0, percentage));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Уровень топлива</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Визуализация уровня топлива */}
                        <div className="mb-4">
                            <div className="h-6 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 transition-all"
                                    style={{ width: `${getFuelPercentage()}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                                <span>0 л</span>
                                <span>{tankCapacity} л</span>
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <FormField
                                control={form.control}
                                name="fuelLevel"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Текущий уровень (л)</FormLabel>
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
                                    <Fuel className="h-4 w-4 mr-2" />
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