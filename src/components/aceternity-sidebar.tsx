import React, {useState, useCallback, useEffect} from "react";
import {Link, useLocation} from "react-router-dom";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {
    LayoutDashboard,
    Route,
    Truck,
    User,
    Package,
    BarChart,
    Shield,
    Settings,
    ChevronRight,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";

interface SidebarLinkProps {
    link: {
        label: string;
        href: string;
        icon: React.ReactNode;
        active?: boolean;
    };
    open?: boolean;
}

const SidebarLink = ({link, open}: SidebarLinkProps) => {
    return (
        <Link
            to={link.href}
            className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-200",
                link.active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/20"
            )}
        >
            {link.icon}
            {open && (
                <motion.span
                    initial={{opacity: 0, width: 0}}
                    animate={{opacity: 1, width: "auto"}}
                    exit={{opacity: 0, width: 0}}
                    className="whitespace-nowrap font-medium"
                >
                    {link.label}
                </motion.span>
            )}
        </Link>
    );
};

export function AceternitySidebar() {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const isMobile = useIsMobile();

    // Автоматически закрыть сайдбар на мобильных устройствах
    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [isMobile]);

    // Закрыть сайдбар при переходе на новую страницу в мобильном режиме
    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        }
    }, [location.pathname, isMobile]);

    const links = [
        {
            label: "Дашборд",
            href: "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5 shrink-0"/>,
            active: location.pathname === "/dashboard",
        },
        {
            label: "Маршруты",
            href: "/routes",
            icon: <Route className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/routes"),
        },
        {
            label: "Водители",
            href: "/drivers",
            icon: <User className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/drivers"),
        },
        {
            label: "Автопарк",
            href: "/fleet",
            icon: <Truck className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/fleet"),
        },
        {
            label: "Грузы",
            href: "/cargo",
            icon: <Package className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/cargo"),
        },
        {
            label: "Аналитика",
            href: "/analytics",
            icon: <BarChart className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/analytics"),
        },
        {
            label: "Соответствие",
            href: "/compliance",
            icon: <Shield className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/compliance"),
        },
        {
            label: "Настройки",
            href: "/settings",
            icon: <Settings className="h-5 w-5 shrink-0"/>,
            active: location.pathname.startsWith("/settings"),
        },
    ];

    const toggleSidebar = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    return (
        <>
            {/* Мобильная кнопка-гамбургер */}
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 z-50 rounded-md bg-background p-2 shadow-md"
                >
                    {open ? (
                        <X className="h-6 w-6 text-foreground"/>
                    ) : (
                        <Menu className="h-6 w-6 text-foreground"/>
                    )}
                </button>
            )}

            {/* Мобильный оверлей */}
            {isMobile && open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Сайдбар */}
            <motion.div
                initial={{width: isMobile ? 0 : 64}}
                animate={{width: open ? (isMobile ? 280 : 280) : 64}}
                transition={{duration: 0.3, ease: "easeInOut"}}
                className={cn(
                    "relative h-full z-50 flex-shrink-0 overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground",
                    isMobile && "fixed left-0 top-0 bottom-0"
                )}
            >
                <div className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-center justify-between py-2 pl-2">
                        {open ? (
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-md bg-primary"/>
                                <motion.span
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="text-lg font-bold text-sidebar-foreground"
                                >
                                    Truck Navigator
                                </motion.span>
                            </div>
                        ) : (
                            <div className="h-7 w-7 rounded-md bg-primary"/>
                        )}
                        {!isMobile && (
                            <button
                                onClick={toggleSidebar}
                                className={cn(
                                    "rounded-md p-1.5 hover:bg-sidebar-accent transition-colors",
                                    !open && "ml-auto"
                                )}
                            >
                                <ChevronRight
                                    className={cn(
                                        "h-5 w-5 text-sidebar-foreground transition-transform",
                                        open && "rotate-180"
                                    )}
                                />
                            </button>
                        )}
                    </div>

                    <div className="mt-6 flex flex-1 flex-col gap-2">
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} link={link} open={open}/>
                        ))}
                    </div>

                    <div className="mt-auto pb-4">
                        <SidebarLink
                            link={{
                                label: "Выйти",
                                href: "/logout",
                                icon: <LogOut className="h-5 w-5 shrink-0"/>,
                                active: false,
                            }}
                            open={open}
                        />
                    </div>
                </div>
            </motion.div>
        </>
    );
}