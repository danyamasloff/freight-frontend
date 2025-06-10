import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, User, ChevronRight, Loader2, AlertCircle, Edit, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { useGetDriverQuery } from '@/shared/api/driversSlice'
import { DriverForm } from './driver-form'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export function EditDriverPage() {
    const { id } = useParams<{ id: string }>()
    const driverId = parseInt(id || '0')
    const navigate = useNavigate()

    const { data: driver, isLoading, error } = useGetDriverQuery(driverId)

    useEffect(() => {
        if (!id || isNaN(driverId)) {
            navigate('/drivers')
        }
    }, [id, driverId, navigate])

    if (error) {
        return (
            <motion.div 
                className="container py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Alert variant="destructive" className="mx-auto max-w-4xl border shadow-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ошибка загрузки</AlertTitle>
                    <AlertDescription>
                        Не удалось загрузить данные о водителе. Пожалуйста, попробуйте позже.
                    </AlertDescription>
                    <Button 
                        variant="outline" 
                        className="mt-4 transition-all duration-200 hover:scale-105" 
                        onClick={() => navigate('/drivers')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> 
                        Вернуться к списку
                    </Button>
                </Alert>
            </motion.div>
        )
    }

    if (isLoading) {
        return (
            <motion.div 
                className="container py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-lg text-muted-foreground">Загрузка данных водителя...</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div 
            className="container py-8 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Breadcrumb */}
            <motion.div 
                className="flex items-center text-muted-foreground"
                variants={itemVariants}
            >
                <Button variant="link" asChild className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">
                    <Link to="/drivers">Водители</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Button variant="link" asChild className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">
                    <Link to={`/drivers/${driverId}`}>{driver?.firstName} {driver?.lastName}</Link>
                </Button>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Редактирование</span>
            </motion.div>

            {/* Header */}
            <motion.div 
                className="text-center space-y-4"
                variants={itemVariants}
            >
                <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Edit className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Редактирование водителя
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
                        Редактирование информации о водителе "{driver?.firstName} {driver?.lastName}"
                    </p>
                </div>
            </motion.div>

            {/* Form Card */}
            <motion.div variants={itemVariants}>
                <Card className="max-w-4xl mx-auto border shadow-lg">
                    <CardHeader className="bg-muted/50 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Информация о водителе</CardTitle>
                                <CardDescription>
                                    Обновите необходимые данные водителя в системе
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <DriverForm
                            initialData={driver}
                            id={driverId}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}