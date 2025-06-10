import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { 
    AlertTriangle, 
    RefreshCw, 
    Home, 
    Bug,
    Copy,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
    copied: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { 
            hasError: false,
            copied: false
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return { 
            hasError: true, 
            error,
            copied: false
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        })
        
        // Логирование ошибки
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    copyErrorDetails = async () => {
        const errorDetails = `
Ошибка: ${this.state.error?.message}
Стек: ${this.state.error?.stack}
Компонент: ${this.state.errorInfo?.componentStack}
Время: ${new Date().toISOString()}
        `.trim()

        try {
            await navigator.clipboard.writeText(errorDetails)
            this.setState({ copied: true })
            setTimeout(() => this.setState({ copied: false }), 2000)
        } catch (err) {
            console.error('Failed to copy error details:', err)
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const containerVariants = {
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.2,
                        delayChildren: 0.1
                    }
                }
            }

            const itemVariants = {
                hidden: { opacity: 0, y: 30 },
                visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" }
                }
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-background flex items-center justify-center p-6">
                    <motion.div
                        className="max-w-2xl w-full text-center"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* Анимированная иконка */}
                        <motion.div 
                            className="relative mb-8"
                            variants={itemVariants}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <div className="relative bg-background border-2 border-destructive/20 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                                    <Bug className="h-16 w-16 text-destructive" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Заголовок */}
                        <motion.div variants={itemVariants} className="mb-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-destructive mb-2">
                                Упс! Что-то пошло не так
                            </h1>
                            <div className="h-1 w-32 bg-gradient-to-r from-destructive to-destructive/50 mx-auto rounded-full" />
                        </motion.div>

                        {/* Основной текст */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                                Произошла неожиданная ошибка в приложении. Мы уже работаем над её устранением.
                            </p>
                        </motion.div>

                        {/* Детали ошибки */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="mb-4">
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Показать детали ошибки
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Card className="border border-destructive/20 shadow-lg text-left">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-destructive mb-2">
                                                        Сообщение об ошибке:
                                                    </h4>
                                                    <code className="text-xs bg-muted p-2 rounded block">
                                                        {this.state.error?.message || 'Неизвестная ошибка'}
                                                    </code>
                                                </div>
                                                
                                                {this.state.error?.stack && (
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-destructive mb-2">
                                                            Стек вызовов:
                                                        </h4>
                                                        <code className="text-xs bg-muted p-2 rounded block max-h-32 overflow-y-auto">
                                                            {this.state.error.stack}
                                                        </code>
                                                    </div>
                                                )}

                                                <div className="flex justify-end">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={this.copyErrorDetails}
                                                        className="gap-2"
                                                    >
                                                        {this.state.copied ? (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                Скопировано
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4" />
                                                                Копировать детали
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>
                        </motion.div>

                        {/* Кнопки действий */}
                        <motion.div 
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                        >
                            <Button 
                                onClick={this.handleReload} 
                                size="lg" 
                                className="group"
                            >
                                <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                                Перезагрузить страницу
                            </Button>
                            <Button 
                                onClick={this.handleGoHome}
                                variant="outline" 
                                size="lg" 
                                className="group"
                            >
                                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                На главную
                            </Button>
                        </motion.div>

                        {/* Дополнительная информация */}
                        <motion.div 
                            variants={itemVariants}
                            className="text-sm text-muted-foreground"
                        >
                            <p className="mb-2">
                                Если проблема повторяется, пожалуйста, обратитесь в службу поддержки
                            </p>
                            <p>
                                Время ошибки: {new Date().toLocaleString('ru-RU')}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            )
        }

        return this.props.children
    }
} 