import {cn} from "@/lib/utils";
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
                "relative flex w-full items-center justify-center bg-background",
                containerClassName
            )}
        >
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:40px_40px]",
                    "[background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
                    className
                )}
            />
            {showRadialGradient && (
                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            )}
            <div className="relative z-20 w-full h-full">{children}</div>
        </div>
    );
}