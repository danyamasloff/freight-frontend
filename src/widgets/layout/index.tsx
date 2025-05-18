import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Header } from '@/widgets/header'

export function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 overflow-hidden">
                    <div className="p-6 h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}