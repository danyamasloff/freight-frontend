import React from "react";
import { cn } from "@/lib/utils";

interface GlowContainerProps {
	children: React.ReactNode;
	className?: string;
	glowColor?: string;
	intensity?: "low" | "medium" | "high";
	animated?: boolean;
}

export function GlowContainer({
	children,
	className,
	glowColor = "blue",
	intensity = "medium",
	animated = false,
}: GlowContainerProps) {
	const glowClasses = {
		low: "shadow-lg",
		medium: "shadow-xl",
		high: "shadow-2xl",
	};

	const colorClasses = {
		blue: "shadow-blue-500/20",
		purple: "shadow-purple-500/20",
		emerald: "shadow-emerald-500/20",
		pink: "shadow-pink-500/20",
		slate: "shadow-slate-500/20",
	};

	return (
		<div className="relative">
			{/* Основной светящийся эффект */}
			<div
				className={cn(
					"absolute inset-0 rounded-xl blur-lg",
					glowClasses[intensity],
					colorClasses[glowColor as keyof typeof colorClasses] || colorClasses.blue,
					animated && "animate-pulse"
				)}
				style={{
					background: `radial-gradient(ellipse at center, ${
						glowColor === "blue"
							? "rgba(59, 130, 246, 0.15)"
							: glowColor === "purple"
								? "rgba(147, 51, 234, 0.15)"
								: glowColor === "emerald"
									? "rgba(16, 185, 129, 0.15)"
									: glowColor === "pink"
										? "rgba(236, 72, 153, 0.15)"
										: "rgba(148, 163, 184, 0.15)"
					} 0%, transparent 70%)`,
				}}
			/>

			{/* Внутренний контент */}
			<div className={cn("relative", className)}>{children}</div>
		</div>
	);
}
