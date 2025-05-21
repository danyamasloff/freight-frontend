import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import { initializeAuthFromStorage } from '@/shared/utils/auth-init'

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useAppDispatch()
    const { isInitialized } = useAppSelector(state => state.auth)

    useEffect(() => {
        // Явно инициализируем auth состояние при монтировании компонента
        if (!isInitialized) {
            initializeAuthFromStorage()
        }
    }, [dispatch, isInitialized])

    return <>{children}</>
}