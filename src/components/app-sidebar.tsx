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
  LogOut
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppDispatch } from "@/shared/hooks/redux"
import { clearCredentials } from "@/app/store/authSlice"

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
  },
  {
    title: "Водители",
    url: "/drivers",
    icon: Users,
  },
  {
    title: "Автопарк",
    url: "/fleet",
    icon: Truck,
  },
  {
    title: "Грузы",
    url: "/cargo",
    icon: Package,
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

  const handleLogout = () => {
    dispatch(clearCredentials())
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Truck className="h-6 w-6 text-primary" />
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
                    <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url ||
                            (item.url !== '/dashboard' && location.pathname.startsWith(item.url))}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
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
                  <Settings />
                  <span>Настройки</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Выйти</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  )
}