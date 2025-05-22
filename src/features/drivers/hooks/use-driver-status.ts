import { useState, useEffect, useCallback, useRef } from 'react'
import { useUpdateDriverStatusMutation, useGetDriverQuery } from '@/shared/api/driversSlice'
import { DrivingStatus, WORKING_TIME_LIMITS } from '../types'
import { useToast } from '@/hooks/use-toast'

interface UseDriverStatusOptions {
    driverId: number
    autoUpdate?: boolean
    updateInterval?: number
}

interface DriverStatusState {
    currentStatus: DrivingStatus
    sessionStart: Date | null
    currentSessionDuration: number
    totalDrivingTime: number
    totalRestTime: number
    canStartDriving: boolean
    mustTakeRest: boolean
    timeUntilMandatoryRest: number
    violations: Array<{
        type: string
        severity: 'WARNING' | 'VIOLATION'
        message: string
    }>
}

export function useDriverStatus({
                                    driverId,
                                    autoUpdate = true,
                                    updateInterval = 30000
                                }: UseDriverStatusOptions) {
    const { toast } = useToast()
    const intervalRef = useRef<NodeJS.Timeout>()

    const { data: driver, refetch } = useGetDriverQuery(driverId)
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDriverStatusMutation()

    const [statusState, setStatusState] = useState<DriverStatusState>({
        currentStatus: DrivingStatus.OFF_DUTY,
        sessionStart: null,
        currentSessionDuration: 0,
        totalDrivingTime: 0,
        totalRestTime: 0,
        canStartDriving: true,
        mustTakeRest: false,
        timeUntilMandatoryRest: WORKING_TIME_LIMITS.MAX_DAILY_DRIVING,
        violations: []
    })

    // Calculate working time status
    const calculateWorkingTimeStatus = useCallback((
        currentStatus: DrivingStatus,
        sessionStart: Date | null,
        totalDrivingTime: number
    ): Partial<DriverStatusState> => {
        const now = new Date()
        let currentSessionDuration = 0

        if (sessionStart) {
            currentSessionDuration = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)
        }

        const totalDrivingToday = totalDrivingTime +
            (currentStatus === DrivingStatus.DRIVING ? currentSessionDuration : 0)

        const timeUntilMandatoryRest = Math.max(0,
            WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - totalDrivingToday
        )

        const violations: DriverStatusState['violations'] = []

        // Check for violations
        if (currentStatus === DrivingStatus.DRIVING && sessionStart) {
            if (currentSessionDuration > WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK) {
                violations.push({
                    type: 'CONTINUOUS_DRIVING',
                    severity: 'VIOLATION',
                    message: 'Превышено максимальное время непрерывного вождения (4.5 часа)'
                })
            } else if (currentSessionDuration > WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK - 30 * 60) {
                violations.push({
                    type: 'CONTINUOUS_DRIVING',
                    severity: 'WARNING',
                    message: 'Приближается время обязательного перерыва'
                })
            }
        }

        if (totalDrivingToday > WORKING_TIME_LIMITS.MAX_DAILY_DRIVING) {
            violations.push({
                type: 'DAILY_DRIVING',
                severity: 'VIOLATION',
                message: 'Превышено максимальное время вождения в день (9 часов)'
            })
        } else if (totalDrivingToday > WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - 60 * 60) {
            violations.push({
                type: 'DAILY_DRIVING',
                severity: 'WARNING',
                message: 'Приближается лимит времени вождения в день'
            })
        }

        const canStartDriving = violations.filter(v => v.severity === 'VIOLATION').length === 0
        const mustTakeRest = timeUntilMandatoryRest <= 0 ||
            (currentStatus === DrivingStatus.DRIVING &&
                currentSessionDuration >= WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK)

        return {
            currentSessionDuration,
            totalDrivingTime: totalDrivingToday,
            canStartDriving,
            mustTakeRest,
            timeUntilMandatoryRest,
            violations
        }
    }, [])

    // Update status on server
    const changeStatus = useCallback(async (newStatus: DrivingStatus, notes?: string) => {
        try {
            const timestamp = new Date().toISOString()

            await updateStatus({
                driverId,
                status: newStatus,
                timestamp,
            }).unwrap()

            // Update local state
            const now = new Date()
            setStatusState(prev => {
                const updatedState = {
                    ...prev,
                    currentStatus: newStatus,
                    sessionStart: newStatus !== DrivingStatus.OFF_DUTY ? now : null,
                }

                return {
                    ...updatedState,
                    ...calculateWorkingTimeStatus(
                        newStatus,
                        updatedState.sessionStart,
                        prev.totalDrivingTime
                    )
                }
            })

            toast({
                title: 'Статус изменен',
                description: `Новый статус: ${getStatusLabel(newStatus)}`
            })

            // Refetch driver data
            refetch()
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось изменить статус водителя',
                variant: 'destructive'
            })
            console.error('Status update error:', error)
        }
    }, [driverId, updateStatus, calculateWorkingTimeStatus, toast, refetch])

    // Get status label
    const getStatusLabel = (status: DrivingStatus): string => {
        const labels = {
            [DrivingStatus.DRIVING]: 'Вождение',
            [DrivingStatus.REST_BREAK]: 'Перерыв',
            [DrivingStatus.DAILY_REST]: 'Ежедневный отдых',
            [DrivingStatus.WEEKLY_REST]: 'Еженедельный отдых',
            [DrivingStatus.OFF_DUTY]: 'Не на службе',
        }
        return labels[status] || status
    }

    // Format duration
    const formatDuration = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours === 0) {
            return `${minutes} мин`
        }

        return `${hours}ч ${minutes}м`
    }, [])

    // Initialize status from driver data
    useEffect(() => {
        if (driver) {
            setStatusState(prev => {
                const sessionStart = driver.workTimeStart ? new Date(driver.workTimeStart) : null

                return {
                    ...prev,
                    currentStatus: driver.status,
                    sessionStart,
                    ...calculateWorkingTimeStatus(
                        driver.status,
                        sessionStart,
                        0 // TODO: Get from API or calculate
                    )
                }
            })
        }
    }, [driver, calculateWorkingTimeStatus])

    // Auto-update timer
    useEffect(() => {
        if (autoUpdate && statusState.sessionStart) {
            intervalRef.current = setInterval(() => {
                setStatusState(prev => ({
                    ...prev,
                    ...calculateWorkingTimeStatus(
                        prev.currentStatus,
                        prev.sessionStart,
                        prev.totalDrivingTime
                    )
                }))
            }, updateInterval)

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
            }
        }
    }, [autoUpdate, updateInterval, statusState.sessionStart, calculateWorkingTimeStatus])

    // Available status transitions
    const getAvailableStatuses = useCallback((): DrivingStatus[] => {
        const { currentStatus, canStartDriving, mustTakeRest } = statusState

        switch (currentStatus) {
            case DrivingStatus.OFF_DUTY:
                return canStartDriving && !mustTakeRest
                    ? [DrivingStatus.DRIVING, DrivingStatus.REST_BREAK]
                    : [DrivingStatus.REST_BREAK, DrivingStatus.DAILY_REST]

            case DrivingStatus.DRIVING:
                return [DrivingStatus.REST_BREAK, DrivingStatus.DAILY_REST, DrivingStatus.OFF_DUTY]

            case DrivingStatus.REST_BREAK:
                return canStartDriving && !mustTakeRest
                    ? [DrivingStatus.DRIVING, DrivingStatus.DAILY_REST, DrivingStatus.OFF_DUTY]
                    : [DrivingStatus.DAILY_REST, DrivingStatus.OFF_DUTY]

            case DrivingStatus.DAILY_REST:
                return [DrivingStatus.DRIVING, DrivingStatus.WEEKLY_REST, DrivingStatus.OFF_DUTY]

            case DrivingStatus.WEEKLY_REST:
                return [DrivingStatus.DRIVING, DrivingStatus.OFF_DUTY]

            default:
                return []
        }
    }, [statusState])

    return {
        statusState,
        driver,
        isUpdatingStatus,
        changeStatus,
        getStatusLabel,
        formatDuration,
        getAvailableStatuses,
        refetch
    }
}