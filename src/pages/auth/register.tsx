import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Truck,
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Loader2,
    AlertCircle,
    CheckCircle,
    UserPlus
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
import { useRegisterMutation } from '@/shared/api/authSlice'

const registerSchema = z.object({
    username: z.string()
        .min(3, 'Имя пользователя должно содержать минимум 3 символа')
        .max(50, 'Слишком длинное имя пользователя')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания'),
    email: z.string()
        .email('Некорректный email адрес')
        .max(100, 'Слишком длинный email'),
    firstName: z.string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Слишком длинное имя'),
    lastName: z.string()
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(50, 'Слишком длинная фамилия'),
    password: z.string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать строчные и заглавные буквы, а также цифры'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [register, { isLoading, error }] = useRegisterMutation()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const { confirmPassword, ...registerData } = data
            await register(registerData).unwrap()

            setRegistrationSuccess(true)
            toast({
                title: 'Регистрация успешна',
                description: 'Аккаунт был создан. Теперь вы можете войти в систему.',
            })

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (err: any) {
            toast({
                title: 'Ошибка регистрации',
                description: err.data?.message || 'Произошла ошибка при регистрации',
                variant: 'destructive',
            })
        }
    }

    const errorMessage = error && 'data' in error
        ? (error.data as any)?.message || 'Произошла ошибка при регистрации'
        : error && 'message' in error
            ? error.message
            : null

    if (registrationSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />

                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 w-full max-w-md">
                    <CardContent className="text-center py-16">
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-full shadow-lg">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-green-800 mb-4">
                            Регистрация завершена!
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Ваш аккаунт был успешно создан.
                            Вы будете перенаправлены на страницу входа.
                        </p>
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm">Перенаправление...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />

            <div className="relative w-full max-w-lg">
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
                    <CardHeader className="text-center pb-6 pt-8">
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Регистрация
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Создайте аккаунт в TruckNavigator
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
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Имя</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Иван"
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
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Фамилия</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Иванов"
                                                        disabled={isLoading}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Имя пользователя</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="ivan.ivanov"
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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        placeholder="ivan@example.com"
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

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Подтвердите пароль</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Повторите пароль"
                                                        className="pl-10 pr-10"
                                                        disabled={isLoading}
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? (
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
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    disabled={isLoading}
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Создание аккаунта...
                                        </>
                                    ) : (
                                        'Зарегистрироваться'
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Уже есть аккаунт?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Войти
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <p className="text-sm text-white/70">
                        © 2024 TruckNavigator. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    )
}