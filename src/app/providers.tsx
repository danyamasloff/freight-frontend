import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { store, persistor } from '@/app/store'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from 'react-error-boundary'
import { NotificationProvider } from '@/contexts/NotificationContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 минут
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

function ErrorFallback({ error, resetErrorBoundary }: any) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 p-6 max-w-md">
                <h2 className="text-2xl font-bold text-destructive">Что-то пошло не так</h2>
                <p className="text-muted-foreground">
                    {error?.message || 'Произошла непредвиденная ошибка'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Попробовать снова
                </button>
            </div>
        </div>
    )
}

// Компонент загрузки для PersistGate
function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
}

interface AppProvidersProps {
    children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
    console.log('AppProviders rendering')
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ThemeProvider
                defaultTheme="dark"
                storageKey="truck-navigator-theme"
            >
                <Provider store={store}>
                    <PersistGate loading={<Loading />} persistor={persistor}>
                        <QueryClientProvider client={queryClient}>
                            <BrowserRouter>
                                <AuthProvider>
                                    <NotificationProvider>
                                        {children}
                                    </NotificationProvider>
                                </AuthProvider>
                            </BrowserRouter>
                            {import.meta.env.DEV && (
                                <ReactQueryDevtools
                                    initialIsOpen={false}
                                />
                            )}
                        </QueryClientProvider>
                    </PersistGate>
                </Provider>
                <Toaster richColors />
            </ThemeProvider>
        </ErrorBoundary>
    )
}