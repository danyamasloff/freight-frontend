import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { store } from '@/app/store'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from 'react-error-boundary'

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

interface AppProvidersProps {
    children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ThemeProvider
                defaultTheme="dark"
                storageKey="truck-navigator-theme"
            >
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <BrowserRouter>
                            <AuthProvider>
                                {children}
                            </AuthProvider>
                        </BrowserRouter>
                        {import.meta.env.DEV && (
                            <ReactQueryDevtools
                                initialIsOpen={false}
                                position="bottom-right"
                            />
                        )}
                    </QueryClientProvider>
                </Provider>
                <Toaster richColors />
            </ThemeProvider>
        </ErrorBoundary>
    )
}