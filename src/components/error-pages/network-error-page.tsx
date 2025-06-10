import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    Home, 
    RefreshCw, 
    Wifi, 
    WifiOff, 
    AlertTriangle,
    Router,
    Signal,
    Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NetworkErrorPage() {
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

    const wifiVariants = {
        animate: {
            opacity: [1, 0.3, 1],
            scale: [1, 0.9, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    const signalVariants = {
        animate: {
            pathLength: [0, 1, 0],
            opacity: [0.3, 1, 0.3],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background flex items-center justify-center p-6">
            <motion.div
                className="max-w-2xl w-full text-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Анимированная иконка сети */}
                <motion.div 
                    className="relative mb-8"
                    variants={wifiVariants}
                    animate="animate"
                >
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
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
                        <div className="relative bg-background border-2 border-blue-500/20 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                            <WifiOff className="h-16 w-16 text-blue-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Заголовок */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h1 className="text-6xl md:text-7xl font-bold text-blue-500/80 mb-2">
                        Нет связи
                    </h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-blue-500/50 mx-auto rounded-full" />
                </motion.div>

                {/* Основной текст */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Проблемы с подключением
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Не удается подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.
                    </p>
                </motion.div>

                {/* Карточка с диагностикой */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border border-blue-500/20 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                                <Router className="h-5 w-5 text-blue-500" />
                                Проверьте подключение
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="text-sm text-muted-foreground p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                    <Wifi className="h-4 w-4 text-blue-500 mb-2" />
                                    <div className="font-medium">Wi-Fi соединение</div>
                                    <div>Убедитесь, что Wi-Fi включен</div>
                                </div>
                                <div className="text-sm text-muted-foreground p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                    <Globe className="h-4 w-4 text-blue-500 mb-2" />
                                    <div className="font-medium">Интернет</div>
                                    <div>Проверьте доступ к интернету</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Индикатор попытки подключения */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Signal className="h-5 w-5 text-blue-500" />
                                </motion.div>
                                <span className="text-sm text-muted-foreground">
                                    Попытка переподключения...
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                    className="bg-blue-500 h-2 rounded-full"
                                    animate={{
                                        width: ["0%", "100%", "0%"]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
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
                        Попробовать снова
                    </Button>
                    <Button asChild variant="outline" size="lg" className="group">
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            На главную
                        </Link>
                    </Button>
                </motion.div>

                {/* Советы по устранению */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Что можно попробовать?
                            </h3>
                            <div className="text-left space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Проверьте кабель интернета или Wi-Fi соединение</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Перезагрузите роутер и подождите 30 секунд</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Обратитесь к интернет-провайдеру</span>
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
                        <span>Ошибка сети</span>
                    </div>
                    <p>
                        Время: {new Date().toLocaleString('ru-RU')}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
} 