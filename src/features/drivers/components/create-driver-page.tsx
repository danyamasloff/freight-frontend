import { Link } from 'react-router-dom'
import { User, ChevronRight, UserPlus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
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

export function CreateDriverPage() {
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
                <span className="text-foreground font-medium">Добавление водителя</span>
            </motion.div>

            {/* Header */}
            <motion.div 
                className="text-center space-y-4"
                variants={itemVariants}
            >
                <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                    <UserPlus className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Добавление нового водителя
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
                        Заполните информацию о водителе для добавления в систему управления автопарком
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
                                    Введите все необходимые данные для регистрации водителя в системе
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <DriverForm />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}