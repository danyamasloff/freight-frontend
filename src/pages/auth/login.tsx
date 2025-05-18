import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Truck,
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useLoginMutation } from '@/shared/api/authSlice'
import { useAppDispatch } from '@/shared/hooks/redux'
import { setCredentials } from '@/app/store/authSlice'

const loginSchema = z.object({
    username: z.string()
        .min(1, 'Имя пользователя обязательно')
        .max(50, 'Слишком длинное имя пользователя'),
    password: z.string()
        .min(1, 'Пароль обязателен')
        .min(6, 'Пароль должен содержать минимум 6 символов'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [login, { isLoading, error }] = useLoginMutation()
    const [showPassword, setShowPassword] = useState(false)

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

            // Save credentials
            dispatch(setCredentials(result))
            localStorage.setItem('token', result.accessToken)
            localStorage.setItem('refreshToken', result.refreshToken)
            localStorage.setItem('username', result.username)

            toast({
                title: 'Успешный вход',
                description: `Добро пожаловать, ${result.username}!`,
            })

            // Redirect to the page user was trying to access, or dashboard
            const from = (location.state as any)?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
        } catch (err: any) {
            toast({
                title: 'Ошибка входа',
                description: err.data?.message || 'Неверные учетные данные',
                variant: 'destructive',
            })
        }
    }

    const errorMessage = error && 'data' in error
        ? (error.data as any)?.message || 'Произошла ошибка при входе'
        : error && 'message' in error
            ? error.message
            : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />

            <div className="relative w-full max-w-md">
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
                    <CardHeader className="text-center pb-8 pt-8">
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                                <Truck className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            TruckNavigator
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Система управления грузоперевозками
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {errorMessage && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Имя пользователя</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Введите имя пользователя"
                                                        className="pl-10"
                                                        disabled={isLoading}
                                                        {...field}
                                                    />
                                                </div>
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
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Введите пароль"
                                                        className="pl-10 pr-10"
                                                        disabled={isLoading}
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    disabled={isLoading}
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Вход...
                                        </>
                                    ) : (
                                        'Войти'
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Нет аккаунта?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Зарегистрироваться
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-white/70">
                        © 2024 TruckNavigator. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    )
}