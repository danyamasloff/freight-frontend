import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Route,
    Users,
    Truck,
    Package,
    BarChart3,
    FileCheck,
    Settings,
    LogOut,
    Calculator,
    Plus,
    Map,
    ChevronRight
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppDispatch } from "@/shared/hooks/redux"
import { clearCredentials } from "@/app/store/authSlice"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

const menuItems = [
    {
        title: "Панель управления",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Маршруты",
        url: "/routes",
        icon: Route,
        submenu: [
            {
                title: "Все маршруты",
                url: "/routes",
                icon: Route
            },
            {
                title: "Планировщик",
                url: "/routes/planner",
                icon: Calculator
            },
            {
                title: "Создать маршрут",
                url: "/routes/create",
                icon: Plus
            }
        ]
    },
    {
        title: "Водители",
        url: "/drivers",
        icon: Users,
        submenu: [
            {
                title: "Список водителей",
                url: "/drivers",
                icon: Users
            },
            {
                title: "Добавить водителя",
                url: "/drivers/create",
                icon: Plus
            }
        ]
    },
    {
        title: "Автопарк",
        url: "/fleet",
        icon: Truck,
        submenu: [
            {
                title: "Список ТС",
                url: "/fleet",
                icon: Truck
            },
            {
                title: "Добавить ТС",
                url: "/fleet/create",
                icon: Plus
            }
        ]
    },
    {
        title: "Грузы",
        url: "/cargo",
        icon: Package,
        submenu: [
            {
                title: "Список грузов",
                url: "/cargo",
                icon: Package
            },
            {
                title: "Добавить груз",
                url: "/cargo/create",
                icon: Plus
            }
        ]
    },
    {
        title: "Аналитика",
        url: "/analytics",
        icon: BarChart3,
    },
    {
        title: "Соответствие РТО",
        url: "/compliance",
        icon: FileCheck,
    },
]

export function AppSidebar() {
    const { state } = useSidebar()
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [openMenus, setOpenMenus] = useState<string[]>(() => {
        // Автоматически открываем меню, если активна одна из его подстраниц
        const openMenus: string[] = []
        menuItems.forEach(item => {
            if (item.submenu && item.submenu.some(sub => location.pathname === sub.url ||
                (sub.url !== '/dashboard' && location.pathname.startsWith(sub.url)))) {
                openMenus.push(item.title)
            }
        })
        return openMenus
    })

    const handleLogout = () => {
        dispatch(clearCredentials())
        navigate('/login')
    }

    const toggleMenu = (menuTitle: string) => {
        setOpenMenus(prev =>
            prev.includes(menuTitle)
                ? prev.filter(title => title !== menuTitle)
                : [...prev, menuTitle]
        )
    }

    const isMenuItemActive = (item: any) => {
        if (item.submenu) {
            return item.submenu.some((sub: any) =>
                location.pathname === sub.url ||
                (sub.url !== '/dashboard' && location.pathname.startsWith(sub.url))
            )
        }
        return location.pathname === item.url ||
            (item.url !== '/dashboard' && location.pathname.startsWith(item.url))
    }

    const isSubItemActive = (subItem: any) => {
        return location.pathname === subItem.url ||
            (subItem.url !== '/dashboard' && location.pathname.startsWith(subItem.url))
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <Truck className="h-6 w-6 text-primary"/>
                    {state === "expanded" && (
                        <span className="font-bold text-lg">TruckNavigator</span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Навигация</SidebarGroupLabel>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                {item.submenu ? (
                                    <Collapsible
                                        open={openMenus.includes(item.title)}
                                        onOpenChange={() => toggleMenu(item.title)}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                isActive={isMenuItemActive(item)}
                                                className="w-full justify-between"
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </div>
                                                <ChevronRight className={`h-4 w-4 transition-transform ${
                                                    openMenus.includes(item.title) ? 'rotate-90' : ''
                                                }`} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.submenu.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isSubItemActive(subItem)}
                                                        >
                                                            <a href={subItem.url}>
                                                                <subItem.icon className="h-4 w-4" />
                                                                <span>{subItem.title}</span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isMenuItemActive(item)}
                                    >
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/settings">
                                <Settings className="h-4 w-4" />
                                <span>Настройки</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span>Выйти</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}