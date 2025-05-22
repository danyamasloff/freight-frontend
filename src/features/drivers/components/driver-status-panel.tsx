import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    Timer,
    Truck,
    Coffee,
    Bed,
    Home,
    Pause,
    Activity
} from 'lucide-react'
import { useDriverStatus } from '@/hooks/use-driver-status'
import { DrivingStatus, DRIVER_STATUS_CONFIG, WORKING_TIME_LIMITS } from '../types'

interface DriverStatusPanelProps {
    driverId: number
    className?: string
    compact?: boolean
}

export function DriverStatusPanel({ driverId, className, compact = false }: DriverStatusPanelProps) {
    const {
        statusState,
        isUpdatingStatus,
        changeStatus,
        formatDuration,
        getAvailableStatuses,
        getStatusLabel
    } = useDriverStatus({ driverId })

    const statusConfig = DRIVER_STATUS_CONFIG[statusState.currentStatus]
    const availableStatuses = getAvailableStatuses()

    // Calculate progress percentages
    const dailyDrivingProgress = Math.min(100,
        (statusState.totalDrivingTime / WORKING_TIME_LIMITS.MAX_DAILY_DRIVING) * 100
    )

    const sessionProgress = statusState.sessionStart && statusState.currentStatus === DrivingStatus.DRIVING
        ? Math.min(100, (statusState.currentSessionDuration / WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK) * 100)
        : 0

    const getStatusIcon = (status: DrivingStatus) => {
        switch (status) {
            case DrivingStatus.DRIVING:
                return <Truck className="h-4 w-4" />
            case DrivingStatus.REST_BREAK:
                return <Coffee className="h-4 w-4" />
            case DrivingStatus.DAILY_REST:
                return <Bed className="h-4 w-4" />
            case DrivingStatus.WEEKLY_REST:
                return <Home className="h-4 w-4" />
            case DrivingStatus.OFF_DUTY:
                return <Pause className="h-4 w-4" />
            default:
                return <Activity className="h-4 w-4" />
        }
    }

    if (compact) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                            <div>
                                <div className="font-medium">{statusConfig.label}</div>
                                {statusState.sessionStart && (
                                    <div className="text-sm text-muted-foreground">
                                        {formatDuration(statusState.currentSessionDuration)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {statusState.violations.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {statusState.violations.length} нарушений
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Статус водителя
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Status */}
                <div className={`p-4 rounded-lg ${statusConfig.bgColor} border-l-4 ${statusConfig.color}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${statusConfig.color}`} />
                            <div>
                                <div className={`font-semibold ${statusConfig.textColor}`}>
                                    {statusConfig.label}
                                </div>
                                {statusState.sessionStart && (
                                    <div className="text-sm text-muted-foreground">
                                        Текущая сессия: {formatDuration(statusState.currentSessionDuration)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-2xl">{statusConfig.icon}</div>
                    </div>
                </div>

                {/* Working Time Progress */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Время вождения сегодня</span>
                            <span>{formatDuration(statusState.totalDrivingTime)} / 9ч</span>
                        </div>
                        <Progress
                            value={dailyDrivingProgress}
                            className="h-2"
                            indicatorClassName={dailyDrivingProgress > 90 ? 'bg-red-500' :
                                dailyDrivingProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'}
                        />
                    </div>

                    {statusState.currentStatus === DrivingStatus.DRIVING && statusState.sessionStart && (
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Время до перерыва</span>
                                <span>
                                    {formatDuration(statusState.currentSessionDuration)} / 4.5ч
                                </span>
                            </div>
                            <Progress
                                value={sessionProgress}
                                className="h-2"
                                indicatorClassName={sessionProgress > 90 ? 'bg-red-500' :
                                    sessionProgress > 75 ? 'bg-yellow-500' : 'bg-blue-500'}
                            />
                        </div>
                    )}
                </div>

                {/* Violations and Warnings */}
                {statusState.violations.length > 0 && (
                    <div className="space-y-2">
                        {statusState.violations.map((violation, index) => (
                            <Alert
                                key={index}
                                variant={violation.severity === 'VIOLATION' ? 'destructive' : 'default'}
                                className="py-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    {violation.message}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Status Actions */}
                <div className="space-y-3">
                    <div className="text-sm font-medium">Изменить статус:</div>
                    <div className="grid grid-cols-2 gap-2">
                        {availableStatuses.map((status) => {
                            const config = DRIVER_STATUS_CONFIG[status]
                            const isCurrent = status === statusState.currentStatus
                            const isRestricted = !statusState.canStartDriving && status === DrivingStatus.DRIVING

                            return (
                                <Button
                                    key={status}
                                    variant={isCurrent ? "default" : "outline"}
                                    size="sm"
                                    disabled={isUpdatingStatus || isCurrent || isRestricted}
                                    onClick={() => changeStatus(status)}
                                    className="justify-start gap-2"
                                >
                                    {getStatusIcon(status)}
                                    <span className="text-xs">{config.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {formatDuration(statusState.timeUntilMandatoryRest)}
                        </div>
                        <div className="text-xs text-muted-foreground">До обязательного отдыха</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {statusState.canStartDriving ? (
                                <CheckCircle2 className="h-8 w-8 mx-auto" />
                            ) : (
                                <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {statusState.canStartDriving ? 'Может вести' : 'Нужен отдых'}
                        </div>
                    </div>
                </div>

                {/* Next Action Recommendation */}
                {statusState.mustTakeRest && (
                    <Alert className="bg-red-50 border-red-200">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Внимание!</strong> Водитель должен прекратить вождение и взять обязательный отдых.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}