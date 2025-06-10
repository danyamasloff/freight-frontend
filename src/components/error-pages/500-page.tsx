import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    Home, 
    ArrowLeft, 
    RefreshCw, 
    Server, 
    AlertTriangle,
    Bug,
    Mail,
    Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ServerErrorPage() {
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

    const glitchVariants = {
        animate: {
            x: [-2, 2, -2, 2, 0],
            y: [-1, 1, -1, 1, 0],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
            }
        }
    }

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
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
                {/* Анимированная иконка сервера */}
                <motion.div 
                    className="relative mb-8"
                    variants={pulseVariants}
                    animate="animate"
                >
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <div className="relative bg-background border-2 border-destructive/20 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                            <motion.div variants={glitchVariants} animate="animate">
                                <Server className="h-16 w-16 text-destructive" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Заголовок 500 */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h1 className="text-8xl md:text-9xl font-bold text-destructive/80 mb-2">
                        500
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-destructive to-destructive/50 mx-auto rounded-full" />
                </motion.div>

                {/* Основной текст */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Внутренняя ошибка сервера
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Что-то пошло не так на нашей стороне. Мы уже работаем над устранением проблемы.
                    </p>
                </motion.div>

                {/* Карточка с информацией */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border border-destructive/20 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                                <Bug className="h-5 w-5 text-destructive" />
                                Что произошло?
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="text-sm text-muted-foreground p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                                    <AlertTriangle className="h-4 w-4 text-destructive mb-2" />
                                    <div className="font-medium">Сервер недоступен</div>
                                    <div>Временные технические неполадки</div>
                                </div>
                                <div className="text-sm text-muted-foreground p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                                    <RefreshCw className="h-4 w-4 text-destructive mb-2" />
                                    <div className="font-medium">Попробуйте позже</div>
                                    <div>Обычно проблема решается быстро</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Кнопки действий */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                >
                    <Button 
                        onClick={() => window.location.reload()} 
                        size="lg" 
                        className="group"
                    >
                        <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Обновить страницу
                    </Button>
                    <Button asChild variant="outline" size="lg" className="group">
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            На главную
                        </Link>
                    </Button>
                </motion.div>

                {/* Контактная информация */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Нужна помощь?
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span>support@freight.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span>+7 (800) 123-45-67</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Дополнительная информация */}
                <motion.div 
                    variants={itemVariants}
                    className="text-sm text-muted-foreground"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Код ошибки: 500</span>
                    </div>
                    <p>
                        Время: {new Date().toLocaleString('ru-RU')}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
} 