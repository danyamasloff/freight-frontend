import { z } from 'zod'
import type {
    DriverSummary,
    DriverDetail,
    DrivingStatus,
    DriverRestAnalysis,
    RestStopRecommendation
} from '@/shared/types/api'

// Re-export API types
export type {
    DriverSummary,
    DriverDetail,
    DrivingStatus,
    DriverRestAnalysis,
    RestStopRecommendation
}

// Form schemas
export const driverFormSchema = z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').max(50),
    licenseNumber: z.string().min(10, 'Некорректный номер водительского удостоверения'),
    licenseCategory: z.array(z.string()).min(1, 'Выберите минимум одну категорию'),
    phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX'),
    email: z.string().email('Некорректный email').optional().or(z.literal('')),
    experience: z.coerce.number().min(0, 'Стаж не может быть отрицательным').max(50),
    licenseIssueDate: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    medicalCertificateExpiryDate: z.string().optional(),
    dangerousGoodsPermit: z.boolean().default(false),
    dangerousGoodsPermitExpiryDate: z.string().optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    kmRate: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
}).refine(data => {
    if (data.licenseIssueDate && data.licenseExpiryDate) {
        return new Date(data.licenseIssueDate) < new Date(data.licenseExpiryDate)
    }
    return true
}, {
    message: 'Дата окончания должна быть позже даты выдачи',
    path: ['licenseExpiryDate']
}).refine(data => {
    if (data.dangerousGoodsPermit && !data.dangerousGoodsPermitExpiryDate) {
        return false
    }
    return true
}, {
    message: 'Укажите срок действия разрешения на перевозку опасных грузов',
    path: ['dangerousGoodsPermitExpiryDate']
})

export type DriverFormValues = z.infer<typeof driverFormSchema>

// Status management types
export interface DriverStatusUpdate {
    driverId: number
    status: DrivingStatus
    timestamp: string
    notes?: string
}

export interface DriverWorkSession {
    driverId: number
    sessionStart: string
    sessionEnd?: string
    totalDrivingTime: number
    totalRestTime: number
    sessions: Array<{
        status: DrivingStatus
        startTime: string
        endTime?: string
        duration: number
    }>
}

// Rest time analysis types
export interface RestTimeAnalysisRequest {
    driverId: number
    routeId?: number
    departureTime: string
    currentLocation?: {
        lat: number
        lng: number
    }
}

export interface RestTimeAnalysisResult extends DriverRestAnalysis {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    nextMandatoryRestAt: string
    recommendedRestStops: RestStopRecommendation[]
    violations: Array<{
        type: 'DRIVING_TIME' | 'DAILY_REST' | 'WEEKLY_REST'
        severity: 'WARNING' | 'VIOLATION'
        description: string
        timeToViolation?: number
    }>
}

// License categories
export const LICENSE_CATEGORIES = [
    { value: 'B', label: 'B - Легковые автомобили' },
    { value: 'C', label: 'C - Грузовые автомобили' },
    { value: 'C1', label: 'C1 - Средние грузовики (до 7.5т)' },
    { value: 'CE', label: 'CE - Грузовики с прицепом' },
    { value: 'C1E', label: 'C1E - Средние грузовики с прицепом' },
    { value: 'D', label: 'D - Автобусы' },
    { value: 'D1', label: 'D1 - Малые автобусы' },
] as const

// Status display configuration
export const DRIVER_STATUS_CONFIG = {
    [DrivingStatus.DRIVING]: {
        label: 'Вождение',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: '🚛'
    },
    [DrivingStatus.REST_BREAK]: {
        label: 'Перерыв',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: '☕'
    },
    [DrivingStatus.DAILY_REST]: {
        label: 'Ежедневный отдых',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        icon: '🛏️'
    },
    [DrivingStatus.WEEKLY_REST]: {
        label: 'Еженедельный отдых',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        icon: '🏠'
    },
    [DrivingStatus.OFF_DUTY]: {
        label: 'Не на службе',
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        icon: '⏸️'
    },
} as const

// Working time regulations (EU)
export const WORKING_TIME_LIMITS = {
    MAX_DAILY_DRIVING: 9 * 60 * 60, // 9 hours in seconds
    MAX_WEEKLY_DRIVING: 56 * 60 * 60, // 56 hours in seconds
    MAX_BI_WEEKLY_DRIVING: 90 * 60 * 60, // 90 hours in seconds
    MIN_DAILY_REST: 11 * 60 * 60, // 11 hours in seconds
    MIN_WEEKLY_REST: 45 * 60 * 60, // 45 hours in seconds
    MAX_DRIVING_BEFORE_BREAK: 4.5 * 60 * 60, // 4.5 hours in seconds
    MIN_BREAK_DURATION: 45 * 60, // 45 minutes in seconds
} as const