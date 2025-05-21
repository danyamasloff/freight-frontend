import React from 'react'
import {Link} from 'react-router-dom'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {ArrowLeft, Construction} from 'lucide-react'

export function CreateRoutePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                    <Link to="/routes">
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Назад
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Создание маршрута</h1>
                    <p className="text-muted-foreground">
                        Создайте новый маршрут для грузоперевозки
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="text-center py-16">
                    <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-lg font-semibold mb-2">Страница в разработке</h3>
                    <p className="text-muted-foreground">
                        Функционал создания маршрутов будет добавлен в следующей версии
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}