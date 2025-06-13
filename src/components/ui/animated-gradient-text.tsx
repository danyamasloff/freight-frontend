import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
	children: React.ReactNode;
	className?: string;
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
	colors?: string[];
}

export function AnimatedGradientText({
	children,
	className,
	as: Component = "span",
	colors = ["from-blue-400", "via-purple-400", "to-pink-400"],
}: AnimatedGradientTextProps) {
	return (
		<>
			<style>{`
				@keyframes gradient-animation {
					0%,
					100% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
				}
				.animated-gradient-text {
					background-size: 200% auto;
					animation: gradient-animation 3s ease-in-out infinite;
				}
			`}</style>
			<Component
				className={cn(
					"relative inline-block font-bold",
					"bg-gradient-to-r",
					...colors,
					"bg-clip-text text-transparent",
					"animated-gradient-text",
					className
				)}
			>
				{children}
			</Component>
		</>
	);
}
