import { useEffect } from 'react'
import { useAppDispatch } from '@/shared/hooks/redux'
import { setCredentials } from '@/app/store/authSlice'

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useAppDispatch()

    // Restore authentication state from localStorage on app start
    useEffect(() => {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        const username = localStorage.getItem('username')

        if (token && refreshToken && username) {
            dispatch(setCredentials({
                accessToken: token,
                refreshToken,
                username,
                expiresIn: 0 // Will be handled by API middleware
            }))
        }
    }, [dispatch])

    return <>{children}</>
}