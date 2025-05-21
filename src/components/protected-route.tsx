import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/shared/hooks/redux'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Проверяем в Redux store
    const { isAuthenticated } = useAppSelector(state => state.auth)

    // Дополнительная проверка localStorage на случай, если Redux не инициализирован
    const hasLocalToken = !!localStorage.getItem('token')

    console.log('ProtectedRoute check:', { isAuthenticated, hasLocalToken })

    if (!isAuthenticated && !hasLocalToken) {
        console.warn('Redirecting to login: not authenticated')
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}