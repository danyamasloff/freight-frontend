import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    Home, 
    ArrowLeft, 
    Search, 
    MapPin, 
    Compass,
    AlertTriangle,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
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

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
            <motion.div
                className="max-w-2xl w-full text-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Анимированная иконка */}
                <motion.div 
                    className="relative mb-8"
                    variants={floatingVariants}
                    animate="animate"
                >
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
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
                        <div className="relative bg-background border-2 border-primary/20 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                            <Compass className="h-16 w-16 text-primary" />
                        </div>
                    </div>
                </motion.div>

                {/* Заголовок 404 */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h1 className="text-8xl md:text-9xl font-bold text-primary/80 mb-2">
                        404
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full" />
                </motion.div>

                {/* Основной текст */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Маршрут не найден
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Похоже, вы свернули не туда. Эта страница не существует или была перемещена.
                    </p>
                </motion.div>

                {/* Карточка с предложениями */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Куда направиться?
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                    <Search className="h-4 w-4 text-primary mb-2" />
                                    <div className="font-medium">Проверьте URL</div>
                                    <div>Убедитесь в правильности адреса</div>
                                </div>
                                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                    <RefreshCw className="h-4 w-4 text-primary mb-2" />
                                    <div className="font-medium">Обновите страницу</div>
                                    <div>Возможно, это временная проблема</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Кнопки действий */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button asChild size="lg" className="group">
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            На главную
                        </Link>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => window.history.back()}
                        className="group"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Button>
                </motion.div>

                {/* Дополнительная информация */}
                <motion.div 
                    variants={itemVariants}
                    className="mt-12 text-sm text-muted-foreground"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Код ошибки: 404</span>
                    </div>
                    <p>
                        Если проблема повторяется, обратитесь к администратору системы
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
} 