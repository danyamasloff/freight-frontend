import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useLoginMutation } from '@/shared/api/authSlice'
import { useAppDispatch } from '@/shared/hooks/redux'
import { setCredentials } from '@/app/store/authSlice'
import { Car } from 'lucide-react'

const loginSchema = z.object({
    username: z.string().min(1, 'Имя пользователя обязательно'),
    password: z.string().min(1, 'Пароль обязателен'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [login, { isLoading }] = useLoginMutation()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            const result = await login(data).unwrap()

            // Сохраняем токены
            dispatch(setCredentials(result))
            localStorage.setItem('token', result.accessToken)
            localStorage.setItem('refreshToken', result.refreshToken)
            localStorage.setItem('username', result.username)

            toast({
                title: 'Успешный вход',
                description: `Добро пожаловать, ${result.username}!`,
            })

            navigate('/dashboard')
        } catch (error: any) {
            toast({
                title: 'Ошибка входа',
                description: error.data?.message || 'Неверные учетные данные',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-[400px]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Car className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">TruckNavigator</CardTitle>
                    <p className="text-muted-foreground">
                        Войдите в систему управления грузоперевозками
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Имя пользователя</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Пароль</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Вход...' : 'Войти'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}