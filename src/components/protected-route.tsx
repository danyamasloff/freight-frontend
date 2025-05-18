import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/shared/hooks/redux'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
    const token = localStorage.getItem('token')
    const location = useLocation()

    // Check if user is authenticated either from Redux state or localStorage
    if (!isAuthenticated && !token) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}