import { cn } from "@/lib/utils";
import React from "react";

interface GridBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    showRadialGradient?: boolean;
}

export function GridBackground({
                                   children,
                                   className,
                                   containerClassName,
                                   showRadialGradient = true,
                               }: GridBackgroundProps) {
    return (
        <div
            className={cn(
                "relative w-full h-full min-h-full flex flex-col bg-background",
                containerClassName
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 w-full h-full",
                    "[background-size:40px_40px]",
                    "[background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
                    className
                )}
            />
            {showRadialGradient && (
                <div className="pointer-events-none absolute inset-0 w-full h-full flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            )}
            <div className="relative z-20 w-full h-full flex-1 min-h-0">{children}</div>
        </div>
    );
}