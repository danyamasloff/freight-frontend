import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AceternitySidebar } from '@/components/aceternity-sidebar'
import { Header } from '@/widgets/header'
import { GridBackground } from '@/components/grid-background'

export function Layout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <AceternitySidebar />
                <div className="flex flex-1 flex-col overflow-hidden w-full">
                    <Header />
                    <main className="flex-1 w-full overflow-auto relative">
                        <GridBackground
                            containerClassName="absolute inset-0"
                            className="fixed inset-0 z-0"
                        >
                            <div className="p-6 w-full h-full max-w-full relative z-10">
                                <Outlet />
                            </div>
                        </GridBackground>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}