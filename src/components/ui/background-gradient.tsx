import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundGradient = ({
                                       children,
                                       className,
                                       containerClassName,
                                       animate = true,
                                   }: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    animate?: boolean;
}) => {
    const variants = {
        initial: {
            backgroundPosition: "0 50%",
        },
        animate: {
            backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
        },
    };
    return (
        <div className={cn("relative p-[4px] group", containerClassName)}>
            <div
                className={cn(
                    "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
                    " bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
                )}
                style={{
                    backgroundSize: "400% 400%",
                    animation: animate ? "gradient 5s ease infinite" : undefined,
                }}
            />
            <div
                className={cn(
                    "relative z-10 rounded-3xl bg-black dark:bg-zinc-900",
                    className
                )}
            >
                {children}
            </div>
            <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
        </div>
    );
};