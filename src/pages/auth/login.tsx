import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    AlertCircle,
    Truck,
} from 'lucide-react'

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useLoginMutation } from '@/shared/api/authSlice'
import { useAppDispatch } from '@/shared/hooks/redux'
import { setCredentials } from '@/app/store/authSlice'
import Blackhole from '@/components/ui/blackhole'

const loginSchema = z.object({
    username: z.string()
        .min(1, 'Имя пользователя не может быть пустым'),
    password: z.string()
        .min(1, 'Пароль не может быть пустым'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [login, { isLoading, error }] = useLoginMutation()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            console.log('Attempting login with:', { username: data.username })
            const result = await login(data).unwrap()

            // Для отладки выводим ответ, чтобы увидеть его структуру
            console.log('Login response:', result)

            // Проверяем наличие токена в ответе (теперь в поле token)
            if (!result.token) {
                console.error('No token in response:', result)
                throw new Error('No token received from server')
            }

            // Сохраняем токен в localStorage
            localStorage.setItem('token', result.token)
            localStorage.setItem('refreshToken', result.refreshToken || '')
            localStorage.setItem('username', result.username || '')

            // Для отладки проверяем сохранение
            console.log('Token saved, length:',
                result.token.length,
                'preview:',
                result.token.substring(0, 10) + '...')

            // Обновляем состояние Redux
            dispatch(setCredentials(result))

            toast({
                title: 'Успешный вход',
                description: 'Добро пожаловать в TruckNavigator!',
            })

            navigate('/dashboard')
        } catch (err: any) {
            console.error('Login error:', err)
            toast({
                title: 'Ошибка входа',
                description: err.data?.message || 'Неверное имя пользователя или пароль',
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
        <>
            {/* Фоновый компонент в цветах Claude */}
            <Blackhole
                strokeColor="oklch(0.60 0.15 35)"
                numberOfLines={60}
                numberOfDiscs={40}
                particleRGBColor={[153, 79, 57]}
            />

            {/* Основной контент */}
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background/80 to-accent/20">
                <div className="relative w-full max-w-md">
                    <Card className="claude-card backdrop-blur-lg bg-card/95 shadow-2xl">
                        <CardHeader className="text-center pb-6 pt-8">
                            <div className="flex justify-center mb-6">
                                <div className="claude-logo p-4 rounded-2xl shadow-lg">
                                    <Truck className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold claude-gradient-primary bg-clip-text text-transparent">
                                TruckNavigator
                            </h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Войдите в свой аккаунт
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {errorMessage && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Имя пользователя
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" />
                                        <Input
                                            {...register('username')}
                                            placeholder="Введите имя пользователя"
                                            className="pl-10 border-border focus:border-primary focus:ring-primary/20"
                                            disabled={isLoading}
                                            autoComplete="username"
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="text-sm text-destructive">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Пароль
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" />
                                        <Input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Введите пароль"
                                            className="pl-10 pr-10 border-border focus:border-primary focus:ring-primary/20"
                                            disabled={isLoading}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-primary hover:text-primary/80 transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <InteractiveHoverButton
                                    type="submit"
                                    disabled={isLoading || isSubmitting}
                                    className="w-full interactive-button-optimized"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Вход...
                                        </>
                                    ) : (
                                        'Войти в систему'
                                    )}
                                </InteractiveHoverButton>
                            </form>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Нет аккаунта?{' '}
                                    <Link
                                        to="/register"
                                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Зарегистрироваться
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-8">
                        <p className="text-sm text-muted-foreground">
                            © 2025 TruckNavigator. Все права защищены.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}