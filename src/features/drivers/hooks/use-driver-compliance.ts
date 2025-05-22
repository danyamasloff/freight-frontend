import { useMemo } from 'react'
import { useGetDriverQuery } from '@/shared/api/driversSlice'
import type { DriverDetail } from '../types'

interface ComplianceCheck {
    type: 'LICENSE' | 'MEDICAL' | 'DANGEROUS_GOODS' | 'EXPERIENCE' | 'CATEGORIES'
    status: 'VALID' | 'WARNING' | 'EXPIRED' | 'MISSING'
    message: string
    expiryDate?: string
    daysUntilExpiry?: number
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
}

interface DriverCompliance {
    overallStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'
    checks: ComplianceCheck[]
    expiringDocuments: ComplianceCheck[]
    canDrive: boolean
    canTransportDangerousGoods: boolean
    recommendedActions: string[]
}

export function useDriverCompliance(driverId: number) {
    const { data: driver, isLoading, error } = useGetDriverQuery(driverId)

    const compliance = useMemo((): DriverCompliance | null => {
        if (!driver) return null

        const now = new Date()
        const checks: ComplianceCheck[] = []

        // License compliance
        if (driver.licenseExpiryDate) {
            const expiryDate = new Date(driver.licenseExpiryDate)
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            if (daysUntilExpiry < 0) {
                checks.push({
                    type: 'LICENSE',
                    status: 'EXPIRED',
                    message: 'Водительское удостоверение просрочено',
                    expiryDate: driver.licenseExpiryDate,
                    daysUntilExpiry,
                    severity: 'CRITICAL'
                })
            } else if (daysUntilExpiry <= 90) {
                checks.push({
                    type: 'LICENSE',
                    status: 'WARNING',
                    message: `Водительское удостоверение истекает через ${daysUntilExpiry} дней`,
                    expiryDate: driver.licenseExpiryDate,
                    daysUntilExpiry,
                    severity: 'WARNING'
                })
            } else {
                checks.push({
                    type: 'LICENSE',
                    status: 'VALID',
                    message: 'Водительское удостоверение действительно',
                    expiryDate: driver.licenseExpiryDate,
                    daysUntilExpiry,
                    severity: 'INFO'
                })
            }
        } else {
            checks.push({
                type: 'LICENSE',
                status: 'MISSING',
                message: 'Не указан срок действия водительского удостоверения',
                severity: 'WARNING'
            })
        }

        // Medical certificate compliance
        if (driver.medicalCertificateExpiryDate) {
            const expiryDate = new Date(driver.medicalCertificateExpiryDate)
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            if (daysUntilExpiry < 0) {
                checks.push({
                    type: 'MEDICAL',
                    status: 'EXPIRED',
                    message: 'Медицинская справка просрочена',
                    expiryDate: driver.medicalCertificateExpiryDate,
                    daysUntilExpiry,
                    severity: 'CRITICAL'
                })
            } else if (daysUntilExpiry <= 30) {
                checks.push({
                    type: 'MEDICAL',
                    status: 'WARNING',
                    message: `Медицинская справка истекает через ${daysUntilExpiry} дней`,
                    expiryDate: driver.medicalCertificateExpiryDate,
                    daysUntilExpiry,
                    severity: 'WARNING'
                })
            } else {
                checks.push({
                    type: 'MEDICAL',
                    status: 'VALID',
                    message: 'Медицинская справка действительна',
                    expiryDate: driver.medicalCertificateExpiryDate,
                    daysUntilExpiry,
                    severity: 'INFO'
                })
            }
        } else {
            checks.push({
                type: 'MEDICAL',
                status: 'MISSING',
                message: 'Не указан срок действия медицинской справки',
                severity: 'WARNING'
            })
        }

        // Dangerous goods permit compliance
        if (driver.dangerousGoodsPermitExpiryDate) {
            const expiryDate = new Date(driver.dangerousGoodsPermitExpiryDate)
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            if (daysUntilExpiry < 0) {
                checks.push({
                    type: 'DANGEROUS_GOODS',
                    status: 'EXPIRED',
                    message: 'Разрешение ДОПОГ просрочено',
                    expiryDate: driver.dangerousGoodsPermitExpiryDate,
                    daysUntilExpiry,
                    severity: 'CRITICAL'
                })
            } else if (daysUntilExpiry <= 60) {
                checks.push({
                    type: 'DANGEROUS_GOODS',
                    status: 'WARNING',
                    message: `Разрешение ДОПОГ истекает через ${daysUntilExpiry} дней`,
                    expiryDate: driver.dangerousGoodsPermitExpiryDate,
                    daysUntilExpiry,
                    severity: 'WARNING'
                })
            } else {
                checks.push({
                    type: 'DANGEROUS_GOODS',
                    status: 'VALID',
                    message: 'Разрешение ДОПОГ действительно',
                    expiryDate: driver.dangerousGoodsPermitExpiryDate,
                    daysUntilExpiry,
                    severity: 'INFO'
                })
            }
        }

        // Experience check
        if (driver.experience !== undefined) {
            if (driver.experience >= 3) {
                checks.push({
                    type: 'EXPERIENCE',
                    status: 'VALID',
                    message: `Стаж вождения: ${driver.experience} лет`,
                    severity: 'INFO'
                })
            } else {
                checks.push({
                    type: 'EXPERIENCE',
                    status: 'WARNING',
                    message: `Недостаточный стаж вождения: ${driver.experience} лет (рекомендуется от 3 лет)`,
                    severity: 'WARNING'
                })
            }
        } else {
            checks.push({
                type: 'EXPERIENCE',
                status: 'MISSING',
                message: 'Не указан стаж вождения',
                severity: 'WARNING'
            })
        }

        // License categories check
        if (driver.licenseCategory && driver.licenseCategory.length > 0) {
            const hasCommercialCategories = driver.licenseCategory.some(cat => ['C', 'CE', 'C1', 'C1E', 'D', 'D1'].includes(cat))

            if (hasCommercialCategories) {
                checks.push({
                    type: 'CATEGORIES',
                    status: 'VALID',
                    message: `Категории: ${driver.licenseCategory.join(', ')}`,
                    severity: 'INFO'
                })
            } else {
                checks.push({
                    type: 'CATEGORIES',
                    status: 'WARNING',
                    message: 'Нет категорий для коммерческого транспорта',
                    severity: 'WARNING'
                })
            }
        } else {
            checks.push({
                type: 'CATEGORIES',
                status: 'MISSING',
                message: 'Не указаны категории водительского удостоверения',
                severity: 'WARNING'
            })
        }

        // Determine overall status
        const hasExpired = checks.some(check => check.status === 'EXPIRED')
        const hasCritical = checks.some(check => check.severity === 'CRITICAL')
        const hasWarnings = checks.some(check => check.severity === 'WARNING')

        let overallStatus: DriverCompliance['overallStatus']
        if (hasExpired || hasCritical) {
            overallStatus = 'NON_COMPLIANT'
        } else if (hasWarnings) {
            overallStatus = 'WARNING'
        } else {
            overallStatus = 'COMPLIANT'
        }

        // Determine capabilities
        const canDrive = !checks.some(check =>
            check.type === 'LICENSE' && (check.status === 'EXPIRED' || check.status === 'MISSING')
        ) && !checks.some(check =>
            check.type === 'MEDICAL' && check.status === 'EXPIRED'
        )

        const canTransportDangerousGoods = canDrive && checks.some(check =>
            check.type === 'DANGEROUS_GOODS' && check.status === 'VALID'
        )

        // Get expiring documents
        const expiringDocuments = checks.filter(check =>
            check.status === 'WARNING' && check.daysUntilExpiry !== undefined && check.daysUntilExpiry <= 90
        )

        // Generate recommendations
        const recommendedActions: string[] = []

        const expiredChecks = checks.filter(check => check.status === 'EXPIRED')
        if (expiredChecks.length > 0) {
            recommendedActions.push('Срочно обновите просроченные документы')
        }

        const expiringChecks = checks.filter(check =>
            check.status === 'WARNING' && check.daysUntilExpiry !== undefined && check.daysUntilExpiry <= 30
        )
        if (expiringChecks.length > 0) {
            recommendedActions.push('Подготовьте обновление документов, срок действия которых истекает')
        }

        const missingChecks = checks.filter(check => check.status === 'MISSING')
        if (missingChecks.length > 0) {
            recommendedActions.push('Добавьте недостающую информацию о документах')
        }

        if (driver.experience !== undefined && driver.experience < 3) {
            recommendedActions.push('Рассмотрите дополнительное обучение для повышения квалификации')
        }

        return {
            overallStatus,
            checks,
            expiringDocuments,
            canDrive,
            canTransportDangerousGoods,
            recommendedActions
        }
    }, [driver])

    const getComplianceColor = (status: DriverCompliance['overallStatus']) => {
        switch (status) {
            case 'COMPLIANT':
                return 'text-green-600'
            case 'WARNING':
                return 'text-yellow-600'
            case 'NON_COMPLIANT':
                return 'text-red-600'
            default:
                return 'text-gray-600'
        }
    }

    const getComplianceIcon = (status: DriverCompliance['overallStatus']) => {
        switch (status) {
            case 'COMPLIANT':
                return '✅'
            case 'WARNING':
                return '⚠️'
            case 'NON_COMPLIANT':
                return '❌'
            default:
                return '❓'
        }
    }

    const getSeverityColor = (severity: ComplianceCheck['severity']) => {
        switch (severity) {
            case 'INFO':
                return 'text-blue-600'
            case 'WARNING':
                return 'text-yellow-600'
            case 'CRITICAL':
                return 'text-red-600'
            default:
                return 'text-gray-600'
        }
    }

    return {
        compliance,
        isLoading,
        error,
        getComplianceColor,
        getComplianceIcon,
        getSeverityColor
    }
}