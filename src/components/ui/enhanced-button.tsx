import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
	children: React.ReactNode;
	className?: string;
	glowColor?: "blue" | "purple" | "emerald" | "pink";
	intensity?: "low" | "medium" | "high";
	pulse?: boolean;
}

export function EnhancedButton({
	children,
	className,
	glowColor = "blue",
	intensity = "medium",
	pulse = false,
	...props
}: EnhancedButtonProps) {
	const glowClasses = {
		blue: "shadow-blue-500/50 hover:shadow-blue-500/75",
		purple: "shadow-purple-500/50 hover:shadow-purple-500/75",
		emerald: "shadow-emerald-500/50 hover:shadow-emerald-500/75",
		pink: "shadow-pink-500/50 hover:shadow-pink-500/75",
	};

	const intensityClasses = {
		low: "shadow-lg hover:shadow-xl",
		medium: "shadow-xl hover:shadow-2xl",
		high: "shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]",
	};

	return (
		<div className="relative group">
			{/* Светящийся фон */}
			<div
				className={cn(
					"absolute inset-0 rounded-lg blur-sm transition-all duration-200",
					glowClasses[glowColor],
					intensityClasses[intensity],
					pulse && "animate-pulse",
					"group-hover:blur-md"
				)}
				style={{
					background: `linear-gradient(45deg, ${
						glowColor === "blue"
							? "rgba(59, 130, 246, 0.2)"
							: glowColor === "purple"
								? "rgba(147, 51, 234, 0.2)"
								: glowColor === "emerald"
									? "rgba(16, 185, 129, 0.2)"
									: "rgba(236, 72, 153, 0.2)"
					}, transparent)`,
				}}
			/>

			{/* Основная кнопка */}
			<Button
				className={cn(
					"relative transition-all duration-200",
					"transform hover:scale-[1.02] active:scale-[0.98]",
					"border-0 shadow-lg",
					className
				)}
				{...props}
			>
				{children}
			</Button>
		</div>
	);
}
