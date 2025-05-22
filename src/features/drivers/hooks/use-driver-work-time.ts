import { useState, useEffect, useCallback } from 'react'
import { useGetDriverQuery } from '@/shared/api/driversSlice'
import { DrivingStatus, WORKING_TIME_LIMITS, type DriverWorkSession } from '../types'

interface WorkTimeCalculation {
    todayDrivingTime: number
    todayRestTime: number
    weekDrivingTime: number
    continuousDrivingTime: number
    timeSinceLastRest: number
    dailyRestTime: number
    weeklyRestTime: number
    isCompliant: boolean
    violations: Array<{
        type: 'DAILY_DRIVING' | 'WEEKLY_DRIVING' | 'CONTINUOUS_DRIVING' | 'DAILY_REST' | 'WEEKLY_REST'
        severity: 'WARNING' | 'VIOLATION'
        timeToViolation?: number
        description: string
    }>
    recommendations: string[]
}

export function useDriverWorkTime(driverId: number, autoCalculate: boolean = true) {
    const { data: driver } = useGetDriverQuery(driverId)
    const [workSession, setWorkSession] = useState<DriverWorkSession | null>(null)
    const [calculation, setCalculation] = useState<WorkTimeCalculation | null>(null)

    const calculateWorkTime = useCallback((session: DriverWorkSession): WorkTimeCalculation => {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay() + 1) // Monday

        // Calculate today's driving and rest time
        let todayDrivingTime = 0
        let todayRestTime = 0
        let continuousDrivingTime = 0
        let timeSinceLastRest = 0
        let lastDrivingSession: Date | null = null

        // Calculate work time from sessions
        session.sessions.forEach(sessionItem => {
            const start = new Date(sessionItem.startTime)
            const end = sessionItem.endTime ? new Date(sessionItem.endTime) : now

            if (start >= startOfDay) {
                if (sessionItem.status === DrivingStatus.DRIVING) {
                    todayDrivingTime += sessionItem.duration
                    if (!lastDrivingSession || start > lastDrivingSession) {
                        lastDrivingSession = end
                        continuousDrivingTime = sessionItem.duration
                    }
                } else if ([DrivingStatus.REST_BREAK, DrivingStatus.DAILY_REST].includes(sessionItem.status)) {
                    todayRestTime += sessionItem.duration
                }
            }
        })

        // Calculate time since last rest
        if (lastDrivingSession) {
            timeSinceLastRest = Math.floor((now.getTime() - lastDrivingSession.getTime()) / 1000)
        }

        // Weekly calculation (simplified)
        const weekDrivingTime = todayDrivingTime * 5 // Rough estimation

        // Check violations
        const violations: WorkTimeCalculation['violations'] = []

        if (todayDrivingTime > WORKING_TIME_LIMITS.MAX_DAILY_DRIVING) {
            violations.push({
                type: 'DAILY_DRIVING',
                severity: 'VIOLATION',
                description: 'Превышен лимит времени вождения в день (9 часов)'
            })
        } else if (todayDrivingTime > WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - 3600) {
            violations.push({
                type: 'DAILY_DRIVING',
                severity: 'WARNING',
                description: 'Приближение к лимиту времени вождения в день',
                timeToViolation: WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - todayDrivingTime
            })
        }

        if (weekDrivingTime > WORKING_TIME_LIMITS.MAX_WEEKLY_DRIVING) {
            violations.push({
                type: 'WEEKLY_DRIVING',
                severity: 'VIOLATION',
                description: 'Превышен лимит времени вождения в неделю (56 часов)'
            })
        }

        if (continuousDrivingTime > WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK) {
            violations.push({
                type: 'CONTINUOUS_DRIVING',
                severity: 'VIOLATION',
                description: 'Превышено максимальное время непрерывного вождения (4.5 часа)'
            })
        } else if (continuousDrivingTime > WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK - 1800) {
            violations.push({
                type: 'CONTINUOUS_DRIVING',
                severity: 'WARNING',
                description: 'Приближается время обязательного перерыва',
                timeToViolation: WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK - continuousDrivingTime
            })
        }

        if (todayRestTime < WORKING_TIME_LIMITS.MIN_DAILY_REST) {
            violations.push({
                type: 'DAILY_REST',
                severity: 'WARNING',
                description: 'Недостаточное время ежедневного отдыха (минимум 11 часов)'
            })
        }

        // Generate recommendations
        const recommendations: string[] = []

        if (continuousDrivingTime > WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK - 3600) {
            recommendations.push('Рекомендуется сделать перерыв в течение часа')
        }

        if (todayDrivingTime > WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - 7200) {
            recommendations.push('Планируйте завершение рабочего дня в ближайшие 2 часа')
        }

        if (todayRestTime < WORKING_TIME_LIMITS.MIN_DAILY_REST) {
            recommendations.push('Обеспечьте достаточное время для ежедневного отдыха (11 часов)')
        }

        const isCompliant = violations.filter(v => v.severity === 'VIOLATION').length === 0

        return {
            todayDrivingTime,
            todayRestTime,
            weekDrivingTime,
            continuousDrivingTime,
            timeSinceLastRest,
            dailyRestTime: todayRestTime,
            weeklyRestTime: 0, // Would be calculated from weekly data
            isCompliant,
            violations,
            recommendations
        }
    }, [])

    // Initialize work session from driver data
    useEffect(() => {
        if (driver && autoCalculate) {
            // Create mock session data from driver status
            const mockSession: DriverWorkSession = {
                driverId: driver.id,
                sessionStart: driver.workTimeStart || new Date().toISOString(),
                totalDrivingTime: 0, // Would come from API
                totalRestTime: 0, // Would come from API
                sessions: [
                    {
                        status: driver.status,
                        startTime: driver.workTimeStart || new Date().toISOString(),
                        duration: 0 // Would be calculated
                    }
                ]
            }

            setWorkSession(mockSession)
            setCalculation(calculateWorkTime(mockSession))
        }
    }, [driver, autoCalculate, calculateWorkTime])

    const updateSession = useCallback((newSession: DriverWorkSession) => {
        setWorkSession(newSession)
        setCalculation(calculateWorkTime(newSession))
    }, [calculateWorkTime])

    const formatDuration = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours === 0) {
            return `${minutes} мин`
        }

        return `${hours}ч ${minutes}м`
    }, [])

    const getComplianceLevel = useCallback((): 'COMPLIANT' | 'WARNING' | 'VIOLATION' => {
        if (!calculation) return 'COMPLIANT'

        if (calculation.violations.some(v => v.severity === 'VIOLATION')) {
            return 'VIOLATION'
        }

        if (calculation.violations.some(v => v.severity === 'WARNING')) {
            return 'WARNING'
        }

        return 'COMPLIANT'
    }, [calculation])

    const getTimeUntilMandatoryRest = useCallback((): number => {
        if (!calculation) return WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK

        return Math.max(0, WORKING_TIME_LIMITS.MAX_DRIVING_BEFORE_BREAK - calculation.continuousDrivingTime)
    }, [calculation])

    const getTimeUntilDailyLimit = useCallback((): number => {
        if (!calculation) return WORKING_TIME_LIMITS.MAX_DAILY_DRIVING

        return Math.max(0, WORKING_TIME_LIMITS.MAX_DAILY_DRIVING - calculation.todayDrivingTime)
    }, [calculation])

    return {
        workSession,
        calculation,
        updateSession,
        formatDuration,
        getComplianceLevel,
        getTimeUntilMandatoryRest,
        getTimeUntilDailyLimit,
        isLoading: !calculation && autoCalculate
    }
}