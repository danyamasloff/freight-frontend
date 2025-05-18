import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export function DriversPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Водители</h1>
            <Card>
                <CardContent className="text-center py-16">
                    <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Страница в разработке</h3>
                    <p className="text-muted-foreground">
                        Функционал управления водителями будет добавлен в следующей версии
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}