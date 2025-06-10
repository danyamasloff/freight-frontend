import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    Home, 
    ArrowLeft, 
    Shield, 
    Lock, 
    AlertTriangle,
    Key,
    User,
    Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ForbiddenPage() {
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

    const shakeVariants = {
        animate: {
            x: [-3, 3, -3, 3, 0],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
            }
        }
    }

    const lockVariants = {
        animate: {
            rotate: [-5, 5, -5, 5, 0],
            scale: [1, 1.1, 1],
            transition: {
                duration: 1,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-yellow-500/5 to-background flex items-center justify-center p-6">
            <motion.div
                className="max-w-2xl w-full text-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Анимированная иконка замка */}
                <motion.div 
                    className="relative mb-8"
                    variants={shakeVariants}
                    animate="animate"
                >
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl"
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
                        <div className="relative bg-background border-2 border-yellow-500/20 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center">
                            <motion.div variants={lockVariants} animate="animate">
                                <Lock className="h-16 w-16 text-yellow-600" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Заголовок 403 */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h1 className="text-8xl md:text-9xl font-bold text-yellow-600/80 mb-2">
                        403
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-yellow-600 to-yellow-600/50 mx-auto rounded-full" />
                </motion.div>

                {/* Основной текст */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Доступ запрещен
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        У вас недостаточно прав для просмотра этой страницы. Обратитесь к администратору.
                    </p>
                </motion.div>

                {/* Карточка с информацией */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="border border-yellow-500/20 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                                <Shield className="h-5 w-5 text-yellow-600" />
                                Возможные причины
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="text-sm text-muted-foreground p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                                    <User className="h-4 w-4 text-yellow-600 mb-2" />
                                    <div className="font-medium">Недостаточно прав</div>
                                    <div>Ваша роль не позволяет доступ</div>
                                </div>
                                <div className="text-sm text-muted-foreground p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                                    <Key className="h-4 w-4 text-yellow-600 mb-2" />
                                    <div className="font-medium">Требуется авторизация</div>
                                    <div>Войдите в систему заново</div>
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
                    <Button asChild size="lg" className="group">
                        <Link to="/login">
                            <Key className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                            Войти в систему
                        </Link>
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
                                Нужны права доступа?
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Обратитесь к администратору системы для получения необходимых разрешений
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>admin@freight.com</span>
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
                        <span>Код ошибки: 403</span>
                    </div>
                    <p>
                        Если вы считаете, что это ошибка, обратитесь в службу поддержки
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
} 