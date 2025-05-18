import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Поиск маршрутов, водителей..."
                            className="w-64 pl-9"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                        >
                            3
                        </Badge>
                    </Button>

                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}