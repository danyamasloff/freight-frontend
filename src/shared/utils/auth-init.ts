import { store } from '@/app/store'
import { setCredentials, initializeComplete } from '@/app/store/authSlice'

export const initializeAuthFromStorage = () => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    const username = localStorage.getItem('username')

    console.log('Auth initialization, token present:', !!token)

    if (token && token !== 'undefined' && token !== 'null') {
        console.log('Initializing auth from token:', token.substring(0, 10) + '...')

        // Диспатчим в Redux store
        store.dispatch(setCredentials({
            token,  // Используем правильное поле token (не accessToken)
            refreshToken: refreshToken || '',
            username: username || '',
            expiresIn: 0
        }))

        store.dispatch(initializeComplete())
        return true
    }

    console.warn('No valid token found in localStorage')
    store.dispatch(initializeComplete())
    return false
}