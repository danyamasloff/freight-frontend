import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { ThemeProvider } from "@/components/theme-provider"

function App() {
    return (
        <AppProviders>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                {children}
            </ThemeProvider>
            <AppRouter />
        </AppProviders>
    )
}

export default App